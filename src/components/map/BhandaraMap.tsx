import React, { useEffect, useRef } from 'react';
import { Bhandara } from '../../types/index.js';
import L from 'leaflet';
import { Navigation, Utensils, Clock } from 'lucide-react';
import { api } from '../../services/api.js';

interface BhandaraMapProps {
  bhandaras: Bhandara[];
  centerLat?: number;
  centerLng?: number;
  selectedBhandaraId?: string | null;
  onSelectBhandara?: (idOrSlug: string) => void;
  className?: string;
}

export const BhandaraMap: React.FC<BhandaraMapProps> = ({
  bhandaras,
  centerLat = 28.6139,
  centerLng = 77.2090,
  selectedBhandaraId,
  onSelectBhandara,
  className = 'h-[500px] w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when centerLat / centerLng changes
  useEffect(() => {
    if (mapInstanceRef.current && centerLat && centerLng) {
      mapInstanceRef.current.setView([centerLat, centerLng], mapInstanceRef.current.getZoom());
    }
  }, [centerLat, centerLng]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    bhandaras.forEach(b => {
      const isLive = b.status === 'HAPPENING_NOW';
      const isStartingSoon = b.status === 'STARTING_SOON';
      const isSelected = selectedBhandaraId === b.id || selectedBhandaraId === b.slug;

      const pinColor = isLive ? '#16A34A' : isStartingSoon ? '#D97706' : '#EA580C';
      const pulseClass = isLive ? 'live-pulse' : '';

      // Custom icon using HTML
      const iconHtml = `
        <div style="background-color: ${pinColor}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;" class="custom-bhandara-pin ${pulseClass}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'bhandara-marker-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([b.latitude, b.longitude], { icon: customIcon });

      // Popup Content
      const statusLabel = isLive 
        ? '<span style="color: #16A34A; font-weight: bold;">● Happening Now</span>' 
        : isStartingSoon 
        ? '<span style="color: #D97706; font-weight: bold;">● Starting Soon</span>' 
        : '<span style="color: #EA580C; font-weight: bold;">● Scheduled</span>';

      const popupContent = `
        <div style="font-family: Outfit, sans-serif; padding: 12px; max-width: 260px;">
          <div style="font-size: 11px; margin-bottom: 4px;">${statusLabel}</div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #1C1917; line-height: 1.3;">${b.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #57534E;">${b.venue}, ${b.locality}</p>
          <div style="font-size: 11px; color: #C2410C; font-weight: 500; margin-bottom: 8px;">🍽️ ${b.foodType}</div>
          <div style="display: flex; gap: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${b.latitude},${b.longitude}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #EA580C; color: white; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;">
              Get Directions
            </a>
            <button id="view-btn-${b.id}" style="flex: 1; text-align: center; background: #F5F5F4; color: #292524; border: 1px solid #D6D3D1; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Details
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${b.id}`);
        if (btn && onSelectBhandara) {
          btn.onclick = () => {
            onSelectBhandara(b.slug || b.id);
          };
        }
      });

      marker.addTo(markersLayerRef.current!);

      if (isSelected) {
        marker.openPopup();
        mapInstanceRef.current?.setView([b.latitude, b.longitude], 15);
      }
    });

    // Fit bounds if multiple markers exist
    if (bhandaras.length > 1 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(bhandaras.map(b => [b.latitude, b.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bhandaras, selectedBhandaraId]);

  // Handle Container Resizing
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-md">
      <div ref={mapContainerRef} className={className} />
    </div>
  );
};
