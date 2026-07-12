'use client';

import { useState, useCallback } from 'react';
import { haversineDistance } from '../lib/aiMatchScore';

/**
 * useDirections — Google Directions API hook.
 *
 * Computes a route between two points and returns the
 * polyline, distance, duration, and step-by-step instructions.
 */

export default function useDirections() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVING');

  const getDirections = useCallback(
    (origin, destination, mode = travelMode) => {
      if (!window.google?.maps) {
        // Return simulated directions
        setLoading(true);
        setTimeout(() => {
          const distKm = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
          const speedKmh = mode === 'WALKING' ? 5 : mode === 'BICYCLING' ? 15 : 35;
          const mins = Math.round((distKm / speedKmh) * 60);
          
          setRoute({
            result: null,
            distance: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`,
            duration: mins < 1 ? '< 1 min' : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`,
            steps: [
              { instructions: 'Head towards the destination on Health Way', distance: '500 m', duration: '1 min' },
              { instructions: `Turn onto Main St and proceed for ${(distKm * 0.8).toFixed(1)} km`, distance: `${(distKm * 0.8).toFixed(1)} km`, duration: `${Math.round(mins * 0.8)} mins` },
              { instructions: 'Arrive at the medical facility on your left', distance: '0 m', duration: '0 mins' },
            ],
            startAddress: 'Your current location',
            endAddress: 'Nearby Medical Facility',
          });
          setLoading(false);
        }, 300);
        return;
      }

      setLoading(true);
      setError(null);
      setTravelMode(mode);

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(origin.lat, origin.lng),
          destination: new window.google.maps.LatLng(destination.lat, destination.lng),
          travelMode: window.google.maps.TravelMode[mode],
        },
        (result, status) => {
          if (status === 'OK' && result.routes.length > 0) {
            const leg = result.routes[0].legs[0];
            setRoute({
              result,
              distance: leg.distance.text,
              duration: leg.duration.text,
              steps: leg.steps.map((step) => ({
                instructions: step.instructions,
                distance: step.distance.text,
                duration: step.duration.text,
              })),
              startAddress: leg.start_address,
              endAddress: leg.end_address,
            });
          } else {
            setError('Could not find directions. Try a different mode.');
          }
          setLoading(false);
        }
      );
    },
    [travelMode]
  );

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return { route, loading, error, travelMode, setTravelMode, getDirections, clearRoute };
}
