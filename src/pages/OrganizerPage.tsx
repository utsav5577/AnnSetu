import React, { useState, useEffect } from 'react';
import { Bhandara, Organizer } from '../types/index.js';
import { api } from '../services/api.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { ShieldCheck, MapPin, Phone, Mail, Calendar, Users, ArrowLeft } from 'lucide-react';

interface OrganizerPageProps {
  organizerId: string;
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const OrganizerPage: React.FC<OrganizerPageProps> = ({
  organizerId,
  onNavigate,
  onShare
}) => {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadOrganizer() {
      setIsLoading(true);
      try {
        const [org, list] = await Promise.all([
          api.getOrganizer(organizerId),
          api.getBhandaras({ limit: 50 })
        ]);
        setOrganizer(org);
        // Filter events by this organizer
        const orgEvents = list.filter(b => b.organizerId === organizerId || b.organizerName?.toLowerCase() === org?.name.toLowerCase());
        setBhandaras(orgEvents);
      } catch (err) {
        console.error('Failed to load organizer profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrganizer();
  }, [organizerId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Organizer Not Found</h2>
        <button onClick={() => onNavigate('explore')} className="text-xs font-bold text-orange-600">
          Return to Explore
        </button>
      </div>
    );
  }

  const upcomingEvents = bhandaras.filter(b => b.status === 'HAPPENING_NOW' || b.status === 'STARTING_SOON' || b.status === 'UPCOMING');
  const pastEvents = bhandaras.filter(b => b.status === 'CONCLUDED' || b.status === 'CANCELLED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24">
      
      {/* Back */}
      <button
        onClick={() => onNavigate('explore')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </button>

      {/* Profile Card */}
      <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {organizer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                  {organizer.name}
                </h1>
                {organizer.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    Verified Trust
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{organizer.city} • Registered Community Organizer</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-500 block">Total Seva Events</span>
            <span className="text-2xl font-black text-orange-600 font-heading">{organizer.totalBhandarasOrganized}</span>
          </div>
        </div>

        {organizer.description && (
          <p className="text-xs text-stone-600 leading-relaxed pt-2 border-t border-stone-100">
            {organizer.description}
          </p>
        )}

        {/* Details row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-600 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{organizer.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{organizer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{organizer.email}</span>
          </div>
        </div>
      </div>

      {/* Events organized */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-stone-900 font-heading">
          Organized Bhandaras ({bhandaras.length})
        </h3>

        {bhandaras.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            No events found for this organizer.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bhandaras.map(b => (
              <BhandaraCard
                key={b.id}
                bhandara={b}
                onSelect={(slug) => onNavigate('detail', slug)}
                onShare={onShare}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
