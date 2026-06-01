import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';

// Helper to calculate distance in KM between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useAutoTracker(
  isEnabled: boolean,
  isTripActive: boolean,
  onStartTrip: () => void,
  onUpdateTrip: (distanceToAdd: number) => void,
  onStopTrip: () => void
) {
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h

  const watchIdRef = useRef<string | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function startTracking() {
      if (!isEnabled) {
        if (watchIdRef.current) {
          Geolocation.clearWatch({ id: watchIdRef.current });
          watchIdRef.current = null;
        }
        setGpsStatus('idle');
        return;
      }

      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            setGpsStatus('error');
            return;
          }
        }

        setGpsStatus('tracking');

        const obj = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
          (position, err) => {
            if (err) {
              console.error('GPS Error:', err);
              return;
            }
            if (!position) return;

            const { latitude: lat, longitude: lng, speed: mpsSpeed } = position.coords;
            const now = Date.now();

            // Calculate speed in km/h
            // if speed is provided by GPS device, use it. Otherwise calculate manually
            let speedKmH = (mpsSpeed || 0) * 3.6;

            if (lastLocationRef.current) {
              const { lat: lastLat, lng: lastLng, time: lastTime } = lastLocationRef.current;
              const distanceKm = calculateDistance(lastLat, lastLng, lat, lng);
              const timeDiffHours = (now - lastTime) / (1000 * 60 * 60);

              if (timeDiffHours > 0 && !mpsSpeed) {
                speedKmH = distanceKm / timeDiffHours;
              }

              // Update distance if trip is active
              if (isTripActive && distanceKm > 0.01) { // minimum 10 meters to avoid gps jitter
                onUpdateTrip(distanceKm);
              }
            }

            setCurrentSpeed(Math.round(speedKmH));
            lastLocationRef.current = { lat, lng, time: now };

            // AUTOPILOT LOGIC:
            // 1. Start Trip if speed > 10 km/h
            if (speedKmH > 10 && !isTripActive) {
              onStartTrip();
              if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
            }

            // 2. Stop Trip if speed < 3 km/h for 2 minutes
            if (isTripActive) {
              if (speedKmH < 3) {
                if (!stopTimeoutRef.current) {
                  stopTimeoutRef.current = setTimeout(() => {
                    onStopTrip();
                    stopTimeoutRef.current = null;
                  }, 2 * 60 * 1000); // 2 minutes
                }
              } else {
                if (stopTimeoutRef.current) {
                  clearTimeout(stopTimeoutRef.current);
                  stopTimeoutRef.current = null;
                }
              }
            }
          }
        );

        watchIdRef.current = obj;
      } catch (error) {
        console.error('Failed to start GPS tracking:', error);
        setGpsStatus('error');
      }
    }

    startTracking();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [isEnabled, isTripActive, onStartTrip, onUpdateTrip, onStopTrip]);

  return { gpsStatus, currentSpeed };
}
