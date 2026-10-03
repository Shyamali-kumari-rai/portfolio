-- ==============================================================================
-- SUPABASE DATABASE SCHEMA SETUP SCRIPT FOR PORTFOLIO
-- Execute this SQL query in your Supabase Dashboard: SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
    icon_class VARCHAR(100) DEFAULT 'fas fa-code',
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    credential_url TEXT,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Public Read Access (Anyone can view skills and certificates)
CREATE POLICY "Public can view skills" 
ON public.skills FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Public can view certificates" 
ON public.certificates FOR SELECT 
TO public 
USING (true);

-- 5. Policies for Authenticated Admin Users (Insert, Update, Delete)
CREATE POLICY "Admin can insert skills" 
ON public.skills FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admin can update skills" 
ON public.skills FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can delete skills" 
ON public.skills FOR DELETE 
TO authenticated 
USING (true);

CREATE POLICY "Admin can insert certificates" 
ON public.certificates FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admin can update certificates" 
ON public.certificates FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can delete certificates" 
ON public.certificates FOR DELETE 
TO authenticated 
USING (true);

-- 6. Insert Starter Data
INSERT INTO public.skills (title, level, icon_class, sort_order) VALUES
('Java', 50, 'Java', 1),
('HTML & CSS', 85, 'html', 2),
('Python', 70, 'python', 3),
('Graphic Designer', 75, 'graphic-designer', 4),
('JavaScript', 65, 'javascript', 5);

INSERT INTO public.certificates (title, description, image_url, credential_url, sort_order) VALUES
('STARTUP SPRINT', 'Entrepreneurship and hackathon participation experience.', 'assets/certificate1.jpeg', 'assets/certificate1.jpeg', 1),
('Python Hackathon', 'Python hackathon participation experience and coding challenges.', 'assets/certificate4.png', 'assets/certificate4.png', 2),
('Graphic Designing', 'Participated in workshop of Canva & digital branding.', 'assets/certificate2.jpeg', 'assets/certificate2.jpeg', 3),
('JavaJumpstart', 'Core concepts, OOP, and data structures in Java.', 'assets/certificate3.jpeg', 'assets/certificate3.jpeg', 4),
('Introduction to Programming', 'Foundational programming workshop and algorithmic thinking.', 'assets/certificate5.jpeg', 'assets/certificate5.jpeg', 5);

-- 7. Storage Bucket Setup (For uploading certificate images)
-- Note: Create a public bucket named 'certificates' in Supabase Dashboard -> Storage
-- or run the following if storage extensions are active:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'certificates');

CREATE POLICY "Admin Storage Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Admin Storage Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'certificates');

-- ==============================================================================
-- 8. Contact Form Submissions Table (Messages)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Public can insert messages"
ON public.messages FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated admin can view and delete messages
CREATE POLICY "Admin can view messages"
ON public.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can delete messages"
ON public.messages FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Admin can update messages"
ON public.messages FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

