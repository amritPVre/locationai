-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    reading_time INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_categories table
CREATE TABLE public.blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_categories table
CREATE TABLE public.forum_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#10B981',
    icon TEXT DEFAULT 'MessageSquare',
    position INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    last_post_id UUID,
    last_post_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_posts table
CREATE TABLE public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    type TEXT DEFAULT 'discussion' CHECK (type IN ('discussion', 'announcement', 'question', 'feature_request', 'bug_report')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pinned', 'locked')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    last_reply_id UUID,
    last_reply_at TIMESTAMPTZ,
    solved BOOLEAN DEFAULT false,
    solution_post_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_replies table
CREATE TABLE public.forum_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view blog categories" ON public.blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog categories" ON public.blog_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view approved blog comments" ON public.blog_comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can create blog comments" ON public.blog_comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own blog comments" ON public.blog_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all blog comments" ON public.blog_comments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- RLS Policies for forum_categories
CREATE POLICY "Anyone can view forum categories" ON public.forum_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage forum categories" ON public.forum_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own forum posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all forum posts" ON public.forum_posts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create forum replies" ON public.forum_replies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own forum replies" ON public.forum_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all forum replies" ON public.forum_replies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
    );

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(featured);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);

CREATE INDEX idx_forum_posts_category_id ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_status ON public.forum_posts(status);
CREATE INDEX idx_forum_posts_type ON public.forum_posts(type);
CREATE INDEX idx_forum_posts_last_reply_at ON public.forum_posts(last_reply_at DESC);

CREATE INDEX idx_forum_replies_post_id ON public.forum_replies(post_id);

-- Insert default blog categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
('Location Intelligence', 'location-intelligence', 'Articles about location-based analysis and insights', '#3B82F6'),
('AI & Technology', 'ai-technology', 'Latest trends in AI and location technology', '#8B5CF6'),
('Business Strategy', 'business-strategy', 'Strategic insights for business expansion', '#10B981'),
('Case Studies', 'case-studies', 'Real-world success stories and examples', '#F59E0B'),
('Tutorials', 'tutorials', 'How-to guides and tutorials', '#EF4444'),
('Industry News', 'industry-news', 'Latest news and updates', '#6B7280');

-- Insert default forum categories
INSERT INTO public.forum_categories (name, slug, description, color, icon, position) VALUES
('Announcements', 'announcements', 'Official announcements and updates', '#EF4444', 'Megaphone', 1),
('General Discussion', 'general-discussion', 'General discussions about Locora', '#3B82F6', 'MessageSquare', 2),
('Feature Requests', 'feature-requests', 'Request new features and improvements', '#10B981', 'Lightbulb', 3),
('Bug Reports', 'bug-reports', 'Report bugs and technical issues', '#F59E0B', 'Bug', 4),
('Help & Support', 'help-support', 'Get help with using Locora', '#8B5CF6', 'HelpCircle', 5),
('Showcase', 'showcase', 'Share your success stories and results', '#06B6D4', 'Star', 6);

-- Functions to update counters
CREATE OR REPLACE FUNCTION update_blog_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.blog_posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.blog_posts 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_posts 
        SET reply_count = reply_count + 1,
            last_reply_id = NEW.id,
            last_reply_at = NEW.created_at
        WHERE id = NEW.post_id;
        
        UPDATE public.forum_categories 
        SET last_post_id = NEW.post_id,
            last_post_at = NEW.created_at
        WHERE id = (SELECT category_id FROM public.forum_posts WHERE id = NEW.post_id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_posts 
        SET reply_count = reply_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER blog_comment_counter_trigger
    AFTER INSERT OR DELETE ON public.blog_comments
    FOR EACH ROW EXECUTE FUNCTION update_blog_post_counters();

CREATE TRIGGER forum_reply_counter_trigger
    AFTER INSERT OR DELETE ON public.forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_forum_post_counters();
