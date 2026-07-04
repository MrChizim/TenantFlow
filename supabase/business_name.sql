ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT;
