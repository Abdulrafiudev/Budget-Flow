-- Create income entries table to allow multiple income additions per month
CREATE TABLE IF NOT EXISTS public.income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.income_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_entries
CREATE POLICY "Users can view their own income entries"
  ON public.income_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income entries"
  ON public.income_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income entries"
  ON public.income_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income entries"
  ON public.income_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_income_entries_user_id ON public.income_entries(user_id);
CREATE INDEX idx_income_entries_budget_id ON public.income_entries(budget_id);
CREATE INDEX idx_income_entries_date ON public.income_entries(date);
