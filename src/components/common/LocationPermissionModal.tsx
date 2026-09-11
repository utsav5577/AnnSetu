import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext.js';
import { MapPin, Navigation, X, Check, Search } from 'lucide-react';

export const LocationPermissionModal: React.FC = () => {
  const { 
    showLocationModal, 
    setShowLocationModal, 
    requestGpsLocation, 
    setManualLocation, 
    cities, 
    isLocating, 
    selectedCity 
  } = useLocation();

  const [activeCityTab, setActiveCityTab] = useState<string>(selectedCity || 'Delhi NCR');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!showLocationModal) return null;

  const currentCityObj = cities.find(c => c.name.toLowerCase() === activeCityTab.toLowerCase());

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] border border-stone-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Choose Your Location</h3>
              <p className="text-xs text-stone-500">We use your location to show Bhandaras happening near you</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLocationModal(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* GPS Button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">Recommended</span>
                <p className="text-sm font-bold text-stone-900 mt-0.5">Use Live GPS Location</p>
                <p className="text-xs text-stone-600">Instantly finds Bhandaras within walking distance.</p>
              </div>
              <button
                onClick={async () => {
                  await requestGpsLocation();
                }}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-75"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                {isLocating ? 'Detecting...' : 'Detect Near Me'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-[#FFFDF9] px-3 text-xs uppercase font-semibold text-stone-400">Or Select City Manually</span>
          </div>

          {/* City Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Indian city or holy dham..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Cities Grid */}
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Major Cities & Holy Centers</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCities.map((city) => {
                const isSelected = activeCityTab.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.slug}
                    onClick={() => {
                      setActiveCityTab(city.name);
                      setManualLocation(city.name, '', { lat: city.lat, lng: city.lng });
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50/80 font-bold text-orange-900 shadow-xs' 
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{city.name}</p>
                      <p className="text-[10px] text-stone-500 font-normal">{city.state}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Localities for chosen city */}
          {currentCityObj && currentCityObj.localities.length > 0 && (
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <span className="text-xs font-bold text-stone-700 block mb-2">
                Popular Localities in {currentCityObj.name}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCityObj.localities.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setManualLocation(currentCityObj.name, loc, { lat: currentCityObj.lat, lng: currentCityObj.lng });
                    }}
                    className="text-xs bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-stone-200 px-2.5 py-1 rounded-lg text-stone-700 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer note */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
          <p className="text-xs text-stone-500">
            Location is used solely to calculate distances to Bhandaras. We never store or track your continuous history.
          </p>
        </div>

      </div>
    </div>
  );
};
