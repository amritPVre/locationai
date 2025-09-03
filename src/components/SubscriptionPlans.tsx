import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'
import { 
  getSubscriptionPlans, 
  getUserSubscription, 
  createCustomerPortalUrl,
  type SubscriptionPlan,
  type UserSubscription,
  getPlanDisplayInfo,
  formatSubscriptionStatus
} from '@/lib/lemonSqueezy'

interface SubscriptionPlansProps {
  onBack?: () => void
}

export function SubscriptionPlans({ onBack }: SubscriptionPlansProps) {
  const { user } = useAuth()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  // Removed yearly billing - only monthly plans available
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    try {
      setError('')
      const [plansData, subscriptionData] = await Promise.all([
        getSubscriptionPlans(),
        getUserSubscription(user.id)
      ])
      setPlans(plansData)
      setCurrentSubscription(subscriptionData)
    } catch (error) {
      console.error('Failed to load subscription data:', error)
      setError('Failed to load subscription information')
    }
  }

  const handleSubscribe = async (_planId: string, _billingCycle: 'monthly' | 'yearly') => {
    // Payment integration coming soon
    alert('🚧 Payment Integration Coming Soon!\n\nWe are working hard to bring you the best payment experience. Stay tuned for updates!')
  }

  const handleManageSubscription = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const portalUrl = await createCustomerPortalUrl(user.id)
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      setError('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  const getPlanPrice = (plan: SubscriptionPlan) => {
    return plan.price_monthly
  }

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.plan_id === planId
  }

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const baseFeatures = [
      `${plan.credits_monthly.toLocaleString()} AI credits per month`,
      'Location intelligence analysis',
      'Interactive mapping'
    ]

    if (plan.name === 'Free') {
      return [...baseFeatures, 'Community support', 'Basic exports (1/month)']
    } else if (plan.name === 'Pro') {
      return [
        ...baseFeatures,
        'Unlimited exports',
        'Advanced analytics',
        'Priority email support',
        'SWOT analysis & PDF reports'
      ]
    } else if (plan.name === 'Enterprise') {
      return [
        ...baseFeatures,
        'Unlimited everything',
        'White-label options',
        'Custom integrations',
        'Dedicated support manager',
        'Advanced API access',
        'Custom reporting'
      ]
    }

    return baseFeatures
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
            <p className="text-xl text-gray-300">Unlock the full power of location intelligence</p>
          </div>
          {onBack && (
            <Button 
              onClick={onBack}
              variant="outline"
              className="glass border-white/20 hover:border-white/40"
            >
              ← Back to Dashboard
            </Button>
          )}
        </div>

        {/* Monthly Billing Only */}
        <div className="text-center mb-8">
          <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-4 py-2">
            Monthly Billing Available
          </Badge>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="premium-card rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Current Subscription</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-medium">{currentSubscription.plan.name} Plan</span>
                    <Badge className={formatSubscriptionStatus(currentSubscription.status).color}>
                      {formatSubscriptionStatus(currentSubscription.status).label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {currentSubscription.cancel_at_period_end ? 'Ends' : 'Renews'}: {' '}
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="glass border-white/20 hover:border-white/40"
                >
                  Manage Billing
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const planInfo = getPlanDisplayInfo(plan.name)
            const price = getPlanPrice(plan)
            // Only monthly pricing available

            const isCurrent = isCurrentPlan(plan.id)
            const isPaid = plan.price_monthly > 0

            return (
              <Card 
                key={plan.id} 
                className={`premium-card p-8 relative transition-all duration-300 hover:scale-105 flex flex-col h-full ${
                  plan.name === 'Pro' ? 'ring-2 ring-blue-500/50' : ''
                } ${isCurrent ? 'border-green-500/50 bg-green-900/10' : ''}`}
              >
                {/* Popular Badge */}
                {plan.name === 'Pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 text-sm font-medium">
                      <Check className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{planInfo.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    {plan.name === 'Pro' ? (
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-2xl text-gray-400 line-through">$25</span>
                          <span className="text-4xl font-bold text-blue-400">${price}</span>
                          <span className="text-gray-400">/mo</span>
                        </div>
                        <div className="text-sm text-orange-400 font-medium mt-1">
                          🔥 Limited Time Offer - Save 56%!
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-blue-400">${price}</span>
                        <span className="text-gray-400">/mo</span>
                      </div>
                    )}
                    
                    {plan.price_monthly === 0 && (
                      <p className="text-sm text-gray-400 mt-1">Perfect for getting started</p>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {getPlanFeatures(plan).map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button - Fixed alignment */}
                <div className="mt-auto">
                  <Button
                    onClick={() => isPaid ? handleSubscribe(plan.id, 'monthly') : null}
                    disabled={isPaid}
                    className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                      plan.name === 'Pro'
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : plan.name === 'Enterprise'
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'glass border-white/20 hover:border-white/40 text-white'
                    }`}
                  >
                  {!isPaid ? (
                    'Get Started Free'
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Coming Soon
                    </>
                  )}
                  </Button>
                </div>

                {isPaid && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Cancel anytime • 7-day free trial
                  </p>
                )}
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Compare Features</h2>
          
          <div className="premium-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white font-semibold">Features</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">Free</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">Pro</th>
                  <th className="text-center py-4 px-6 text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-6">AI Credits per month</td>
                  <td className="py-3 px-6 text-center">10</td>
                  <td className="py-3 px-6 text-center">500</td>
                  <td className="py-3 px-6 text-center">2,000</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-6">Map exports</td>
                  <td className="py-3 px-6 text-center">1/month</td>
                  <td className="py-3 px-6 text-center">Unlimited</td>
                  <td className="py-3 px-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-6">Support</td>
                  <td className="py-3 px-6 text-center">Community</td>
                  <td className="py-3 px-6 text-center">Priority Email</td>
                  <td className="py-3 px-6 text-center">Dedicated Manager</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-6">White-label options</td>
                  <td className="py-3 px-6 text-center">-</td>
                  <td className="py-3 px-6 text-center">-</td>
                  <td className="py-3 px-6 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-6">Custom integrations</td>
                  <td className="py-3 px-6 text-center">-</td>
                  <td className="py-3 px-6 text-center">-</td>
                  <td className="py-3 px-6 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="premium-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans?</h3>
              <p className="text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades.
              </p>
            </div>
            
            <div className="premium-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">What happens to unused credits?</h3>
              <p className="text-gray-400 text-sm">
                Credits reset monthly and don't roll over. However, we track your usage patterns and can provide custom solutions for high-volume users.
              </p>
            </div>
            
            <div className="premium-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-gray-400 text-sm">
                Yes! All paid plans include a 7-day free trial. You can cancel anytime during the trial without being charged.
              </p>
            </div>
            
            <div className="premium-card rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">How secure is my data?</h3>
              <p className="text-gray-400 text-sm">
                Your data is encrypted and stored securely with enterprise-grade security. We're SOC 2 compliant and never share your business intelligence data.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Trusted by 500+ businesses worldwide</p>
          <div className="flex justify-center items-center gap-8 text-gray-500">
            <div className="text-2xl">🔒</div>
            <span className="text-sm">SSL Encrypted</span>
            <div className="text-2xl">🛡️</div>
            <span className="text-sm">SOC 2 Compliant</span>
            <div className="text-2xl">💳</div>
            <span className="text-sm">Secure Payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
