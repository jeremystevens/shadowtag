import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getCurrentSession } from '../lib/supabase';

export type PlayerStatus = 'neutral' | 'it' | 'out';
export type MysteryRole = 'none' | 'tracker' | 'decoy' | 'mole';

export type Avatar = {
  id: string;
  url: string;
  label: string;
};

// Curated selection of stylized avatars
export const AVATARS: Avatar[] = [
  { id: 'bear', url: '/avatars/bear.png', label: 'The Bear' },
  { id: 'cat', url: '/avatars/cat.png', label: 'The Phantom' },
  { id: 'rabbit', url: '/avatars/rabbit.png', label: 'The Ghost' },
  { id: 'chicken', url: '/avatars/chicken.png', label: 'The Rogue' },
  { id: 'meerkat', url: '/avatars/meerkat.png', label: 'The Watcher' },
  { id: 'panda', url: '/avatars/panda.png', label: 'The Shadow' },
  { id: 'gamer', url: '/avatars/gamer.png', label: 'The Hunter' },
  { id: 'boy', url: '/avatars/boy.png', label: 'The Drifter' },
  { id: 'woman', url: '/avatars/woman.png', label: 'The Stalker' },
  { id: 'woman2', url: '/avatars/woman2.png', label: 'The Tracker' },
  { id: 'woman3', url: '/avatars/woman3.png', label: 'The Specter' },
  { id: 'woman4', url: '/avatars/woman4.png', label: 'The Wraith' }
];

export interface Player {
  id: string;
  codename: string;
  status: PlayerStatus;
  joinedAt: Date;
  lastTaggedAt: Date | null;
  becameItAt: Date | null;
  tagStreak: number;
  totalTags: number;
  isAdmin?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  points: number;
  dodgeCount: number;
  lastDodgeAt: Date | null;
  powerUps: {
    extraDodge: boolean;
    shadowCloak: boolean;
    reverseTag: boolean;
  };
  lastLocationUpdate: number;
  mysteryRole: MysteryRole;
  roleRevealedAt: Date | null;
  roleCooldown: string | null;
  disguiseActive: boolean;
  disguiseUntil: Date | null;
  isAdditionalIt: boolean;
  fakeDodgeCount: number;
  lastFakeDodgeAt: Date | null;
  baitPingCount: number;
  lastBaitPingAt: Date | null;
  hasUsedWhisper: boolean;
  avatarId: string;
  avatarUrl: string;
}

export interface Match {
  id: string;
  startedAt: string;
  endedAt: string | null;
  duration: string;
  isActive: boolean;
  winnerId: string | null;
  createdAt: string | null;
  regionLat: number | null;
  regionLng: number | null;
  regionName: string | null;
}

export interface Tag {
  id: string;
  taggerId: string;
  taggedId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
}

export interface Dodge {
  id: string;
  playerId: string;
  dodgedPlayerId: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

export interface Season {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
}

export type EventType = 'double_tag' | 'silent_mode' | 'tag_reversal';

export interface FlashEvent {
  id: string;
  type: EventType;
  startedAt: Date;
  endsAt: Date;
  isActive: boolean;
}

export interface Whisper {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
}

interface GameState {
  initialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentPlayer: Player | null;
  players: Player[];
  tags: Tag[];
  dodges: Dodge[];
  nearbyPlayers: Player[];
  seasons: Season[];
  currentSeason: Season | null;
  currentMatch: Match | null;
  locationWatchId: number | null;
  locationError: string | null;
  whispers: Whisper[];
  lastLocationUpdate: number;
  currentEvent: FlashEvent | null;
  
  // Actions
  initGame: () => Promise<void>;
  login: (codename: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (codename: string, password: string, avatarId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  tagPlayer: (taggedId: string) => Promise<boolean>;
  dodgePlayer: (dodgedId: string) => Promise<boolean>;
  updateLocation: () => Promise<void>;
  startSeason: (name: string) => Promise<void>;
  endCurrentSeason: () => Promise<void>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  clearLocationError: () => void;
  restoreSession: () => Promise<void>;
  joinMatch: () => Promise<boolean>;
  
  // Admin actions
  resetGame: () => Promise<void>;

  // Mind Games actions
  fakeDodge: (targetId: string) => Promise<boolean>;
  baitPing: (location: { lat: number; lng: number }) => Promise<boolean>;
  sendWhisper: (receiverId: string, message: string) => Promise<boolean>;
  activateDisguise: () => Promise<boolean>;
  useTrackerAbility: () => Promise<{lat: number, lng: number} | null>;
  useDecoyAbility: () => Promise<boolean>;
  clearError: () => void;
}

// Helper function to generate consistent email from codename
const generateEmail = (codename: string) => `${codename.toLowerCase()}@shadowtag.game`;

const LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 60000, // Increased from 30000 to 60000 milliseconds
  maximumAge: 60000,
};

const MIN_DISTANCE_CHANGE = 5;
const MIN_UPDATE_INTERVAL = 3000;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Helper function to check network connection
function isOnline(): boolean {
  return navigator.onLine;
}

export const useGameStore = create<GameState>((set, get) => ({
  initialized: false,
  isLoading: false,
  error: null,
  currentPlayer: null,
  players: [],
  tags: [],
  dodges: [],
  nearbyPlayers: [],
  seasons: [],
  currentSeason: null,
  currentMatch: null,
  locationWatchId: null,
  locationError: null,
  whispers: [],
  lastLocationUpdate: 0,
  currentEvent: null,
  
  initGame: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await get().restoreSession();
      
      // Get current flash event
      const { data: eventData } = await supabase
        .from('flash_events')
        .select('*')
        .eq('is_active', true)
        .lte('started_at', new Date().toISOString())
        .gte('ends_at', new Date().toISOString())
        .maybeSingle();

      const { data: seasonData, error: seasonError } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (seasonError && seasonError.code !== 'PGRST116') {
        console.error('Error fetching current season:', seasonError);
      }
      
      const { data: playersData } = await supabase
        .from('players')
        .select('*');
      
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data: dodgesData } = await supabase
        .from('dodges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .maybeSingle();
      
      set({
        initialized: true,
        isLoading: false,
        currentSeason: seasonData || null,
        players: playersData || [],
        tags: tagsData || [],
        dodges: dodgesData || [],
        currentEvent: eventData || null,
        currentMatch: matchData || null,
      });
      
      if (get().currentPlayer) {
        get().startLocationTracking();
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      set({ 
        error: 'Failed to initialize game. Please try again.',
        isLoading: false,
        initialized: true
      });
    }
  },

  restoreSession: async () => {
    try {
      const session = await getCurrentSession();
      if (!session) return;

      const { data: player } = await supabase
        .from('players')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (player) {
        set({ currentPlayer: player });
        get().startLocationTracking();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
  },
  
  login: async (codename: string, password: string) => {
    try {
      // First check if the player exists using maybeSingle to handle no results
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('codename', codename)
        .maybeSingle();

      if (playerError && playerError.code !== 'PGRST116') {
        console.error('Database error:', playerError);
        return { success: false, error: 'An error occurred. Please try again.' };
      }

      if (!playerData) {
        return { success: false, error: 'Player not found. Please check your codename or sign up.' };
      }

      // Generate email consistently using the same pattern as signup
      const email = generateEmail(codename);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        return { success: false, error: 'Invalid password. Please try again.' };
      }

      const { data: fullPlayerData, error: fullPlayerError } = await supabase
        .from('players')
        .select('*')
        .eq('codename', codename)
        .single();
      
      if (fullPlayerError || !fullPlayerData) {
        console.error('Failed to fetch player data:', fullPlayerError);
        return { success: false, error: 'Failed to load player data. Please try again.' };
      }
      
      set({ currentPlayer: fullPlayerData });
      get().startLocationTracking();
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },
  
  signup: async (codename: string, password: string, avatarId?: string) => {
    try {
      // Check if codename is available
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('codename', codename)
        .maybeSingle();

      if (existingPlayer) {
        return { success: false, error: 'This codename is already taken. Please choose another one.' };
      }

      // Generate email consistently
      const email = generateEmail(codename);

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        if (authError.message.includes('User already registered')) {
          return { success: false, error: 'This codename is already registered. Please try logging in instead.' };
        }
        throw authError;
      }

      const session = await getCurrentSession();
      if (!session) {
        return { success: false, error: 'Failed to create account. Please try again.' };
      }

      // Find selected avatar
      const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert([
          {
            id: session.user.id,
            codename,
            avatar_id: avatar.id,
            avatar_url: avatar.url,
            status: 'neutral',
            tag_streak: 0,
            total_tags: 0,
          },
        ])
        .select()
        .single();
      
      if (playerError) {
        throw playerError;
      }
      
      set({ currentPlayer: player });
      get().startLocationTracking();
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      };
    }
  },
  
  logout: async () => {
    try {
      get().stopLocationTracking();
      await supabase.auth.signOut();
      set({ currentPlayer: null });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
  
  tagPlayer: async (taggedId: string) => {
    const { currentPlayer } = get();
    if (!currentPlayer || currentPlayer.status !== 'it') return false;
    
    try {
      const { error } = await supabase.rpc('tag_player', {
        tagger_id: currentPlayer.id,
        tagged_id: taggedId,
      });
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to tag player:', error);
      return false;
    }
  },
  
  dodgePlayer: async (dodgedId: string) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return false;
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          LOCATION_OPTIONS
        );
      });
      
      const { latitude: lat, longitude: lng } = position.coords;
      
      const { data, error } = await supabase.rpc('handle_dodge', {
        dodging_player_id: currentPlayer.id,
        dodged_player_id: dodgedId,
        dodge_location: { lat, lng },
      });
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to dodge:', error);
      return false;
    }
  },
  
  updateLocation: async () => {
    const { currentPlayer, lastLocationUpdate } = get();
    if (!currentPlayer) return;
    
    const now = Date.now();
    if (now - lastLocationUpdate < MIN_UPDATE_INTERVAL) {
      return;
    }

    try {
      set({ locationError: null });

      if (!isOnline()) {
        set({ locationError: 'No internet connection. Please check your network settings.' });
        return;
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          LOCATION_OPTIONS
        );
      });
      
      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      
      if (accuracy > 100) {
        set({ locationError: 'Low location accuracy. Please check your GPS settings.' });
        return;
      }
      
      if (currentPlayer.location) {
        const distance = calculateDistance(
          currentPlayer.location.lat,
          currentPlayer.location.lng,
          lat,
          lng
        );
        
        if (distance < MIN_DISTANCE_CHANGE) {
          return;
        }
      }
      
      await supabase
        .from('players')
        .update({
          location: { lat, lng },
          last_location_update: new Date().toISOString(),
        })
        .eq('id', currentPlayer.id);
      
      const { data: nearbyPlayers } = await supabase.rpc('get_nearby_players', {
        user_lat: lat,
        user_lng: lng,
        radius_meters: 500
      });
      
      set({ nearbyPlayers: nearbyPlayers || [], lastLocationUpdate: now });
    } catch (error) {
      console.error('Failed to update location:', error);
      let errorMessage = 'Failed to update location';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services in your browser settings and refresh the page.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your GPS signal and internet connection.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please check your GPS signal and try again.';
            break;
        }
      }
      
      set({ locationError: errorMessage });
    }
  },
  
  startLocationTracking: async () => {
    const { currentPlayer, locationWatchId } = get();
    if (!currentPlayer || locationWatchId) return;
    
    try {
      if (!isOnline()) {
        set({ locationError: 'No internet connection. Please check your network settings.' });
        return;
      }

      await get().updateLocation();
      
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          
          if (accuracy > 100) {
            return;
          }
          
          const now = Date.now();
          const { lastLocationUpdate, currentPlayer } = get();
          
          if (now - lastLocationUpdate < MIN_UPDATE_INTERVAL) {
            return;
          }
          
          if (currentPlayer?.location) {
            const distance = calculateDistance(
              currentPlayer.location.lat,
              currentPlayer.location.lng,
              lat,
              lng
            );
            
            if (distance < MIN_DISTANCE_CHANGE) {
              return;
            }
          }
          
          await supabase
            .from('players')
            .update({
              location: { lat, lng },
              last_location_update: new Date().toISOString(),
            })
            .eq('id', currentPlayer.id);
          
          const { data: nearbyPlayers } = await supabase.rpc('get_nearby_players', {
            user_lat: lat,
            user_lng: lng,
            radius_meters: 500
          });
          
          set({ nearbyPlayers: nearbyPlayers || [], locationError: null, lastLocationUpdate: now });
        },
        (error) => {
          console.error('Location tracking error:', error);
          let errorMessage = 'Location tracking failed';
          
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services and refresh the page.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your GPS signal.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Please check your connection.';
                break;
            }
          }
          
          set({ locationError: errorMessage });
        },
        LOCATION_OPTIONS
      );
      
      set({ locationWatchId: watchId });
      
      const channel = supabase
        .channel('location_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'players',
          },
          async (payload) => {
            if (payload.new.id !== currentPlayer.id) {
              await get().updateLocation();
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
        get().stopLocationTracking();
      };
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      set({ locationError: 'Failed to start location tracking. Please check your location settings.' });
    }
  },
  
  stopLocationTracking: () => {
    const { locationWatchId } = get();
    if (locationWatchId) {
      navigator.geolocation.clearWatch(locationWatchId);
      set({ locationWatchId: null });
    }
  },
  
  clearLocationError: () => {
    set({ locationError: null });
  },
  
  startSeason: async (name: string) => {
    try {
      const { data: season, error } = await supabase
        .from('seasons')
        .insert([
          {
            name,
            is_active: true,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      set({
        seasons: [...get().seasons, season],
        currentSeason: season,
      });
    } catch (error) {
      console.error('Failed to start season:', error);
    }
  },
  
  endCurrentSeason: async () => {
    const { currentSeason } = get();
    if (!currentSeason) return;
    
    try {
      const { error } = await supabase
        .from('seasons')
        .update({
          is_active: false,
          end_date: new Date().toISOString(),
        })
        .eq('id', currentSeason.id);
      
      if (error) throw error;
      
      set({
        currentSeason: { ...currentSeason, isActive: false, endDate: new Date() },
      });
    } catch (error) {
      console.error('Failed to end season:', error);
    }
  },
  
  resetGame: async () => {
    try {
      await supabase.rpc('reset_game');
      await get().initGame();
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  },

  fakeDodge: async (targetId: string) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return false;
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          LOCATION_OPTIONS
        );
      });
      
      const { latitude: lat, longitude: lng } = position.coords;
      
      const { data, error } = await supabase.rpc('create_fake_dodge', {
        player_id: currentPlayer.id,
        target_id: targetId,
        dodge_location: { lat, lng },
      });
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to fake dodge:', error);
      return false;
    }
  },
  
  baitPing: async (location: { lat: number; lng: number }) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return false;
    
    try {
      const { data, error } = await supabase.rpc('create_bait_ping', {
        player_id: currentPlayer.id,
        ping_location: location,
      });
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to create bait ping:', error);
      return false;
    }
  },

  sendWhisper: async (receiverId: string, message: string) => {
    const { currentPlayer } = get();
    if (!currentPlayer || currentPlayer.hasUsedWhisper) return false;
    
    try {
      const { data, error } = await supabase.rpc('send_whisper', {
        receiver_id: receiverId,
        message,
      });
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to send whisper:', error);
      return false;
    }
  },

  activateDisguise: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer || currentPlayer.status !== 'it') return false;
    
    try {
      const { data, error } = await supabase.rpc('activate_disguise');
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to activate disguise:', error);
      return false;
    }
  },
  
  useTrackerAbility: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer || currentPlayer.mysteryRole !== 'tracker') return null;
    
    try {
      const { data, error } = await supabase.rpc('use_tracker_ability');
      
      if (error) throw error;
      
      await get().initGame();
      return data as { lat: number, lng: number };
    } catch (error) {
      console.error('Failed to use tracker ability:', error);
      return null;
    }
  },
  
  useDecoyAbility: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer || currentPlayer.mysteryRole !== 'decoy') return false;
    
    try {
      const { data, error } = await supabase.rpc('use_decoy_ability');
      
      if (error) throw error;
      
      await get().initGame();
      return true;
    } catch (error) {
      console.error('Failed to use decoy ability:', error);
      return false;
    }
  },
  
  joinMatch: async () => {
    const { currentPlayer } = get();
    if (!currentPlayer) return false;
    
    try {
      set({ isLoading: true });
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          LOCATION_OPTIONS
        );
      });
      
      const { latitude: lat, longitude: lng } = position.coords;
      
      const { data, error } = await supabase.rpc('join_regional_match', {
        player_id: currentPlayer.id,
        player_lat: lat,
        player_lng: lng
      });
      
      if (error) throw error;
      
      await get().initGame();
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Failed to join match:', error);
      set({ 
        error: 'Failed to join match. Please check your location settings and try again.',
        isLoading: false 
      });
      return false;
    }
  },
  
  clearError: () => set({ error: null })
}));