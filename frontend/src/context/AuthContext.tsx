'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setAuth: (user: User, session: Session) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const updateSessionCookie = (session: Session | null) => {
    if (session) {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `sb-access-token=${session.access_token}; path=/; SameSite=Lax${secure}`;
    } else {
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const setAuth = (user: User, session: Session) => {
    setUser(user);
    setSession(session);
    updateSessionCookie(session);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session: storedSession } } = await supabase.auth.getSession();

      if (storedSession) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (refreshed) {
          setSession(refreshed);
          setUser(refreshed.user);
          updateSessionCookie(refreshed);
        } else {
          setSession(storedSession);
          setUser(storedSession.user);
          updateSessionCookie(storedSession);
        }
      }
      setIsLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsLoading(false);
        updateSessionCookie(null);
        router.push('/auth/login');
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      updateSessionCookie(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
