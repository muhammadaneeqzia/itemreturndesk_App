-- ============================================
-- Item Return Desk - Complete Supabase Schema
-- ============================================
-- This file contains all SQL queries to set up the database
-- Run this in Supabase SQL Editor section by section
-- ============================================

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for hashing (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CREATE ENUMS (Optional - using CHECK constraints instead)
-- ============================================
-- We'll use CHECK constraints instead of ENUMs for flexibility

-- ============================================
-- 3. CREATE TABLES
-- ============================================

-- Table: profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Lost', 'Found')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other')),
    location TEXT NOT NULL,
    tip_amount DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'resolved', 'archived')),
    claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days')
);

-- Table: post_images
CREATE TABLE IF NOT EXISTS public.post_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: post_videos
CREATE TABLE IF NOT EXISTS public.post_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id, post_id)
);

-- Table: messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'match', 'claim', 'contact', 'admin')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. CREATE INDEXES
-- ============================================

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type_status_created ON public.posts(type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON public.posts(expires_at);

-- post_images indexes
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_post_images_post_order ON public.post_images(post_id, image_order);

-- post_videos indexes
CREATE INDEX IF NOT EXISTS idx_post_videos_post_id ON public.post_videos(post_id);

-- conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_post_id ON public.conversations(post_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON public.conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON public.conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================
-- 5. CREATE FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update conversation last_message_at when new message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create notification when message is sent
CREATE OR REPLACE FUNCTION public.notify_message_sent()
RETURNS TRIGGER AS $$
DECLARE
    conv_record RECORD;
    recipient_id UUID;
BEGIN
    -- Get conversation details
    SELECT user1_id, user2_id INTO conv_record
    FROM public.conversations
    WHERE id = NEW.conversation_id;

    -- Determine recipient (the other user)
    IF conv_record.user1_id = NEW.sender_id THEN
        recipient_id := conv_record.user2_id;
    ELSE
        recipient_id := conv_record.user1_id;
    END IF;

    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message, conversation_id, related_user_id)
    VALUES (
        recipient_id,
        'message',
        'New Message',
        'You have a new message',
        NEW.conversation_id,
        NEW.sender_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get unread message count for a user
CREATE OR REPLACE FUNCTION public.get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM public.messages m
    INNER JOIN public.conversations c ON m.conversation_id = c.id
    WHERE (c.user1_id = p_user_id OR c.user2_id = p_user_id)
      AND m.sender_id != p_user_id
      AND m.is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-archive old posts
CREATE OR REPLACE FUNCTION public.auto_archive_old_posts()
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET status = 'archived',
        updated_at = timezone('utc'::text, now())
    WHERE status IN ('active', 'claimed')
      AND expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for posts
DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update updated_at for conversations
DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Create profile when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update conversation when new message is sent
DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

-- Trigger: Create notification when message is sent
DROP TRIGGER IF EXISTS on_message_notification ON public.messages;
CREATE TRIGGER on_message_notification
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_message_sent();

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update any post" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;

DROP POLICY IF EXISTS "Post images are viewable by everyone" ON public.post_images;
DROP POLICY IF EXISTS "Users can insert images for own posts" ON public.post_images;
DROP POLICY IF EXISTS "Users can update images for own posts" ON public.post_images;
DROP POLICY IF EXISTS "Admins can update any post image" ON public.post_images;
DROP POLICY IF EXISTS "Users can delete images for own posts" ON public.post_images;
DROP POLICY IF EXISTS "Admins can delete any post image" ON public.post_images;

DROP POLICY IF EXISTS "Post videos are viewable by everyone" ON public.post_videos;
DROP POLICY IF EXISTS "Users can insert videos for own posts" ON public.post_videos;
DROP POLICY IF EXISTS "Users can update videos for own posts" ON public.post_videos;
DROP POLICY IF EXISTS "Admins can update any post video" ON public.post_videos;
DROP POLICY IF EXISTS "Users can delete videos for own posts" ON public.post_videos;
DROP POLICY IF EXISTS "Admins can delete any post video" ON public.post_videos;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (status = 'active' OR status = 'claimed');

CREATE POLICY "Users can view their own posts"
    ON public.posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any post"
    ON public.posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can delete own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any post"
    ON public.posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Post Images Policies
CREATE POLICY "Post images are viewable by everyone"
    ON public.post_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_images.post_id
            AND (status = 'active' OR status = 'claimed')
        )
    );

CREATE POLICY "Users can insert images for own posts"
    ON public.post_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_images.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update images for own posts"
    ON public.post_images FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_images.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update any post image"
    ON public.post_images FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can delete images for own posts"
    ON public.post_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_images.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete any post image"
    ON public.post_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Post Videos Policies
CREATE POLICY "Post videos are viewable by everyone"
    ON public.post_videos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_videos.post_id
            AND (status = 'active' OR status = 'claimed')
        )
    );

CREATE POLICY "Users can insert videos for own posts"
    ON public.post_videos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_videos.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update videos for own posts"
    ON public.post_videos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_videos.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update any post video"
    ON public.post_videos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can delete videos for own posts"
    ON public.post_videos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE id = post_videos.post_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete any post video"
    ON public.post_videos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Conversations Policies
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete own conversations"
    ON public.conversations FOR DELETE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = messages.conversation_id
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in own conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = messages.conversation_id
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Handled by triggers/functions

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT ALL ON public.posts TO authenticated;
GRANT SELECT ON public.posts TO anon;

GRANT ALL ON public.post_images TO authenticated;
GRANT SELECT ON public.post_images TO anon;

GRANT ALL ON public.post_videos TO authenticated;
GRANT SELECT ON public.post_videos TO anon;

GRANT ALL ON public.conversations TO authenticated;

GRANT ALL ON public.messages TO authenticated;

GRANT ALL ON public.notifications TO authenticated;

-- Grant permissions on sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- ============================================
-- NOTES:
-- ============================================
-- 1. After running this SQL, go to Supabase Dashboard:
--    - Storage → Create buckets: post-images, post-videos, user-avatars
--    - Set bucket policies (see schema.md)
--
-- 2. To create an admin user:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@campus.edu';
--
-- 3. Set up cron job for auto-archiving (optional):
--    SELECT cron.schedule('archive-old-posts', '0 0 * * *', 'SELECT public.auto_archive_old_posts()');
--
-- 4. Enable Realtime for:
--    - messages table (for chat)
--    - notifications table (for real-time notifications)
--    - posts table (for post updates)
-- ============================================

