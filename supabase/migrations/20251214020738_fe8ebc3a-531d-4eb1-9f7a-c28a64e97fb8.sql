-- Add columns for smart insights tracking
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS mojo_themes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS focus_areas jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS behavior_patterns jsonb DEFAULT '{"intensity_seeking": 50, "impulse_control": 50, "avoidance_patterns": 50, "risk_chasing": 50, "recovery_speed": 50}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_insights jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_insight_update timestamp with time zone;

-- Create table for mojo chat history (for AI analysis)
CREATE TABLE IF NOT EXISTS public.mojo_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  themes jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mojo_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for mojo_conversations
CREATE POLICY "Users can view own conversations" 
ON public.mojo_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" 
ON public.mojo_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
ON public.mojo_conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mojo_conversations_user_id ON public.mojo_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_mojo_conversations_created_at ON public.mojo_conversations(created_at DESC);