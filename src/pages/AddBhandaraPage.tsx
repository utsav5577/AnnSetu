import React, { useState, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLocation } from '../context/LocationContext.js';
import { 
  Sparkles, 
  Upload, 
  MapPin, 
  Clock, 
  Calendar, 
  Utensils, 
  Phone, 
  User, 
  Check, 
  AlertCircle, 
  Navigation,
  Info,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AddBhandaraPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AddBhandaraPage: React.FC<AddBhandaraPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { coords, selectedCity, cities } = useLocation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [posterBase64, setPosterBase64] = useState<string>('');
  const [posterMimeType, setPosterMimeType] = useState<string>('');
  const [isParsingPoster, setIsParsingPoster] = useState<boolean>(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [city, setCity] = useState<string>(selectedCity || 'Delhi NCR');
  const [state, setState] = useState<string>('Delhi');
  const [latitude, setLatitude] = useState<number>(coords?.lat || 28.6139);
  const [longitude, setLongitude] = useState<number>(coords?.lng || 77.2090);

  // Today's date default
  const todayStr = new Date().toISOString().split('T')[0];
  const [eventDate, setEventDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('12:00');
  const [endTime, setEndTime] = useState<string>('15:30');

  const [foodType, setFoodType] = useState<string>('Puri Sabzi & Halwa');
  const [foodItems, setFoodItems] = useState<string[]>([
    'Puri',
    'Aloo Tamatar Sabzi',
    'Suji Halwa',
    'Boondi Prasad'
  ]);
  const [customFoodItem, setCustomFoodItem] = useState<string>('');
  const [pureVegConfirmed, setPureVegConfirmed] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [expectedAttendees, setExpectedAttendees] = useState<string>('500+');
  const [organizerName, setOrganizerName] = useState<string>(user.role === 'ORGANIZER' ? user.name : '');
  const [contactPhone, setContactPhone] = useState<string>('');
  
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'Filtered Drinking Water',
    'Sitting Arrangement (Pangat)'
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successReceipt, setSuccessReceipt] = useState<{ id: string; slug: string } | null>(null);

  const POPULAR_PRASAD_ITEMS = [
    'Puri',
    'Aloo Tamatar Sabzi',
    'Suji Halwa',
    'Boondi Prasad',
    'Kheer',
    'Chana Masala',
    'Kadhi Chawal',
    'Khichdi Prasad',
    'Dal Baati Churma',
    'Boondi Ladoo',
    'Chhole Bhature',
    'Jeera Pulao',
    'Panchamrit',
    'Langar Dal'
  ];

  const NON_VEG_KEYWORDS = [
    'chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'prawn', 'shrimp',
    'crab', 'meat', 'gosht', 'egg', 'anda', 'ande', 'omelette', 'non-veg', 'nonveg',
    'bacon', 'ham', 'sausage', 'lamb', 'keema', 'biryani non', 'murgh', 'machli',
    'halal meat', 'tandoori chicken', 'kebab', 'seekh'
  ];

  const checkPureVegViolation = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const term of NON_VEG_KEYWORDS) {
      const regex = new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, 'i');
      if (regex.test(lower)) return term;
    }
    return null;
  };

  const detectedViolation = checkPureVegViolation(
    `${name} ${foodType} ${foodItems.join(' ')} ${description}`
  );

  const toggleFoodItem = (item: string) => {
    if (foodItems.includes(item)) {
      const filtered = foodItems.filter(i => i !== item);
      setFoodItems(filtered);
      if (filtered.length > 0) setFoodType(filtered.join(', '));
    } else {
      const updated = [...foodItems, item];
      setFoodItems(updated);
      setFoodType(updated.join(', '));
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customFoodItem.trim();
    if (!trimmed) return;
    const violation = checkPureVegViolation(trimmed);
    if (violation) {
      setErrorMessage(`Pure Vegetarian Policy: "${violation}" is strictly not allowed on AnnSetu.`);
      return;
    }
    if (!foodItems.includes(trimmed)) {
      const updated = [...foodItems, trimmed];
      setFoodItems(updated);
      setFoodType(updated.join(', '));
    }
    setCustomFoodItem('');
  };

  const availableFacilities = [
    'Filtered Drinking Water',
    'Sitting Arrangement (Pangat)',
    'Senior Citizen Priority Line',
    'Wheelchair Accessible',
    'Two-Wheeler & Car Parking',
    'Shoe Stand (Joota Ghar)',
    'Takeaway Prasad Allowed'
  ];

  // Handle Image Upload & Gemini Parsing
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPosterPreview(result);

      // Extract base64 and mime
      const match = result.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        setPosterMimeType(match[1]);
        setPosterBase64(match[2]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiAutoFill = async () => {
    if (!posterBase64) return;
    setIsParsingPoster(true);
    setParseSuccessMsg('');
    setErrorMessage('');

    try {
      const res = await api.parsePoster(posterBase64, posterMimeType || 'image/jpeg');
      if (res.success && res.data) {
        const d = res.data;
        if (d.name) setName(d.name);
        if (d.venue) setVenue(d.venue);
        if (d.address) setAddress(d.address);
        if (d.locality) setLocality(d.locality);
        if (d.city) setCity(d.city);
        if (d.eventDate) setEventDate(d.eventDate);
        if (d.startTime) setStartTime(d.startTime);
        if (d.endTime) setEndTime(d.endTime);
        if (d.foodType) setFoodType(d.foodType);
        if (d.organizerName) setOrganizerName(d.organizerName);
        if (d.contactPhone) setContactPhone(d.contactPhone);
        if (d.description) setDescription(d.description);

        setParseSuccessMsg('Poster successfully analyzed with Gemini AI! Please review the extracted fields below.');
      } else {
        setErrorMessage(res.message || 'Could not auto-extract poster details. Please fill manually.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('AI poster analysis unavailable. Please fill in details manually.');
    } finally {
      setIsParsingPoster(false);
    }
  };

  // Facilities toggle
  const toggleFacility = (fac: string) => {
    if (selectedFacilities.includes(fac)) {
      setSelectedFacilities(selectedFacilities.filter(f => f !== fac));
    } else {
      setSelectedFacilities([...selectedFacilities, fac]);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pureVegConfirmed) {
      setErrorMessage('Please confirm that this Bhandara serves 100% Pure Vegetarian (Satvik / Shuddh Shakahari) food.');
      return;
    }

    if (detectedViolation) {
      setErrorMessage(`Pure Vegetarian Policy Violation: The term "${detectedViolation}" is prohibited. AnnSetu is strictly for 100% Pure Vegetarian (Satvik) Bhandaras.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name,
        venue,
        address,
        locality: locality || venue,
        city,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        eventDate,
        startTime,
        endTime,
        foodType,
        foodItems,
        vegetarianStatus: 'PURE_VEG' as const,
        description,
        expectedAttendees,
        organizerName: organizerName || user.name,
        organizerId: user.role === 'ORGANIZER' ? user.id : undefined,
        contactPhone,
        posterUrl: posterPreview || undefined,
        photos: posterPreview ? [posterPreview] : [],
        facilities: selectedFacilities
      };

      const res = await api.createBhandara(payload);
      if (res.success && res.data) {
        setSuccessReceipt({ id: res.data.id, slug: res.data.slug });
      } else {
        setErrorMessage(res.error?.message || res.message || 'Failed to submit Bhandara.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-100/70 px-3 py-1 rounded-full border border-orange-200">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>Selfless Anna Daan Platform</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-heading">
          Add a Community Bhandara / Mahaprasad
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
          Help devotees locate sacred Bhandaras, Langars, and Temple Feasts. You can upload an invitation card/poster for AI auto-fill, or enter details directly.
        </p>
      </div>

      {/* Success Receipt State */}
      {successReceipt ? (
        <div className="p-8 bg-[#FFFDF9] border border-emerald-200 rounded-3xl shadow-xl text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-900 font-heading">
              Bhandara Successfully Registered!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
              Your submission has been published and is now discoverable by thousands of devotees in your area.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('detail', successReceipt.slug)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>View Published Listing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccessReceipt(null);
                setName('');
                setVenue('');
                setPosterPreview('');
                setPosterBase64('');
              }}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
            >
              Submit Another Event
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: Invitation Poster & Gemini Auto-Fill */}
          <div className="p-6 bg-[#FFFDF9] border border-orange-200/90 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>1. Invitation Poster / Card</span>
                  <span className="text-[11px] font-normal text-stone-500">(Optional but recommended)</span>
                </h3>
                <p className="text-xs text-stone-600">
                  Upload an event poster or temple pamphlet to enable 1-click AI auto-fill.
                </p>
              </div>

              {posterBase64 && (
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isParsingPoster}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isParsingPoster ? 'animate-spin' : ''}`} />
                  {isParsingPoster ? 'Gemini AI Extracting...' : '✨ Auto-Fill using Gemini AI'}
                </button>
              )}
            </div>

            {/* Poster Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/30 hover:bg-orange-50/60 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {posterPreview ? (
                <div className="space-y-3">
                  <img
                    src={posterPreview}
                    alt="Poster Preview"
                    className="max-h-60 mx-auto rounded-xl object-contain shadow-md"
                  />
                  <p className="text-xs text-stone-500">Click to change poster image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-stone-800">
                    Click to browse or drop event invitation poster / WhatsApp banner
                  </p>
                  <p className="text-[11px] text-stone-400">JPG, PNG, WebP up to 10MB</p>
                </div>
              )}
            </div>

            {/* AI Extraction Success Notification */}
            {parseSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{parseSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* STEP 2: Basic Information & Venue */}
          <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900">2. Event Name & Venue</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">
                  Bhandara / Event Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bada Mangal Hanuman Mandir Bhandara & Mahaprasad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Venue / Mandir / Trust Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pracheen Hanuman Mandir"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Locality / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place, Baba Kharak Singh Marg"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">
                  Complete Address & Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Shivaji Stadium Metro Station, Connaught Place, New Delhi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">City *</label>
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    const matched = cities.find(c => c.name === e.target.value);
                    if (matched) {
                      setLatitude(matched.lat);
                      setLongitude(matched.lng);
                      setState(matched.state);
                    }
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                >
                  {cities.map(c => (
                    <option key={c.slug} value={c.name}>{c.name} ({c.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>

            </div>

            {coords && (
              <button
                type="button"
                onClick={() => {
                  setLatitude(coords.lat);
                  setLongitude(coords.lng);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-orange-700 hover:text-orange-800 font-semibold"
              >
                <Navigation className="w-3.5 h-3.5" />
                Fill with my current GPS coordinates ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
              </button>
            )}

          </div>

          {/* STEP 3: Date, Timing & Prasad Menu */}
          <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-heading">3. Timing & Mahaprasad Menu</h3>
              
              {/* Pure Veg Banner Badge */}
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-lg">
                <div className="w-4 h-4 border-2 border-emerald-600 rounded-[3px] p-[2px] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                </div>
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">100% Shuddh Shakahari</span>
              </div>
            </div>

            {/* Pure Veg Mandatory Callout */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <div className="w-4 h-4 border-2 border-emerald-600 rounded-[3px] p-[2px] flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold">Strict Pure Vegetarian Policy (शुद्ध शाकाहारी महाप्रसाद)</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  AnnSetu is devoted solely to Satvik, Pure Vegetarian Mahaprasad and Langar. Non-vegetarian items (meat, chicken, fish, seafood, eggs) are strictly prohibited and automatically rejected.
                </p>
              </div>
            </div>

            {/* Live Violation Alert */}
            {detectedViolation && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-2 text-xs text-rose-900 font-bold animate-pulse">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Violation Detected: The term &quot;{detectedViolation}&quot; is prohibited. AnnSetu allows only 100% Pure Vegetarian listings.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              <div>
                <label className="font-bold text-stone-700 block mb-1">Event Date (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Start Time (IST) *</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">End Time (IST) *</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Prasad Quick-Select Chips */}
              <div className="sm:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 block text-xs">Select Prasad Items (Tap to toggle):</label>
                  <span className="text-[11px] text-stone-500">{foodItems.length} items selected</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_PRASAD_ITEMS.map((item) => {
                    const isSelected = foodItems.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleFoodItem(item)}
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white font-bold border-orange-600 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>
                        {item}
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Item */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add another prasad dish (e.g. Malpua, Motichoor Ladoo)..."
                    value={customFoodItem}
                    onChange={(e) => setCustomFoodItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomItem(e);
                      }
                    }}
                    className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl text-xs transition-colors"
                  >
                    + Add Dish
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">Prasad Summary / Menu Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puri, Chana Masala, Aloo Sabzi, Sooji Halwa, Kheer"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Expected Attendees</label>
                <input
                  type="text"
                  placeholder="e.g. 500+, 1000 - 2000"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-stone-700 block mb-1">Description & Seva Details</label>
                <textarea
                  rows={3}
                  placeholder="Any background story, seva guidelines, or special spiritual significance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

            </div>

            {/* Facilities Selector */}
            <div className="pt-2">
              <label className="font-bold text-stone-700 block mb-2 text-xs">Facilities Available for Devotees:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {availableFacilities.map(fac => {
                  const isChecked = selectedFacilities.includes(fac);
                  return (
                    <button
                      type="button"
                      key={fac}
                      onClick={() => toggleFacility(fac)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        isChecked 
                          ? 'bg-orange-50 border-orange-300 text-orange-900 font-semibold' 
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{fac}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* STEP 4: Organizer & Contact */}
          <div className="p-6 bg-[#FFFDF9] border border-stone-200/90 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900">4. Organizer Contact Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Organizer / Samiti Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shri Ram Seva Samiti"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Contact Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Pure Vegetarian Declaration Card */}
          <div className="p-4 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="pureVegDeclaration"
              checked={pureVegConfirmed}
              onChange={(e) => setPureVegConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded-sm border-emerald-400 focus:ring-emerald-500 shrink-0 cursor-pointer"
            />
            <label htmlFor="pureVegDeclaration" className="text-xs text-emerald-950 font-medium cursor-pointer leading-relaxed">
              <span className="font-bold text-emerald-900 block">I solemnly confirm 100% Pure Vegetarian (Shuddh Shakahari) preparation:</span>
              All Prasad and food items served are strictly satvik, vegetarian, and completely free of meat, chicken, fish, seafood, or egg products.
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-stone-500">
              By submitting, you confirm this Bhandara is open to all community devotees without discrimination.
            </p>

            <button
              type="submit"
              disabled={isSubmitting || !pureVegConfirmed || !!detectedViolation}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-orange-600/25 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Event...' : 'Publish Bhandara Listing'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
