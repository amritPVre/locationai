import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

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

  if (!user) {
    navigate('/auth')
    return null
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    navigate('/auth')
    return null
  }

  if (!isAdmin) {
    navigate('/dashboard')
    return null
  }

  return <>{children}</>
}

function AppContent() {
  const navigate = useNavigate()

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
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
              onGetStarted={() => navigate('/auth')}
              onPrivacyClick={() => navigate('/privacy')}
              onTermsClick={() => navigate('/terms')}
              onContactClick={() => navigate('/contact')}
              onCancellationClick={() => navigate('/cancellation')}
              onShippingClick={() => navigate('/shipping')}
              onBlogClick={() => navigate('/blog')}
              onForumClick={() => navigate('/forum')}
              onInstructionsClick={() => navigate('/instructions')}
            />
          </>
        } 
      />

      <Route path="/auth" element={<AuthPage />} />

      {/* Policy Pages - Accessible to all */}
      <Route 
        path="/privacy" 
        element={
          <>
            <SEOHead 
              title="Privacy Policy - Kmlytics"
              description="Learn how Kmlytics protects and handles your personal data and business information."
              page="privacy"
            />
            <PrivacyPolicy onBack={() => navigate('/')} />
          </>
        } 
      />

      <Route 
        path="/terms" 
        element={
          <>
            <SEOHead 
              title="Terms and Conditions - Kmlytics"
              description="Read the terms and conditions for using Kmlytics location intelligence platform."
              page="terms"
            />
            <TermsConditions onBack={() => navigate('/')} />
          </>
        } 
      />

      <Route 
        path="/cancellation" 
        element={
          <>
            <SEOHead 
              title="Cancellation & Refunds Policy - Kmlytics"
              description="Learn about Kmlytics subscription cancellation and refund policies."
              page="cancellation"
            />
            <CancellationRefunds onBack={() => navigate('/')} />
          </>
        } 
      />

      <Route 
        path="/contact" 
        element={
          <>
            <SEOHead 
              title="Contact Us - Kmlytics"
              description="Get in touch with the Kmlytics team for support, questions, or partnerships."
              page="contact"
            />
            <ContactUs onBack={() => navigate('/')} />
          </>
        } 
      />

      <Route 
        path="/shipping" 
        element={
          <>
            <SEOHead 
              title="Shipping Policy - Kmlytics"
              description="Learn about Kmlytics digital service delivery and data export policies."
              page="shipping"
            />
            <ShippingPolicy onBack={() => navigate('/')} />
          </>
        } 
      />

      <Route 
        path="/blog" 
        element={
          <>
            <SEOHead 
              title="Blog - Kmlytics"
              description="Read the latest insights on business intelligence, location analytics, and strategic planning."
              page="blog"
            />
            <Blog onPostClick={(slug) => console.log('Navigate to blog post:', slug)} />
          </>
        } 
      />

      <Route 
        path="/forum" 
        element={
          <>
            <SEOHead 
              title="Community Forum - Kmlytics"
              description="Join the Kmlytics community discussion on location intelligence and business analytics."
              page="forum"
            />
            <Forum 
              onPostClick={(slug) => console.log('Navigate to forum post:', slug)}
              onCreatePost={() => console.log('Create new forum post')}
            />
          </>
        } 
      />

      <Route 
        path="/instructions" 
        element={
          <>
            <SEOHead 
              title="How to Use - Kmlytics"
              description="Step-by-step guide on how to use Kmlytics for location intelligence and business analysis."
              page="instructions"
            />
            <Instructions onBack={() => navigate('/')} />
          </>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard 
              onAdminClick={() => navigate('/admin')}
              onInstructionsClick={() => navigate('/instructions')}
              onSubscriptionClick={() => navigate('/subscription')}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/subscription" 
        element={
          <ProtectedRoute>
            <SubscriptionPlans onBack={() => navigate('/dashboard')} />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

      {/* Fallback - redirect to home */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1><button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">Go Home</button></div></div>} />
    </Routes>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="dark">
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </div>
      </Router>
    </HelmetProvider>
  )
}

export default App