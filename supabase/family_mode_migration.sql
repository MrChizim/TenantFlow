-- Run this in your Supabase SQL editor after switching to family/shared-password mode.
-- This removes the per-user auth dependency from the schema now that the app
-- no longer creates or relies on multiple auth.users rows.
--
-- Run each numbered block separately — if one statement in a batch fails,
-- Supabase rolls back the whole batch, including earlier statements that
-- would otherwise have succeeded.

-- 1. Simple single-row settings table replacing "profiles" (business_name only —
--    plan/billing fields are no longer needed). Run this block first.
CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name TEXT
);

-- 2. Seed the single settings row. Set your business name from the app's
--    Settings page afterward — no need to fill it in here.
INSERT INTO public.app_settings (id, business_name)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop the FK from tenant_invite_links.user_id to auth.users, and allow it to be null.
--    (The invite-generate route no longer has a real signed-in Supabase user.)
ALTER TABLE public.tenant_invite_links
  DROP CONSTRAINT IF EXISTS tenant_invite_links_user_id_fkey;
ALTER TABLE public.tenant_invite_links
  ALTER COLUMN user_id DROP NOT NULL;

-- 4. Drop RLS policies everywhere — the app now uses the service-role key
--    exclusively from trusted server code, so Postgres RLS is no longer the
--    access-control boundary (the shared password + session cookie is).
ALTER TABLE public.tenant_invite_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments DISABLE ROW LEVEL SECURITY;

-- 5. profiles table is no longer used by the app — safe to drop once you've
--    confirmed everything works (business_name now lives in app_settings).
-- DROP TABLE IF EXISTS public.profiles;
