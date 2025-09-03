import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  MessageSquare,
  Pin,
  Lock,

  AlertCircle,
  Lightbulb,
  Bug,
  Megaphone,
  Save,
  X,

  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

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
  updated_at: string
}

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  position: number
  post_count: number
}

const POST_TYPES = [
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: 'text-red-400' },
  { value: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'text-blue-400' },
  { value: 'question', label: 'Question', icon: AlertCircle, color: 'text-green-400' },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-400' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-orange-400' },
]

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'text-green-400' },
  { value: 'closed', label: 'Closed', color: 'text-gray-400' },
  { value: 'pinned', label: 'Pinned', color: 'text-yellow-400' },
  { value: 'locked', label: 'Locked', color: 'text-red-400' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'normal', label: 'Normal', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
]

export function ForumManager() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'announcement' | 'discussion' | 'question'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'pinned' | 'locked'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    type: 'announcement' as 'discussion' | 'announcement' | 'question' | 'feature_request' | 'bug_report',
    status: 'open' as 'open' | 'closed' | 'pinned' | 'locked',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    tags: [] as string[]
  })

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    setLoading(true)
    try {
      // Fetch all forum posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .order('position')

      if (categoriesError) throw categoriesError

      setPosts(postsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching forum data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const slug = generateSlug(formData.title)
      const postData = {
        ...formData,
        slug,
        author_id: user.id,
        author_name: user.email?.split('@')[0] || 'Admin',
        author_avatar: null,
        updated_at: new Date().toISOString()
      }

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('forum_posts')
          .update(postData)
          .eq('id', editingPost.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('forum_posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      await fetchForumData()
      resetForm()
    } catch (error) {
      console.error('Error saving forum post:', error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this forum post?')) return

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      await fetchForumData()
    } catch (error) {
      console.error('Error deleting forum post:', error)
    }
  }

  const updatePostStatus = async (postId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (error) throw error
      await fetchForumData()
    } catch (error) {
      console.error('Error updating post status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category_id: '',
      type: 'announcement',
      status: 'open',
      priority: 'normal',
      tags: []
    })
    setIsCreating(false)
    setEditingPost(null)
  }

  const startEdit = (post: ForumPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      category_id: post.category_id,
      type: post.type,
      status: post.status,
      priority: post.priority,
      tags: post.tags
    })
    setEditingPost(post)
    setIsCreating(true)
  }

  const filteredPosts = posts.filter(post => {
    const matchesType = filter === 'all' || post.type === filter
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesType && matchesStatus && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeInfo = (type: string) => {
    return POST_TYPES.find(t => t.value === type) || POST_TYPES[0]
  }

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  }

  const getPriorityInfo = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong animate-pulse">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading forum posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Forum Management</h2>
          <p className="text-gray-400">Create and manage forum posts and announcements</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="premium-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingPost ? 'Edit Forum Post' : 'Create New Forum Post'}
              </h3>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-white/20 hover:border-white/40"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter post title"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white font-medium mb-2">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-white font-medium mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    {POST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-white font-medium mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-white font-medium mb-2">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-40"
                  placeholder="Write the post content..."
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="announcement, important, update"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-white/20 hover:border-white/40"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
        >
          <option value="all">All Types</option>
          {POST_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const typeInfo = getTypeInfo(post.type)
          const statusInfo = getStatusInfo(post.status)
          const priorityInfo = getPriorityInfo(post.priority)
          const TypeIcon = typeInfo.icon

          return (
            <Card key={post.id} className="premium-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Type Icon */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-white truncate">{post.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/10 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/10 ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                        {post.status === 'pinned' && <Pin className="w-4 h-4 text-yellow-400" />}
                        {post.status === 'locked' && <Lock className="w-4 h-4 text-red-400" />}
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {post.content.substring(0, 150)}...
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.view_count} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.reply_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Quick Status Actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updatePostStatus(post.id, post.status === 'pinned' ? 'open' : 'pinned')}
                        className={`p-2 rounded-lg transition-colors ${
                          post.status === 'pinned' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                        title={post.status === 'pinned' ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updatePostStatus(post.id, post.status === 'locked' ? 'open' : 'locked')}
                        className={`p-2 rounded-lg transition-colors ${
                          post.status === 'locked' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                        title={post.status === 'locked' ? 'Unlock' : 'Lock'}
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(post)}
                      className="border-white/20 hover:border-white/40"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="border-red-500/20 hover:border-red-400/50 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No forum posts found</h3>
          <p className="text-gray-400 mb-6">
            Create your first forum post to start community discussions.
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Forum Post
          </Button>
        </div>
      )}
    </div>
  )
}
