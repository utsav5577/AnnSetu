import React, { useState, useEffect } from 'react';
import { Bhandara, EventStatus, VerificationStatus } from '../types/index.js';
import { api } from '../services/api.js';
import { useLocation } from '../context/LocationContext.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { BhandaraMap } from '../components/map/BhandaraMap.js';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  Grid, 
  X, 
  RotateCcw, 
  SlidersHorizontal,
  Compass,
  MapPin
} from 'lucide-react';

interface ExplorePageProps {
  initialFilter?: string;
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ 
  initialFilter, 
  onNavigate, 
  onShare 
}) => {
  const { coords, selectedCity, locationLabel, setShowLocationModal } = useLocation();

  // State
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters
  const [search, setSearch] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week'>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'all'>('all');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nearest' | 'happening_now' | 'starting_soon' | 'trending' | 'recently_added'>('nearest');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Parse initialFilter param if passed
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.startsWith('status:')) {
        const val = initialFilter.replace('status:', '');
        setStatusFilter(val as any);
      } else if (initialFilter.startsWith('search:')) {
        const val = decodeURIComponent(initialFilter.replace('search:', ''));
        setSearch(val);
      } else if (initialFilter.startsWith('food:')) {
        const val = decodeURIComponent(initialFilter.replace('food:', ''));
        setFoodTypeFilter(val);
      } else if (initialFilter.startsWith('sort:')) {
        const val = initialFilter.replace('sort:', '');
        setSortBy(val as any);
      }
    }
  }, [initialFilter]);

  // Fetch Bhandaras whenever filters or location change
  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      try {
        const list = await api.getBhandaras({
          lat: coords?.lat,
          lng: coords?.lng,
          distance: distanceKm,
          date: dateFilter === 'all' ? undefined : dateFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          verification: verificationFilter === 'all' ? undefined : verificationFilter,
          foodType: foodTypeFilter === 'all' ? undefined : foodTypeFilter,
          search: search.trim() || undefined,
          sort: sortBy
        });
        setBhandaras(list);
      } catch (err) {
        console.error('Failed to fetch filtered bhandaras:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = setTimeout(fetchFiltered, 150);
    return () => clearTimeout(timeout);
  }, [coords?.lat, coords?.lng, distanceKm, dateFilter, statusFilter, verificationFilter, foodTypeFilter, search, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setDistanceKm(undefined);
    setDateFilter('all');
    setStatusFilter('all');
    setVerificationFilter('all');
    setFoodTypeFilter('all');
    setSortBy('nearest');
  };

  const hasActiveFilters = distanceKm !== undefined || dateFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all' || foodTypeFilter !== 'all' || search !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-800">
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Real-time Discovery</span>
            <span>•</span>
            <button onClick={() => setShowLocationModal(true)} className="hover:underline flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-600" />
              <span>{locationLabel}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading mt-1">
            Explore Nearby Bhandaras
          </h1>
        </div>

        {/* View Toggle (Grid / Map) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && '•'}
          </button>
        </div>
      </div>

      {/* Filter Controls (Desktop & Mobile Dropdown) */}
      <div className={`p-4 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl shadow-xs space-y-4 ${
        showMobileFilters ? 'block' : 'hidden md:block'
      }`}>
        
        {/* Search input row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by temple, organizer, venue, or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:border-orange-500"
            >
              <option value="nearest">Nearest Distance</option>
              <option value="happening_now">Happening Right Now</option>
              <option value="starting_soon">Starting Soon</option>
              <option value="trending">Popular / Trending</option>
              <option value="recently_added">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-stone-100">
          
          {/* Distance Filter */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Distance Radius:</label>
            <div className="flex flex-wrap gap-1">
              {[
                { val: undefined, label: 'All' },
                { val: 1, label: '1 km' },
                { val: 3, label: '3 km' },
                { val: 5, label: '5 km' },
                { val: 10, label: '10 km' }
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setDistanceKm(opt.val)}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    distanceKm === opt.val 
                      ? 'bg-orange-600 text-white border-orange-600 font-bold' 
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Date:</label>
            <div className="flex flex-wrap gap-1">
              {[
                { val: 'all', label: 'Anytime' },
                { val: 'today', label: 'Today' },
                { val: 'tomorrow', label: 'Tomorrow' },
                { val: 'this_week', label: 'This Week' }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setDateFilter(opt.val as any)}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    dateFilter === opt.val 
                      ? 'bg-orange-600 text-white border-orange-600 font-bold' 
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Live Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Live States</option>
              <option value="HAPPENING_NOW">Happening Right Now</option>
              <option value="STARTING_SOON">Starting Soon (within 60m)</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">Trust / Verification:</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden"
            >
              <option value="all">All Verifications</option>
              <option value="VERIFIED_ORGANIZER">Verified Organizer Only</option>
              <option value="COMMUNITY_CONFIRMED">Community Confirmed Only</option>
              <option value="COMMUNITY_ADDED">Community Added</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-medium">
              Active filters applied • Showing <strong>{bhandaras.length}</strong> matching Bhandaras
            </span>
            <button
              onClick={resetFilters}
              className="text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          </div>
        )}

      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 h-72 animate-pulse flex flex-col justify-between">
              <div className="bg-stone-200 rounded-xl h-40 w-full" />
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                <div className="h-3 bg-stone-200 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bhandaras.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-stone-200/90 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No Nearby Bhandaras Found</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We couldn't find any events matching your selected distance, date, or status filters in {locationLabel}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onNavigate('add')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors"
            >
              + Submit a Bhandara
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <BhandaraMap
              bhandaras={bhandaras}
              centerLat={coords?.lat || 28.6139}
              centerLng={coords?.lng || 77.2090}
              onSelectBhandara={(slug) => onNavigate('detail', slug)}
              className="h-[600px] w-full"
            />
          </div>
          {/* Side List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {bhandaras.map(b => (
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

    </div>
  );
};
