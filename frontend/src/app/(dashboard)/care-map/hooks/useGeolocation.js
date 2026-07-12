'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useGeolocation — Browser Geolocation hook.
 *
 * Returns the user's current { lat, lng } plus loading/error states.
 * Falls back to a default location (Mumbai) if permission is denied.
 */
const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777 }; // Mumbai

export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true);
          setError('Location access denied. Showing default location.');
        } else if (err.code === 2) {
          setError('Location unavailable. Showing default location.');
        } else {
          setError('Location request timed out. Showing default location.');
        }
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, permissionDenied, retry: requestLocation };
}
