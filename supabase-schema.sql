-- Create table if missing
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  quiz JSONB NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Replace existing policies
DROP POLICY IF EXISTS "Enable all access" ON public.quizzes;
DROP POLICY IF EXISTS "Allow public insert" ON public.quizzes;
DROP POLICY IF EXISTS "Allow public select" ON public.quizzes;

-- Open policies (anon-friendly; for development)
CREATE POLICY "Allow insert" ON public.quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select" ON public.quizzes FOR SELECT USING (true);
