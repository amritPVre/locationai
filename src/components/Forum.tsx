import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageSquare, 
  Plus, 
  Pin, 
  Lock, 
  Eye, 
  User, 
  Calendar, 
  Clock,
  CheckCircle,

  Lightbulb,
  Bug,
  HelpCircle,

  TrendingUp,
  Search,
  Filter,
  Megaphone
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { CreateForumPost } from './CreateForumPost'

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  position: number
  post_count: number
  last_post_id: string | null
  last_post_at: string | null
}

interface ForumPost {
  id: string
  category_id: string
  title: string
  slug: string
  content: string
  author_id: string
  author_name: string
  author_avatar: string | null
  type: 'discussion' | 'announcement' | 'question' | 'feature_request' | 'bug_report'
  status: 'open' | 'closed' | 'pinned' | 'locked'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tags: string[]
  view_count: number
  reply_count: number
  like_count: number
  last_reply_at: string | null
  solved: boolean
  created_at: string
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'announcement': return Megaphone
    case 'question': return HelpCircle
    case 'feature_request': return Lightbulb
    case 'bug_report': return Bug
    default: return MessageSquare
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'announcement': return 'bg-red-500/20 text-red-300'
    case 'question': return 'bg-blue-500/20 text-blue-300'
    case 'feature_request': return 'bg-green-500/20 text-green-300'
    case 'bug_report': return 'bg-orange-500/20 text-orange-300'
    default: return 'bg-gray-500/20 text-gray-300'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'text-red-400'
    case 'high': return 'text-orange-400'
    case 'normal': return 'text-blue-400'
    case 'low': return 'text-gray-400'
    default: return 'text-gray-400'
  }
}

export function Forum({ onPostClick, onCreatePost: _onCreatePost }: { 
  onPostClick?: (slug: string) => void
  onCreatePost?: () => void 
}) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    setLoading(true)
    try {
      // Fetch forum categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .order('position')

      if (categoriesError) throw categoriesError

      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('last_reply_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(50)

      if (postsError) throw postsError

      setCategories(categoriesData || [])
      setPosts(postsData || [])
    } catch (error) {
      console.error('Error fetching forum data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      categories.find(cat => cat.id === post.category_id)?.slug === selectedCategory
    const matchesType = selectedType === 'all' || post.type === selectedType
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesType && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return formatDate(dateString)
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong animate-pulse">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground">Loading discussions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show create post form
  if (showCreatePost) {
    return (
      <CreateForumPost
        onBack={() => setShowCreatePost(false)}
        onPostCreated={() => {
          setShowCreatePost(false)
          fetchForumData() // Refresh the forum data
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
                Community Forum
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Connect with the Kmlytics community. Share ideas, ask questions, and stay updated with announcements.
              </p>
            </div>
            
            {user && (
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>

          {/* Categories Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => {
              const IconComponent = getTypeIcon(category.icon) || MessageSquare
              return (
                <Card 
                  key={category.id} 
                  className="premium-card border-white/10 group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{category.post_count} posts</span>
                          </div>
                          {category.last_post_at && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatRelativeTime(category.last_post_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              
              {/* Filters */}
              <div className="flex space-x-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="announcement">Announcements</option>
                  <option value="discussion">Discussions</option>
                  <option value="question">Questions</option>
                  <option value="feature_request">Feature Requests</option>
                  <option value="bug_report">Bug Reports</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const TypeIcon = getTypeIcon(post.type)
              const categoryInfo = getCategoryInfo(post.category_id)
              
              return (
                <Card 
                  key={post.id} 
                  className="premium-card border-white/10 group cursor-pointer hover:scale-[1.005] transition-all duration-300"
                  onClick={() => onPostClick?.(post.slug)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Type Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(post.type)}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Title and Status */}
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                {post.title}
                              </h3>
                              
                              {post.status === 'pinned' && (
                                <Pin className="w-4 h-4 text-yellow-400" />
                              )}
                              {post.status === 'locked' && (
                                <Lock className="w-4 h-4 text-red-400" />
                              )}
                              {post.solved && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                              
                              <span className={`text-xs ${getPriorityColor(post.priority)}`}>
                                {post.priority.toUpperCase()}
                              </span>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{post.author_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                              {categoryInfo && (
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: categoryInfo.color }}
                                >
                                  {categoryInfo.name}
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded-full">
                                    +{post.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Content Preview */}
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-col items-end space-y-2 text-sm text-gray-500 ml-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.view_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.reply_count}</span>
                            </div>
                            {post.last_reply_at && (
                              <div className="text-xs text-gray-600">
                                Last reply {formatRelativeTime(post.last_reply_at)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No discussions found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or browse different categories.
              </p>
              {user && (
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a Discussion
                </Button>
              )}
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                className="border-white/20 hover:border-white/40 hover:bg-white/5 text-white"
              >
                Load More Discussions
                <TrendingUp className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
