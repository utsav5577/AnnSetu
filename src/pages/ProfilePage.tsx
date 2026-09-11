import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { User, Shield, Bell, Check, Bookmark, PlusCircle, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, switchRole, allDemoUsers, switchUser } = useAuth();
  const [notifyNearMe, setNotifyNearMe] = useState<boolean>(true);
  const [notifyBadaMangal, setNotifyBadaMangal] = useState<boolean>(true);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'USER', title: 'Community Devotee', desc: 'Can discover, confirm active status, and write reviews' },
    { role: 'ORGANIZER', title: 'Bhandara Organizer', desc: 'Can manage own samiti events and view attendee stats' },
    { role: 'ADMIN', title: 'Moderator / Admin', desc: 'Can approve/reject submissions and resolve user reports' },
    { role: 'SUPER_ADMIN', title: 'Super Admin', desc: 'Full authority including system configuration and audit logs' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Back */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Profile Header Card */}
      <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{user.name}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                user.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                user.role === 'ORGANIZER' ? 'bg-amber-100 text-amber-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
          <button
            onClick={() => onNavigate('saved')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-orange-50 hover:border-orange-200 border border-stone-200/70 text-left transition-colors flex items-center gap-2.5"
          >
            <Bookmark className="w-4 h-4 text-orange-600 shrink-0" />
            <div>
              <span className="font-bold text-stone-800 text-xs block">Saved Events</span>
              <span className="text-[11px] text-stone-500">View bookmarked Bhandaras</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('add')}
            className="p-3 rounded-xl bg-stone-50 hover:bg-orange-50 hover:border-orange-200 border border-stone-200/70 text-left transition-colors flex items-center gap-2.5"
          >
            <PlusCircle className="w-4 h-4 text-orange-600 shrink-0" />
            <div>
              <span className="font-bold text-stone-800 text-xs block">Submit Bhandara</span>
              <span className="text-[11px] text-stone-500">Add a community event</span>
            </div>
          </button>
        </div>
      </div>

      {/* Role-Based Access Control Switcher */}
      <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-600" />
            <span>Role Switcher (RBAC Showcase)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Switch your active profile to test devotee discovery, organizer management, and administrative moderation.
          </p>
        </div>

        <div className="space-y-2">
          {roles.map(r => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                user.role === r.role
                  ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              <div>
                <p className="font-bold text-xs">{r.title} ({r.role})</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{r.desc}</p>
              </div>
              {user.role === r.role && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-600" />
            <span>Devotee Alerts & Notifications</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure how you would like to be alerted for local Anna Daan events.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
            <div>
              <span className="font-bold text-stone-800 block">Nearby Bhandara Alerts</span>
              <span className="text-stone-500 text-[11px]">Notify me when a Bhandara is starting within 3 km of my location</span>
            </div>
            <input
              type="checkbox"
              checked={notifyNearMe}
              onChange={(e) => setNotifyNearMe(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded-sm"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
            <div>
              <span className="font-bold text-stone-800 block">Special Festival Seva Announcements</span>
              <span className="text-stone-500 text-[11px]">Receive updates for Bada Mangal, Navratri, and Purnima Langars</span>
            </div>
            <input
              type="checkbox"
              checked={notifyBadaMangal}
              onChange={(e) => setNotifyBadaMangal(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded-sm"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
