/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig } from '../services/supabaseClient';
import {
  getCurrentSession,
  signIn,
  signOut,
  signUp,
  updateProfile,
} from '../services/supabaseAuthService';

const AuthContext = createContext(null);

const STORAGE_KEY = 'greenzone_user_fallback';

function readFallbackUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeFallbackUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readFallbackUser());
  const [isLoading, setIsLoading] = useState(() => hasSupabaseConfig && !readFallbackUser());
  const [authBackend, setAuthBackend] = useState(hasSupabaseConfig ? 'supabase' : 'fallback');

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!hasSupabaseConfig) {
        setUser(readFallbackUser());
        setIsLoading(false);
        return;
      }

      try {
        const sessionState = await getCurrentSession();
        if (!isMounted) return;
        setUser(sessionState.user);
        writeFallbackUser(sessionState.user);
      } catch {
        if (!isMounted) return;
        setAuthBackend('fallback');
        setUser(readFallbackUser());
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSession();

    if (!supabase) return () => {
      isMounted = false;
    };

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        writeFallbackUser(null);
        return;
      }

      try {
        const sessionState = await getCurrentSession();
        setUser(sessionState.user);
        writeFallbackUser(sessionState.user);
      } catch {
        setAuthBackend('fallback');
      }
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Supabase is not configured yet.' };
    }

    const result = await signIn(email, password);
    if (result.success) {
      setUser(result.user);
      writeFallbackUser(result.user);
    }
    return result;
  };

  const signup = async (name, email, password) => {
    if (!hasSupabaseConfig) {
      return { success: false, error: 'Supabase is not configured yet.' };
    }

    const result = await signUp(name, email, password);
    if (result.success && result.user) {
      setUser(result.user);
      writeFallbackUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await signOut();
    writeFallbackUser(null);
    setUser(null);
  };

  const updateUser = async (name, email) => {
    if (!user?.id || !hasSupabaseConfig) {
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      writeFallbackUser(updatedUser);
      return { success: true };
    }

    const result = await updateProfile(user.id, { name, email });
    if (result.success) {
      setUser(result.user);
      writeFallbackUser(result.user);
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, authBackend, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
