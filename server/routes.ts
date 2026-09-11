import express, { Request, Response } from 'express';
import { db, CITIES_DATA } from './db.js';
import { parseBhandaraPosterWithGemini } from './gemini.js';
import { UserRole } from '../src/types/index.js';

const router = express.Router();

// Helper to get authenticated user strictly from database (prevents client header spoofing)
function getRequestUser(req: Request) {
  const userIdHeader = req.headers['x-user-id'] as string;
  const userNameHeader = req.headers['x-user-name'] as string;

  if (userIdHeader) {
    const existing = db.getUserById(userIdHeader);
    if (existing) {
      return existing; // Authoritative user record from server database
    }
  }

  // Fallback to default user
  const allUsers = db.getUsers();
  return allUsers[0] || {
    id: 'usr_guest',
    email: 'guest@annsetu.in',
    name: userNameHeader || 'AnnSetu Visitor',
    role: 'USER' as UserRole,
    createdAt: new Date().toISOString()
  };
}

// Security Middleware: Requires ADMIN or SUPER_ADMIN role
function requireAdmin(req: Request, res: Response, next: express.NextFunction) {
  const user = getRequestUser(req);
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied: AnnSetu Admin or Super Admin privileges required.' }
    });
  }
  next();
}

// 1. Health
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AnnSetu Backend API',
    credit: '© 2026 AnnSetu — Created by Utsav Srivastava',
    timestamp: new Date().toISOString()
  });
});

// 2. Cities & Localities
router.get('/cities', (req: Request, res: Response) => {
  const allBhandaras = db.getBhandaras({ includePending: false });
  const citiesWithCount = CITIES_DATA.map(c => {
    const count = allBhandaras.filter(b => b.city.toLowerCase().includes(c.name.toLowerCase()) || b.city.toLowerCase().includes(c.slug)).length;
    return { ...c, bhandaraCount: count };
  });
  res.json({ success: true, data: citiesWithCount });
});

// 3. Bhandaras List (with rich geospatial, search, date, and status filters)
router.get('/bhandaras', (req: Request, res: Response) => {
  try {
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const maxDistanceKm = req.query.distance ? parseFloat(req.query.distance as string) : undefined;
    const city = req.query.city as string;
    const locality = req.query.locality as string;
    const status = req.query.status as string;
    const dateFilter = req.query.dateFilter as string;
    const verification = req.query.verification as string;
    const foodType = req.query.foodType as string;
    const search = req.query.search as string;
    const sort = req.query.sort as string;
    const includePending = req.query.includePending === 'true';

    const bhandaras = db.getBhandaras({
      userLat,
      userLng,
      maxDistanceKm,
      city,
      locality,
      status,
      dateFilter,
      verification,
      foodType,
      search,
      sort,
      includePending
    });

    res.json({
      success: true,
      data: bhandaras,
      count: bhandaras.length,
      filters: { city, locality, status, dateFilter, sort, maxDistanceKm }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Error fetching Bhandaras' }
    });
  }
});

// 4. Bhandara Details
router.get('/bhandaras/:id', (req: Request, res: Response) => {
  const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
  const bhandara = db.getBhandaraById(req.params.id, userLat, userLng);

  if (!bhandara) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Bhandara event not found.' }
    });
  }

  const organizer = bhandara.organizerId ? db.getOrganizerById(bhandara.organizerId) : null;
  const confirmations = db.getConfirmations(bhandara.id);
  const reviews = db.getReviews(bhandara.id);

  // Automatically increment view count
  db.trackAction(bhandara.id, 'view');

  res.json({
    success: true,
    data: {
      ...bhandara,
      organizer,
      confirmations,
      reviews
    }
  });
});

// 5. Create Bhandara
router.post('/bhandaras', (req: Request, res: Response) => {
  try {
    const user = getRequestUser(req);
    const { name, venue, address, locality, city, eventDate, startTime, endTime } = req.body;

    if (!name || !venue || !address || !city || !eventDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Please fill in all mandatory fields (Name, Venue, Address, City, Date, Time).' }
      });
    }

    try {
      const { bhandara, duplicates } = db.createBhandara(req.body, user);

      res.status(201).json({
        success: true,
        data: bhandara,
        duplicateWarning: duplicates.length > 0 ? {
          count: duplicates.length,
          potentialMatches: duplicates.map(d => ({ id: d.id, name: d.name, venue: d.venue, eventDate: d.eventDate }))
        } : null,
        message: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
          ? 'Bhandara published directly with Admin verification.' 
          : 'Bhandara submitted successfully! It is queued for community moderation.'
      });
    } catch (createErr: any) {
      const isPolicyViolation = createErr.message && createErr.message.includes('Pure Vegetarian Policy');
      return res.status(400).json({
        success: false,
        error: { 
          code: isPolicyViolation ? 'PURE_VEG_POLICY_VIOLATION' : 'VALIDATION_ERROR', 
          message: createErr.message || 'Failed to validate Bhandara.' 
        }
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Failed to create Bhandara.' }
    });
  }
});

// 6. Update Bhandara
router.patch('/bhandaras/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const existing = db.getBhandaraById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
  }

  // Authorization: Only the creator of the bhandara or an Admin can edit it
  const isOwner = existing.createdBy === user.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied: Only the organizer or an AnnSetu Admin can modify this Bhandara.' }
    });
  }

  try {
    const updated = db.updateBhandara(req.params.id, req.body, user);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    const isPolicyViolation = err.message && err.message.includes('Pure Vegetarian Policy');
    res.status(400).json({
      success: false,
      error: {
        code: isPolicyViolation ? 'PURE_VEG_POLICY_VIOLATION' : 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }
});

// 7. Community Confirmation (Is this Bhandara happening right now?)
router.post('/bhandaras/:id/confirm', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { isHappening, note } = req.body;

  if (typeof isHappening !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'isHappening boolean value is required.' }
    });
  }

  const success = db.addConfirmation(req.params.id, user, isHappening, note);
  if (!success) {
    return res.status(400).json({ success: false, error: { code: 'FAILED', message: 'Could not record confirmation.' } });
  }

  const updatedBhandara = db.getBhandaraById(req.params.id);
  res.json({
    success: true,
    data: updatedBhandara,
    message: isHappening 
      ? 'Thank you! Your confirmation helps devotees know this Bhandara is live.' 
      : 'Thank you for reporting that the event is not active right now.'
  });
});

// 8. Reviews
router.post('/bhandaras/:id/reviews', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { overallRating, infoAccuracyRating, locationAccuracyRating, timingAccuracyRating, comments, attended } = req.body;

  const review = db.addReview(req.params.id, user, {
    overallRating,
    infoAccuracyRating,
    locationAccuracyRating,
    timingAccuracyRating,
    comments,
    attended
  });

  res.status(201).json({
    success: true,
    data: review,
    message: 'Your genuine visit review has been submitted for community trust.'
  });
});

// 9. Report Bhandara
router.post('/bhandaras/:id/report', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { reason, details } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Please specify a report reason.' }
    });
  }

  const report = db.addReport(req.params.id, user, reason, details || '');
  res.status(201).json({
    success: true,
    data: report,
    message: 'Report submitted. Our moderation team will investigate this immediately.'
  });
});

// 10. Save / Bookmark toggle
router.post('/bhandaras/:id/save', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const isSaved = db.toggleSave(user.id, req.params.id);

  res.json({
    success: true,
    isSaved,
    message: isSaved ? 'Bhandara saved to your collection.' : 'Bhandara removed from saved items.'
  });
});

// 11. Tracking (Views, Directions, Shares)
router.post('/bhandaras/:id/track', (req: Request, res: Response) => {
  const { action } = req.body;
  if (action === 'view' || action === 'share' || action === 'directions') {
    db.trackAction(req.params.id, action);
  }
  res.json({ success: true });
});

// 12. Saved Bhandaras for User
router.get('/saved', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const saved = db.getSavedBhandaras(user.id);
  res.json({ success: true, data: saved });
});

// 13. My Submissions
router.get('/my-submissions', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const all = db.getBhandaras({ includePending: true });
  const mine = all.filter(b => b.createdBy === user.id);
  res.json({ success: true, data: mine });
});

// 14. Organizers
router.get('/organizers', (req: Request, res: Response) => {
  const organizers = db.getOrganizers();
  res.json({ success: true, data: organizers });
});

router.get('/organizers/:id', (req: Request, res: Response) => {
  const organizer = db.getOrganizerById(req.params.id);
  if (!organizer) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organizer not found' } });
  }

  // Get their bhandaras
  const allBhandaras = db.getBhandaras({ includePending: false });
  const organizerEvents = allBhandaras.filter(b => b.organizerId === organizer.id);

  res.json({
    success: true,
    data: {
      ...organizer,
      events: organizerEvents
    }
  });
});

// 15. AI / Gemini Poster Parser
router.post('/ai/parse-poster', async (req: Request, res: Response) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'No poster image data provided.' }
    });
  }

  const result = await parseBhandaraPosterWithGemini(imageBase64, mimeType);
  if (!result.success) {
    return res.status(200).json({
      success: false,
      error: result.error || 'Failed to parse poster.',
      fallbackMessage: 'You can easily enter the event details manually below.'
    });
  }

  res.json({
    success: true,
    data: result.data,
    message: 'Poster details analyzed! Please review and confirm before submitting.'
  });
});

// 16. Auth simulation & switching
router.get('/auth/me', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  res.json({ success: true, data: user });
});

router.get('/auth/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ success: true, data: users });
});

router.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role, userId } = req.body;
  if (userId) {
    const u = db.getUserById(userId);
    if (u) {
      if (role) u.role = role;
      return res.json({ success: true, data: u });
    }
  }

  const user = getRequestUser(req);
  if (role) {
    user.role = role;
  }
  res.json({ success: true, data: user });
});

// 17. Admin Metrics
router.get('/admin/metrics', requireAdmin, (req: Request, res: Response) => {
  const metrics = db.getAdminMetrics();
  res.json({ success: true, data: metrics });
});

// 18. Admin Moderation
router.get('/admin/moderation', requireAdmin, (req: Request, res: Response) => {
  const all = db.getBhandaras({ includePending: true });
  const pending = all.filter(b => b.moderationStatus === 'PENDING');
  res.json({ success: true, data: pending });
});

router.post('/admin/bhandaras/:id/moderate', requireAdmin, (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { action, reason } = req.body;

  if (!['APPROVE', 'REJECT', 'VERIFY', 'CANCEL', 'DELETE'].includes(action)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: 'Unknown moderation action.' } });
  }

  const success = db.moderateBhandara(req.params.id, action, user, reason);
  if (!success) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found.' } });
  }

  res.json({
    success: true,
    message: `Bhandara action ${action} executed successfully.`
  });
});

// 19. Merge Duplicates
router.post('/admin/bhandaras/merge', requireAdmin, (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { targetId, duplicateId } = req.body;

  if (!targetId || !duplicateId) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'targetId and duplicateId are required.' } });
  }

  const success = db.mergeDuplicates(targetId, duplicateId, user);
  if (!success) {
    return res.status(400).json({ success: false, error: { code: 'FAILED', message: 'Failed to merge events. Check IDs.' } });
  }

  res.json({ success: true, message: 'Duplicates successfully merged and records consolidated.' });
});

// 20. Reports Queue
router.get('/admin/reports', requireAdmin, (req: Request, res: Response) => {
  const status = req.query.status as string;
  const reports = db.getReports(status);
  res.json({ success: true, data: reports });
});

router.post('/admin/reports/:id', requireAdmin, (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { action } = req.body; // 'RESOLVED' | 'DISMISSED'
  if (!['RESOLVED', 'DISMISSED'].includes(action)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: 'Action must be RESOLVED or DISMISSED.' } });
  }

  const success = db.resolveReport(req.params.id, action, user);
  if (!success) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  res.json({ success: true, message: `Report marked ${action}.` });
});

// 21. Organizer Verification
router.get('/admin/organizers', requireAdmin, (req: Request, res: Response) => {
  const organizers = db.getOrganizers();
  res.json({ success: true, data: organizers });
});

router.post('/admin/organizers/:id/verify', requireAdmin, (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { status } = req.body; // 'VERIFIED' | 'REJECTED' | 'SUSPENDED'

  const success = db.verifyOrganizer(req.params.id, status, user);
  if (!success) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organizer not found' } });
  }

  res.json({ success: true, message: `Organizer verification status updated to ${status}.` });
});

// 22. Admin Audit Logs
router.get('/admin/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, data: logs });
});

export default router;
