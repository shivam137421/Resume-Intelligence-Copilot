import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../services/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isGuest?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshConnectionStatus?: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'ai_resume_guest_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);

  const initGuestUser = () => {
    try {
      const localGuest = localStorage.getItem(GUEST_STORAGE_KEY);
      if (localGuest) {
        setUser(JSON.parse(localGuest));
      } else {
        const guest: UserProfile = {
          id: 'guest-user-123',
          email: 'alex.vance@example.com',
          fullName: 'Alex Vance',
          isGuest: true
        };
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest));
        setUser(guest);
      }
    } catch {
      // In case localStorage is disabled or restricted
      setUser({
        id: 'guest-user-123',
        email: 'alex.vance@example.com',
        fullName: 'Alex Vance',
        isGuest: true
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (!isMounted) return;
          if (error) {
            console.warn('[AuthContext] Supabase session retrieval error, switching to offline fallback mode:', error.message);
            setIsSupabaseConnected(false);
            initGuestUser();
          } else if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'Professional User',
              avatarUrl: session.user.user_metadata?.avatar_url,
              isGuest: false
            });
            setIsSupabaseConnected(true);
          } else {
            // Supabase is configured and connected, but no user is currently authenticated
            initGuestUser();
            setIsSupabaseConnected(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('[AuthContext] Network unreachable or Supabase error; fallback engine active:', err);
          setIsSupabaseConnected(false);
          initGuestUser();
          setLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || 'Professional User',
            avatarUrl: session.user.user_metadata?.avatar_url,
            isGuest: false
          });
        } else {
          initGuestUser();
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Offline / unconfigured fallback mode
      initGuestUser();
      setIsSupabaseConnected(false);
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: 'user-local',
        email,
        fullName: email.split('@')[0],
        isGuest: false
      };
      setUser(loggedUser);
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {
        // Ignore storage errors
      }
    }
  };

  const signupWithEmail = async (email: string, pass: string, fullName: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: 'user-local',
        email,
        fullName,
        isGuest: false
      };
      setUser(loggedUser);
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {
        // Ignore storage errors
      }
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } else {
      alert('Google OAuth requires active Supabase credentials in .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY). Please see ANTIGRAVITY_SETUP.md for step-by-step setup.');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthContext] Supabase sign out warning:', err);
      }
    }
    initGuestUser();
  };

  const refreshConnectionStatus = async (): Promise<boolean> => {
    const isConnected = await checkSupabaseConnection();
    setIsSupabaseConnected(isConnected);
    return isConnected;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConnected,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        refreshConnectionStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
