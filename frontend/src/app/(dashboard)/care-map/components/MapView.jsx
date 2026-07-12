'use client';

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Navigation, Sparkles, Map, Locate, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import MEDORA_MAP_STYLES from '../lib/mapStyles';
import { MARKER_COLORS } from '../lib/aiMatchScore';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const MAP_OPTIONS = {
  styles: MEDORA_MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  minZoom: 8,
  maxZoom: 18,
};

/**
 * Create a colored SVG marker as a data URI.
 */
function createMarkerIcon(color, isSelected = false, isTopMatch = false) {
  const size = isSelected ? 40 : 32;
  const dotRadius = isSelected ? 12 : 10;
  const cx = size / 2;
  const cy = size / 2;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${isSelected ? `<circle cx="${cx}" cy="${cy}" r="${cx - 1}" fill="${color}" opacity="0.15"/>` : ''}
      <circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${color}" stroke="white" stroke-width="2.5"/>
      ${isTopMatch ? `<circle cx="${cx}" cy="${cy}" r="${dotRadius + 4}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4"/>` : ''}
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof window !== 'undefined' && window.google?.maps
      ? new window.google.maps.Size(size, size)
      : undefined,
    anchor: typeof window !== 'undefined' && window.google?.maps
      ? new window.google.maps.Point(cx, cy)
      : undefined,
  };
}

/**
 * User location "pulse dot" marker SVG.
 */
function createUserMarkerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="#0891b2" opacity="0.12"/>
      <circle cx="14" cy="14" r="8" fill="#0891b2" opacity="0.25"/>
      <circle cx="14" cy="14" r="5" fill="#0891b2" stroke="white" stroke-width="2"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof window !== 'undefined' && window.google?.maps
      ? new window.google.maps.Size(28, 28)
      : undefined,
    anchor: typeof window !== 'undefined' && window.google?.maps
      ? new window.google.maps.Point(14, 14)
      : undefined,
  };
}

/**
 * MapView — Interactive Google Map with custom markers and info windows.
 */
export default function MapView({
  userLocation,
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectPlace,
  onHoverPlace,
  onLeavePlace,
  directionsResult,
  mapRef,
  isLoaded,
  route,
}) {
  const [infoPlace, setInfoPlace] = useState(null);
  const mapInstanceRef = useRef(null);

  const center = useMemo(
    () => userLocation || { lat: 19.076, lng: 72.8777 },
    [userLocation]
  );

  const onLoad = useCallback(
    (map) => {
      mapInstanceRef.current = map;
      if (mapRef) mapRef.current = map;
    },
    [mapRef]
  );

  // Pan to selected place
  useEffect(() => {
    if (selectedPlaceId && mapInstanceRef.current) {
      const place = places?.find((p) => p.place_id === selectedPlaceId);
      if (place) {
        const lat = place.geometry?.location?.lat?.() ?? place.lat;
        const lng = place.geometry?.location?.lng?.() ?? place.lng;
        if (lat && lng) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
      }
    }
  }, [selectedPlaceId, places]);

  const hasGoogleMaps = typeof window !== 'undefined' && !!window.google?.maps;

  // Auto-fit bounds to show user location and all nearby places
  useEffect(() => {
    let listener = null;
    
    if (hasGoogleMaps && mapInstanceRef.current && places?.length > 0 && userLocation && !selectedPlaceId) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
      
      places.forEach((place) => {
        const lat = place.geometry?.location?.lat?.() ?? place.lat;
        const lng = place.geometry?.location?.lng?.() ?? place.lng;
        if (lat && lng) {
          bounds.extend(new window.google.maps.LatLng(lat, lng));
        }
      });
      
      mapInstanceRef.current.fitBounds(bounds);

      // Prevent zooming in too close
      listener = window.google.maps.event.addListener(mapInstanceRef.current, 'zoom_changed', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(15);
        }
        if (listener) {
          window.google.maps.event.removeListener(listener);
          listener = null;
        }
      });
    }

    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [places, userLocation, selectedPlaceId, hasGoogleMaps]);

  const [showTraffic, setShowTraffic] = useState(false);

  if (!hasGoogleMaps) {
    return (
      <div className="w-full h-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden relative">
        {/* Skeleton grid background */}
        <div className="absolute inset-0 bg-medical-grid opacity-30 animate-pulse pointer-events-none" />
        
        {/* Animated radar/scanning overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-primary/20 animate-ping opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-primary/10 animate-ping opacity-25" style={{ animationDelay: '0.6s' }} />

        {/* Skeleton paths (simulating roads) */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-200/60 stroke-2 fill-none animate-pulse">
          <path d="M -50 100 Q 200 150 500 200 T 1200 100" />
          <path d="M 100 -50 Q 150 300 100 800" />
          <path d="M 600 -50 Q 550 400 700 800" />
          <path d="M -50 450 L 1200 500" strokeWidth="4" />
          <path d="M -50 250 Q 400 220 1200 450" />
        </svg>

        {/* Skeleton user location beacon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center w-8 h-8">
            <span className="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping" />
            <span className="relative w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm" />
          </div>
        </div>

        {/* Skeleton hospital pins pulsing around */}
        {[
          { top: '30%', left: '25%' },
          { top: '65%', left: '75%' },
          { top: '20%', left: '70%' },
          { top: '75%', left: '35%' },
        ].map((pos, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="absolute w-6 h-6 rounded-full bg-teal-500/25 animate-pulse" style={{ animationDelay: `${idx * 0.4}s` }} />
              <span className="relative w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm relative">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={13}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {/* User Location Marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={createUserMarkerIcon()}
            zIndex={1000}
            title="Your Location"
          />
        )}

        {/* Hospital Markers */}
        {places?.map((place, index) => {
          const lat = place.geometry?.location?.lat?.() ?? place.lat;
          const lng = place.geometry?.location?.lng?.() ?? place.lng;
          if (!lat || !lng) return null;

          const isSelected = selectedPlaceId === place.place_id;
          const isHovered = hoveredPlaceId === place.place_id;
          const isTopMatch = index === 0;

          const colorKey = isTopMatch ? 'aiRecommended' : place.placeType || 'hospital';
          const color = MARKER_COLORS[colorKey]?.bg || MARKER_COLORS.hospital.bg;

          return (
            <MarkerF
              key={place.place_id}
              position={{ lat, lng }}
              icon={createMarkerIcon(color, isSelected || isHovered, isTopMatch)}
              zIndex={isSelected ? 999 : isHovered ? 998 : index === 0 ? 997 : 100}
              onClick={() => {
                onSelectPlace?.(place);
                setInfoPlace(place);
              }}
              onMouseOver={() => onHoverPlace?.(place.place_id)}
              onMouseOut={() => onLeavePlace?.()}
              animation={
                (isHovered && window.google?.maps?.Animation?.BOUNCE) || undefined
              }
            />
          );
        })}

        {/* Info Window */}
        {infoPlace && (() => {
          const lat = infoPlace.geometry?.location?.lat?.() ?? infoPlace.lat;
          const lng = infoPlace.geometry?.location?.lng?.() ?? infoPlace.lng;
          return (
            <InfoWindowF
              position={{ lat, lng }}
              onCloseClick={() => setInfoPlace(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -20) }}
            >
              <div className="p-1 min-w-[180px] max-w-[220px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <h3 className="text-xs font-bold text-gray-900 leading-tight">{infoPlace.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {infoPlace.rating && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                      ★ {infoPlace.rating}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">{infoPlace.distanceText}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-50 text-cyan-700">
                    {infoPlace.aiScore}% Match
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                    infoPlace.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {infoPlace.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </InfoWindowF>
          );
        })()}

        {/* Directions Polyline */}
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              polylineOptions: {
                strokeColor: '#0891b2',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
              suppressMarkers: false,
            }}
          />
        )}

        {/* Traffic Layer */}
        {showTraffic && <TrafficLayer />}
      </GoogleMap>

      {/* Traffic Toggle Button */}
      <button
        onClick={() => setShowTraffic(!showTraffic)}
        className={cn(
          "absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl border text-[11px] font-extrabold transition-all shadow-md cursor-pointer",
          showTraffic
            ? "border-primary bg-primary text-white shadow-glow"
            : "border-border bg-white text-muted-foreground hover:text-foreground hover:bg-muted/10"
        )}
      >
        Traffic Overlay
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 glass-premium rounded-xl px-3 py-2 flex items-center gap-3 text-[9px] font-semibold text-muted-foreground">
        {Object.entries(MARKER_COLORS).slice(0, 4).map(([key, { bg, label }]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bg }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
