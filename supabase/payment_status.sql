-- Run in Supabase SQL editor

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid'
CHECK (payment_status IN ('paid', 'owing', 'uncertain'));
