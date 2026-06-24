'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

const CACHE_KEY = 'cs_geolocation_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos en milisegundos

interface CachedLocation {
  location: Location;
  timestamp: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2s entre reintentos

export const useGeolocation = () => {
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedLocation = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
            return {
              location: parsed.location,
              error: null,
              loading: false,
            };
          }
        }
      } catch (e) {
        // Ignorar errores de lectura de caché
      }
    }
    return {
      location: null,
      error: null,
      loading: true,
    };
  });

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'La geolocalización no es compatible con tu navegador',
        loading: false,
      }));
      return;
    }

    // Si ya tenemos una ubicación válida en el estado, no ponemos loading a true
    if (!state.location) {
      setState((prev) => ({ ...prev, loading: true }));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        retryCount.current = 0;
        if (retryTimer.current) {
          clearTimeout(retryTimer.current);
          retryTimer.current = null;
        }

        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (typeof window !== 'undefined') {
          try {
            const cacheData: CachedLocation = {
              location: newLocation,
              timestamp: Date.now(),
            };
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          } catch (e) {
            // Ignorar errores de escritura de caché
          }
        }

        setState({
          location: newLocation,
          error: null,
          loading: false,
        });
      },
      (error) => {
        // Error permanente (denegado) -> no reintentar
        if (error.code === error.PERMISSION_DENIED) {
          retryCount.current = 0;
          setState((prev) => ({
            location: prev.location,
            error: 'Permiso de ubicación denegado por el usuario',
            loading: false,
          }));
          return;
        }

        // Error transitorio (timeout / no disponible) -> reintentar
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current++;
          // Pequeño delay antes de reintentar para no saturar
          retryTimer.current = setTimeout(() => {
            getPosition();
          }, RETRY_DELAY);
          return;
        }

        // Se agotaron los reintentos
        retryCount.current = 0;
        const msg = error.code === error.TIMEOUT
          ? 'Se agotó el tiempo para obtener la ubicación'
          : 'La información de ubicación no está disponible';

        setState((prev) => ({
          location: prev.location,
          error: prev.location ? null : msg,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  }, [state.location]);

  useEffect(() => {
    getPosition();
    return () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, []); // Solo ejecutar una vez al montar el hook

  const formatDistance = (meters?: number) => {
    if (meters === undefined || meters === null) return null;
    if (meters < 1000) {
      return `A ${Math.round(meters)} m de ti`;
    }
    const km = meters / 1000;
    return `A ${km.toFixed(1)} km de ti`;
  };

  const denied = state.error === 'Permiso de ubicación denegado por el usuario';

  return { ...state, getPosition, formatDistance, denied };
};
