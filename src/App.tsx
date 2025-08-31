import { useState } from 'react'
import { useAuth, AuthProvider } from '@/lib/auth'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/components/Dashboard'
import { LandingPage } from '@/components/LandingPage'
import { PrivacyPolicy } from '@/components/PrivacyPolicy'
import { Spinner } from '@/components/ui/spinner'

type AppView = 'landing' | 'auth' | 'dashboard' | 'privacy'

function AppContent() {
  const { user, loading } = useAuth()
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

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />
  }

  // Handle different views for non-authenticated users
  switch (currentView) {
    case 'landing':
      return (
        <LandingPage 
          onGetStarted={() => setCurrentView('auth')}
          onPrivacyClick={() => setCurrentView('privacy')}
        />
      )
    
    case 'auth':
      return <AuthPage />
    
    case 'privacy':
      return (
        <PrivacyPolicy 
          onBack={() => setCurrentView('landing')}
        />
      )
    
    default:
      return (
        <LandingPage 
          onGetStarted={() => setCurrentView('auth')}
          onPrivacyClick={() => setCurrentView('privacy')}
        />
      )
  }
}

function App() {
  return (
    <div className="dark">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  )
}

export default App
