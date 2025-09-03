import { supabase } from './supabase'

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: 'super_admin' | 'admin'
  created_at: string
  updated_at: string
}

export interface AdminStats {
  total_users: number
  free_users: number
  professional_users: number
  enterprise_users: number
  total_datasets: number
  total_analyses: number
  total_credits_remaining: number
  ai_recommendations_used: number
  swot_analyses_used: number
}

export interface UserWithCredits {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  credits: number
  plan: 'free' | 'professional' | 'enterprise'
  last_reset: string
  total_analyses: number
}

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) throw error
    return data || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get current user's admin role
export async function getCurrentUserRole(): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('get_admin_role')
    if (error) throw error
    return data || 'user'
  } catch (error) {
    console.error('Error getting admin role:', error)
    return 'user'
  }
}

// Get admin stats
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const { data, error } = await supabase
      .from('admin_stats')
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
}

// Get all users with credits info
export async function getAllUsers(): Promise<UserWithCredits[]> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select(`
        user_id,
        credits,
        plan,
        last_reset,
        created_at,
        auth.users!inner(
          id,
          email,
          created_at,
          last_sign_in_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get analysis counts for each user
    const userAnalyses = await supabase
      .from('analyses')
      .select('user_id')
      .then(({ data: analyses }) => {
        const counts: Record<string, number> = {}
        analyses?.forEach(analysis => {
          counts[analysis.user_id] = (counts[analysis.user_id] || 0) + 1
        })
        return counts
      })

    return (data || []).map((item: any) => ({
      id: item.user_id,
      email: item.auth?.users?.email || 'Unknown',
      created_at: item.auth?.users?.created_at || item.created_at,
      last_sign_in_at: item.auth?.users?.last_sign_in_at,
      credits: item.credits,
      plan: item.plan,
      last_reset: item.last_reset,
      total_analyses: userAnalyses[item.user_id] || 0
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Update user's plan and credits
export async function updateUserPlan(
  userId: string, 
  newPlan: 'free' | 'professional' | 'enterprise'
): Promise<boolean> {
  try {
    const creditAmounts = {
      free: 11,
      professional: 216,
      enterprise: 1008
    }

    const { error } = await supabase
      .from('user_credits')
      .update({ 
        plan: newPlan,
        credits: creditAmounts[newPlan],
        last_reset: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user plan:', error)
    return false
  }
}

// Add credits to user
export async function addCreditsToUser(userId: string, amount: number): Promise<boolean> {
  try {
    // Get current credits
    const { data: currentData, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    const newCredits = (currentData?.credits || 0) + amount

    const { error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding credits to user:', error)
    return false
  }
}

// Get recent analyses
export async function getRecentAnalyses(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        user_id,
        created_at,
        radius_km,
        suppliers_count,
        ai_recommendation,
        ai_swot_analysis,
        offices!inner(office_name),
        datasets!inner(filename)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent analyses:', error)
    return []
  }
}

// Reset all user credits (monthly reset)
export async function resetAllUserCredits(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('reset_monthly_credits')
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error resetting all user credits:', error)
    return false
  }
}

// Get admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return []
  }
}

// Add admin user
export async function addAdminUser(email: string, role: 'admin' | 'super_admin' = 'admin'): Promise<boolean> {
  try {
    // First get the user ID from auth.users
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError) throw userError

    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userData.id,
        email,
        role
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding admin user:', error)
    return false
  }
}
