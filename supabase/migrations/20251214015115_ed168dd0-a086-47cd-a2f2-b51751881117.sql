-- Create user_progress table to store charge, transactions, and stats
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 5,
  streak INTEGER NOT NULL DEFAULT 0,
  streak_claimed_today BOOLEAN NOT NULL DEFAULT false,
  last_active_date TEXT,
  stats JSONB NOT NULL DEFAULT '{"plannedSessions":0,"earlyExits":0,"stayedWithin":0,"wentOver":0,"averageDelaySeconds":0,"longestStabilityRun":0,"currentStabilityRun":0}'::jsonb,
  reaction_leaderboard JSONB NOT NULL DEFAULT '{"personalBest":999,"averageTime":0,"totalAttempts":0,"history":[],"percentile":50}'::jsonb,
  trial_start TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- Create transactions table to store charge history
CREATE TABLE public.charge_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'allocate', 'bonus')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charge_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for charge_transactions
CREATE POLICY "Users can view own transactions" ON public.charge_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.charge_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_charge_transactions_user ON public.charge_transactions(user_id);
CREATE INDEX idx_charge_transactions_created ON public.charge_transactions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();