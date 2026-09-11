import React, { createContext, useContext, useState, useEffect } from 'react';
import { CityInfo } from '../types/index.js';
import { api } from '../services/api.js';

interface LocationContextType {
  coords: { lat: number; lng: number } | null;
  selectedCity: string;
  selectedLocality: string;
  locationLabel: string;
  isUsingGps: boolean;
  isLocating: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'manual';
  requestGpsLocation: () => Promise<boolean>;
  setManualLocation: (city: string, locality?: string, customCoords?: { lat: number; lng: number }) => void;
  cities: CityInfo[];
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
}

const DEFAULT_COORDS = { lat: 28.6139, lng: 77.2090 }; // Delhi NCR Connaught Place area
const DEFAULT_CITY = 'Delhi NCR';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('annsetu_coords');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_COORDS; }
    }
    return DEFAULT_COORDS;
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('annsetu_city') || DEFAULT_CITY;
  });

  const [selectedLocality, setSelectedLocality] = useState<string>(() => {
    return localStorage.getItem('annsetu_locality') || '';
  });

  const [isUsingGps, setIsUsingGps] = useState<boolean>(() => {
    return localStorage.getItem('annsetu_using_gps') === 'true';
  });

  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'manual'>('prompt');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadCities() {
      try {
        const list = await api.getCities();
        setCities(list);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    loadCities();
  }, []);

  const requestGpsLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setPermissionState('denied');
      return false;
    }

    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setCoords(newCoords);
          setIsUsingGps(true);
          setPermissionState('granted');
          localStorage.setItem('annsetu_coords', JSON.stringify(newCoords));
          localStorage.setItem('annsetu_using_gps', 'true');
          setIsLocating(false);
          setShowLocationModal(false);
          resolve(true);
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err.message);
          setPermissionState('denied');
          setIsLocating(false);
          resolve(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  };

  const setManualLocation = (city: string, locality?: string, customCoords?: { lat: number; lng: number }) => {
    setSelectedCity(city);
    setSelectedLocality(locality || '');
    setIsUsingGps(false);
    setPermissionState('manual');

    localStorage.setItem('annsetu_city', city);
    localStorage.setItem('annsetu_locality', locality || '');
    localStorage.setItem('annsetu_using_gps', 'false');

    if (customCoords) {
      setCoords(customCoords);
      localStorage.setItem('annsetu_coords', JSON.stringify(customCoords));
    } else {
      const match = cities.find(c => c.name.toLowerCase() === city.toLowerCase() || c.slug === city.toLowerCase());
      if (match) {
        const matchedCoords = { lat: match.lat, lng: match.lng };
        setCoords(matchedCoords);
        localStorage.setItem('annsetu_coords', JSON.stringify(matchedCoords));
      }
    }
    setShowLocationModal(false);
  };

  const locationLabel = isUsingGps 
    ? (selectedLocality ? `${selectedLocality} (Live GPS)` : 'Current Live Location')
    : (selectedLocality ? `${selectedLocality}, ${selectedCity}` : selectedCity);

  return (
    <LocationContext.Provider
      value={{
        coords,
        selectedCity,
        selectedLocality,
        locationLabel,
        isUsingGps,
        isLocating,
        permissionState,
        requestGpsLocation,
        setManualLocation,
        cities,
        showLocationModal,
        setShowLocationModal
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
