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
  isOAuthLoading?: boolean;
  oauthError?: string | null;
  clearOAuthError?: () => void;
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

/**
 * Maps Supabase Auth user or OAuth payload into standard UserProfile domain object.
 * Robustly extracts name and avatar attributes from user metadata (handling full_name, name, avatar_url, and picture).
 */
export const mapSupabaseUser = (authUser: any): UserProfile => {
  const meta = authUser?.user_metadata || {};
  const email = authUser?.email || '';
  const fullName = meta.full_name || meta.name || email.split('@')[0] || 'Professional User';
  const avatarUrl = meta.avatar_url || meta.picture || undefined;

  return {
    id: authUser?.id || `user-${Date.now()}`,
    email,
    fullName,
    avatarUrl,
    isGuest: false
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);

  const clearOAuthError = () => setOauthError(null);

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

    // Detect and handle OAuth redirect error parameters or code exchange on mount
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash
        );

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (error || errorDescription) {
          const formattedError = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : error || 'OAuth authentication failed';
          console.warn('[AuthContext] Google OAuth redirect error:', formattedError);
          setOauthError(formattedError);

          // Clean error parameters from URL without reloading
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else if (searchParams.has('code') || hashParams.has('access_token')) {
          setIsOAuthLoading(true);
        }
      } catch (err) {
        console.error('[AuthContext] Error parsing OAuth redirect URL parameters:', err);
      }
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (!isMounted) return;
          if (error) {
            console.warn('[AuthContext] Supabase session retrieval error, engaging offline fallback:', error.message);
            setIsSupabaseConnected(false);
            initSessionFromStorage();
          } else if (session?.user) {
            const authUser = mapSupabaseUser(session.user);
            setUser(authUser);
            setIsSupabaseConnected(true);
            try {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            } catch {
              // Ignore storage errors
            }

            // If returned from OAuth redirect (code or hash in URL), sanitize URL bar cleanly
            if (
              typeof window !== 'undefined' &&
              (window.location.search.includes('code=') || window.location.hash.includes('access_token='))
            ) {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
          } else {
            // Supabase is reachable, but user hasn't logged in with Supabase yet
            initSessionFromStorage();
            setIsSupabaseConnected(true);
          }
          setIsOAuthLoading(false);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('[AuthContext] Supabase connectivity error, falling back to local session:', err);
          setIsSupabaseConnected(false);
          initSessionFromStorage();
          setIsOAuthLoading(false);
          setLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          setUser(authUser);
          setIsOAuthLoading(false);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          } catch {
            // Ignore storage errors
          }

          // Clean up OAuth tokens / code from URL query and hash
          if (
            typeof window !== 'undefined' &&
            (window.location.search.includes('code=') || window.location.hash.includes('access_token='))
          ) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } else {
          // Auth state returned null (signed out)
          initSessionFromStorage();
          setIsOAuthLoading(false);
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
      setIsOAuthLoading(false);
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
        const loggedUser = mapSupabaseUser(data.user);
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
        const authUser = mapSupabaseUser(data.user);

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
   * Social Authentication (Google OAuth 2.0)
   * Initiates Google OAuth redirect flow via Supabase Auth with Google provider.
   * Handles local fallback simulation if credentials are not configured.
   */
  const loginWithGoogle = async (): Promise<void> => {
    setOauthError(null);

    if (isSupabaseConfigured && supabase) {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : 'http://localhost:5173';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setOauthError(error.message);
        throw new Error(error.message);
      }
      return data as any;
    } else {
      // Local offline fallback mode:
      // Provide simulated Google OAuth login for zero-friction local development & testing
      const mockGoogleUser: UserProfile = {
        id: `google-user-${Date.now()}`,
        email: 'alex.vance@gmail.com',
        fullName: 'Alex Vance (Google)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        isGuest: false
      };
      setUser(mockGoogleUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockGoogleUser));
      } catch {
        // Ignore storage errors
      }
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
        isOAuthLoading,
        oauthError,
        clearOAuthError,
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
