import React, { useState } from 'react';
import { Bhandara } from '../../types/index.js';
import { StatusBadge, VerificationBadge } from '../common/TrustBadge.js';
import { MapPin, Clock, Navigation, Bookmark, Share2, Utensils, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../../services/api.js';

interface BhandaraCardProps {
  bhandara: Bhandara;
  onSelect: (idOrSlug: string) => void;
  onShare?: (bhandara: Bhandara) => void;
}

export const BhandaraCard: React.FC<BhandaraCardProps> = ({ bhandara, onSelect, onShare }) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      const saved = await api.toggleSave(bhandara.id);
      setIsSaved(saved);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    api.trackEvent(bhandara.id, 'directions');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bhandara.latitude},${bhandara.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(bhandara);
    } else if (navigator.share) {
      api.trackEvent(bhandara.id, 'share');
      navigator.share({
        title: bhandara.name,
        text: `🙏 Bhandara: ${bhandara.name} at ${bhandara.venue}, ${bhandara.locality} on AnnSetu`,
        url: window.location.origin + `/bhandara/${bhandara.slug || bhandara.id}`
      }).catch(() => {});
    }
  };

  // Fallback Indian feast image
  const defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
  const coverImage = bhandara.photos?.[0] || bhandara.posterUrl || defaultImage;

  // Format Indian distance
  const distanceFormatted = bhandara.distanceKm !== undefined
    ? (bhandara.distanceKm < 1 ? `${Math.round(bhandara.distanceKm * 1000)} m` : `${bhandara.distanceKm.toFixed(1)} km`)
    : null;

  return (
    <div 
      onClick={() => onSelect(bhandara.slug || bhandara.id)}
      className="group bg-[#FFFDF9] rounded-2xl border border-stone-200/90 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-950/5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Top subtle ornamental line for Indian festival feel */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-90" />

      {/* Media & Badges */}
      <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
        <img 
          src={coverImage} 
          alt={bhandara.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-stone-950/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <StatusBadge status={bhandara.status} size="sm" />

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-orange-700 flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
              title="Share Bhandara with Devotees"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSaveToggle}
              disabled={isSaving}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition-colors ${
                isSaved 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white/95 hover:bg-white text-stone-700 hover:text-orange-700'
              }`}
              title={isSaved ? 'Saved to Favorites' : 'Save Bhandara'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom tags on image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
          <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium border border-white/15">
            <Utensils className="w-3 h-3 text-amber-300" />
            <span className="truncate max-w-[140px]">{bhandara.foodType}</span>
          </span>
          {distanceFormatted && (
            <span className="bg-orange-600 text-white font-bold px-2 py-0.5 rounded-md text-[11px] shadow-xs flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5" />
              {distanceFormatted} dur
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Verification Pill, Pure Veg & Devotee confirmations */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <VerificationBadge verification={bhandara.verificationStatus} />
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-0.5" title="Pure Vegetarian Satvik Food Only">
                🌱 Pure Veg
              </span>
            </div>
            {bhandara.positiveConfirmationsCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {bhandara.positiveConfirmationsCount} Confirmed
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-stone-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors font-heading">
            {bhandara.name}
          </h3>

          {/* Venue & Locality */}
          <div className="flex items-start gap-1.5 mt-2 text-xs text-stone-600">
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium text-stone-800">
              {bhandara.venue}, {bhandara.locality}
            </span>
          </div>

          {/* Timing */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              {bhandara.eventDate} • <strong>{bhandara.startTime} - {bhandara.endTime} IST</strong>
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-stone-500 truncate max-w-[150px]">
            {bhandara.organizerName ? `Seva by ${bhandara.organizerName}` : 'Community Seva'}
          </div>

          <button
            onClick={handleDirections}
            className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-600 text-orange-800 hover:text-white border border-orange-200 hover:border-orange-600 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Raasta Dekhein</span>
          </button>
        </div>

      </div>
    </div>
  );
};
