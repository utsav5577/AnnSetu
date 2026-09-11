import React, { useState, useEffect } from 'react';
import { Bhandara, Report, AuditLog } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { StatusBadge, VerificationBadge } from '../components/common/TrustBadge.js';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Users, 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  Trash2, 
  Filter, 
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Flame,
  Shield
} from 'lucide-react';

interface AdminPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'reports' | 'organizers' | 'audit'>('pending');
  const [stats, setStats] = useState<any>(null);
  const [pendingBhandaras, setPendingBhandaras] = useState<Bhandara[]>([]);
  const [allBhandaras, setAllBhandaras] = useState<Bhandara[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string>('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, pend, all, rep, logs] = await Promise.all([
        api.getAdminStats(),
        api.getAdminPending(),
        api.getBhandaras({ limit: 100 }),
        api.getAdminReports(),
        api.getAdminAuditLogs()
      ]);
      setStats(st);
      setPendingBhandaras(pend);
      setAllBhandaras(all);
      setReports(rep);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Actions
  const handleApprove = async (id: string) => {
    try {
      const res = await api.moderateBhandara(id, 'APPROVE');
      if (res.success) {
        setActionFeedback('Event approved and made live on AnnSetu.');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection:') || 'Incomplete or unverified details';
    try {
      const res = await api.moderateBhandara(id, 'REJECT', reason);
      if (res.success) {
        setActionFeedback('Event rejected.');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerification = async (id: string, current: string) => {
    const nextStatus = current === 'VERIFIED_ORGANIZER' ? 'COMMUNITY_ADDED' : 'VERIFIED_ORGANIZER';
    try {
      const res = await api.moderateBhandara(id, 'VERIFY', nextStatus);
      if (res.success) {
        setActionFeedback(`Verification status updated to ${nextStatus}.`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'RESOLVED' | 'DISMISSED') => {
    try {
      const res = await api.resolveReport(reportId, action);
      if (res.success) {
        setActionFeedback('Report marked as resolved.');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If not admin, show friendly RBAC switch helper
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full mx-auto flex items-center justify-center">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Admin Privileges Required</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          The AnnSetu Moderation & Audit Console is restricted to designated administrators and community moderators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchRole('ADMIN')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Switch to Admin Role (Instant Review Access)
          </button>
        </div>
      </div>
    );
  }

  const filteredAll = allBhandaras.filter(b => 
    b.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    b.venue.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.city.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
              Staff Console
            </span>
            <span className="text-xs text-stone-500">
              Signed in as <strong>{user.name}</strong> ({user.role})
            </span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 font-heading mt-1">
            AnnSetu Moderation & Trust Engine
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback('')} className="text-emerald-600 font-bold">×</button>
        </div>
      )}

      {/* KPI Stats Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Total Events</span>
            <span className="text-2xl font-black text-stone-900 font-heading mt-0.5 block">{stats.totalBhandaras}</span>
          </div>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Active Now</span>
            <span className="text-2xl font-black text-emerald-900 font-heading mt-0.5 block">{stats.activeNow}</span>
          </div>
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Queue</span>
            <span className="text-2xl font-black text-amber-900 font-heading mt-0.5 block">{stats.pendingSubmissions}</span>
          </div>
          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">User Reports</span>
            <span className="text-2xl font-black text-rose-900 font-heading mt-0.5 block">{stats.reportedBhandaras}</span>
          </div>
          <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">Verified Trusts</span>
            <span className="text-2xl font-black text-orange-900 font-heading mt-0.5 block">{stats.verifiedBhandaras}</span>
          </div>
          <div className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Devotee Accounts</span>
            <span className="text-2xl font-black text-stone-900 font-heading mt-0.5 block">{stats.totalUsers}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Submissions ({pendingBhandaras.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>All Bhandaras ({allBhandaras.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Community Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Immutable Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">
              Community Submissions Awaiting Moderation
            </h3>
            <span className="text-xs text-stone-500">
              Review and verify location and timing before approving for public display
            </span>
          </div>

          {pendingBhandaras.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs text-stone-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-stone-800">Pending Queue is All Clear!</p>
              <p>No unreviewed community submissions at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBhandaras.map(item => (
                <div key={item.id} className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                        Pending Review
                      </span>
                      <span className="text-xs text-stone-500">{item.city}</span>
                    </div>
                    <h4 className="text-base font-bold text-stone-900">{item.name}</h4>
                    <p className="text-xs text-stone-600">
                      <strong>Venue:</strong> {item.venue}, {item.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span><strong>Date:</strong> {item.eventDate}</span>
                      <span><strong>Hours:</strong> {item.startTime} - {item.endTime} IST</span>
                      <span><strong>Prasad:</strong> {item.foodType}</span>
                    </div>
                    {item.posterUrl && (
                      <div className="pt-2">
                        <a href={item.posterUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:underline">
                          View Attached Poster →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => onNavigate('detail', item.slug || item.id)}
                      className="text-xs text-stone-500 hover:text-stone-900 font-medium mt-1"
                    >
                      Preview Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL BHANDARAS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, venue, or city..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
            <span className="text-xs text-stone-500 font-medium">
              Showing {filteredAll.length} events
            </span>
          </div>

          <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <tr>
                    <th className="p-3.5">Event Name</th>
                    <th className="p-3.5">City & Venue</th>
                    <th className="p-3.5">Date & Timing</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredAll.map(b => (
                    <tr key={b.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900 max-w-[220px]">
                        <button onClick={() => onNavigate('detail', b.slug || b.id)} className="hover:text-orange-600 text-left">
                          {b.name}
                        </button>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {b.venue}, {b.city}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {b.eventDate} ({b.startTime} - {b.endTime})
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="p-3.5">
                        <VerificationBadge verification={b.verificationStatus} />
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleVerification(b.id, b.verificationStatus)}
                          className="text-[11px] font-bold text-orange-600 hover:underline"
                        >
                          {b.verificationStatus === 'VERIFIED_ORGANIZER' ? 'Revoke Verified' : 'Mark Verified'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-stone-900">
            Devotee Community Flagged Reports ({reports.length})
          </h3>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs text-stone-500">
              No unresolved reports. Community data is healthy!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md">
                        {r.reason.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-stone-400">
                        Reported by {r.userName} on {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-800">
                      Bhandara ID: {r.bhandaraId}
                    </p>
                    {r.details && (
                      <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                        "{r.details}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Resolve & Correct
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-900">
              Tamper-Evident Administrative Audit Trail
            </h3>
            <span className="text-xs text-stone-500">Every moderation action is chronologically recorded</span>
          </div>

          <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl divide-y divide-stone-100 shadow-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-4 text-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{log.action}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 rounded-sm text-stone-600">
                        {log.targetType}: {log.targetId}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-0.5">
                      By <strong>{log.userName}</strong> ({log.userRole})
                    </p>
                  </div>
                  <span className="text-stone-400 font-mono text-[11px] shrink-0">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
