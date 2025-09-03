import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft,
  Send,

  AlertCircle,
  Lightbulb,
  Bug,
  MessageSquare,

} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
}

interface CreateForumPostProps {
  onBack: () => void
  onPostCreated: () => void
}

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'General discussion or conversation' },
  { value: 'question', label: 'Question', icon: AlertCircle, description: 'Ask for help or advice' },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggest new features or improvements' },
  { value: 'bug_report', label: 'Bug Report', icon: Bug, description: 'Report issues or bugs' },
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'normal', label: 'Normal', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
]

export function CreateForumPost({ onBack, onPostCreated }: CreateForumPostProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    type: 'discussion' as 'discussion' | 'question' | 'feature_request' | 'bug_report',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    tags: [] as string[]
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('position')

      if (error) throw error
      setCategories(data || [])
      
      // Set default category if available
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
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
    if (!user || !formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    try {
      const slug = generateSlug(formData.title)
      
      const { error } = await supabase
        .from('forum_posts')
        .insert([{
          ...formData,
          slug,
          author_id: user.id,
          author_name: user.email?.split('@')[0] || 'Anonymous',
          author_avatar: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (error) throw error

      onPostCreated()
    } catch (error) {
      console.error('Error creating forum post:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedType = POST_TYPES.find(type => type.value === formData.type)
  const TypeIcon = selectedType?.icon || MessageSquare

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-white/20 hover:border-white/40"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Post</h1>
            <p className="text-gray-400">Share your thoughts with the community</p>
          </div>
        </div>

        {/* Form */}
        <Card className="premium-card border-white/10">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="What would you like to discuss?"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-white font-medium mb-2">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors"
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
                  <label className="block text-white font-medium mb-2">Post Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    {POST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {selectedType && (
                    <p className="text-sm text-gray-400 mt-1">{selectedType.description}</p>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-white font-medium mb-2">Priority</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PRIORITY_LEVELS.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        formData.priority === priority.value
                          ? 'border-blue-400 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <span className={`font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors h-40 resize-none"
                  placeholder="Describe your question, idea, or issue in detail..."
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="Add tags separated by commas (e.g., feature, ui, api)"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Help others find your post by adding relevant tags
                </p>
              </div>

              {/* Post Type Preview */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Preview</h4>
                    <p className="text-gray-400 text-sm">
                      This will be posted as a <span className="text-blue-400">{selectedType?.label}</span> in {categories.find(c => c.id === formData.category_id)?.name || 'selected category'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="border-white/20 hover:border-white/40"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Create Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="premium-card border-white/10 mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Community Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
              <div>
                <h4 className="text-white font-medium mb-2">✅ Do:</h4>
                <ul className="space-y-1">
                  <li>• Be respectful and constructive</li>
                  <li>• Search before posting duplicates</li>
                  <li>• Use clear, descriptive titles</li>
                  <li>• Provide relevant details</li>
                  <li>• Tag your posts appropriately</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">❌ Don't:</h4>
                <ul className="space-y-1">
                  <li>• Post spam or promotional content</li>
                  <li>• Use offensive language</li>
                  <li>• Share sensitive information</li>
                  <li>• Post off-topic content</li>
                  <li>• Engage in personal attacks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
