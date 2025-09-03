-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('super_admin', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all admin records" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin records" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Insert the super admin user
INSERT INTO public.admin_users (user_id, email, role)
SELECT id, 'solarapp98@gmail.com', 'super_admin'
FROM auth.users 
WHERE email = 'solarapp98@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    IF user_email IS NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        );
    ELSE
        RETURN EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE email = user_email
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS TEXT AS $$
DECLARE
    admin_role TEXT;
BEGIN
    SELECT role INTO admin_role
    FROM public.admin_users 
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(admin_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin stats view
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.user_credits WHERE plan = 'free') as free_users,
    (SELECT COUNT(*) FROM public.user_credits WHERE plan = 'professional') as professional_users,
    (SELECT COUNT(*) FROM public.user_credits WHERE plan = 'enterprise') as enterprise_users,
    (SELECT COUNT(*) FROM public.datasets) as total_datasets,
    (SELECT COUNT(*) FROM public.analyses) as total_analyses,
    (SELECT SUM(credits) FROM public.user_credits) as total_credits_remaining,
    (SELECT COUNT(*) FROM public.analyses WHERE ai_recommendation IS NOT NULL) as ai_recommendations_used,
    (SELECT COUNT(*) FROM public.analyses WHERE ai_swot_analysis IS NOT NULL) as swot_analyses_used;

-- Grant access to admin stats view
GRANT SELECT ON public.admin_stats TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_role ON public.admin_users(role);
