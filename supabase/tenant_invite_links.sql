-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.tenant_invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '30 days'
);

ALTER TABLE public.tenant_invite_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their invite links"
  ON public.tenant_invite_links
  FOR ALL
  USING (auth.uid() = user_id);

-- Public read by token (for tenant form)
CREATE POLICY "Anyone can read invite link by token"
  ON public.tenant_invite_links
  FOR SELECT
  USING (true);
