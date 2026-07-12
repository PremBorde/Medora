'use client';

import { useState, useCallback, useRef } from 'react';
import { computeAIMatchScore, getPlaceType } from '../lib/aiMatchScore';

/**
 * useNearbyPlaces — Google Places Nearby Search hook.
 *
 * Uses the Google Maps Places service (loaded via @react-google-maps/api)
 * to search for hospitals, clinics, pharmacies, and diagnostic labs
 * near the user's location.
 */

const PLACE_TYPES = {
  hospital: 'hospital',
  clinic: 'doctor',
  pharmacy: 'pharmacy',
  diagnostic: 'health',
};

/**
 * Generate mock hospital data when Google Maps API is unavailable.
 */
function generateMockPlaces(userLocation, specialistType, urgencyLevel) {
  const mockHospitals = [
    {
      place_id: 'mock_1',
      name: 'Apollo Hospital',
      lat: userLocation.lat + 0.008,
      lng: userLocation.lng + 0.012,
      rating: 4.5,
      user_ratings_total: 2847,
      isOpen: true,
      vicinity: '123 Healthcare Blvd',
      types: ['hospital'],
      photos: [],
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
      hasEmergency: true,
      is24x7: true,
      isGovernment: false,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_2',
      name: 'City General Hospital',
      lat: userLocation.lat - 0.005,
      lng: userLocation.lng + 0.009,
      rating: 4.2,
      user_ratings_total: 1456,
      isOpen: true,
      vicinity: '456 Medical Lane',
      types: ['hospital'],
      photos: [],
      departments: ['General Medicine', 'Emergency', 'Pediatrics'],
      hasEmergency: true,
      is24x7: true,
      isGovernment: true,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_3',
      name: 'MedPlus Clinic',
      lat: userLocation.lat + 0.003,
      lng: userLocation.lng - 0.006,
      rating: 4.7,
      user_ratings_total: 892,
      isOpen: true,
      vicinity: '789 Wellness Ave',
      types: ['doctor', 'health'],
      photos: [],
      departments: ['General Practice', 'Dermatology'],
      hasEmergency: false,
      is24x7: false,
      isGovernment: false,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_4',
      name: 'LifeCare Diagnostics',
      lat: userLocation.lat - 0.01,
      lng: userLocation.lng - 0.004,
      rating: 4.3,
      user_ratings_total: 634,
      isOpen: false,
      vicinity: '321 Lab Street',
      types: ['health'],
      photos: [],
      departments: ['Pathology', 'Radiology'],
      hasEmergency: false,
      is24x7: false,
      isGovernment: false,
      wheelchairAccessible: false,
    },
    {
      place_id: 'mock_5',
      name: 'Fortis Memorial Hospital',
      lat: userLocation.lat + 0.015,
      lng: userLocation.lng + 0.005,
      rating: 4.6,
      user_ratings_total: 3201,
      isOpen: true,
      vicinity: '100 Premium Healthcare Park',
      types: ['hospital'],
      photos: [],
      departments: ['Cardiology', 'Oncology', 'Neurosurgery', 'Orthopedics'],
      hasEmergency: true,
      is24x7: true,
      isGovernment: false,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_6',
      name: 'MedWorld Pharmacy',
      lat: userLocation.lat - 0.002,
      lng: userLocation.lng + 0.003,
      rating: 4.1,
      user_ratings_total: 312,
      isOpen: true,
      vicinity: '55 Pharma Road',
      types: ['pharmacy', 'drugstore'],
      photos: [],
      departments: [],
      hasEmergency: false,
      is24x7: true,
      isGovernment: false,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_7',
      name: 'Max Super Speciality Hospital',
      lat: userLocation.lat + 0.02,
      lng: userLocation.lng - 0.01,
      rating: 4.4,
      user_ratings_total: 2156,
      isOpen: true,
      vicinity: '200 Super Speciality Road',
      types: ['hospital'],
      photos: [],
      departments: ['Cardiology', 'Pulmonology', 'Gastroenterology'],
      hasEmergency: true,
      is24x7: true,
      isGovernment: false,
      wheelchairAccessible: true,
    },
    {
      place_id: 'mock_8',
      name: 'Government District Hospital',
      lat: userLocation.lat - 0.012,
      lng: userLocation.lng + 0.015,
      rating: 3.8,
      user_ratings_total: 1890,
      isOpen: true,
      vicinity: '1 Civil Lines',
      types: ['hospital'],
      photos: [],
      departments: ['General Medicine', 'Surgery', 'Obstetrics'],
      hasEmergency: true,
      is24x7: true,
      isGovernment: true,
      wheelchairAccessible: true,
    },
  ];

  // Enrich with AI match scores
  return mockHospitals.map((place) => {
    const fakeGeometry = {
      location: { lat: () => place.lat, lng: () => place.lng },
    };
    const matchResult = computeAIMatchScore(
      { ...place, geometry: fakeGeometry },
      userLocation,
      specialistType,
      urgencyLevel
    );
    return {
      ...place,
      geometry: fakeGeometry,
      placeType: getPlaceType(place),
      aiScore: matchResult.score,
      aiReasons: matchResult.reasons,
      distanceText: matchResult.distanceText,
      travelTime: matchResult.travelTime,
      distanceKm: matchResult.distance,
    };
  }).sort((a, b) => b.aiScore - a.aiScore);
}

export default function useNearbyPlaces(mapRef, userLocation, specialistType, urgencyLevel) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const serviceRef = useRef(null);

  const search = useCallback(
    (keyword = '') => {
      if (!userLocation) return;

      // If Google Maps Places service is not available, use mock data
      if (!mapRef?.current || !window.google?.maps?.places) {
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
          let results = generateMockPlaces(userLocation, specialistType, urgencyLevel);
          if (keyword) {
            const q = keyword.toLowerCase();
            const isGeneralDoctor = q.includes('general physician') || q.includes('general medicine') || q.includes('general practice');
            
            const getStem = (word) => {
              if (word.includes('cardiolog')) return 'cardio';
              if (word.includes('pulmonolog')) return 'pulmono';
              if (word.includes('neurolog')) return 'neuro';
              if (word.includes('dermatolog')) return 'dermato';
              if (word.includes('oncolog')) return 'oncolo';
              if (word.includes('orthoped')) return 'ortho';
              if (word.includes('gastroenterolog')) return 'gastro';
              return word;
            };

            const queryStem = getStem(q);

            results = results.filter((p) => {
              if (isGeneralDoctor) {
                // Return all medical facilities (exclude diagnostics/pharmacies if they are too generic)
                return p.placeType === 'hospital' || p.placeType === 'clinic' || p.placeType === 'emergency';
              }
              // Normal specific keyword matching (e.g. Cardiologist matches Cardiology)
              return (
                p.name.toLowerCase().includes(queryStem) ||
                p.vicinity?.toLowerCase().includes(queryStem) ||
                p.departments?.some((d) => {
                  const dept = d.toLowerCase();
                  return dept.includes(queryStem) || queryStem.includes(dept);
                })
              );
            });
          }
          setPlaces(results);
          setLoading(false);
        }, 600);
        return;
      }

      // Real Google Places search
      if (!serviceRef.current) {
        serviceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
      }

      setLoading(true);
      setError(null);

      const request = {
        location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        radius: 5000,
        type: 'hospital',
        keyword: keyword || specialistType || 'hospital',
      };

      serviceRef.current.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const enriched = results.map((place) => {
            const matchResult = computeAIMatchScore(place, userLocation, specialistType, urgencyLevel);
            return {
              ...place,
              place_id: place.place_id,
              name: place.name,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              isOpen: place.opening_hours?.isOpen?.() ?? false,
              vicinity: place.vicinity,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
              placeType: getPlaceType(place),
              aiScore: matchResult.score,
              aiReasons: matchResult.reasons,
              distanceText: matchResult.distanceText,
              travelTime: matchResult.travelTime,
              distanceKm: matchResult.distance,
              hasEmergency: place.types?.includes('hospital'),
              is24x7: false,
              isGovernment: false,
              wheelchairAccessible: false,
              departments: [],
            };
          });
          enriched.sort((a, b) => b.aiScore - a.aiScore);
          setPlaces(enriched);
        } else {
          // Fallback to mock
          setPlaces(generateMockPlaces(userLocation, specialistType, urgencyLevel));
        }
        setLoading(false);
      });
    },
    [mapRef, userLocation, specialistType, urgencyLevel]
  );

  return { places, loading, error, search, setPlaces };
}
