import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
  User, 
  Globe,
  Save,
  X,
  Image,
  Star,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_name: string
  category: string
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  published_at: string | null
  view_count: number
  like_count: number
  comment_count: number
  featured: boolean
  reading_time: number | null
  created_at: string
  updated_at: string
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  post_count: number
}

export function BlogManager() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    seo_title: '',
    seo_description: '',
    seo_keywords: [] as string[],
    featured: false,
    reading_time: null as number | null
  })

  useEffect(() => {
    fetchBlogData()
  }, [])

  const fetchBlogData = async () => {
    setLoading(true)
    try {
      // Fetch all blog posts (including drafts for admin)
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      setPosts(postsData || [])
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title,
      reading_time: estimateReadingTime(prev.content)
    }))
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      reading_time: estimateReadingTime(content)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const postData = {
        ...formData,
        author_id: user.id,
        author_name: user.email?.split('@')[0] || 'Admin',
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData])

        if (error) throw error
      }

      await fetchBlogData()
      resetForm()
    } catch (error) {
      console.error('Error saving blog post:', error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      await fetchBlogData()
    } catch (error) {
      console.error('Error deleting blog post:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      category: '',
      tags: [],
      status: 'draft',
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      featured: false,
      reading_time: null
    })
    setIsCreating(false)
    setEditingPost(null)
  }

  const startEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image: post.featured_image || '',
      category: post.category,
      tags: post.tags,
      status: post.status,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      seo_keywords: post.seo_keywords || [],
      featured: post.featured,
      reading_time: post.reading_time
    })
    setEditingPost(post)
    setIsCreating(true)
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true
    return post.status === filter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300'
      case 'draft': return 'bg-yellow-500/20 text-yellow-300'
      case 'archived': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong animate-pulse">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Management</h2>
          <p className="text-gray-400">Create and manage blog posts</p>
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
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
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
                <div>
                  <label className="block text-white font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="Enter blog post title"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-white font-medium mb-2">URL Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    placeholder="url-friendly-slug"
                    required
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-white font-medium mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-20"
                  placeholder="Brief description for preview"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-40"
                  placeholder="Write your blog content here..."
                  required
                />
                {formData.reading_time && (
                  <p className="text-sm text-gray-400 mt-1">
                    Estimated reading time: {formData.reading_time} minutes
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-white font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-white font-medium mb-2">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="https://example.com/image.jpg"
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
                  placeholder="ai, location, business"
                />
              </div>

              {/* SEO Section */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">SEO Settings</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">SEO Description</label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 h-20"
                      placeholder="Meta description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">SEO Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.seo_keywords.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo_keywords: e.target.value.split(',').map(keyword => keyword.trim()).filter(Boolean)
                      }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      placeholder="location intelligence, ai, business"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-white">Featured Post</span>
                  <Star className="w-4 h-4 text-yellow-400" />
                </label>
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

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <span className="text-white font-medium">Filter:</span>
        {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="premium-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{post.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    {post.featured && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
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
                      <Tag className="w-4 h-4" />
                      <span>{post.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count} views</span>
                    </div>
                    {post.reading_time && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.reading_time} min read</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
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
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <Edit className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No blog posts found</h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' ? 'Create your first blog post to get started.' : `No ${filter} posts found.`}
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Blog Post
          </Button>
        </div>
      )}
    </div>
  )
}
