import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { 
  MapPin, 
  Search, 
  Compass, 
  Map as MapIcon, 
  Bookmark, 
  PlusCircle, 
  Shield, 
  ChevronDown, 
  Flame,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { locationLabel, setShowLocationModal, isUsingGps } = useLocation();
  const { user, switchRole, isAdmin, allDemoUsers, switchUser } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'USER', label: 'Community Devotee', desc: 'Discover, confirm, and review' },
    { role: 'ORGANIZER', label: 'Bhandara Organizer', desc: 'Manage samiti events' },
    { role: 'ADMIN', label: 'Moderator / Admin', desc: 'Approve, verify, and resolve reports' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full authority & audit oversight' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-stone-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform border border-amber-300/30">
                <Flame className="w-5 h-5 fill-amber-200 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-stone-900 font-heading">
                    Ann<span className="text-orange-600">Setu</span>
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-orange-100/80 text-orange-900 border border-orange-200/60 font-serif-desi">
                    अन्नसेतु
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-medium tracking-tight">
                  Seva aur Samuday ka Setu
                </p>
              </div>
            </button>

            {/* Location Selector Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100/90 hover:bg-orange-50 hover:text-orange-900 border border-stone-200/80 hover:border-orange-300 transition-all text-stone-700 max-w-[240px] truncate shadow-2xs"
              title="Click to change location"
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isUsingGps ? 'text-orange-600 fill-orange-200 animate-pulse' : 'text-stone-500'}`} />
              <span className="truncate">{locationLabel}</span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('explore')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'explore' 
                  ? 'bg-orange-50 text-orange-700 font-semibold' 
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <Compass className="w-4 h-4 text-orange-600" />
              Explore
            </button>

            <button
              onClick={() => onNavigate('map')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'map' 
                  ? 'bg-orange-50 text-orange-700 font-semibold' 
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <MapIcon className="w-4 h-4 text-amber-600" />
              Live Map
            </button>

            <button
              onClick={() => onNavigate('saved')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'saved' 
                  ? 'bg-orange-50 text-orange-700 font-semibold' 
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <Bookmark className="w-4 h-4 text-stone-500" />
              Saved
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  currentView === 'admin' 
                    ? 'bg-rose-900 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right actions: Add Bhandara CTA + Role Switcher */}
          <div className="flex items-center gap-2.5">
            
            {/* Add Bhandara Button */}
            <button
              onClick={() => onNavigate('add')}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-md shadow-orange-600/20 hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Add Bhandara</span>
            </button>

            {/* Quick RBAC Role & User Switcher for reviewers */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-2xs transition-all"
                title="Current active role and account switcher"
              >
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium text-stone-700">{user.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                  user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                  user.role === 'ORGANIZER' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {/* Dropdown Menu */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFDF9] border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">Signed In As</p>
                    <p className="text-xs text-stone-600 truncate">{user.name} ({user.email})</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
                      Active Role: {user.role}
                    </span>
                  </div>

                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                      Quick Role Switcher (RBAC)
                    </p>
                    <div className="space-y-1">
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => {
                            switchRole(r.role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            user.role === r.role 
                              ? 'bg-orange-500 text-white font-bold' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{r.label}</p>
                            <p className={`text-[10px] ${user.role === r.role ? 'text-orange-100' : 'text-stone-400'}`}>{r.desc}</p>
                          </div>
                          {user.role === r.role && <Sparkles className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {allDemoUsers.length > 0 && (
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                        Switch Demo Account
                      </p>
                      <div className="space-y-1">
                        {allDemoUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded-md text-xs flex items-center justify-between hover:bg-stone-100 ${
                              u.id === user.id ? 'font-bold text-orange-700' : 'text-stone-600'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-stone-100 text-stone-600 font-mono">
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="px-2 pt-1">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                      View Profile & Submissions
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowRoleDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-600" />
                        Admin Moderation Dashboard
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
