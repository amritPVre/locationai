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
      user_credits: {
        Row: {
          id: string
          user_id: string
          credits: number
          plan: 'free' | 'professional' | 'enterprise'
          last_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits?: number
          plan?: 'free' | 'professional' | 'enterprise'
          last_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits?: number
          plan?: 'free' | 'professional' | 'enterprise'
          last_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          email: string
          role: 'super_admin' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          role?: 'super_admin' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          role?: 'super_admin' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          author_id: string | null
          author_name: string
          author_avatar: string | null
          category: string
          tags: string[]
          status: 'draft' | 'published' | 'archived'
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          published_at: string | null
          view_count: number
          like_count: number
          comment_count: number
          featured: boolean
          reading_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          author_id?: string | null
          author_name: string
          author_avatar?: string | null
          category?: string
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          featured?: boolean
          reading_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          author_id?: string | null
          author_name?: string
          author_avatar?: string | null
          category?: string
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          featured?: boolean
          reading_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          post_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          post_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          post_count?: number
          created_at?: string
        }
      }
      blog_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          user_name: string
          user_email: string
          user_avatar: string | null
          content: string
          status: 'pending' | 'approved' | 'rejected'
          parent_id: string | null
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          user_name: string
          user_email: string
          user_avatar?: string | null
          content: string
          status?: 'pending' | 'approved' | 'rejected'
          parent_id?: string | null
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          user_name?: string
          user_email?: string
          user_avatar?: string | null
          content?: string
          status?: 'pending' | 'approved' | 'rejected'
          parent_id?: string | null
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          icon: string
          position: number
          post_count: number
          last_post_id: string | null
          last_post_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          icon?: string
          position?: number
          post_count?: number
          last_post_id?: string | null
          last_post_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          icon?: string
          position?: number
          post_count?: number
          last_post_id?: string | null
          last_post_at?: string | null
          created_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          category_id: string
          title: string
          slug: string
          content: string
          author_id: string
          author_name: string
          author_avatar: string | null
          type: 'discussion' | 'announcement' | 'question' | 'feature_request' | 'bug_report'
          status: 'open' | 'closed' | 'pinned' | 'locked'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          tags: string[]
          view_count: number
          reply_count: number
          like_count: number
          last_reply_id: string | null
          last_reply_at: string | null
          solved: boolean
          solution_post_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          title: string
          slug: string
          content: string
          author_id: string
          author_name: string
          author_avatar?: string | null
          type?: 'discussion' | 'announcement' | 'question' | 'feature_request' | 'bug_report'
          status?: 'open' | 'closed' | 'pinned' | 'locked'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          tags?: string[]
          view_count?: number
          reply_count?: number
          like_count?: number
          last_reply_id?: string | null
          last_reply_at?: string | null
          solved?: boolean
          solution_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          title?: string
          slug?: string
          content?: string
          author_id?: string
          author_name?: string
          author_avatar?: string | null
          type?: 'discussion' | 'announcement' | 'question' | 'feature_request' | 'bug_report'
          status?: 'open' | 'closed' | 'pinned' | 'locked'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          tags?: string[]
          view_count?: number
          reply_count?: number
          like_count?: number
          last_reply_id?: string | null
          last_reply_at?: string | null
          solved?: boolean
          solution_post_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_replies: {
        Row: {
          id: string
          post_id: string
          user_id: string
          user_name: string
          user_avatar: string | null
          content: string
          parent_id: string | null
          like_count: number
          is_solution: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          user_name: string
          user_avatar?: string | null
          content: string
          parent_id?: string | null
          like_count?: number
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string | null
          content?: string
          parent_id?: string | null
          like_count?: number
          is_solution?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          price_monthly: number
          price_yearly: number | null
          credits_monthly: number
          features: any
          lemon_squeezy_variant_id_monthly: string | null
          lemon_squeezy_variant_id_yearly: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price_monthly: number
          price_yearly?: number | null
          credits_monthly: number
          features?: any
          lemon_squeezy_variant_id_monthly?: string | null
          lemon_squeezy_variant_id_yearly?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          credits_monthly?: number
          features?: any
          lemon_squeezy_variant_id_monthly?: string | null
          lemon_squeezy_variant_id_yearly?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          lemon_squeezy_subscription_id: string
          lemon_squeezy_customer_id: string
          status: string
          billing_cycle: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          lemon_squeezy_subscription_id: string
          lemon_squeezy_customer_id: string
          status?: string
          billing_cycle?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          lemon_squeezy_subscription_id?: string
          lemon_squeezy_customer_id?: string
          status?: string
          billing_cycle?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          lemon_squeezy_order_id: string
          lemon_squeezy_subscription_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          receipt_url: string | null
          payment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          lemon_squeezy_order_id: string
          lemon_squeezy_subscription_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string | null
          receipt_url?: string | null
          payment_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          lemon_squeezy_order_id?: string
          lemon_squeezy_subscription_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          receipt_url?: string | null
          payment_date?: string
          created_at?: string
        }
      }
      subscription_usage: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          feature_used: string
          credits_consumed: number
          usage_date: string
          metadata: any
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          feature_used: string
          credits_consumed?: number
          usage_date?: string
          metadata?: any
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          feature_used?: string
          credits_consumed?: number
          usage_date?: string
          metadata?: any
        }
      }
    }
  }
}
