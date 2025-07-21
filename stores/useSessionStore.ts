// stores/useSessionStore.ts
import { create } from 'zustand';
import { Session } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface SessionState {
  session: Session | null;
  loading: boolean;
  fetchSession: () => Promise<void>;
  updateSession: (updates: Partial<Session['user']>) => void;
  logout: () => Promise<void>;
  isRole: (role: UserRole | UserRole[]) => boolean;
}

const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  loading: true,

  fetchSession: async () => {
    set({ loading: true });
    try {
      const session = await getSession();
      console.log('Session fetched:', session ? 'exists' : 'null');
      set({ session, loading: false });
    } catch (error) {
      console.error('Error fetching session:', error);
      set({ session: null, loading: false });
    }
  },

  updateSession: (updates) => {
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            user: {
              ...state.session?.user,
              ...updates,
            },
          }
        : null,
    }));
  },

  logout: async () => {
    try {
      console.log('Starting logout process in Zustand store');

      // First, clear the store state to prevent UI glitches
      set({ session: null, loading: false });

      // Next, try to clear admin-specific state if applicable
      try {
        const response = await fetch('/api/admin/auth', {
          method: 'DELETE',
          credentials: 'include',
        });
        console.log('Admin auth endpoint response:', response.status);
      } catch (err) {
        // Continue even if this fails
        console.log('Admin auth endpoint failed, continuing logout');
      }

      // Use NextAuth signOut with redirect:false to prevent automatic redirects
      // We'll handle redirects manually to ensure clean logout
      const signOutResponse = await signOut({
        redirect: false,
        callbackUrl: '/',
      });

      console.log('NextAuth signOut completed');

      // Return the redirect URL from NextAuth
      return Promise.resolve();
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clearing the state even on error
      set({ session: null, loading: false });
      return Promise.reject(error);
    }
  },

  // Utility function to check user roles
  isRole: (role) => {
    const { session } = get();
    if (!session?.user?.role) return false;

    if (Array.isArray(role)) {
      return role.includes(session.user.role);
    }

    return session.user.role === role;
  },
}));

export default useSessionStore;
