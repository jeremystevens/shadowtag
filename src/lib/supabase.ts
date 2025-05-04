import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: window.localStorage
  }
});

// Subscribe to auth state changes
export const subscribeToAuthChanges = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
};

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Subscribe to location updates for nearby players
export const subscribeToLocationUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('location_updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'players',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Update player location
export const updatePlayerLocation = async (
  playerId: string,
  lat: number,
  lng: number
) => {
  return await supabase
    .from('players')
    .update({
      location: { lat, lng },
      last_location_update: new Date().toISOString(),
    })
    .eq('id', playerId);
};

// Get nearby players using PostGIS
export const getNearbyPlayers = async (
  lat: number,
  lng: number,
  radiusMeters: number = 500
) => {
  const { data, error } = await supabase.rpc('get_nearby_players', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return data;
};

// Request location permissions and get current position
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};

// Start watching location changes
export const watchLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'Geolocation is not supported by this browser.',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    });
    return 0;
  }

  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });
};

// Stop watching location
export const clearLocationWatch = (watchId: number) => {
  navigator.geolocation.clearWatch(watchId);
};