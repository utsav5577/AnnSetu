import React, { useState, useEffect } from 'react';
import { Bhandara, Review } from '../types/index.js';
import { api } from '../services/api.js';
import { StatusBadge, VerificationBadge } from '../components/common/TrustBadge.js';
import { TrustPanel } from '../components/bhandara/TrustPanel.js';
import { CommunityConfirmationWidget } from '../components/bhandara/CommunityConfirmationWidget.js';
import { ReportModal } from '../components/bhandara/ReportModal.js';
import { PosterViewerModal } from '../components/bhandara/PosterViewerModal.js';
import { ReviewSection } from '../components/bhandara/ReviewSection.js';
import { BhandaraMap } from '../components/map/BhandaraMap.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  Navigation, 
  Bookmark, 
  Share2, 
  AlertTriangle, 
  Utensils, 
  Phone, 
  User, 
  CheckCircle, 
  Eye, 
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

interface BhandaraDetailPageProps {
  idOrSlug: string;
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const BhandaraDetailPage: React.FC<BhandaraDetailPageProps> = ({ 
  idOrSlug, 
  onNavigate, 
  onShare 
}) => {
  const [bhandara, setBhandara] = useState<Bhandara | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearbyBhandaras, setNearbyBhandaras] = useState<Bhandara[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true);
      try {
        const item = await api.getBhandara(idOrSlug);
        setBhandara(item);
        if (item) {
          api.trackEvent(item.id, 'view');
          const [revs, near] = await Promise.all([
            api.getReviews(item.id),
            api.getBhandaras({
              lat: item.latitude,
              lng: item.longitude,
              distance: 10,
              limit: 4
            })
          ]);
          setReviews(revs);
          setNearbyBhandaras(near.filter(n => n.id !== item.id).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load bhandara detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [idOrSlug]);

  const handleSaveToggle = async () => {
    if (!bhandara) return;
    try {
      const saved = await api.toggleSave(bhandara.id);
      setIsSaved(saved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDirections = () => {
    if (!bhandara) return;
    api.trackEvent(bhandara.id, 'directions');
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bhandara.latitude},${bhandara.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Loading sacred event details...</p>
      </div>
    );
  }

  if (!bhandara) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Bhandara Not Found</h2>
        <p className="text-xs text-stone-600">The requested Bhandara may have concluded or the link is invalid.</p>
        <button
          onClick={() => onNavigate('explore')}
          className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
        >
          Explore All Bhandaras
        </button>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80';
  const heroImage = bhandara.photos?.[0] || bhandara.posterUrl || defaultImage;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('explore')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discovery</span>
      </button>

      {/* Main Cover & Hero Block */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200">
        <div className="relative aspect-21/9 sm:aspect-16/7 w-full overflow-hidden">
          <img
            src={heroImage}
            alt={bhandara.name}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* Hero Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={bhandara.status} />
            <VerificationBadge verification={bhandara.verificationStatus} />
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-950/80 border border-emerald-400/40 text-emerald-200 backdrop-blur-md px-2.5 py-1 rounded-md font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              100% Pure Vegetarian
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md font-medium">
              {bhandara.city}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight font-heading">
            {bhandara.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-200">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{bhandara.venue}, {bhandara.locality}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{bhandara.eventDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{bhandara.startTime} - {bhandara.endTime} IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Toolbar */}
      <div className="p-4 bg-[#FFFDF9] border border-stone-200 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Directions CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDirections}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-orange-600/20 transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions (Google Maps)</span>
          </button>
        </div>

        {/* Right: Save, Share, Report */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToggle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              isSaved 
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs' 
                : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onShare(bhandara)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium transition-colors"
            title="Report incorrect information"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            <span>Report</span>
          </button>
        </div>

      </div>

      {/* Grid: Left (Details & Trust) + Right (Organizer & Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trust & Freshness Indicators Panel */}
          <TrustPanel bhandara={bhandara} />

          {/* Real-time Community Confirmation Widget */}
          <CommunityConfirmationWidget
            bhandara={bhandara}
            onConfirmationSuccess={(updated) => setBhandara(updated)}
          />

          {/* Food Prasad & Mahaprasad Details */}
          <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-stone-900 font-heading">Mahaprasad & Food Specialty</h3>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-4 h-4 border-2 border-emerald-600 rounded-[3px] p-[2px] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                </div>
                <span className="text-[11px] font-bold text-emerald-900 tracking-wide uppercase">Shuddh Shakahari</span>
              </div>
            </div>

            <div className="p-3.5 bg-gradient-to-br from-orange-50/80 to-amber-50/50 border border-orange-200/80 rounded-xl space-y-2">
              <span className="text-xs font-bold text-orange-900 block">Prasad Menu:</span>
              <p className="text-sm font-semibold text-stone-900">{bhandara.foodType}</p>
              
              {/* Individual Food Item Chips */}
              {bhandara.foodItems && bhandara.foodItems.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {bhandara.foodItems.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white border border-orange-200/90 text-stone-800 rounded-md shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[11px] text-stone-600 bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/70 flex items-center gap-2">
              <span className="text-base">🙏</span>
              <span>AnnSetu Pure Vegetarian Guarantee: strictly prepared with traditional purity, satvik ingredients, and devotion.</span>
            </div>

            {bhandara.description && (
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1">About the Bhandara:</span>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {bhandara.description}
                </p>
              </div>
            )}
          </div>

          {/* Facilities & Accessibility */}
          {bhandara.facilities && bhandara.facilities.length > 0 && (
            <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-stone-900">Facilities Available</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bhandara.facilities.map(fac => (
                  <div key={fac} className="flex items-center gap-2 p-2 bg-stone-50 rounded-xl border border-stone-200/80 text-xs font-medium text-stone-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitation Poster Inspection */}
          {bhandara.posterUrl && (
            <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="font-bold text-base text-stone-900">Original Invitation Poster</h3>
                <button
                  onClick={() => setShowPosterModal(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  View Fullscreen
                </button>
              </div>
              <div 
                onClick={() => setShowPosterModal(true)}
                className="relative rounded-xl overflow-hidden border border-stone-200 cursor-pointer group max-h-80 flex items-center justify-center bg-stone-100"
              >
                <img
                  src={bhandara.posterUrl}
                  alt="Invitation Card"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                  <Maximize2 className="w-4 h-4" />
                  Click to inspect poster
                </div>
              </div>
            </div>
          )}

          {/* Reviews & Devotee Feedback */}
          <ReviewSection
            bhandaraId={bhandara.id}
            reviews={reviews}
            onReviewAdded={async () => {
              const revs = await api.getReviews(bhandara.id);
              setReviews(revs);
            }}
          />

        </div>

        {/* Right Column (1 Col): Organizer, Venue Map, Guidelines */}
        <div className="space-y-6">
          
          {/* Organizer Card */}
          <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
              Organizer & Samiti Details
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{bhandara.organizerName || 'Community Samiti'}</h4>
                <p className="text-xs text-stone-500">
                  {bhandara.verificationStatus === 'VERIFIED_ORGANIZER' ? 'Verified Trust / Registered Samiti' : 'Community Volunteer'}
                </p>
                {bhandara.organizerId && (
                  <button
                    onClick={() => onNavigate('organizer', bhandara.organizerId)}
                    className="text-xs font-bold text-orange-600 hover:underline mt-1 block"
                  >
                    View Organizer Profile →
                  </button>
                )}
              </div>
            </div>

            {bhandara.contactPhone && (
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  Organizer Phone:
                </span>
                <a href={`tel:${bhandara.contactPhone}`} className="font-bold text-stone-800 hover:text-orange-600">
                  {bhandara.contactPhone}
                </a>
              </div>
            )}

            {bhandara.expectedAttendees && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Expected Gathering:</span>
                <span className="font-bold text-stone-800">{bhandara.expectedAttendees} Devotees</span>
              </div>
            )}
          </div>

          {/* Location Map Preview */}
          <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-stone-900">Location Map</h3>
            <p className="text-xs text-stone-600">{bhandara.address}</p>
            <BhandaraMap
              bhandaras={[bhandara]}
              centerLat={bhandara.latitude}
              centerLng={bhandara.longitude}
              selectedBhandaraId={bhandara.id}
              className="h-[220px] w-full"
            />
            <button
              onClick={handleDirections}
              className="w-full text-center bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              Navigate with Google Maps
            </button>
          </div>

          {/* Devotee Guidelines note */}
          <div className="bg-amber-500/10 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Devotee Etiquette</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              Please maintain cleanliness, cooperate in queue queues, avoid food wastage, and allow seniors and differently-abled devotees priority access.
            </p>
          </div>

        </div>

      </div>

      {/* Similar / Nearby Bhandaras */}
      {nearbyBhandaras.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-stone-200">
          <h3 className="font-black text-xl text-stone-900 font-heading">
            Other Bhandaras in this Area
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {nearbyBhandaras.map(b => (
              <BhandaraCard
                key={b.id}
                bhandara={b}
                onSelect={(slug) => onNavigate('detail', slug)}
                onShare={onShare}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportModal
        bhandaraId={bhandara.id}
        bhandaraName={bhandara.name}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <PosterViewerModal
        posterUrl={bhandara.posterUrl || ''}
        eventName={bhandara.name}
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
      />

    </div>
  );
};
