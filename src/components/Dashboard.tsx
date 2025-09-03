import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { LogOut, Upload, Building, Map, Brain, BarChart3, Shield, MapPin, HelpCircle, CreditCard, Crown } from 'lucide-react'
import { type UserSubscription } from '@/lib/lemonSqueezy'
import { getUserCredits } from '@/lib/credits'
import { FileUpload } from './FileUpload'
import { OfficeManager } from './OfficeManager'
import { MapView } from './MapView'
import { AnalysisResults } from './AnalysisResults'
import { ContextualInfo } from './ContextualInfo'
import { AIInsights } from './AIInsights'
import { ErrorBoundary } from './ui/error-boundary'

type ActiveTab = 'upload' | 'offices' | 'map' | 'analysis' | 'context' | 'ai'

export function Dashboard({ 
  onAdminClick, 
  onInstructionsClick, 
  onSubscriptionClick 
}: { 
  onAdminClick?: () => void; 
  onInstructionsClick?: () => void;
  onSubscriptionClick?: () => void;
}) {
  const { signOut, user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload')
  const [subscription] = useState<UserSubscription | null>(null)
  const [credits, setCredits] = useState<number>(0)

  // Load credit data only (subscription disabled)
  useEffect(() => {
    if (user) {
      getUserCredits(user.id).then(credits => {
        setCredits(credits?.credits || 0)
      }).catch(() => setCredits(0))
    }
  }, [user])

  const tabs = [
    { id: 'upload' as const, label: 'Upload Data', icon: Upload, gradient: 'from-purple-500 to-pink-500' },
    { id: 'offices' as const, label: 'Offices', icon: Building, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'map' as const, label: 'Map View', icon: Map, gradient: 'from-green-500 to-emerald-500' },
    { id: 'analysis' as const, label: 'Analysis', icon: BarChart3, gradient: 'from-orange-500 to-red-500' },
    { id: 'context' as const, label: 'Context', icon: Brain, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'ai' as const, label: 'AI Insights', icon: Brain, gradient: 'from-violet-500 to-purple-500' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload />
      case 'offices':
        return <OfficeManager />
      case 'map':
        return <MapView />
      case 'analysis':
        return <AnalysisResults />
      case 'context':
        return <ContextualInfo />
      case 'ai':
        return (
          <ErrorBoundary>
            <AIInsights />
          </ErrorBoundary>
        )
      default:
        return <FileUpload />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 w-3 h-3 border-2 border-dashed border-cyan-400 rounded-full opacity-60"></div>
                  <div className="absolute -top-4 -left-4 w-2 h-2 bg-cyan-400 rounded-full opacity-40"></div>
                </div>
                <span className="text-2xl font-bold text-white">Kmlytics</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Regional Office Location Analysis
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, <span className="text-accent font-medium">{user?.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Subscription Button */}
              {onSubscriptionClick && (
                <Button 
                  variant="outline" 
                  onClick={onSubscriptionClick}
                  className="glass border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-300"
                >
                  {subscription?.plan?.name === 'Enterprise' ? (
                    <Crown className="h-4 w-4 mr-2 text-yellow-400" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {subscription ? 'Billing' : 'Upgrade'}
                </Button>
              )}
              
              {onInstructionsClick && (
                <Button 
                  variant="outline" 
                  onClick={onInstructionsClick}
                  className="glass border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-300"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              )}
              {isAdmin && onAdminClick && (
                <Button 
                  variant="outline" 
                  onClick={onAdminClick}
                  className="glass border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all duration-300"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={signOut}
                className="glass border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="xl:w-80 space-y-3">
            <div className="premium-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'luxury-gradient text-white shadow-lg glow-strong'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5 hover:scale-[1.02]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-r ${tab.gradient} opacity-80 group-hover:opacity-100`
                      }`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Plan Status Card */}
            <div className="premium-card rounded-2xl p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold gradient-text">Current Plan</h3>
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-medium">
                      Free
                    </span>
                    <Badge className="text-xs text-gray-500">
                      Active
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">AI Credits</span>
                  <div className="flex items-center gap-1">
                    <span className="text-accent font-medium">{credits.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">
                      /10 per month
                    </span>
                  </div>
                </div>

                {!subscription && (
                  <Button
                    onClick={onSubscriptionClick}
                    className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="premium-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 gradient-text">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Session</span>
                  <span className="text-green-400 font-medium">Live</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Tab</span>
                  <span className="text-accent font-medium capitalize">{activeTab}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="premium-card rounded-2xl p-6 min-h-[600px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
    </div>
  )
}
