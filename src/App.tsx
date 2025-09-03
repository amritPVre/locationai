import { useState } from 'react'
import { useAuth, AuthProvider } from '@/lib/auth'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/components/Dashboard'
import { AdminDashboard } from '@/components/AdminDashboard'
import { LandingPage } from '@/components/LandingPage'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { TermsConditions } from '@/components/TermsConditions'
import { CancellationRefunds } from '@/components/CancellationRefunds'
import { ContactUs } from '@/components/ContactUs'
import { ShippingPolicy } from '@/components/ShippingPolicy'
import { Blog } from '@/components/Blog'
import { Forum } from '@/components/Forum'
import { Instructions } from '@/components/Instructions'
import { SubscriptionPlans } from '@/components/SubscriptionPlans'
import { Spinner } from '@/components/ui/spinner'
import { HelmetProvider } from 'react-helmet-async'
import { SEOHead } from '@/components/SEO/SEOHead'

type AppView = 'landing' | 'auth' | 'dashboard' | 'admin' | 'privacy' | 'terms' | 'cancellation' | 'contact' | 'shipping' | 'blog' | 'forum' | 'instructions' | 'subscription'

function AppContent() {
  const { user, loading, isAdmin } = useAuth()
  const [currentView, setCurrentView] = useState<AppView>('landing')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong">
            <Spinner size="lg" className="text-white" />
          </div>
          <p className="text-muted-foreground text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, check current view
  if (user) {
    if (currentView === 'admin' && isAdmin) {
      return <AdminDashboard />
    }
    if (currentView === 'instructions') {
      return <Instructions onBack={() => setCurrentView('dashboard')} />
    }
    if (currentView === 'subscription') {
      return <SubscriptionPlans onBack={() => setCurrentView('dashboard')} />
    }
    return <Dashboard 
      onAdminClick={() => setCurrentView('admin')}
      onInstructionsClick={() => setCurrentView('instructions')}
      onSubscriptionClick={() => setCurrentView('subscription')}
    />
  }

  // Handle different views for non-authenticated users
  switch (currentView) {
    case 'landing':
      return (
        <>
          <SEOHead 
            title="Kmlytics - AI-Powered Business Intelligence Analysis & Location Intelligence Platform"
            description="Transform your business expansion strategy with Kmlytics' AI-powered business intelligence analysis. Advanced location intelligence, supplier coverage optimization, and strategic office location recommendations for data-driven business decisions."
            keywords={[
              "business intelligence analysis",
              "location intelligence platform", 
              "business analytics software",
              "office location analysis",
              "supplier coverage optimization",
              "business expansion strategy",
              "AI business analysis",
              "data analytics platform",
              "business intelligence software",
              "location analytics",
              "strategic planning tools",
              "business performance analysis",
              "geographic business intelligence",
              "supply chain optimization",
              "business location planning"
            ]}
            page="home"
          />
          <LandingPage 
            onGetStarted={() => setCurrentView('auth')}
            onPrivacyClick={() => setCurrentView('privacy')}
            onTermsClick={() => setCurrentView('terms')}
            onContactClick={() => setCurrentView('contact')}
            onCancellationClick={() => setCurrentView('cancellation')}
            onShippingClick={() => setCurrentView('shipping')}
            onBlogClick={() => setCurrentView('blog')}
            onForumClick={() => setCurrentView('forum')}
            onInstructionsClick={() => setCurrentView('instructions')}
          />
        </>
      )
    
    case 'auth':
      return <AuthPage />
    
    case 'admin':
      // Redirect non-authenticated users to auth
      setCurrentView('auth')
      return null
    
    case 'blog':
      return (
        <Blog 
          onPostClick={(slug) => console.log('Navigate to blog post:', slug)}
        />
      )
    
    case 'forum':
      return (
        <Forum 
          onPostClick={(slug) => console.log('Navigate to forum post:', slug)}
          onCreatePost={() => console.log('Create new forum post')}
        />
      )
    
    case 'privacy':
      return (
        <PrivacyPolicy 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    case 'terms':
      return (
        <TermsConditions 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    case 'cancellation':
      return (
        <CancellationRefunds 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    case 'contact':
      return (
        <ContactUs 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    case 'shipping':
      return (
        <ShippingPolicy 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    case 'instructions':
      return <Instructions onBack={() => setCurrentView('landing')} />
    
    default:
      return (
        <LandingPage 
          onGetStarted={() => setCurrentView('auth')}
          onPrivacyClick={() => setCurrentView('privacy')}
          onTermsClick={() => setCurrentView('terms')}
          onContactClick={() => setCurrentView('contact')}
          onCancellationClick={() => setCurrentView('cancellation')}
          onShippingClick={() => setCurrentView('shipping')}
          onBlogClick={() => setCurrentView('blog')}
          onForumClick={() => setCurrentView('forum')}
          onInstructionsClick={() => setCurrentView('instructions')}
        />
      )
  }
}

function App() {
  return (
    <HelmetProvider>
      <div className="dark">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </HelmetProvider>
  )
}

export default App
