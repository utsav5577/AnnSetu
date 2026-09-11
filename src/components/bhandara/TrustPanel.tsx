import React from 'react';
import { Bhandara } from '../../types/index.js';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  CalendarCheck
} from 'lucide-react';

interface TrustPanelProps {
  bhandara: Bhandara;
}

export const TrustPanel: React.FC<TrustPanelProps> = ({ bhandara }) => {
  // Calculate freshness
  let freshnessText = 'Not yet confirmed today';
  let isFresh = false;

  if (bhandara.lastConfirmedAt) {
    const minutesAgo = Math.floor((Date.now() - new Date(bhandara.lastConfirmedAt).getTime()) / (60 * 1000));
    if (minutesAgo < 60) {
      freshnessText = `Confirmed ${minutesAgo}m ago by devotees`;
      isFresh = true;
    } else if (minutesAgo < 24 * 60) {
      const hoursAgo = Math.floor(minutesAgo / 60);
      freshnessText = `Confirmed ${hoursAgo}h ago today`;
      isFresh = true;
    } else {
      freshnessText = 'Last confirmed more than 24h ago';
    }
  }

  const isVerifiedOrg = bhandara.verificationStatus === 'VERIFIED_ORGANIZER';
  const hasCommunityConfirmation = bhandara.positiveConfirmationsCount >= 3;

  return (
    <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">AnnSetu Trust & Freshness Indicators</h4>
            <p className="text-[11px] text-stone-500">Real-time validation backed by verified data and community votes</p>
          </div>
        </div>

        {isFresh ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Live & Fresh
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Check Timing
          </span>
        )}
      </div>

      {/* Grid of 4 Trust Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* 1. Location Integrity */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Verified Coordinates</span>
            <span className="text-stone-600 block mt-0.5">
              Exact GPS pin and venue landmark confirmed ({bhandara.latitude.toFixed(4)}, {bhandara.longitude.toFixed(4)})
            </span>
          </div>
        </div>

        {/* 2. Timing Accuracy */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Dynamic IST Timing</span>
            <span className="text-stone-600 block mt-0.5">
              Scheduled {bhandara.startTime} to {bhandara.endTime} IST ({bhandara.status.replace('_', ' ')})
            </span>
          </div>
        </div>

        {/* 3. Community Confirmations */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
          <Users className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Devotee Confirmations</span>
            <span className="text-stone-600 block mt-0.5">
              {bhandara.positiveConfirmationsCount > 0 
                ? `${bhandara.positiveConfirmationsCount} community member(s) confirmed this event on ground`
                : 'Awaiting first community confirmation'}
            </span>
          </div>
        </div>

        {/* 4. Organizer State */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-start gap-2.5">
          <CalendarCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Organizer Standing</span>
            <span className="text-stone-600 block mt-0.5">
              {isVerifiedOrg 
                ? 'Official Temple / Registered Charitable Trust (Admin Verified)' 
                : 'Community-submitted event under peer moderation'}
            </span>
          </div>
        </div>

      </div>

      {/* Freshness Timestamp notice */}
      <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-500">
        <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>Status Freshness: <strong className="text-stone-700">{freshnessText}</strong>.</span>
      </div>

    </div>
  );
};
