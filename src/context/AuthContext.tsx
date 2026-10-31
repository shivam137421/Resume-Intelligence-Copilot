import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../services/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isGuest?: boolean;
}

export interface SignupResult {
  user?: UserProfile | null;
  requiresEmailConfirmation?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, fullName: string) => Promise<SignupResult>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshConnectionStatus?: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest-user-123',
  email: 'alex.vance@example.com',
  fullName: 'Alex Vance',
  isGuest: true
};

export const AUTH_STORAGE_KEY = 'ai_resume_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);

  /**
   * Restores a local offline fallback session if present,
   * otherwise defaults to the guest user session.
   */
  const initSessionFromStorage = () => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed: UserProfile = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setUser(parsed);
          return;
        }
      }
    } catch {
      // Local storage disabled or corrupted, proceed to default guest
    }
    setUser(DEFAULT_GUEST_USER);
  };

  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (!isMounted) return;
          if (error) {
            console.warn('[AuthContext] Supabase session retrieval error, engaging offline fallback:', error.message);
            setIsSupabaseConnected(false);
            initSessionFromStorage();
          } else if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Professional User',
              avatarUrl: session.user.user_metadata?.avatar_url,
              isGuest: false
            });
            setIsSupabaseConnected(true);
          } else {
            // Supabase is reachable, but user hasn't logged in with Supabase yet
            initSessionFromStorage();
            setIsSupabaseConnected(true);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('[AuthContext] Supabase connectivity error, falling back to local session:', err);
          setIsSupabaseConnected(false);
          initSessionFromStorage();
          setLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const authUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Professional User',
            avatarUrl: session.user.user_metadata?.avatar_url,
            isGuest: false
          };
          setUser(authUser);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          } catch {
            // Ignore storage errors
          }
        } else {
          // Auth state returned null (signed out)
          initSessionFromStorage();
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Offline / unconfigured fallback mode
      initSessionFromStorage();
      setIsSupabaseConnected(false);
      setLoading(false);
    }
  }, []);

  /**
   * Log in with Email & Password
   */
  const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    const trimmedEmail = email.trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.user) {
        const loggedUser: UserProfile = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          fullName: data.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url,
          isGuest: false
        };
        setUser(loggedUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        } catch {
          // Ignore storage errors
        }
      }
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: `user-local-${Date.now()}`,
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        isGuest: false
      };
      setUser(loggedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {
        // Ignore storage errors
      }
    }
  };

  /**
   * Register a new user with Email, Password, and Full Name metadata
   */
  const signupWithEmail = async (email: string, pass: string, fullName: string): Promise<SignupResult> => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: {
            full_name: trimmedName
          }
        }
      });
      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const authUser: UserProfile = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          fullName: data.user.user_metadata?.full_name || trimmedName || trimmedEmail.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url,
          isGuest: false
        };

        // If email confirmation is enabled on Supabase, session is null until confirmed
        if (!data.session) {
          return { user: authUser, requiresEmailConfirmation: true };
        }

        setUser(authUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        } catch {
          // Ignore storage errors
        }
        return { user: authUser, requiresEmailConfirmation: false };
      }

      return { requiresEmailConfirmation: false };
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: `user-local-${Date.now()}`,
        email: trimmedEmail,
        fullName: trimmedName || trimmedEmail.split('@')[0],
        isGuest: false
      };
      setUser(loggedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {
        // Ignore storage errors
      }
      return { user: loggedUser, requiresEmailConfirmation: false };
    }
  };

  /**
   * Social Authentication (Google OAuth)
   */
  const loginWithGoogle = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw new Error(error.message);
    } else {
      alert('Google OAuth requires active Supabase credentials in .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY). Please see ANTIGRAVITY_SETUP.md for setup instructions.');
    }
  };

  /**
   * Log out of current session and restore default guest workspace
   */
  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthContext] Supabase sign out warning:', err);
      }
    }
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setUser(DEFAULT_GUEST_USER);
  };

  /**
   * Connectivity check helper
   */
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
