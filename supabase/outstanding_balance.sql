ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC DEFAULT 0;
