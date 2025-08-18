// Supabase 自動生成的類型定義
// 執行 npm run db:types 來更新這個檔案

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          user_id: string
          nickname: string
          item_level: number
          job_id: string
          is_main: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nickname: string
          item_level: number
          job_id: string
          is_main?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nickname?: string
          item_level?: number
          job_id?: string
          is_main?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      job_categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string
          created_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          name: string
          category_id: string
          role: Database["public"]["Enums"]["job_role"]
          logo: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          role?: Database["public"]["Enums"]["job_role"]
          logo?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category_id?: string
          role?: Database["public"]["Enums"]["job_role"]
          logo?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      raid_economics: {
        Row: {
          id: string
          raid_id: string
          character_id: string
          total_cost: number
          active_gold: number
          bound_gold: number
          total_revenue: number
          profit_ratio: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          raid_id: string
          character_id: string
          total_cost?: number
          active_gold?: number
          bound_gold?: number
          total_revenue?: number
          profit_ratio?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          raid_id?: string
          character_id?: string
          total_cost?: number
          active_gold?: number
          bound_gold?: number
          total_revenue?: number
          profit_ratio?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_economics_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_economics_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raids"
            referencedColumns: ["id"]
          }
        ]
      }
      raid_participants: {
        Row: {
          id: string
          raid_id: string
          character_id: string
          status: Database["public"]["Enums"]["participant_status"]
          position: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          raid_id: string
          character_id: string
          status?: Database["public"]["Enums"]["participant_status"]
          position?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          raid_id?: string
          character_id?: string
          status?: Database["public"]["Enums"]["participant_status"]
          position?: string | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_participants_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raids"
            referencedColumns: ["id"]
          }
        ]
      }
      raid_timeline: {
        Row: {
          id: string
          raid_id: string
          gate: string
          status: Database["public"]["Enums"]["gate_status"]
          start_time: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          raid_id: string
          gate: string
          status?: Database["public"]["Enums"]["gate_status"]
          start_time?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          raid_id?: string
          gate?: string
          status?: Database["public"]["Enums"]["gate_status"]
          start_time?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_timeline_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raids"
            referencedColumns: ["id"]
          }
        ]
      }
      raids: {
        Row: {
          id: string
          name: string
          type: Database["public"]["Enums"]["raid_type"]
          mode: Database["public"]["Enums"]["raid_mode"]
          gate: string | null
          scheduled_time: string
          status: Database["public"]["Enums"]["raid_status"]
          max_players: number
          required_dps: number
          required_support: number
          min_item_level: number
          phase1_cost: number | null
          phase2_cost: number | null
          phase3_cost: number | null
          phase4_cost: number | null
          active_gold_reward: number | null
          bound_gold_reward: number | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: Database["public"]["Enums"]["raid_type"]
          mode?: Database["public"]["Enums"]["raid_mode"]
          gate?: string | null
          scheduled_time: string
          status?: Database["public"]["Enums"]["raid_status"]
          max_players?: number
          required_dps?: number
          required_support?: number
          min_item_level: number
          phase1_cost?: number | null
          phase2_cost?: number | null
          phase3_cost?: number | null
          phase4_cost?: number | null
          active_gold_reward?: number | null
          bound_gold_reward?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["raid_type"]
          mode?: Database["public"]["Enums"]["raid_mode"]
          gate?: string | null
          scheduled_time?: string
          status?: Database["public"]["Enums"]["raid_status"]
          max_players?: number
          required_dps?: number
          required_support?: number
          min_item_level?: number
          phase1_cost?: number | null
          phase2_cost?: number | null
          phase3_cost?: number | null
          phase4_cost?: number | null
          active_gold_reward?: number | null
          bound_gold_reward?: number | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "raids_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      rewards: {
        Row: {
          id: string
          raid_id: string
          item_name: string
          quantity: number
          gold_value: number | null
          distributed: boolean
          distributed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          raid_id: string
          item_name: string
          quantity?: number
          gold_value?: number | null
          distributed?: boolean
          distributed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          raid_id?: string
          item_name?: string
          quantity?: number
          gold_value?: number | null
          distributed?: boolean
          distributed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_raid_id_fkey"
            columns: ["raid_id"]
            isOneToOne: false
            referencedRelation: "raids"
            referencedColumns: ["id"]
          }
        ]
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          available: boolean
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          available?: boolean
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          available?: boolean
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gate_status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
      job_role: "DPS" | "SUPPORT"
      participant_status: "PENDING" | "CONFIRMED" | "DECLINED" | "COMPLETED"
      raid_mode: "SOLO" | "NORMAL" | "HARD"
      raid_status: "PLANNED" | "RECRUITING" | "FULL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      raid_type: "CELESTIAL" | "DREAM" | "IVORY_TOWER" | "PLAGUE"
      user_role: "ADMIN" | "SCHEDULER" | "PLAYER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}