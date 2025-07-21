// components/providers/SessionSyncProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import useSessionStore from '@/stores/useSessionStore';

interface SessionSyncProviderProps {
  children: ReactNode;
}

export function SessionSyncProvider({ children }: SessionSyncProviderProps) {
  const { data: session, status } = useSession();
  const fetchSession = useSessionStore((state) => state.fetchSession);
  const storeSession = useSessionStore((state) => state.session);

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session &&
      (!storeSession || storeSession.user?.id !== session.user?.id)
    ) {
      // Only update store when something has changed
      useSessionStore.setState({ session, loading: false });
    } else if (status === 'unauthenticated' && storeSession) {
      // Clear store when session is gone
      useSessionStore.setState({ session: null, loading: false });
    }
  }, [session, status, storeSession]);

  // Fetch session on initial mount
  useEffect(() => {
    if (status === 'loading') {
      fetchSession();
    }
  }, [fetchSession, status]);

  return <>{children}</>;
}
