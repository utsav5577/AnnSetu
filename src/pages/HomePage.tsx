import React, { useEffect, useState, useRef } from 'react';
import { Bhandara, CityInfo } from '../types/index.js';
import { api } from '../services/api.js';
import { useLocation } from '../context/LocationContext.js';
import { BhandaraCard } from '../components/bhandara/BhandaraCard.js';
import { ASSETS } from '../assets/images.js';
import { 
  Search, 
  MapPin, 
  Flame, 
  Compass, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Navigation,
  UtensilsCrossed,
  ShieldCheck,
  CheckCircle2,
  Heart,
  PlusCircle,
  FileImage,
  AlertCircle,
  RefreshCw,
  LocateFixed
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onShare: (bhandara: Bhandara) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onShare }) => {
  const { coords, locationLabel, setShowLocationModal, selectedCity, requestGpsLocation, isLocating, isUsingGps } = useLocation();
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  const nearestSectionRef = useRef<HTMLDivElement>(null);

  const foodSpecialties = [
    'Puri Sabzi & Halwa',
    'Khichdi Prasad',
    'Kheer Prasad',
    'Chhole Bhature',
    'Dal Baati Churma',
    'Kadhi Chawal',
    'Mahaprasad Thali'
  ];

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const [list, cityList] = await Promise.all([
        api.getBhandaras({
          lat: coords?.lat,
          lng: coords?.lng,
          city: selectedCity === 'Delhi NCR' ? undefined : selectedCity,
          sort: coords ? 'nearest' : 'trending'
        }),
        api.getCities()
      ]);
      setBhandaras(list);
      setCities(cityList);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [coords?.lat, coords?.lng, selectedCity]);

  // Derived Shelves from real data
  const happeningNow = bhandaras.filter(b => b.status === 'HAPPENING_NOW');
  const startingSoon = bhandaras.filter(b => b.status === 'STARTING_SOON');
  const nearest = [...bhandaras].filter(b => b.distanceKm !== undefined).sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 6);
  const upcoming = bhandaras.filter(b => b.status === 'UPCOMING');
  const recentlyAdded = [...bhandaras].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const trending = [...bhandaras].sort((a, b) => (b.viewsCount + b.savesCount * 3 + b.positiveConfirmationsCount * 2) - (a.viewsCount + a.savesCount * 3 + a.positiveConfirmationsCount * 2)).slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('explore', `search:${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('explore');
    }
  };

  const handleScrollToNearest = () => {
    if (!coords && !isUsingGps) {
      requestGpsLocation();
    }
    nearestSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-20 bg-[#FAF6EE]">
      
      {/* ========================================================================= */}
      {/* 1. HOMEPAGE HERO: CINEMATIC AUTHENTIC INDIAN COMMUNITY SEVA PHOTOGRAPHY   */}
      {/* ========================================================================= */}
      <section className="relative min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden border-b border-orange-200/80">
        
        {/* Real Indian Community Bhandara Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src={ASSETS.heroBhandaraSeva}
            alt="Indian community bhandara food distribution with volunteers serving devotees"
            className="w-full h-full object-cover object-center transform scale-102 transition-transform duration-1000"
            loading="eager"
            fetchPriority="high"
          />
          {/* Subtle multi-layer warm gradient overlay for high contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C140E] via-[#2A1D13]/80 to-[#1C140E]/70" />
          <div className="absolute inset-0 bg-orange-950/25 mix-blend-multiply" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center space-y-6">
          
          {/* Subtle Brand & Location Badge */}
          <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-amber-300/30 text-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
            <span className="font-serif-desi tracking-wide">अन्न सेतु</span>
            <span className="text-amber-400/50">•</span>
            <span>Seva & Community Food Bridge</span>
          </div>

          {/* Main Headline (Clear & Culturally Connected) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] font-heading drop-shadow-md">
            Aapke Aas-Paas Kahan Ho Raha Hai <span className="text-amber-400 underline decoration-orange-500/60 decoration-wavy decoration-2">Bhandara?</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-amber-100/90 leading-relaxed font-normal drop-shadow-xs">
            Apne aas-paas ho rahe Bhandaron ko discover karein, details dekhein aur aasani se pahunchne ka raasta paayein.
          </p>

          {/* Dual Primary CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleScrollToNearest}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow-xl shadow-orange-950/30 hover:shadow-2xl transition-all scale-100 hover:scale-[1.02] border border-orange-400/40"
            >
              <Navigation className="w-4 h-4" />
              <span>Mere Paas Bhandara Dhoondo</span>
            </button>

            <button
              onClick={() => onNavigate('add')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 hover:border-white/50 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Bhandara Add Karein</span>
            </button>
          </div>

          {/* Fast Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative flex items-center shadow-2xl rounded-2xl bg-white/95 backdrop-blur-md border border-orange-200/80 p-1.5 transition-all focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-orange-500">
            <Search className="w-5 h-5 text-orange-600 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Bhandara, area ya mandir search karein (e.g. Hanuman Mandir, Rohini, Kashi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-500 bg-transparent focus:outline-hidden"
            />
            <button
              type="submit"
              className="bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Popular Prasad Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-3xl mx-auto">
            <span className="text-[11px] text-amber-200/90 font-medium mr-1 flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3 text-amber-400" />
              Prasad:
            </span>
            {foodSpecialties.map(food => (
              <button
                key={food}
                onClick={() => onNavigate('explore', `food:${encodeURIComponent(food)}`)}
                className="text-[11px] bg-black/40 hover:bg-orange-600/90 text-amber-100 hover:text-white border border-white/20 hover:border-orange-400 px-3 py-1 rounded-full backdrop-blur-xs transition-all shadow-xs"
              >
                {food}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. POLISHED ANNSETU LOCATION EXPERIENCE CARD                              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-[#FFFDF9] border border-orange-200/90 rounded-2xl p-4 sm:p-5 shadow-lg shadow-orange-950/5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20">
              <MapPin className={`w-6 h-6 ${isUsingGps ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded-sm">
                  📍 Aapki Location
                </span>
                {isUsingGps && (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    GPS Active
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
                Bhandaras Near <span className="text-orange-700 font-extrabold">{locationLabel}</span>
              </h3>
              <p className="text-xs text-stone-500">
                Real-time distance aur directions calculation ke liye
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={requestGpsLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold rounded-xl transition-all"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-orange-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Location Allow Karein'}</span>
            </button>

            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all"
            >
              <span>Location Manually Choose Karein</span>
            </button>
          </div>

        </div>
      </section>

      {/* Error state if API fails */}
      {loadError && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="font-bold text-sm text-stone-900">Bhandare load nahi ho paaye</h4>
            <p className="text-xs text-stone-600">Please connection check karein aur dobara try karein.</p>
            <button
              onClick={loadData}
              className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Dobara Try Karein</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SHELF: HAPPENING RIGHT NOW (Abhi Yahan Bhandara Chal Raha Hai)           */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {happeningNow.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                    Abhi Yahan Bhandara Chal Raha Hai
                  </h2>
                  <p className="text-xs text-stone-500">Live Prasad distribution underway right now</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('explore', 'status:HAPPENING_NOW')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Sabhi Dekhein ({happeningNow.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {happeningNow.map(b => (
                <BhandaraCard
                  key={b.id}
                  bhandara={b}
                  onSelect={(slug) => onNavigate('detail', slug)}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 4. SHELF: SABSE PAAS KE BHANDARE (Nearest to Detected / Chosen Location) */}
        {/* ========================================================================= */}
        <section ref={nearestSectionRef} className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                  Sabse Paas Ke Bhandare
                </h2>
                <p className="text-xs text-stone-500">
                  {locationLabel} se distance ke anusar
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('explore', 'sort:nearest')}
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Explore All Near Me</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {nearest.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFDF9] border border-stone-200/90 rounded-2xl max-w-md mx-auto space-y-2">
              <p className="font-bold text-stone-800 text-xs">Is waqt aapke aas-paas koi Bhandara nahi mila.</p>
              <p className="text-xs text-stone-500">Location badal kar ya distance badhakar dobara dekhein.</p>
              <button
                onClick={() => setShowLocationModal(true)}
                className="mt-2 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs inline-block"
              >
                Location Change Karein
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearest.map(b => (
                <BhandaraCard
                  key={b.id}
                  bhandara={b}
                  onSelect={(slug) => onNavigate('detail', slug)}
                  onShare={onShare}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 5. SHELF: SHURU HONE WALE HAIN (Starting Soon Within 60 Mins)             */}
        {/* ========================================================================= */}
        {startingSoon.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                    Shuru Hone Wale Hain
                  </h2>
                  <p className="text-xs text-stone-500">Starting within 60 minutes</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('explore', 'status:STARTING_SOON')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Sabhi Dekhein</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {startingSoon.map(b => (
                <BhandaraCard
                  key={b.id}
                  bhandara={b}
                  onSelect={(slug) => onNavigate('detail', slug)}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 6. SHELF: AANE WALE BHANDARE (Upcoming Scheduled Feasts)                  */}
        {/* ========================================================================= */}
        {upcoming.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                    Aane Wale Bhandare
                  </h2>
                  <p className="text-xs text-stone-500">Upcoming community feasts and festival Langars</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('explore', 'status:UPCOMING')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.slice(0, 6).map(b => (
                <BhandaraCard
                  key={b.id}
                  bhandara={b}
                  onSelect={(slug) => onNavigate('detail', slug)}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 7. SHELF: NAYE JUDE BHANDARE (Recently Added by Community)                */}
        {/* ========================================================================= */}
        {recentlyAdded.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                    Naye Jude Bhandare
                  </h2>
                  <p className="text-xs text-stone-500">Recently contributed by local sevadars and samitis</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('explore', 'sort:recently_added')}
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Sabhi Naye Dekhein</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentlyAdded.map(b => (
                <BhandaraCard
                  key={b.id}
                  bhandara={b}
                  onSelect={(slug) => onNavigate('detail', slug)}
                  onShare={onShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 8. COMMUNITY & SEVA STORY SECTION: ANNSETU BRIDGE                         */}
        {/* ========================================================================= */}
        <section className="pt-6">
          <div className="bg-[#FFFDF9] border border-orange-200/90 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden relative">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Authentic Indian Seva Story */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 bg-orange-100/90 text-orange-950 px-3 py-1 rounded-full text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                  <span>Ann + Setu = Bhojan aur Samuday ka Setu</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-stone-900 font-heading leading-tight">
                  Seva Ko Logon Tak Pahunchane Ka Ek Setu
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Bhartiya parampara mein Anna Daan ko sabse bada daan maana gaya hai. Mandiron, gurudwaron, aur gali-mohallon mein har roz hazaron samitiyan nishkwarth bhav se prasad banti hain. Lekin aksar zarooratmand logon aur devotees ko sahi samay aur jagah ka pata nahi chal pata.
                </p>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  AnnSetu ka lakshya aadhunik technology aur GPS ki madad se har bhakt ko pavitra Mahaprasad tak bina kisi bhatkav ke seedhe pahunchana hai.
                </p>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl">
                    <span className="text-base font-bold text-orange-800 block">01. Live Timings</span>
                    <span className="text-xs text-stone-600 mt-1 block leading-snug">Indian Standard Time ke hisaab se live status updates.</span>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                    <span className="text-base font-bold text-amber-800 block">02. Devotee Trust</span>
                    <span className="text-xs text-stone-600 mt-1 block leading-snug">Wahan maujood log confirm karte hain ki bhandara chal raha hai.</span>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                    <span className="text-base font-bold text-emerald-800 block">03. Seedha Raasta</span>
                    <span className="text-xs text-stone-600 mt-1 block leading-snug">One-tap Google Maps se entry gate tak seedhe pahunchein.</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Authentic Indian Kitchen Seva Photo */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-orange-200">
                <img
                  src={ASSETS.communityFoodSeva}
                  alt="Indian sevadars happily preparing fresh hot food in large community bhandara kitchen"
                  className="w-full h-auto aspect-4/3 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs p-2.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                  <p className="font-bold">Nishkwarth Seva Bhav</p>
                  <p className="text-[11px] text-amber-200">Daily Langar & Bhandara preparation across India</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. "AAPKE AREA MEIN BHANDARA HO RAHA HAI?" ADD BHANDARA CTA SECTION       */}
        {/* ========================================================================= */}
        <section className="pt-2">
          <div className="bg-gradient-to-br from-stone-900 via-[#271E16] to-stone-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-orange-500/20">
            
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full">
                <PlusCircle className="w-3.5 h-3.5" />
                Community Contribution
              </span>

              <h2 className="text-2xl sm:text-4xl font-black font-heading leading-tight text-white">
                Aapke Area Mein Bhandara Ho Raha Hai?
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Uski jaankari AnnSetu par share karein, taaki aas-paas ke log bhi us tak aasani se pahunch sakein. Chahe mandir ka bhandara ho, gurdwara langar ho, ya kisi parivaar ki niji seva — aapka ek post hazaron logon tak prasad pahuncha sakta hai.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('add')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Bhandara Add Karein</span>
                </button>

                <button
                  onClick={() => onNavigate('add')}
                  className="inline-flex items-center gap-2 bg-stone-800/80 hover:bg-stone-700 text-amber-200 border border-amber-400/30 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition-all"
                >
                  <FileImage className="w-4 h-4 text-orange-400" />
                  <span>Poster / Flyer Upload Karein (AI Auto-Fill)</span>
                </button>
              </div>
            </div>

            {/* Subtle background motif */}
            <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none hidden md:block text-orange-400">
              <Flame className="w-72 h-72 fill-orange-400" />
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. COMMUNITY TRUST SECTION: SAHI JAANKARI. SAHI JAGAH. SAHI SAMAY.      */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
              Vishwas & Satyata
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading">
              Sahi Jaankari. Sahi Jagah. Sahi Samay.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              AnnSetu ke char stambh jo devotee ko galat jaankari aur bhatkav se bachate hain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2.5 shadow-2xs hover:border-orange-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Community Confirmed</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Venue par maujood bhakt ek click se confirm karte hain ki prasad chalu hai ya khatam ho gaya.
              </p>
            </div>

            <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2.5 shadow-2xs hover:border-orange-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Verified Organizer</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Registered mandir trust aur aadhikarik samitiyon ko verification badge diya jata hai.
              </p>
            </div>

            <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2.5 shadow-2xs hover:border-orange-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Live IST Timings</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Bina purane ya expired program ke, samay ke anusar status automatically update hota hai.
              </p>
            </div>

            <div className="p-5 bg-[#FFFDF9] border border-stone-200/90 rounded-2xl space-y-2.5 shadow-2xs hover:border-orange-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Report & Corrections</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Kisi bhi galat address ya timing ko community report kar sakti hai, jise admin turant check karta hai.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. CITIES / HOLY DHAMS EXPLORER                                          */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
                City aur Dham ke Anusar Khojein
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Pavitra Anna Daan centers across India</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cities.map(city => (
              <button
                key={city.slug}
                onClick={() => onNavigate('area', city.slug)}
                className="group p-4 rounded-2xl bg-[#FFFDF9] border border-stone-200/90 hover:border-orange-400 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="w-8 h-8 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center font-bold text-xs group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </span>
                  {city.bhandaraCount !== undefined && city.bhandaraCount > 0 && (
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      {city.bhandaraCount} active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-orange-600 transition-colors">
                    {city.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-normal">{city.state}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
