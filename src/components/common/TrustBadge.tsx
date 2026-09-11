import React from 'react';
import { EventStatus, VerificationStatus } from '../../types/index.js';
import { CheckCircle2, ShieldCheck, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: EventStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  switch (status) {
    case 'HAPPENING_NOW':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-700 text-white shadow-xs border border-emerald-800 ${sizeClasses}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
          </span>
          <span>Abhi Chal Raha Hai</span>
        </span>
      );
    case 'STARTING_SOON':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span>Jald Shuru • Soon</span>
        </span>
      );
    case 'UPCOMING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-orange-50 text-orange-950 border border-orange-200 shadow-2xs ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-orange-700" />
          <span>Aage Ka Karyakram</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-red-50 text-red-800 border border-red-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Cancelled / Radd</span>
        </span>
      );
    case 'ENDED':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-stone-100 text-stone-600 border border-stone-200 ${sizeClasses}`}>
          <span>Sampann • Concluded</span>
        </span>
      );
  }
};

interface VerificationBadgeProps {
  verification: VerificationStatus;
  showText?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verification, showText = true }) => {
  switch (verification) {
    case 'VERIFIED_ORGANIZER':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-900 bg-sky-50/90 border border-sky-200 px-2.5 py-0.5 rounded-full shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 fill-sky-100 shrink-0" />
          {showText && 'Verified Trust / Samiti'}
        </span>
      );
    case 'COMMUNITY_CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-50/90 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {showText && 'Devotee Confirmed'}
        </span>
      );
    case 'PENDING_VERIFICATION':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          {showText && 'Under Community Review'}
        </span>
      );
    case 'COMMUNITY_ADDED':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100/90 border border-stone-200 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          {showText && 'Community Added'}
        </span>
      );
  }
};
