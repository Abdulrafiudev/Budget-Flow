-- Create notification reminders table to track scheduled push notifications
CREATE TABLE IF NOT EXISTS public.notification_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  income_entry_id UUID NOT NULL REFERENCES public.income_entries(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notification_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_reminders
CREATE POLICY "Users can view their own notification reminders"
  ON public.notification_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification reminders"
  ON public.notification_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification reminders"
  ON public.notification_reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_notification_reminders_user_id ON public.notification_reminders(user_id);
CREATE INDEX idx_notification_reminders_scheduled_for ON public.notification_reminders(scheduled_for);
CREATE INDEX idx_notification_reminders_sent ON public.notification_reminders(sent);
