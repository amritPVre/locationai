import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { LogOut, Upload, Building, Map, Brain, BarChart3 } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { OfficeManager } from './OfficeManager'
import { MapView } from './MapView'
import { AnalysisResults } from './AnalysisResults'
import { ContextualInfo } from './ContextualInfo'
import { AIInsights } from './AIInsights'
import { ErrorBoundary } from './ui/error-boundary'

type ActiveTab = 'upload' | 'offices' | 'map' | 'analysis' | 'context' | 'ai'

export function Dashboard() {
  const { signOut, user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload')

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
              <div className="w-12 h-12 rounded-xl luxury-gradient flex items-center justify-center glow">
                <BarChart3 className="h-6 w-6 text-white" />
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
