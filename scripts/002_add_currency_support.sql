-- Add currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN'));

-- Add currency column to budgets table for historical tracking
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN'));
