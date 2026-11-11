import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '../services/supabaseClient';
import { ResumeTemplateId } from '../types/resume';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceSettings {
  userId: string;
  defaultTemplate: ResumeTemplateId;
  aiModelPreference: string;
  autoSaveEnabled: boolean;
  exportPageLimit: number;
  themePreference?: 'dark' | 'light' | 'system';
  updatedAt?: string;
}

export interface ProfileUpdatePayload {
  fullName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
}

export interface SettingsUpdatePayload {
  defaultTemplate?: ResumeTemplateId;
  aiModelPreference?: string;
  autoSaveEnabled?: boolean;
  exportPageLimit?: number;
  themePreference?: 'dark' | 'light' | 'system';
}

export interface SignupResult {
  user?: UserProfile | null;
  requiresEmailConfirmation?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  settings: WorkspaceSettings;
  loading: boolean;
  isOAuthLoading?: boolean;
  oauthError?: string | null;
  clearOAuthError?: () => void;
  isSupabaseConnected: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, fullName: string) => Promise<SignupResult>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdatePayload) => Promise<void>;
  updateSettings: (updates: SettingsUpdatePayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshConnectionStatus?: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest-user-123',
  email: 'alex.vance@example.com',
  fullName: 'Alex Vance',
  headline: 'Senior Full Stack & AI Systems Engineer',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  githubUsername: 'alexvance-dev',
  linkedinUrl: 'https://linkedin.com/in/alexvance',
  isGuest: true
};

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  userId: 'guest-user-123',
  defaultTemplate: 'ats-minimal',
  aiModelPreference: 'gemini-2.5-flash',
  autoSaveEnabled: true,
  exportPageLimit: 1,
  themePreference: 'dark'
};

export const AUTH_STORAGE_KEY = 'ai_resume_auth_session';
export const WORKSPACE_SETTINGS_STORAGE_KEY = 'ai_resume_workspace_settings';
export const USER_PROFILE_STORAGE_KEY = 'ai_resume_user_profile';

/**
 * Maps Supabase Auth user or OAuth payload and optional PostgreSQL profiles row into standard UserProfile domain object.
 * Robustly extracts name, avatar, contact attributes from user metadata (handling full_name, name, avatar_url, and picture)
 * and enriches them with database profile fields.
 */
export const mapSupabaseUser = (authUser: any, dbProfile?: any): UserProfile => {
  const meta = authUser?.user_metadata || {};
  const email = authUser?.email || dbProfile?.email || '';
  const fullName =
    dbProfile?.full_name || meta.full_name || meta.name || email.split('@')[0] || 'Professional User';
  const avatarUrl = dbProfile?.avatar_url || meta.avatar_url || meta.picture || undefined;
  const headline = dbProfile?.headline || meta.headline || undefined;
  const phone = dbProfile?.phone || meta.phone || undefined;
  const location = dbProfile?.location || meta.location || undefined;
  const githubUsername = dbProfile?.github_username || meta.github_username || undefined;
  const linkedinUrl = dbProfile?.linkedin_url || meta.linkedin_url || undefined;

  return {
    id: authUser?.id || dbProfile?.id || `user-${Date.now()}`,
    email,
    fullName,
    headline,
    phone,
    location,
    avatarUrl,
    githubUsername,
    linkedinUrl,
    isGuest: false,
    createdAt: dbProfile?.created_at || authUser?.created_at,
    updatedAt: dbProfile?.updated_at || authUser?.updated_at
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured);

  const clearOAuthError = () => setOauthError(null);

  /**
   * Restores a local offline fallback session if present,
   * otherwise defaults to the guest user session and default workspace settings.
   */
  const initSessionFromStorage = () => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed: UserProfile = JSON.parse(savedSession);
        if (parsed && parsed.email) {
          setUser(parsed);
        } else {
          setUser(DEFAULT_GUEST_USER);
        }
      } else {
        setUser(DEFAULT_GUEST_USER);
      }
    } catch {
      setUser(DEFAULT_GUEST_USER);
    }

    try {
      const savedSettings = localStorage.getItem(WORKSPACE_SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings: WorkspaceSettings = JSON.parse(savedSettings);
        if (parsedSettings && parsedSettings.defaultTemplate) {
          setSettings(parsedSettings);
          return;
        }
      }
    } catch {}
    setSettings(DEFAULT_WORKSPACE_SETTINGS);
  };

  /**
   * Synchronizes user profile and workspace settings from Supabase database tables ('profiles' and 'user_settings').
   * If records do not yet exist, initializes them with defaults or session metadata.
   */
  const syncProfileAndSettingsFromDb = async (userId: string, currentAuthUser?: any) => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Fetch Profile row from 'profiles' table
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.warn('[AuthContext] Error retrieving profile row from database:', profileErr.message);
      } else if (profileData) {
        const enrichedUser = mapSupabaseUser(
          currentAuthUser || { id: userId, email: profileData.email },
          profileData
        );
        setUser(enrichedUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(enrichedUser));
          localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(enrichedUser));
        } catch {}
      } else if (currentAuthUser) {
        // Upsert matching profile record if not yet created by trigger
        const initialProfile = mapSupabaseUser(currentAuthUser);
        await supabase.from('profiles').upsert({
          id: userId,
          email: initialProfile.email,
          full_name: initialProfile.fullName,
          avatar_url: initialProfile.avatarUrl,
          headline: initialProfile.headline,
          phone: initialProfile.phone,
          location: initialProfile.location,
          github_username: initialProfile.githubUsername,
          linkedin_url: initialProfile.linkedinUrl,
          updated_at: new Date().toISOString()
        });
      }

      // 2. Fetch Settings row from 'user_settings' table
      const { data: settingsData, error: settingsErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsErr) {
        console.warn('[AuthContext] Error retrieving user_settings row from database:', settingsErr.message);
      } else if (settingsData) {
        const loadedSettings: WorkspaceSettings = {
          userId: settingsData.user_id,
          defaultTemplate: (settingsData.default_template as ResumeTemplateId) || 'ats-minimal',
          aiModelPreference: settingsData.ai_model_preference || 'gemini-2.5-flash',
          autoSaveEnabled: settingsData.auto_save_enabled !== undefined ? settingsData.auto_save_enabled : true,
          exportPageLimit: settingsData.export_page_limit || 1,
          themePreference: 'dark',
          updatedAt: settingsData.updated_at
        };
        setSettings(loadedSettings);
        try {
          localStorage.setItem(WORKSPACE_SETTINGS_STORAGE_KEY, JSON.stringify(loadedSettings));
        } catch {}
      } else {
        // Initialize default user settings in table
        const initialSettings = { ...DEFAULT_WORKSPACE_SETTINGS, userId };
        await supabase.from('user_settings').upsert({
          user_id: userId,
          default_template: initialSettings.defaultTemplate,
          ai_model_preference: initialSettings.aiModelPreference,
          auto_save_enabled: initialSettings.autoSaveEnabled,
          export_page_limit: initialSettings.exportPageLimit,
          updated_at: new Date().toISOString()
        });
        setSettings(initialSettings);
      }
    } catch (err) {
      console.warn('[AuthContext] Profile & settings synchronization exception:', err);
    }
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
        .then(async ({ data: { session }, error }) => {
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

            // Sync enriched profile and settings from database tables
            await syncProfileAndSettingsFromDb(session.user.id, session.user);

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

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

          // Sync database profile and workspace settings
          await syncProfileAndSettingsFromDb(session.user.id, session.user);

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
        await syncProfileAndSettingsFromDb(data.user.id, data.user);
      }
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: `user-local-${Date.now()}`,
        email: trimmedEmail,
        fullName: trimmedEmail.split('@')[0],
        headline: 'Professional User',
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

        await syncProfileAndSettingsFromDb(data.user.id, data.user);
        return { user: authUser, requiresEmailConfirmation: false };
      }

      return { requiresEmailConfirmation: false };
    } else {
      // Local offline fallback mode
      const loggedUser: UserProfile = {
        id: `user-local-${Date.now()}`,
        email: trimmedEmail,
        fullName: trimmedName || trimmedEmail.split('@')[0],
        headline: 'Professional User',
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
        headline: 'Staff AI Systems Architect',
        phone: '+1 (555) 987-6543',
        location: 'Mountain View, CA',
        githubUsername: 'alexvance',
        linkedinUrl: 'https://linkedin.com/in/alexvance',
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
      localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
      localStorage.removeItem(WORKSPACE_SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setUser(DEFAULT_GUEST_USER);
    setSettings(DEFAULT_WORKSPACE_SETTINGS);
  };

  /**
   * Update User Profile details
   * Optimistically updates state, persists to localStorage, and synchronizes to Supabase 'profiles' table.
   */
  const updateProfile = async (updates: ProfileUpdatePayload): Promise<void> => {
    if (!user) return;

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Optimistic UI state update
    setUser(updatedUser);

    // Persist to local caches
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('[AuthContext] LocalStorage profile write warning:', err);
    }

    // Upsert to Supabase 'profiles' table if connected and non-guest
    if (isSupabaseConfigured && supabase && !user.isGuest) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: updatedUser.fullName,
        headline: updatedUser.headline,
        phone: updatedUser.phone,
        location: updatedUser.location,
        avatar_url: updatedUser.avatarUrl,
        github_username: updatedUser.githubUsername,
        linkedin_url: updatedUser.linkedinUrl,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('[AuthContext] Error synchronizing profile to database:', error.message);
        throw new Error(error.message);
      }
    }
  };

  /**
   * Update Workspace Settings preferences
   * Optimistically updates settings state, persists to localStorage, and synchronizes to Supabase 'user_settings' table.
   */
  const updateSettings = async (updates: SettingsUpdatePayload): Promise<void> => {
    const updatedSettings: WorkspaceSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Optimistic UI state update
    setSettings(updatedSettings);

    // Persist to local cache
    try {
      localStorage.setItem(WORKSPACE_SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (err) {
      console.warn('[AuthContext] LocalStorage settings write warning:', err);
    }

    // Upsert to Supabase 'user_settings' table if connected and non-guest
    if (isSupabaseConfigured && supabase && user && !user.isGuest) {
      const { error } = await supabase.from('user_settings').upsert({
        user_id: user.id,
        default_template: updatedSettings.defaultTemplate,
        ai_model_preference: updatedSettings.aiModelPreference,
        auto_save_enabled: updatedSettings.autoSaveEnabled,
        export_page_limit: updatedSettings.exportPageLimit,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('[AuthContext] Error synchronizing settings to database:', error.message);
        throw new Error(error.message);
      }
    }
  };

  /**
   * Refreshes user profile and workspace settings from database
   */
  const refreshProfile = async (): Promise<void> => {
    if (user?.id) {
      await syncProfileAndSettingsFromDb(user.id, user);
    }
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
        settings,
        loading,
        isOAuthLoading,
        oauthError,
        clearOAuthError,
        isSupabaseConnected,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
        updateSettings,
        refreshProfile,
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
