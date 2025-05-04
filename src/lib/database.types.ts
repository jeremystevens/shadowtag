export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          codename: string
          status: 'neutral' | 'it' | 'out'
          joined_at: string
          last_tagged_at: string | null
          became_it_at: string | null
          tag_streak: number
          total_tags: number
          is_admin: boolean
          location: Json | null
          points: number
          dodge_count: number
          last_dodge_at: string | null
          power_ups: Json | null
        }
        Insert: {
          id?: string
          codename: string
          status?: 'neutral' | 'it' | 'out'
          joined_at?: string
          last_tagged_at?: string | null
          became_it_at?: string | null
          tag_streak?: number
          total_tags?: number
          is_admin?: boolean
          location?: Json | null
          points?: number
          dodge_count?: number
          last_dodge_at?: string | null
          power_ups?: Json | null
        }
        Update: {
          id?: string
          codename?: string
          status?: 'neutral' | 'it' | 'out'
          joined_at?: string
          last_tagged_at?: string | null
          became_it_at?: string | null
          tag_streak?: number
          total_tags?: number
          is_admin?: boolean
          location?: Json | null
          points?: number
          dodge_count?: number
          last_dodge_at?: string | null
          power_ups?: Json | null
        }
      }
      tags: {
        Row: {
          id: string
          tagger_id: string
          tagged_id: string
          location: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          tagger_id: string
          tagged_id: string
          location: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          tagger_id?: string
          tagged_id?: string
          location?: Json
          created_at?: string | null
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string | null
        }
      }
      dodges: {
        Row: {
          id: string
          player_id: string
          dodged_player_id: string
          created_at: string
          location: Json
        }
        Insert: {
          id?: string
          player_id: string
          dodged_player_id: string
          created_at?: string
          location: Json
        }
        Update: {
          id?: string
          player_id?: string
          dodged_player_id?: string
          created_at?: string
          location?: Json
        }
      }
    }
    Functions: {
      handle_dodge: {
        Args: {
          dodging_player_id: string
          dodged_player_id: string
          dodge_location: Json
        }
        Returns: boolean
      }
      tag_player: {
        Args: {
          tagger_id: string
          tagged_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      player_status: 'neutral' | 'it' | 'out'
    }
  }
}