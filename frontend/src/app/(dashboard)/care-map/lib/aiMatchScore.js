/**
 * AI Match Score Calculator
 *
 * Computes a 0–100 "AI Match %" for each hospital based on:
 * - Distance (closer = higher score)
 * - Rating (higher = higher)
 * - Open-now bonus
 * - Emergency capability bonus (when urgency is EMERGENCY)
 * - Specialist keyword match bonus
 */

/**
 * Haversine distance in km between two lat/lng pairs.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate driving time from distance (rough: 30km/h city average).
 */
export function estimateTravelTime(distanceKm) {
  const mins = Math.round((distanceKm / 30) * 60);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/**
 * Format distance for display.
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Compute AI match score and reason list.
 *
 * @param {Object} place - Google Places result (must have geometry.location, rating, opening_hours, types, name)
 * @param {{ lat: number, lng: number }} userLocation
 * @param {string} specialistType - e.g. "Cardiologist"
 * @param {string} urgencyLevel - e.g. "EMERGENCY"
 * @returns {{ score: number, reasons: string[], distance: number, travelTime: string }}
 */
export function computeAIMatchScore(place, userLocation, specialistType, urgencyLevel) {
  const reasons = [];
  let score = 0;

  // --- Distance component (max 30 pts) ---
  const dist = haversineDistance(
    userLocation.lat,
    userLocation.lng,
    place.geometry?.location?.lat?.() ?? place.lat ?? 0,
    place.geometry?.location?.lng?.() ?? place.lng ?? 0
  );
  const distScore = Math.max(0, 30 - dist * 3); // loses 3 pts per km
  score += distScore;
  if (dist < 3) reasons.push('Closest hospital');

  // --- Rating component (max 25 pts) ---
  const rating = place.rating ?? 0;
  const ratingScore = (rating / 5) * 25;
  score += ratingScore;
  if (rating >= 4.0) reasons.push('High patient rating');

  // --- Open Now bonus (10 pts) ---
  const isOpen = place.opening_hours?.isOpen?.() ?? place.isOpen ?? false;
  if (isOpen) {
    score += 10;
    reasons.push('Currently open');
  }

  // --- Emergency bonus (15 pts) ---
  const hasEmergency =
    place.types?.includes('hospital') ||
    place.name?.toLowerCase().includes('emergency') ||
    place.name?.toLowerCase().includes('trauma');
  if (urgencyLevel === 'EMERGENCY' && hasEmergency) {
    score += 15;
    reasons.push('Emergency support available');
  }

  // --- Specialist match bonus (20 pts) ---
  if (specialistType) {
    const nameMatch =
      place.name?.toLowerCase().includes(specialistType.toLowerCase()) ||
      place.types?.some((t) => t.includes(specialistType.toLowerCase()));
    if (nameMatch) {
      score += 20;
      reasons.push('Recommended specialist available');
    } else {
      // Partial credit for hospitals (they typically have many specialists)
      if (place.types?.includes('hospital')) {
        score += 10;
        reasons.push('Multi-specialty hospital');
      }
    }
  }

  // Clamp to 0-100
  score = Math.min(100, Math.max(0, Math.round(score)));

  // Ensure at least one reason
  if (reasons.length === 0) reasons.push('Nearby healthcare facility');

  return {
    score,
    reasons,
    distance: dist,
    distanceText: formatDistance(dist),
    travelTime: estimateTravelTime(dist),
  };
}

/**
 * Determine the marker type/color for a place.
 */
export function getPlaceType(place) {
  const types = place.types || [];
  if (place.isEmergency || types.includes('emergency')) return 'emergency';
  if (types.includes('hospital')) return 'hospital';
  if (types.includes('doctor') || types.includes('health')) return 'clinic';
  if (types.includes('pharmacy') || types.includes('drugstore')) return 'pharmacy';
  if (types.includes('physiotherapist') || types.includes('dentist')) return 'clinic';
  return 'hospital';
}

/**
 * Marker color config by type.
 */
export const MARKER_COLORS = {
  aiRecommended: { bg: '#0891b2', border: '#0d9488', label: 'AI Recommended' },
  hospital:      { bg: '#3b82f6', border: '#2563eb', label: 'Hospital' },
  clinic:        { bg: '#8b5cf6', border: '#7c3aed', label: 'Clinic' },
  diagnostic:    { bg: '#f59e0b', border: '#d97706', label: 'Diagnostic Lab' },
  pharmacy:      { bg: '#f97316', border: '#ea580c', label: 'Pharmacy' },
  emergency:     { bg: '#ef4444', border: '#dc2626', label: 'Emergency' },
};
