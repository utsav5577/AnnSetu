import React, { useState, useEffect } from 'react';
import { Bhandara, EventStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { useLocation } from '../context/LocationContext.js';
import { BhandaraMap } from '../components/map/BhandaraMap.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { MapPin, Navigation, Compass, SlidersHorizontal } from 'lucide-react';

interface MapPageProps {
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onNavigate, onShare }) => {
  const { coords, locationLabel, setShowLocationModal } = useLocation();
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [selectedBhandaraId, setSelectedBhandaraId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const list = await api.getBhandaras({
          lat: coords?.lat,
          lng: coords?.lng,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sort: 'nearest'
        });
        setBhandaras(list);
      } catch (err) {
        console.error('Failed to load map events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, [coords?.lat, coords?.lng, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 pb-20">
      
      {/* Header & Quick Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-orange-800 font-semibold">
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Interactive Spatial Discovery</span>
            <span>•</span>
            <button onClick={() => setShowLocationModal(true)} className="hover:underline flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-600" />
              <span>{locationLabel}</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
            Live Bhandara Map Explorer
          </h1>
        </div>

        {/* Quick Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { val: 'all', label: 'All Markers' },
            { val: 'HAPPENING_NOW', label: '● Happening Now' },
            { val: 'STARTING_SOON', label: '● Starting Soon' },
            { val: 'UPCOMING', label: 'Upcoming' }
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => setStatusFilter(opt.val as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                statusFilter === opt.val
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Side Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Map Container */}
        <div className="lg:col-span-2">
          <BhandaraMap
            bhandaras={bhandaras}
            centerLat={coords?.lat || 28.6139}
            centerLng={coords?.lng || 77.2090}
            selectedBhandaraId={selectedBhandaraId}
            onSelectBhandara={(slug) => onNavigate('detail', slug)}
            className="h-[620px] w-full"
          />
        </div>

        {/* Side Event Drawer */}
        <div className="lg:col-span-1 space-y-3 max-h-[620px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1 text-xs font-bold text-stone-700">
            <span>Nearby Locations ({bhandaras.length})</span>
            <span className="text-stone-400 font-normal">Click marker or card for details</span>
          </div>

          {bhandaras.map(b => (
            <div 
              key={b.id} 
              onMouseEnter={() => setSelectedBhandaraId(b.id)}
              className="transition-transform"
            >
              <BhandaraCard
                bhandara={b}
                onSelect={(slug) => onNavigate('detail', slug)}
                onShare={onShare}
              />
            </div>
          ))}

          {bhandaras.length === 0 && !isLoading && (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
              No markers found in this view. Try switching status filters above.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
