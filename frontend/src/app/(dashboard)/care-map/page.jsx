'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadScript } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Map, Locate, AlertCircle, WifiOff, List } from 'lucide-react';

import useGeolocation from './hooks/useGeolocation';
import useNearbyPlaces from './hooks/useNearbyPlaces';
import useDirections from './hooks/useDirections';

import AIBanner from './components/AIBanner';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import HospitalList from './components/HospitalList';
import MapView from './components/MapView';
import DetailDrawer from './components/DetailDrawer';
import DirectionsPanel from './components/DirectionsPanel';
import BookingModal from './components/BookingModal';
import EmergencyOverlay from './components/EmergencyOverlay';
import QuickActions from './components/QuickActions';
import Mascot from '@/components/Mascot';
import { X } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
const LIBRARIES = ['places', 'geometry'];

function CareMapContent() {
  const searchParams = useSearchParams();
  const mapRef = useRef(null);

  // ── URL Params (from symptom-checker results) ───────────────────────────────
  const urgencyLevel = searchParams.get('urgencyLevel') || 'ROUTINE';
  const specialistType = searchParams.get('specialistType') || 'General Physician';
  const summary = searchParams.get('summary') || '';
  const recommendedAction = searchParams.get('action') || '';

  // ── State ────────────────────────────────────────────────────────────────────
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookingPlace, setBookingPlace] = useState(null);
  const [showEmergency, setShowEmergency] = useState(urgencyLevel === 'EMERGENCY');
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchCategory, setSearchCategory] = useState('all');
  const [showNova, setShowNova] = useState(true);
  const [mobileView, setMobileView] = useState('list');

  // ── Hooks ────────────────────────────────────────────────────────────────────
  const { location: userLocation, loading: geoLoading, error: geoError, permissionDenied, retry: retryLocation } = useGeolocation();
  const { places, loading: placesLoading, search } = useNearbyPlaces(mapRef, userLocation, specialistType, urgencyLevel);
  const { route, loading: directionsLoading, travelMode, setTravelMode, getDirections, clearRoute } = useDirections();

  // ── Search on mount when location is ready ──────────────────────────────────
  useEffect(() => {
    if (userLocation && !geoLoading) {
      search(specialistType);
    }
  }, [userLocation, geoLoading, specialistType, search]);

  // ── Filtered places ─────────────────────────────────────────────────────────
  const filteredPlaces = places.filter((p) => {
    const hasPrimaryTypes = activeFilters.some((f) => ['type_hospital', 'type_clinic', 'type_emergency'].includes(f));
    if (hasPrimaryTypes) {
      if (activeFilters.includes('type_hospital') && p.placeType !== 'hospital') return false;
      if (activeFilters.includes('type_clinic') && p.placeType !== 'clinic') return false;
      if (activeFilters.includes('type_emergency') && p.placeType !== 'emergency') return false;
    }

    if (activeFilters.includes('openNow') && !p.isOpen) return false;
    if (activeFilters.includes('24x7') && !p.is24x7) return false;
    if (activeFilters.includes('emergency') && !p.hasEmergency) return false;
    if (activeFilters.includes('government') && !p.isGovernment) return false;
    if (activeFilters.includes('private') && p.isGovernment) return false;
    if (activeFilters.includes('wheelchair') && !p.wheelchairAccessible) return false;
    return true;
  }).sort((a, b) => {
    if (activeFilters.includes('nearest')) return a.distanceKm - b.distanceKm;
    if (activeFilters.includes('highestRated')) return (b.rating || 0) - (a.rating || 0);
    return b.aiScore - a.aiScore; // Default: AI recommended
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectPlace = useCallback((place) => {
    setSelectedPlace(place);
    setDrawerOpen(true);
    clearRoute();
  }, [clearRoute]);

  const handleDirections = useCallback((place) => {
    if (!userLocation) return;
    setSelectedPlace(place);
    const lat = place.geometry?.location?.lat?.() ?? place.lat;
    const lng = place.geometry?.location?.lng?.() ?? place.lng;
    if (lat && lng) {
      getDirections(userLocation, { lat, lng }, travelMode);
      setMobileView('map');
    }
    setDrawerOpen(false);
  }, [userLocation, getDirections, travelMode]);

  const handleModeChange = useCallback((mode) => {
    setTravelMode(mode);
    if (selectedPlace && userLocation) {
      const lat = selectedPlace.geometry?.location?.lat?.() ?? selectedPlace.lat;
      const lng = selectedPlace.geometry?.location?.lng?.() ?? selectedPlace.lng;
      if (lat && lng) {
        getDirections(userLocation, { lat, lng }, mode);
      }
    }
  }, [selectedPlace, userLocation, getDirections, setTravelMode]);

  const handleBooking = useCallback((place) => {
    setBookingPlace(place);
    setDrawerOpen(false);
  }, []);

  const handleSearch = useCallback((query) => {
    search(query || specialistType);
  }, [search, specialistType]);

  const handleFilterToggle = useCallback((filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  }, []);

  // ── Nearest emergency hospital ──────────────────────────────────────────────
  const nearestEmergency = filteredPlaces.find((p) => p.hasEmergency) || filteredPlaces[0];

  // ── Loading state ───────────────────────────────────────────────────────────
  if (geoLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-primary-50 mx-auto flex items-center justify-center"
          >
            <Locate className="w-8 h-8 text-primary" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Finding your location...</h3>
            <p className="text-xs text-muted-foreground mt-1">Please allow location access for accurate results</p>
          </div>
        </div>
      </div>
    );
  }

  const mapContent = (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* ── Top: AI Banner ──────────────────────────────────────────────── */}
      <AIBanner
        urgencyLevel={urgencyLevel}
        specialistType={specialistType}
        summary={summary}
        recommendedAction={recommendedAction}
        bestMatch={filteredPlaces[0]}
      />

      {/* ── Search & Filters ────────────────────────────────────────────── */}
      <SearchBar onSearch={handleSearch} onCategoryChange={setSearchCategory} onLocateSelf={retryLocation} />
      <FilterChips activeFilters={activeFilters} onToggle={handleFilterToggle} />

      {/* ── Main Content: Cards + Map ───────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Hospital Cards */}
        <div className={`lg:col-span-5 xl:col-span-4 overflow-y-auto pr-1 no-scrollbar flex flex-col h-full min-h-0 ${
          mobileView === 'list' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            <HospitalList
              places={filteredPlaces}
              loading={placesLoading}
              selectedPlaceId={selectedPlace?.place_id}
              hoveredPlaceId={hoveredPlaceId}
              onSelectPlace={handleSelectPlace}
              onHoverPlace={setHoveredPlaceId}
              onLeavePlace={() => setHoveredPlaceId(null)}
              onDirections={handleDirections}
              onBook={handleBooking}
            />
          </div>

          {/* Directions Panel (below cards) */}
          {route && (
            <div className="mt-3 shrink-0">
              <DirectionsPanel
                route={route}
                travelMode={travelMode}
                onModeChange={handleModeChange}
                onClear={clearRoute}
                loading={directionsLoading}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Map */}
        <div className={`lg:col-span-7 xl:col-span-8 min-h-[300px] lg:min-h-0 rounded-2xl overflow-hidden border border-border shadow-inner ${
          mobileView === 'map' ? 'block' : 'hidden lg:block'
        }`}>
          <MapView
            userLocation={userLocation}
            places={filteredPlaces}
            selectedPlaceId={selectedPlace?.place_id}
            hoveredPlaceId={hoveredPlaceId}
            onSelectPlace={handleSelectPlace}
            onHoverPlace={setHoveredPlaceId}
            onLeavePlace={() => setHoveredPlaceId(null)}
            directionsResult={route?.result}
            route={route}
            mapRef={mapRef}
            isLoaded={isGoogleLoaded || !GOOGLE_MAPS_API_KEY}
          />
        </div>
      </div>

      {/* Floating Mobile Switch Button (Show List / Show Map) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 lg:hidden pointer-events-auto shadow-2xl">
        <button
          onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-xs font-bold border border-primary-600 active:scale-95 transition-all hover:bg-primary-600 shadow-glow cursor-pointer"
        >
          {mobileView === 'list' ? (
            <>
              <Map className="w-4 h-4" />
              <span>Show Map View</span>
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              <span>Show List View</span>
            </>
          )}
        </button>
      </div>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      <DetailDrawer
        place={selectedPlace}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDirections={handleDirections}
        onBook={handleBooking}
      />

      <BookingModal
        place={bookingPlace}
        isOpen={!!bookingPlace}
        onClose={() => setBookingPlace(null)}
      />

      <EmergencyOverlay
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
        nearestEmergency={nearestEmergency}
        onDirections={handleDirections}
      />

      <QuickActions
        selectedPlace={selectedPlace}
        onDirections={handleDirections}
        onBook={handleBooking}
      />

      {/* Floating Nova Companion */}
      {showNova && (
        <div className="fixed bottom-6 right-6 z-40 max-w-[220px] pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setShowNova(false)}
              className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-foreground z-50 cursor-pointer hover:bg-muted transition-all"
              title="Hide Companion"
            >
              <X className="w-3 h-3" />
            </button>
            <Mascot 
              state="explaining" 
              urgencyLevel={urgencyLevel} 
              speechText={
                urgencyLevel === 'EMERGENCY'
                  ? "Critical: Please stay calm. We recommend calling an ambulance (112) immediately. Do not attempt to drive yourself."
                  : urgencyLevel === 'URGENT'
                  ? "Urgent: We recommend visiting a clinic within 12–24 hours. Keep a log of symptoms to share with the physician."
                  : urgencyLevel === 'HOME_CARE'
                  ? "Home Care: Rest, stay hydrated, and monitor symptoms. If they worsen, seek care immediately."
                  : "Advice: A routine visit is recommended. Bring your medical history and list of current medications."
              } 
            />
          </div>
        </div>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  if (GOOGLE_MAPS_API_KEY) {
    return (
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={LIBRARIES}
        onLoad={() => setIsGoogleLoaded(true)}
        loadingElement={
          <div className="flex items-center justify-center h-[calc(100vh-140px)]">
            <div className="text-center space-y-3">
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground font-medium">Loading Smart Care Map...</p>
            </div>
          </div>
        }
      >
        {mapContent}
      </LoadScript>
    );
  }

  // No API key — render with mock data (map will show placeholder)
  return mapContent;
}

export default function CareMapPage() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative overflow-hidden bg-background bg-medical-grid">
      {/* Decorative blurred mesh circles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4 relative z-10"
      >
        <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
          <Map className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Smart Care Map</h1>
          <p className="text-xs text-muted-foreground">
            AI-powered healthcare navigation — find the best hospitals near you
          </p>
        </div>
      </motion.div>

      {/* Main content wrapped in Suspense for useSearchParams */}
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        }
      >
        <div className="flex-1 min-h-0 relative z-10">
          <CareMapContent />
        </div>
      </Suspense>
    </div>
  );
}
