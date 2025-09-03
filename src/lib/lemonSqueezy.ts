// Simplified subscription types - Payment integration coming soon
export interface SubscriptionPlan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  credits_monthly: number
  features: any
  is_active: boolean
  display_order: number
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  billing_cycle: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  plan: SubscriptionPlan
}

// Mock subscription plans for display purposes
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  // Return hardcoded plans since payment is coming soon
  return [
    {
      id: 'free-plan',
      name: 'Free',
      price_monthly: 0,
      price_yearly: 0,
      credits_monthly: 10,
      features: { ai_analysis: true, basic_mapping: true },
      is_active: true,
      display_order: 0
    },
    {
      id: 'pro-plan', 
      name: 'Pro',
      price_monthly: 11,
      price_yearly: 110,
      credits_monthly: 1080,
      features: { ai_analysis: true, advanced_mapping: true, unlimited_export: true },
      is_active: true,
      display_order: 1
    },
    {
      id: 'enterprise-plan',
      name: 'Enterprise', 
      price_monthly: 108,
      price_yearly: 1080,
      credits_monthly: 10080,
      features: { ai_analysis: true, advanced_mapping: true, unlimited_export: true, white_label: true },
      is_active: true,
      display_order: 2
    }
  ]
}

// Get user's active subscription - Returns null since payment is coming soon
export async function getUserSubscription(_userId: string): Promise<UserSubscription | null> {
  // Return null since payment integration is coming soon
  return null
}

// Create checkout URL - Coming soon
export async function createCheckoutUrl(
  _planId: string,
  _userId: string,
  _userEmail: string,
  _billingCycle: 'monthly' | 'yearly' = 'monthly'
): Promise<string> {
  throw new Error('Payment integration coming soon! We are working on bringing you the best payment experience.')
}

// Create customer portal URL - Coming soon
export async function createCustomerPortalUrl(_userId: string): Promise<string> {
  throw new Error('Customer portal coming soon!')
}

// Cancel subscription - Coming soon  
export async function cancelSubscription(_userId: string): Promise<boolean> {
  throw new Error('Subscription management coming soon!')
}

// Track feature usage - Disabled
export async function trackFeatureUsage(
  _userId: string,
  feature: string,
  creditsUsed: number = 1,
  _metadata: any = {}
): Promise<void> {
  // Feature usage tracking disabled - payment system coming soon
  console.log(`Feature usage: ${feature} (${creditsUsed} credits) - tracking disabled`)
}

// Check if user can use a feature based on their plan
export async function canUseFeature(_userId: string, _feature: string): Promise<boolean> {
  // Allow all features since payment is coming soon
  return true
}

// Format subscription status for display
export function formatSubscriptionStatus(_status: string): { label: string, color: string } {
  return { label: 'Free Plan', color: 'text-gray-500' }
}

// Get plan display information
export function getPlanDisplayInfo(planName: string) {
  const planInfo: Record<string, { icon: string, color: string, badge?: string }> = {
    'Free': { icon: '🆓', color: 'text-gray-400' },
    'Pro': { icon: '⭐', color: 'text-blue-400', badge: 'Popular' },
    'Enterprise': { icon: '👑', color: 'text-purple-400', badge: 'Premium' }
  }
  
  return planInfo[planName] || { icon: '📦', color: 'text-gray-400' }
}