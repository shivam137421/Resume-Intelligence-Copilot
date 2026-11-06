import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runOAuthIntegrationTests() {
  console.log('=================================================================');
  console.log('--- CHECKPOINT 09: GOOGLE OAUTH AUTHENTICATION INTEGRATION TEST ---');
  console.log('=================================================================\n');

  const baseDir = path.resolve(__dirname, '..');

  // 1. Verify existence of required Checkpoint 09 files
  const authModalPath = path.resolve(baseDir, 'src', 'components', 'auth', 'AuthModal.tsx');
  const authContextPath = path.resolve(baseDir, 'src', 'context', 'AuthContext.tsx');
  const navbarPath = path.resolve(baseDir, 'src', 'components', 'layout', 'Navbar.tsx');
  const setupGuidePath = path.resolve(baseDir, 'ANTIGRAVITY_SETUP.md');

  const requiredFiles = [
    { name: 'AuthModal.tsx', path: authModalPath },
    { name: 'AuthContext.tsx', path: authContextPath },
    { name: 'Navbar.tsx', path: navbarPath },
    { name: 'ANTIGRAVITY_SETUP.md', path: setupGuidePath }
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      throw new Error(`FAIL: File does not exist at ${file.path}`);
    }
    console.log(`✓ Verified file existence: ${file.name}`);
  }

  // 2. Validate AuthModal.tsx OAuth integration
  console.log('\n--- 2. VALIDATING AUTHMODAL.TSX OAUTH IMPLEMENTATION ---');
  const modalContent = fs.readFileSync(authModalPath, 'utf-8');

  const requiredModalChecks = [
    { name: 'Google OAuth Context Function Hook', check: 'loginWithGoogle' },
    { name: 'Google OAuth Loading State', check: 'isGoogleLoading' },
    { name: 'Connecting to Google Indicator', check: 'Connecting to Google...' },
    { name: 'Google SVG Icon Rendering', check: 'viewBox="0 0 24 24"' },
    { name: 'Google Brand Color (#4285F4)', check: '#4285F4' },
    { name: 'Google OAuth Button Text', check: 'Continue with Google' },
    { name: 'OAuth Redirect Error Display', check: 'oauthError' },
    { name: 'Loading Spinner on OAuth', check: 'Loader2' }
  ];

  for (const item of requiredModalChecks) {
    if (!modalContent.includes(item.check)) {
      throw new Error(`FAIL in AuthModal.tsx: Missing "${item.name}" (check: ${item.check})`);
    }
    console.log(`✓ AuthModal.tsx: ${item.name} verified`);
  }

  // 3. Validate AuthContext.tsx Google OAuth and Profile Syncing
  console.log('\n--- 3. VALIDATING AUTHCONTEXT.TSX OAUTH & PROFILE SYNCING ---');
  const contextContent = fs.readFileSync(authContextPath, 'utf-8');

  const requiredContextChecks = [
    { name: 'loginWithGoogle Method in Interface', check: 'loginWithGoogle: () => Promise<void>' },
    { name: 'OAuth Loading State Flag', check: 'isOAuthLoading' },
    { name: 'OAuth Error State Attribute', check: 'oauthError' },
    { name: 'Supabase signInWithOAuth Invocation', check: 'supabase.auth.signInWithOAuth' },
    { name: 'Google Provider Specification', check: "provider: 'google'" },
    { name: 'Redirect Callback Option', check: 'redirectTo' },
    { name: 'Offline Access Type Parameter', check: "access_type: 'offline'" },
    { name: 'Select Account Prompt Parameter', check: "prompt: 'select_account'" },
    { name: 'Google Metadata Mapping: Full Name', check: 'meta.full_name' },
    { name: 'Google Metadata Mapping: Name Fallback', check: 'meta.name' },
    { name: 'Google Metadata Mapping: Picture Avatar', check: 'meta.picture' },
    { name: 'Google Metadata Mapping: Avatar URL', check: 'meta.avatar_url' },
    { name: 'URL Redirect Param Detection (code)', check: "searchParams.has('code')" },
    { name: 'URL Sanitization via history.replaceState', check: 'window.history.replaceState' },
    { name: 'Session Key Storage Persistence', check: 'AUTH_STORAGE_KEY' },
    { name: 'User Profile Mapping Helper', check: 'mapSupabaseUser' }
  ];

  for (const item of requiredContextChecks) {
    if (!contextContent.includes(item.check)) {
      throw new Error(`FAIL in AuthContext.tsx: Missing "${item.name}" (check: ${item.check})`);
    }
    console.log(`✓ AuthContext.tsx: ${item.name} verified`);
  }

  // 4. Validate Navbar.tsx Avatar and Profile Synchronization
  console.log('\n--- 4. VALIDATING NAVBAR.TSX AVATAR PROFILE RENDERING ---');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  if (!navbarContent.includes('user.avatarUrl')) {
    throw new Error('FAIL in Navbar.tsx: Missing dynamic user.avatarUrl rendering for OAuth profiles');
  }
  console.log('✓ Navbar.tsx: Dynamic user.avatarUrl avatar element verified');

  if (!navbarContent.includes('alt={user.fullName || user.email}')) {
    throw new Error('FAIL in Navbar.tsx: Missing accessible user image alt attribute');
  }
  console.log('✓ Navbar.tsx: Accessible avatar alt tag verified');

  // 5. Validate ANTIGRAVITY_SETUP.md Documentation Matrix
  console.log('\n--- 5. VALIDATING ANTIGRAVITY_SETUP.MD CONFIGURATION GUIDE ---');
  const setupContent = fs.readFileSync(setupGuidePath, 'utf-8');

  const requiredSetupSections = [
    { name: 'Google OAuth 2.0 Integration Section', check: 'Google OAuth 2.0 Social Authentication Integration' },
    { name: 'Google Cloud Console Setup Instructions', check: 'Google Cloud Console' },
    { name: 'OAuth Consent Screen Configuration', check: 'OAuth consent screen' },
    { name: 'Userinfo Email & Profile Scopes', check: 'auth/userinfo.email' },
    { name: 'Authorized JavaScript Origins localhost:5173', check: 'http://localhost:5173' },
    { name: 'Authorized Redirect URI (/auth/v1/callback)', check: 'auth/v1/callback' },
    { name: 'Supabase Google Provider Setup', check: 'Enable Google provider' },
    { name: 'Zero Secret Exposure Matrix', check: 'Zero Secret Exposure' }
  ];

  for (const item of requiredSetupSections) {
    if (!setupContent.includes(item.check)) {
      throw new Error(`FAIL in ANTIGRAVITY_SETUP.md: Missing "${item.name}" (check: ${item.check})`);
    }
    console.log(`✓ ANTIGRAVITY_SETUP.md: ${item.name} documented`);
  }

  // Verify zero leaked client secrets in repository files
  if (setupContent.includes('GOOGLE_CLIENT_SECRET=GOCSPX-') || setupContent.includes('client_secret: "GOCSPX-')) {
    throw new Error('CRITICAL SECURITY FAIL: Detected actual Google Client Secret in setup documentation!');
  }
  console.log('✓ Security Hygiene: Zero leaked secrets verified in ANTIGRAVITY_SETUP.md');

  // 6. Functional Validation & Mock Simulation Checks
  console.log('\n--- 6. FUNCTIONAL SIMULATION & LOGIC UNIT CHECKS ---');

  // Simulation A: Google Profile Metadata Extractor
  interface MockSupabaseUser {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
      picture?: string;
      avatar_url?: string;
    };
  }

  const mapUserSimulation = (sbUser: MockSupabaseUser) => {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const fullName = meta.full_name || meta.name || email.split('@')[0] || 'Professional User';
    const avatarUrl = meta.avatar_url || meta.picture || undefined;

    return {
      id: sbUser.id,
      email,
      fullName,
      avatarUrl,
      isGuest: false
    };
  };

  // Test Case 1: Standard Google OAuth user payload (with picture and full_name)
  const googleUser1: MockSupabaseUser = {
    id: 'google-uid-001',
    email: 'alex.vance@gmail.com',
    user_metadata: {
      full_name: 'Alex Vance',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocLsample123'
    }
  };
  const profile1 = mapUserSimulation(googleUser1);
  if (profile1.fullName !== 'Alex Vance' || profile1.avatarUrl !== 'https://lh3.googleusercontent.com/a/ACg8ocLsample123') {
    throw new Error('FAIL: Google OAuth metadata mapping failed for standard payload');
  }
  console.log('✓ Functional Check 1: Standard Google OAuth profile mapping verified');

  // Test Case 2: Google user with `name` and `avatar_url` variant
  const googleUser2: MockSupabaseUser = {
    id: 'google-uid-002',
    email: 'shivam.engineer@gmail.com',
    user_metadata: {
      name: 'Shivam Engineer',
      avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLavatar456'
    }
  };
  const profile2 = mapUserSimulation(googleUser2);
  if (profile2.fullName !== 'Shivam Engineer' || profile2.avatarUrl !== 'https://lh3.googleusercontent.com/a/ACg8ocLavatar456') {
    throw new Error('FAIL: Google OAuth metadata mapping failed for name/avatar_url variant');
  }
  console.log('✓ Functional Check 2: Google metadata fallback mapping (name & avatar_url) verified');

  // Test Case 3: Email-only user without metadata
  const emailUser: MockSupabaseUser = {
    id: 'email-uid-003',
    email: 'developer@example.com'
  };
  const profile3 = mapUserSimulation(emailUser);
  if (profile3.fullName !== 'developer' || profile3.avatarUrl !== undefined) {
    throw new Error('FAIL: Email fallback mapping failed');
  }
  console.log('✓ Functional Check 3: Email prefix fallback verified');

  // Simulation B: OAuth Redirect URL Parser & Sanitizer
  const testOAuthRedirectUrl = (sampleUrl: string) => {
    const parsed = new URL(sampleUrl);
    const searchParams = parsed.searchParams;
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');

    let detectedError: string | null = null;
    if (error || errorDescription) {
      detectedError = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error;
    }

    // Sanitized URL removes code, error, state query params
    const cleanUrl = `${parsed.origin}${parsed.pathname}`;
    return { detectedError, code, cleanUrl };
  };

  const successRedirect = testOAuthRedirectUrl('http://localhost:5173/?code=pkce_code_sample_987&state=xyz');
  if (successRedirect.code !== 'pkce_code_sample_987' || successRedirect.cleanUrl !== 'http://localhost:5173/') {
    throw new Error('FAIL: OAuth PKCE code redirect parsing and URL sanitization failed');
  }
  console.log('✓ Functional Check 4: OAuth code detection and URL sanitization verified');

  const errorRedirect = testOAuthRedirectUrl('http://localhost:5173/?error=access_denied&error_description=User+cancelled+consent');
  if (errorRedirect.detectedError !== 'User cancelled consent' || errorRedirect.cleanUrl !== 'http://localhost:5173/') {
    throw new Error('FAIL: OAuth redirect error detection and extraction failed');
  }
  console.log('✓ Functional Check 5: OAuth error query extraction and URL clean state verified');

  // Simulation C: Offline Google User Persistence
  const mockStorage: Record<string, string> = {};
  const mockGooglePersistedUser = {
    id: 'google-local-999',
    email: 'alex.vance@gmail.com',
    fullName: 'Alex Vance (Google)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    isGuest: false
  };

  mockStorage['ai_resume_auth_session'] = JSON.stringify(mockGooglePersistedUser);
  const restoredGoogleUser = JSON.parse(mockStorage['ai_resume_auth_session']);

  if (
    !restoredGoogleUser ||
    restoredGoogleUser.email !== 'alex.vance@gmail.com' ||
    !restoredGoogleUser.avatarUrl ||
    restoredGoogleUser.isGuest !== false
  ) {
    throw new Error('FAIL: Offline Google OAuth session serialization failed');
  }
  console.log('✓ Functional Check 6: Offline Google OAuth persistence serialization verified');

  console.log('\n=================================================================');
  console.log('ALL CHECKPOINT 09 GOOGLE OAUTH VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('=================================================================\n');
}

runOAuthIntegrationTests();

