-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 11 NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'professional', 'enterprise')),
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON public.user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits, plan, last_reset)
    VALUES (NEW.id, 11, 'free', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credits when a user signs up
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to reset credits monthly
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void AS $$
BEGIN
    UPDATE public.user_credits
    SET 
        credits = CASE 
            WHEN plan = 'free' THEN 11
            WHEN plan = 'professional' THEN 216
            WHEN plan = 'enterprise' THEN 1008
            ELSE 11
        END,
        last_reset = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        last_reset < CURRENT_DATE - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_user_credits_plan ON public.user_credits(plan);
CREATE INDEX idx_user_credits_last_reset ON public.user_credits(last_reset);
