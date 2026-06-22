'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadFromSupabase = useStore(s => s.loadFromSupabase);
  const clearAll = useStore(s => s.clearAll);
  const loaded = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Load data for the current session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !loaded.current) {
        loaded.current = true;
        loadFromSupabase(supabase, user.id);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loaded.current = true;
        loadFromSupabase(supabase, session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        loaded.current = false;
        clearAll();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFromSupabase, clearAll]);

  return <>{children}</>;
}
