# 🍋 Lemon Squeezy Integration Guide for Kmlytics

This guide will help you integrate Lemon Squeezy subscription payments into your Kmlytics app.

## 📋 Prerequisites

- [x] Lemon Squeezy account created
- [x] Existing Kmlytics app with credit system
- [x] Supabase database setup
- [x] React/TypeScript frontend

## 🚀 Step 1: Lemon Squeezy Dashboard Setup

### 1.1 Create Store
1. Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
2. Create a new Store
3. Complete store setup (name, description, etc.)

### 1.2 Create Products & Variants
Create these subscription plans to match your current pricing:

#### **Free Plan** (No Lemon Squeezy needed)
- 10 credits/month
- Basic features
- Handle this in your app without payment

#### **Professional Plan** 
- Price: $29/month
- 500 credits/month
- Advanced features

#### **Enterprise Plan**
- Price: $99/month  
- 2000 credits/month
- Priority support

### 1.3 Get API Keys
1. Go to Settings → API
2. Copy your **API Key** and **Store ID**
3. Create a **Webhook Endpoint** (we'll set this up later)

## 🔧 Step 2: Install Dependencies

```bash
npm install @lemonsqueezy/lemonsqueezy.js
npm install @types/node --save-dev  # For Node.js types if needed
```

## 📂 Step 3: Environment Variables

Add to your `.env` file:

```env
# Lemon Squeezy
VITE_LEMON_SQUEEZY_API_KEY=your_api_key_here
VITE_LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Your existing environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

## 🗄️ Step 4: Database Schema Updates

Create a new migration for subscription management:

### `migration_add_subscriptions.sql`

```sql
-- Subscription plans table
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  credits_monthly INTEGER NOT NULL,
  features JSONB,
  lemon_squeezy_variant_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  lemon_squeezy_subscription_id VARCHAR(100) UNIQUE,
  lemon_squeezy_customer_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, past_due
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history table  
CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  lemon_squeezy_order_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20), -- paid, pending, failed, refunded
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, credits_monthly, features, lemon_squeezy_variant_id) VALUES
('Free', 0.00, 0.00, 10, 
 '{"ai_analysis": true, "basic_mapping": true, "export_limit": 1}', NULL),
('Professional', 29.00, 290.00, 500, 
 '{"ai_analysis": true, "advanced_mapping": true, "unlimited_export": true, "priority_support": false}', 'YOUR_PRO_VARIANT_ID'),
('Enterprise', 99.00, 990.00, 2000, 
 '{"ai_analysis": true, "advanced_mapping": true, "unlimited_export": true, "priority_support": true, "white_label": true}', 'YOUR_ENTERPRISE_VARIANT_ID');

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Allow public read for subscription plans
CREATE POLICY "Allow public read on subscription_plans" ON subscription_plans
FOR SELECT TO public USING (true);

-- Users can only see their own subscriptions and payments
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payment_history
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can manage everything
CREATE POLICY "Admins manage subscriptions" ON user_subscriptions
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
);

CREATE POLICY "Admins manage payments" ON payment_history
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
);

-- Service role can insert/update for webhooks
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage payments" ON payment_history
FOR ALL TO service_role USING (true);

-- Function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 💳 Step 5: Lemon Squeezy Service Implementation

### Create `src/lib/lemonSqueezy.ts`

```typescript
interface SubscriptionPlan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  credits_monthly: number
  features: any
  lemon_squeezy_variant_id: string | null
}

interface CheckoutData {
  variantId: string
  customData: {
    user_id: string
    user_email: string
    plan_name: string
  }
}

// Get all available subscription plans
export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true })

  if (error) throw error
  return data as SubscriptionPlan[]
}

// Get user's current subscription
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Create Lemon Squeezy checkout URL
export async function createCheckoutUrl(planId: string, userId: string, userEmail: string): Promise<string> {
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (!plan?.lemon_squeezy_variant_id) {
    throw new Error('Plan not available for purchase')
  }

  // This will be handled by your backend API route
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      variantId: plan.lemon_squeezy_variant_id,
      customData: {
        user_id: userId,
        user_email: userEmail,
        plan_name: plan.name,
        plan_id: planId
      }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to create checkout URL')
  }

  const { checkoutUrl } = await response.json()
  return checkoutUrl
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const response = await fetch('/api/cancel-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscriptionId })
  })

  if (!response.ok) {
    throw new Error('Failed to cancel subscription')
  }
}
```

## 🛠️ Step 6: Backend API Routes (Node.js/Supabase Edge Functions)

### Option A: Supabase Edge Function

Create `supabase/functions/lemon-squeezy/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    if (action === 'create-checkout') {
      const { variantId, customData } = await req.json()

      const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LEMON_SQUEEZY_API_KEY')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'checkouts',
            attributes: {
              checkout_data: {
                custom: customData
              }
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: Deno.env.get('LEMON_SQUEEZY_STORE_ID')
                }
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantId
                }
              }
            }
          }
        })
      })

      const checkoutData = await checkoutResponse.json()
      return new Response(
        JSON.stringify({ checkoutUrl: checkoutData.data.attributes.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Option B: Netlify/Vercel Function

Create `api/create-checkout.ts` (for Vercel):

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { variantId, customData } = req.body

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: customData
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: process.env.LEMON_SQUEEZY_STORE_ID
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId
              }
            }
          }
        }
      })
    })

    const checkoutData = await response.json()
    res.status(200).json({ checkoutUrl: checkoutData.data.attributes.url })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkout' })
  }
}
```

## 🎯 Step 7: Webhook Handler for Subscription Events

### Create `api/webhooks/lemon-squeezy.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify webhook signature
  const signature = req.headers['x-signature'] as string
  const body = JSON.stringify(req.body)
  
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  try {
    const { meta, data } = req.body
    const eventName = meta.event_name
    const customData = data.attributes.custom_data

    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(data, customData)
        break
      
      case 'subscription_updated':
        await handleSubscriptionUpdated(data, customData)
        break
      
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data, customData)
        break
      
      case 'subscription_resumed':
        await handleSubscriptionResumed(data, customData)
        break

      case 'order_created':
        await handleOrderCreated(data, customData)
        break
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handleSubscriptionCreated(data: any, customData: any) {
  const { user_id, plan_id } = customData

  // Create subscription record
  await supabase.from('user_subscriptions').insert({
    user_id,
    plan_id,
    lemon_squeezy_subscription_id: data.id,
    lemon_squeezy_customer_id: data.attributes.customer_id,
    status: data.attributes.status,
    current_period_start: data.attributes.billing_anchor,
    current_period_end: data.attributes.renews_at,
  })

  // Reset user credits based on new plan
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('credits_monthly')
    .eq('id', plan_id)
    .single()

  if (plan) {
    await supabase.from('user_credits').upsert({
      user_id,
      credits: plan.credits_monthly,
      last_reset: new Date().toISOString()
    })
  }
}

async function handleSubscriptionUpdated(data: any, customData: any) {
  await supabase
    .from('user_subscriptions')
    .update({
      status: data.attributes.status,
      current_period_end: data.attributes.renews_at,
      cancel_at_period_end: data.attributes.cancelled
    })
    .eq('lemon_squeezy_subscription_id', data.id)
}

async function handleSubscriptionCancelled(data: any, customData: any) {
  // Update subscription to cancelled
  await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'cancelled',
      cancel_at_period_end: true
    })
    .eq('lemon_squeezy_subscription_id', data.id)
}

async function handleOrderCreated(data: any, customData: any) {
  const { user_id } = customData

  // Record payment
  await supabase.from('payment_history').insert({
    user_id,
    lemon_squeezy_order_id: data.id,
    amount: data.attributes.total / 100, // Convert from cents
    currency: data.attributes.currency,
    status: data.attributes.status
  })
}
```

## 🎨 Step 8: Frontend Components

### Create `src/components/SubscriptionPlans.tsx`:

```typescript
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getSubscriptionPlans, getUserSubscription, createCheckoutUrl } from '@/lib/lemonSqueezy'

export function SubscriptionPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        getSubscriptionPlans(),
        user ? getUserSubscription(user.id) : null
      ])
      setPlans(plansData)
      setCurrentSubscription(subscriptionData)
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return
    
    setLoading(true)
    try {
      const checkoutUrl = await createCheckoutUrl(planId, user.id, user.email!)
      window.open(checkoutUrl, '_blank')
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-400">Upgrade your location intelligence capabilities</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className="premium-card p-6 relative">
            {plan.name === 'Professional' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-400">${plan.price_monthly}</span>
              <span className="text-gray-400">/month</span>
            </div>
            
            <ul className="space-y-2 mb-6 text-gray-300">
              <li>• {plan.credits_monthly} AI credits/month</li>
              {Object.entries(plan.features || {}).map(([key, value]: [string, any]) => (
                value && <li key={key}>• {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || currentSubscription?.plan_id === plan.id || plan.price_monthly === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {currentSubscription?.plan_id === plan.id ? 'Current Plan' : 
               plan.price_monthly === 0 ? 'Free Plan' : 
               loading ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Update `src/components/Dashboard.tsx`:

Add subscription status to the dashboard:

```typescript
// Add this import
import { getUserSubscription } from '@/lib/lemonSqueezy'

// Add state for subscription
const [subscription, setSubscription] = useState(null)

// Load subscription data
useEffect(() => {
  if (user) {
    getUserSubscription(user.id)
      .then(setSubscription)
      .catch(console.error)
  }
}, [user])

// Add subscription info to the dashboard
<div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
  <h3 className="text-lg font-semibold text-white mb-2">Current Plan</h3>
  <p className="text-blue-400 font-medium">
    {subscription?.plan?.name || 'Free Plan'}
  </p>
  {subscription && (
    <p className="text-sm text-gray-400 mt-1">
      Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
    </p>
  )}
</div>
```

## 🔄 Step 9: Credit System Integration

Update your existing credit system to work with subscriptions.

### Update `src/lib/credits.ts`:

```typescript
// Add subscription-aware credit reset
export async function resetMonthlyCredits(userId: string): Promise<void> {
  // Get user's subscription to determine credit amount
  const subscription = await getUserSubscription(userId)
  
  let creditsToSet = 10 // Default free plan
  
  if (subscription?.plan) {
    creditsToSet = subscription.plan.credits_monthly
  }

  const { error } = await supabase
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits: creditsToSet,
      last_reset: new Date().toISOString()
    })

  if (error) throw error
}
```

## ⚙️ Step 10: Implementation Steps

### 10.1 **Lemon Squeezy Dashboard**
1. Create products and variants
2. Set up webhook endpoint URL: `https://your-domain.com/api/webhooks/lemon-squeezy`
3. Copy API keys and store ID

### 10.2 **Database Migration**  
1. Run the SQL migration in Supabase
2. Update variant IDs in the subscription_plans table

### 10.3 **Environment Variables**
1. Add Lemon Squeezy credentials to `.env`
2. Deploy environment variables to Vercel

### 10.4 **API Routes**
1. Create checkout and webhook API routes
2. Test webhook with Lemon Squeezy webhook tester

### 10.5 **Frontend Integration**
1. Add subscription plans component
2. Update dashboard with plan status
3. Integrate with existing credit system

## 🧪 Step 11: Testing

### 11.1 **Test Mode**
1. Use Lemon Squeezy test mode
2. Create test subscriptions
3. Verify webhook events

### 11.2 **Credit Flow**
1. Test free plan (10 credits)
2. Test paid plan credit allocation
3. Test monthly credit reset

## 🔒 Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **API Key Security**: Keep API keys server-side only
3. **User Authorization**: Verify user ownership before operations
4. **Database Security**: Use RLS policies for data protection

## 📱 Step 12: UI Updates Needed

You'll need to:

1. **Add "Upgrade" buttons** in the credit display
2. **Create subscription management page**
3. **Add billing history section**
4. **Update credit exhaustion handling** to show upgrade prompts

Would you like me to help implement any of these specific components?

---

## 🎯 Quick Start Checklist

- [ ] Create Lemon Squeezy store and products
- [ ] Get API keys and store ID  
- [ ] Add environment variables
- [ ] Run database migration
- [ ] Create API routes for checkout/webhooks
- [ ] Implement frontend subscription components
- [ ] Test with Lemon Squeezy test mode
- [ ] Deploy and configure webhook URL
- [ ] Go live with production keys

This integration will give you a complete subscription payment system with automatic credit management! 🎉
