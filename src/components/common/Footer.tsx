import React from 'react';
import { Flame, Heart, ShieldCheck, MapPin, Compass, Share2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1C1917] text-stone-300 pt-12 pb-24 md:pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
                <Flame className="w-5 h-5 fill-amber-200 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Ann<span className="text-orange-500">Setu</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              AnnSetu is India's community-driven discovery platform for sacred Bhandaras, Langars, and Mahaprasad feasts. Dedicated to connecting devotees with transparent, real-time community service.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-500/90 font-medium">
              <Heart className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500 shrink-0" />
              <span>Dedicated to the spirit of selfless Anna Daan</span>
            </div>
          </div>

          {/* Quick Discovery */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3 font-heading">
              Discover
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-orange-400 transition-colors">
                  All Nearby Bhandaras
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('map')} className="hover:text-orange-400 transition-colors">
                  Interactive Live Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'HAPPENING_NOW')} className="hover:text-orange-400 transition-colors">
                  Happening Right Now
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore', 'STARTING_SOON')} className="hover:text-orange-400 transition-colors">
                  Starting Soon
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('add')} className="hover:text-orange-400 transition-colors text-orange-400 font-medium">
                  + Submit a Community Bhandara
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Holy Centers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3 font-heading">
              Major Centers
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('area', 'delhi')} className="hover:text-orange-400 transition-colors">
                  Delhi NCR Bhandaras
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('area', 'varanasi')} className="hover:text-orange-400 transition-colors">
                  Kashi Varanasi Anna Daan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('area', 'ayodhya')} className="hover:text-orange-400 transition-colors">
                  Ayodhya Dham Mahaprasad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('area', 'lucknow')} className="hover:text-orange-400 transition-colors">
                  Lucknow Bada Mangal & Seva
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('area', 'haridwar')} className="hover:text-orange-400 transition-colors">
                  Haridwar & Rishikesh Ghats
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('area', 'mathura-vrindavan')} className="hover:text-orange-400 transition-colors">
                  Vrindavan & Mathura Seva
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3 font-heading">
              Information & Guidelines
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-orange-400 transition-colors">
                  About AnnSetu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-orange-400 transition-colors">
                  How It Works & Trust Model
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-orange-400 transition-colors">
                  Safety & Hygiene Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('community-guidelines')} className="hover:text-orange-400 transition-colors">
                  Community Rules
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-orange-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-orange-400 transition-colors">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Mandatory Exact Credit */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-300">
              © 2026 AnnSetu — Created by Utsav Srivastava
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Location-Aware Discovery</span>
            <span>•</span>
            <span>Real-time Community Confirmation</span>
            <span>•</span>
            <span>Zero Fake Data</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
