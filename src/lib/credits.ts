import { supabase } from './supabase'

export interface UserCredits {
  id: string
  user_id: string
  credits: number
  plan: 'free' | 'professional' | 'enterprise'
  last_reset: string
  created_at: string
  updated_at: string
}

export const PLAN_CREDITS = {
  free: 11,
  professional: 216,
  enterprise: 1008
} as const

export const PLAN_NAMES = {
  free: 'Free',
  professional: 'Professional',
  enterprise: 'Enterprise'
} as const

// Get user's current credits
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No credits record found, create one for free plan
        return await createUserCredits(userId, 'free')
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error getting user credits:', error)
    return null
  }
}

// Create credits record for new user
export async function createUserCredits(
  userId: string, 
  plan: 'free' | 'professional' | 'enterprise' = 'free'
): Promise<UserCredits | null> {
  try {
    const credits = PLAN_CREDITS[plan]
    
    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits,
        plan,
        last_reset: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user credits:', error)
    return null
  }
}

// Deduct credits for AI usage
export async function deductCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    const currentCredits = await getUserCredits(userId)
    
    if (!currentCredits || currentCredits.credits < amount) {
      return false // Insufficient credits
    }

    const { error } = await supabase
      .from('user_credits')
      .update({ 
        credits: currentCredits.credits - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deducting credits:', error)
    return false
  }
}

// Update user's plan and credits
export async function updateUserPlan(
  userId: string, 
  newPlan: 'free' | 'professional' | 'enterprise'
): Promise<boolean> {
  try {
    const newCredits = PLAN_CREDITS[newPlan]
    
    const { error } = await supabase
      .from('user_credits')
      .update({ 
        plan: newPlan,
        credits: newCredits,
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

// Check if user needs monthly credit reset
export async function checkAndResetMonthlyCredits(userId: string): Promise<boolean> {
  try {
    const currentCredits = await getUserCredits(userId)
    
    if (!currentCredits) return false

    const lastReset = new Date(currentCredits.last_reset)
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    if (lastReset < oneMonthAgo) {
      // Reset credits based on current plan
      const newCredits = PLAN_CREDITS[currentCredits.plan]
      
      const { error } = await supabase
        .from('user_credits')
        .update({ 
          credits: newCredits,
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking/resetting monthly credits:', error)
    return false
  }
}

// Format credits display
export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

// Get credits color based on remaining amount
export function getCreditsColor(credits: number, plan: 'free' | 'professional' | 'enterprise'): string {
  const maxCredits = PLAN_CREDITS[plan]
  const percentage = (credits / maxCredits) * 100

  if (percentage > 50) return 'text-green-400'
  if (percentage > 20) return 'text-yellow-400'
  return 'text-red-400'
}
