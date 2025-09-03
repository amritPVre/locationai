import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp, 
  Database,
  Brain,
  Clock,
  UserPlus,
  RefreshCw,
  Download,
  Eye,
  Edit,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import {
  getAdminStats,
  getAllUsers,
  updateUserPlan,
  addCreditsToUser,
  getRecentAnalyses,
  resetAllUserCredits,
  type AdminStats,
  type UserWithCredits
} from '@/lib/admin'
import { useAuth } from '@/lib/auth'
import { BlogManager } from './admin/BlogManager'
import { ForumManager } from './admin/ForumManager'

export function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithCredits[]>([])
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'blog' | 'forum'>('overview')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0)
  const [newPlan, setNewPlan] = useState<'free' | 'professional' | 'enterprise'>('free')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [statsData, usersData, analysesData] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getRecentAnalyses(20)
      ])
      
      setStats(statsData)
      setUsers(usersData)
      setRecentAnalyses(analysesData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserPlan = async () => {
    if (!selectedUser || !newPlan) return
    
    const success = await updateUserPlan(selectedUser, newPlan)
    if (success) {
      await fetchAdminData()
      setSelectedUser('')
    }
  }

  const handleAddCredits = async () => {
    if (!selectedUser || creditsToAdd <= 0) return
    
    const success = await addCreditsToUser(selectedUser, creditsToAdd)
    if (success) {
      await fetchAdminData()
      setSelectedUser('')
      setCreditsToAdd(0)
    }
  }

  const handleResetAllCredits = async () => {
    if (confirm('Are you sure you want to reset all user credits? This action cannot be undone.')) {
      const success = await resetAllUserCredits()
      if (success) {
        await fetchAdminData()
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCredits = (credits: number) => {
    return credits.toLocaleString()
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400'
      case 'professional': return 'text-blue-400'
      case 'enterprise': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-500/20 text-gray-300',
      professional: 'bg-blue-500/20 text-blue-300',
      enterprise: 'bg-purple-500/20 text-purple-300'
    }
    return colors[plan as keyof typeof colors] || colors.free
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Kmlytics Platform Management & Analytics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'blog', label: 'Blog Management', icon: BookOpen },
            { id: 'forum', label: 'Forum Management', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Total Users', 
                  value: stats.total_users.toLocaleString(), 
                  icon: Users, 
                  color: 'from-blue-500 to-cyan-500' 
                },
                { 
                  label: 'AI Credits Used', 
                  value: `${(stats.ai_recommendations_used + stats.swot_analyses_used).toLocaleString()}`, 
                  icon: Brain, 
                  color: 'from-purple-500 to-pink-500' 
                },
                { 
                  label: 'Total Analyses', 
                  value: stats.total_analyses.toLocaleString(), 
                  icon: BarChart3, 
                  color: 'from-green-500 to-emerald-500' 
                },
                { 
                  label: 'Datasets Uploaded', 
                  value: stats.total_datasets.toLocaleString(), 
                  icon: Database, 
                  color: 'from-orange-500 to-red-500' 
                }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="premium-card border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Plan Distribution */}
            <Card className="premium-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Plan Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { plan: 'Free', count: stats.free_users, color: 'text-gray-400', bg: 'bg-gray-500/20' },
                    { plan: 'Professional', count: stats.professional_users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                    { plan: 'Enterprise', count: stats.enterprise_users, color: 'text-purple-400', bg: 'bg-purple-500/20' }
                  ].map((planData, index) => (
                    <div key={index} className={`${planData.bg} rounded-xl p-4 text-center`}>
                      <div className={`text-2xl font-bold ${planData.color} mb-2`}>
                        {planData.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {planData.plan} Users
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="premium-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleResetAllCredits}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset All Credits
                  </Button>
                  <Button 
                    onClick={fetchAdminData}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* User Management Actions */}
            <Card className="premium-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  User Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Update Plan */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Update User Plan</h4>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} ({user.plan})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newPlan} onValueChange={(value: any) => setNewPlan(value)}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleUpdateUserPlan}
                      disabled={!selectedUser}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Update Plan
                    </Button>
                  </div>

                  {/* Add Credits */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Add Credits</h4>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} ({formatCredits(user.credits)} credits)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      value={creditsToAdd}
                      onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                      placeholder="Credits to add"
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    />
                    <Button 
                      onClick={handleAddCredits}
                      disabled={!selectedUser || creditsToAdd <= 0}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Add Credits
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="premium-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Users ({users.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-gray-300">Plan</th>
                        <th className="text-left py-3 px-4 text-gray-300">Credits</th>
                        <th className="text-left py-3 px-4 text-gray-300">Analyses</th>
                        <th className="text-left py-3 px-4 text-gray-300">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-300">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(user.plan)}`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className={`py-3 px-4 font-medium ${user.credits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCredits(user.credits)}
                          </td>
                          <td className="py-3 px-4 text-gray-300">{user.total_analyses}</td>
                          <td className="py-3 px-4 text-gray-300">{formatDate(user.created_at)}</td>
                          <td className="py-3 px-4 text-gray-300">
                            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Management Tab */}
        {activeTab === 'blog' && (
          <BlogManager />
        )}

        {/* Forum Management Tab */}
        {activeTab === 'forum' && (
          <ForumManager />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <Card className="premium-card border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Analysis Activity
                </h3>
                <div className="space-y-4">
                  {recentAnalyses.slice(0, 10).map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Analysis for {analysis.offices?.office_name || 'Unknown Office'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Dataset: {analysis.datasets?.filename || 'Unknown'} • 
                            {analysis.suppliers_count} suppliers • 
                            {analysis.radius_km}km radius
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">{formatDate(analysis.created_at)}</p>
                        <div className="flex space-x-2 mt-1">
                          {analysis.ai_recommendation && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">AI Rec</span>
                          )}
                          {analysis.ai_swot_analysis && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">SWOT</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
