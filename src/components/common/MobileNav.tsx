import React from 'react';
import { Home, Compass, Map, Bookmark, Plus, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-stone-200/80 md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            currentView === 'home' ? 'text-orange-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            currentView === 'explore' ? 'text-orange-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>

        {/* Add Center Button */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <button
            onClick={() => onNavigate('add')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30 flex items-center justify-center active:scale-95 transition-transform"
            title="Add a Bhandara"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] text-orange-700 font-semibold mt-1">Add</span>
        </div>

        {/* Map */}
        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            currentView === 'map' ? 'text-orange-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Map</span>
        </button>

        {/* Saved or Profile */}
        <button
          onClick={() => onNavigate(isAdmin ? 'admin' : 'saved')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            (currentView === 'saved' || currentView === 'admin') ? 'text-orange-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {isAdmin ? (
            <>
              <Shield className="w-5 h-5 mb-0.5 text-rose-600" />
              <span className="text-[10px] text-rose-700 font-semibold tracking-tight">Admin</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Saved</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
