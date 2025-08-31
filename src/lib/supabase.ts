import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aqfsykgjybevvdthbmlf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnN5a2dqeWJldnZkdGhibWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDE3NzQsImV4cCI6MjA3MjIxNzc3NH0.ESH9AODBUaX38pNXqDl4IFvveapSwZEczJM3a1aFppo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string
          user_id: string
          dataset_id: string
          supplier_name: string
          latitude: number
          longitude: number
          original_coordinates: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dataset_id: string
          supplier_name: string
          latitude: number
          longitude: number
          original_coordinates?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dataset_id?: string
          supplier_name?: string
          latitude?: number
          longitude?: number
          original_coordinates?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      offices: {
        Row: {
          id: string
          user_id: string
          office_name: string
          latitude: number
          longitude: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          office_name: string
          latitude: number
          longitude: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          office_name?: string
          latitude?: number
          longitude?: number
          created_at?: string
          updated_at?: string
        }
      }
      datasets: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_url: string | null
          total_suppliers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_url?: string | null
          total_suppliers?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_url?: string | null
          total_suppliers?: number
          created_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          dataset_id: string
          office_id: string
          radius_km: number
          suppliers_count: number
          supplier_names: string[]
          contextual_data: any
          ai_recommendation: string | null
          ai_swot_analysis: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dataset_id: string
          office_id: string
          radius_km: number
          suppliers_count: number
          supplier_names: string[]
          contextual_data?: any
          ai_recommendation?: string | null
          ai_swot_analysis?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dataset_id?: string
          office_id?: string
          radius_km?: number
          suppliers_count?: number
          supplier_names?: string[]
          contextual_data?: any
          ai_recommendation?: string | null
          ai_swot_analysis?: string | null
          created_at?: string
        }
      }
    }
  }
}
