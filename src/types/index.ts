export type UserRole = 'USER' | 'ORGANIZER' | 'ADMIN' | 'SUPER_ADMIN';

export type EventStatus = 'UPCOMING' | 'STARTING_SOON' | 'HAPPENING_NOW' | 'ENDED' | 'CANCELLED';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type VerificationStatus = 
  | 'COMMUNITY_ADDED' 
  | 'PENDING_VERIFICATION' 
  | 'COMMUNITY_CONFIRMED' 
  | 'VERIFIED_ORGANIZER';

export type ReportReason = 
  | 'FAKE_EVENT'
  | 'WRONG_LOCATION'
  | 'WRONG_DATE'
  | 'WRONG_TIME'
  | 'EVENT_CANCELLED'
  | 'DUPLICATE'
  | 'MISLEADING_INFO'
  | 'INAPPROPRIATE_IMAGE'
  | 'OTHER';

export type FoodType = 
  | 'Puri Sabzi & Halwa'
  | 'Khichdi Prasad'
  | 'Kheer Prasad'
  | 'Chhole Bhature'
  | 'Dal Baati Churma'
  | 'Kadhi Chawal'
  | 'Complete Mahaprasad'
  | 'Special Festival Bhoj';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  city?: string;
  avatar?: string;
  createdAt: string;
}

export interface Bhandara {
  id: string;
  slug: string;
  name: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string; // Asia/Kolkata
  venue: string;
  address: string;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
  organizerId?: string;
  organizerName?: string;
  organizerPhone?: string;
  createdBy: string;
  status: EventStatus;
  moderationStatus: ModerationStatus;
  verificationStatus: VerificationStatus;
  lastConfirmedAt?: string;
  foodType: string;
  foodItems?: string[];
  vegetarianStatus: 'PURE_VEG';
  expectedAttendees?: string;
  facilities: string[]; // e.g., 'Drinking Water', 'Sitting Arrangement', 'Parking', 'Separate Queue for Seniors', 'Prasad Packing'
  posterUrl?: string;
  photos: string[];
  viewsCount: number;
  savesCount: number;
  sharesCount: number;
  directionsClicks: number;
  positiveConfirmationsCount: number;
  negativeConfirmationsCount: number;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
  isDevelopmentSeed?: boolean;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  city: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  eventsCount: number;
  followersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bhandaraId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  attended: boolean;
  infoAccuracyRating: number; // 1-5
  locationAccuracyRating: number; // 1-5
  timingAccuracyRating: number; // 1-5
  overallRating: number; // 1-5
  comments: string;
  status: 'APPROVED' | 'PENDING' | 'HIDDEN';
  createdAt: string;
}

export interface EventConfirmation {
  id: string;
  bhandaraId: string;
  userId: string;
  userName: string;
  isHappening: boolean;
  note?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  bhandaraId: string;
  bhandaraName: string;
  userId: string;
  userName: string;
  reason: ReportReason;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SavedBhandara {
  userId: string;
  bhandaraId: string;
  savedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetEntity: 'BHANDARA' | 'ORGANIZER' | 'USER' | 'REVIEW' | 'REPORT';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface EventUpdate {
  id: string;
  bhandaraId: string;
  updateType: 'TIME_CHANGED' | 'LOCATION_UPDATED' | 'CANCELLED' | 'CORRECTED';
  note: string;
  updatedBy: string;
  timestamp: string;
}

export interface CityInfo {
  name: string;
  slug: string;
  state: string;
  lat: number;
  lng: number;
  localities: string[];
  bhandaraCount?: number;
}

export interface FilterParams {
  distance?: number; // km
  date?: 'today' | 'tomorrow' | 'this_week' | 'all';
  status?: EventStatus | 'all';
  verification?: VerificationStatus | 'all';
  city?: string;
  locality?: string;
  search?: string;
  foodType?: string;
  sort?: 'nearest' | 'happening_now' | 'starting_soon' | 'trending' | 'recently_added';
  limit?: number;
}

export interface AdminMetrics {
  totalUsers: number;
  totalBhandaras: number;
  activeEvents: number;
  upcomingEvents: number;
  pendingSubmissions: number;
  verifiedEvents: number;
  reportedEvents: number;
  cancelledEvents: number;
  totalOrganizers: number;
  totalReviews: number;
  totalConfirmations: number;
}
