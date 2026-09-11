import React, { useState, useEffect } from 'react';
import { Bhandara } from '../types/index.js';
import { api } from '../services/api.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { Bookmark, Compass } from 'lucide-react';

interface SavedPageProps {
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate, onShare }) => {
  const [savedBhandaras, setSavedBhandaras] = useState<Bhandara[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSaved() {
      setIsLoading(true);
      try {
        const list = await api.getSavedBhandaras();
        setSavedBhandaras(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-orange-800 font-semibold">
          <Bookmark className="w-4 h-4 text-orange-600" />
          <span>My Saved Bhandaras</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading mt-1">
          Saved & Bookmarked Events
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Quickly access the events you plan to attend.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs text-stone-400">Loading saved items...</div>
      ) : savedBhandaras.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF9] border border-stone-200/90 rounded-2xl max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">No Saved Bhandaras Yet</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Click the bookmark icon on any Bhandara card to save it here for fast lookup and directions.
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Nearby Bhandaras</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedBhandaras.map(b => (
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
  );
};
