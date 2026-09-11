import React, { useState, useEffect } from 'react';
import { Bhandara, CityInfo } from '../types/index.js';
import { api } from '../services/api.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { MapPin, Compass, ArrowLeft } from 'lucide-react';

interface AreaPageProps {
  slug: string;
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const AreaPage: React.FC<AreaPageProps> = ({ slug, onNavigate, onShare }) => {
  const [city, setCity] = useState<CityInfo | null>(null);
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadArea() {
      setIsLoading(true);
      try {
        const [cities, list] = await Promise.all([
          api.getCities(),
          api.getBhandaras({ limit: 100 })
        ]);

        const matchedCity = cities.find(c => c.slug === slug || c.name.toLowerCase().includes(slug.toLowerCase())) || cities[0];
        setCity(matchedCity);

        // Filter bhandaras for this city
        const cityEvents = list.filter(b => 
          b.city.toLowerCase() === matchedCity.name.toLowerCase() ||
          b.city.toLowerCase().includes(matchedCity.name.toLowerCase().split(' ')[0])
        );
        setBhandaras(cityEvents);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadArea();
  }, [slug]);

  if (isLoading || !city) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const filtered = selectedLocality === 'all' 
    ? bhandaras 
    : bhandaras.filter(b => b.locality.toLowerCase().includes(selectedLocality.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24">
      
      {/* Back */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Area Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
            Sacred Anna Daan Center
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading">
          {city.name} Bhandaras & Mahaprasad
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm text-amber-100 leading-relaxed">
          {city.description}
        </p>

        {/* Localities pills */}
        {city.localities && city.localities.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-white block mb-2">Filter by Locality:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedLocality('all')}
                className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                  selectedLocality === 'all'
                    ? 'bg-white text-orange-900 shadow-xs'
                    : 'bg-black/20 hover:bg-black/30 text-white'
                }`}
              >
                All Areas ({bhandaras.length})
              </button>
              {city.localities.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocality(loc)}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                    selectedLocality === loc
                      ? 'bg-white text-orange-900 shadow-xs'
                      : 'bg-black/20 hover:bg-black/30 text-white'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 font-heading">
            Live & Scheduled Bhandaras in {city.name} ({filtered.length})
          </h2>
          <button
            onClick={() => onNavigate('add')}
            className="text-xs font-bold text-orange-600 hover:underline"
          >
            + Add Bhandara in {city.name}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFDF9] border border-stone-200/90 rounded-2xl text-xs text-stone-500 space-y-2">
            <p className="font-bold text-stone-800">No active events in this locality right now.</p>
            <p>Know of a Bhandara happening here? Help fellow devotees by listing it!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(b => (
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
