import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Heart, 
  MessageCircle, 
  Tag,
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  author_name: string
  author_avatar: string | null
  category: string
  tags: string[]
  published_at: string
  view_count: number
  like_count: number
  comment_count: number
  featured: boolean
  reading_time: number | null
}

interface BlogCategory {
  name: string
  slug: string
  description: string
  color: string
  post_count: number
}

export function Blog({ onPostClick }: { onPostClick?: (slug: string) => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetchBlogData()
  }, [])

  const fetchBlogData = async () => {
    setLoading(true)
    try {
      // Fetch published blog posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)

      if (postsError) throw postsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      setPosts(postsData || [])
      setCategories(categoriesData || [])
      setFeaturedPosts((postsData || []).filter(post => post.featured).slice(0, 3))
    } catch (error) {
      console.error('Error fetching blog data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatReadingTime = (minutes: number | null) => {
    if (!minutes) return '5 min read'
    return `${minutes} min read`
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName)
    return category?.color || '#3B82F6'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong animate-pulse">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl luxury-gradient flex items-center justify-center glow-strong">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Kmlytics Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Insights, tutorials, and industry trends in location intelligence and AI-powered business strategy.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="premium-card border-white/10 group cursor-pointer hover:scale-[1.02] transition-all duration-300">
                  <CardContent className="p-0">
                    {post.featured_image && (
                      <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-t-xl overflow-hidden">
                        <img 
                          src={post.featured_image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getCategoryColor(post.category) }}
                        >
                          {post.category}
                        </span>
                        <span className="text-yellow-400 text-sm">Featured</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatReadingTime(post.reading_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.view_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.like_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.name}>
                    {category.name} ({category.post_count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.name ? category.color : undefined
                }}
              >
                {category.name} ({category.post_count})
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="premium-card border-white/10 group cursor-pointer hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-0">
                {post.featured_image && (
                  <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-t-xl overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(post.category) }}
                    >
                      {post.category}
                    </span>
                    {post.featured && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-gray-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatReadingTime(post.reading_time)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.like_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comment_count}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onPostClick?.(post.slug)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-gray-400">
              Try adjusting your search terms or browse different categories.
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-16">
            <Button
              variant="outline"
              className="border-white/20 hover:border-white/40 hover:bg-white/5 text-white"
            >
              Load More Articles
              <TrendingUp className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
