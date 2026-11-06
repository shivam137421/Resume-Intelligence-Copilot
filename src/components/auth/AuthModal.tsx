import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signin' }) => {
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    isSupabaseConnected,
    oauthError,
    clearOAuthError,
    isOAuthLoading
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form error, loading, and OAuth loading states
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  // Sync OAuth error from context if redirect returned with error
  useEffect(() => {
    if (oauthError) {
      setErrorMessage(oauthError);
    }
  }, [oauthError]);

  // Field validation touched states
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Real-time field validation calculations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isFullNameValid = fullName.trim().length >= 2;
  const doPasswordsMatch = isSignUp ? password === confirmPassword : true;

  const canSubmit = isSignUp
    ? isEmailValid && isPasswordValid && isFullNameValid && doPasswordsMatch && !loading
    : isEmailValid && isPasswordValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Mark fields as touched
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (isSignUp && !isFullNameValid) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp && !doPasswordsMatch) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signupWithEmail(email, password, fullName);
        if (result && result.requiresEmailConfirmation) {
          setSuccessMessage(
            'Account registered successfully! A confirmation link has been sent to your email. Please verify before signing in.'
          );
          setLoading(false);
          return;
        }
      } else {
        await loginWithEmail(email, password);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (clearOAuthError) clearOAuthError();
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (!isSupabaseConnected) {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setErrorMessage('');
    setSuccessMessage('');
    setTouched({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-7 text-slate-100 space-y-4">
        
        {/* Header with Brand Icon and Close */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-xl shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-white tracking-tight">
                {isSignUp ? 'Create Workspace Account' : 'Sign In to ResumeSync'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSignUp
                  ? 'Join to synchronize your ATS resumes and AI edits'
                  : 'Welcome back! Access your versions and analyses'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-slate-800/80 border border-slate-700/60 rounded-xl">
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isSignUp
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isSignUp
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Backend Connectivity Status Alert */}
        {!isSupabaseConnected ? (
          <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-[11px] text-amber-300 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Local Offline Session Active</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed font-sans">
              Supabase cloud credentials are not active in `.env`. Local session storage and offline registration are engaged seamlessly.
            </p>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Supabase Cloud Connected</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono">PostgreSQL RLS</span>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Full Name (Sign Up only) */}
          {isSignUp && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Full Name</label>
                {touched.fullName && !isFullNameValid && (
                  <span className="text-[10px] text-rose-400">Min 2 characters</span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  placeholder="Alex Vance"
                  disabled={loading}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.fullName && !isFullNameValid
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-medium">Email Address</label>
              {touched.email && !isEmailValid && (
                <span className="text-[10px] text-rose-400">Valid email required</span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="alex.vance@example.com"
                disabled={loading}
                className={`w-full pl-9 pr-3 py-2 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all ${
                  touched.email && !isEmailValid
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-medium">Password</label>
              {touched.password && !isPasswordValid && (
                <span className="text-[10px] text-rose-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full pl-9 pr-9 py-2 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all ${
                  touched.password && !isPasswordValid
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Confirm Password</label>
                {touched.confirmPassword && !doPasswordsMatch && (
                  <span className="text-[10px] text-rose-400">Passwords do not match</span>
                )}
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full pl-9 pr-3 py-2 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all ${
                    touched.confirmPassword && !doPasswordsMatch
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isSignUp ? 'Creating Account...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Workspace Account' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Authentication Separator */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || isGoogleLoading || isOAuthLoading}
          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Sign in with your Google account"
        >
          {isGoogleLoading || isOAuthLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Footer: Switch Mode & Guest Quick Action */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{isSignUp ? 'Already registered?' : 'Need an account?'}</span>
          <button
            type="button"
            onClick={() => switchMode(!isSignUp)}
            className="text-brand-400 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In instead' : 'Create an Account'}
          </button>
        </div>

      </div>
    </div>
  );
};
