'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const load = useStore(s => s.load);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    load();
  }, [load]);

  return <>{children}</>;
}
