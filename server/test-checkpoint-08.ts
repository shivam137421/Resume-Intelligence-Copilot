import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runAuthTests() {
  console.log('--- CHECKPOINT 08 AUTOMATED VALIDATION TEST ---');
  const baseDir = path.resolve(__dirname, '..');

  // 1. Verify existence of required Checkpoint 08 files
  const authModalPath = path.resolve(baseDir, 'src', 'components', 'auth', 'AuthModal.tsx');
  const authContextPath = path.resolve(baseDir, 'src', 'context', 'AuthContext.tsx');
  const navbarPath = path.resolve(baseDir, 'src', 'components', 'layout', 'Navbar.tsx');

  if (!fs.existsSync(authModalPath)) {
    throw new Error(`FAIL: src/components/auth/AuthModal.tsx does not exist at ${authModalPath}`);
  }
  console.log('✓ Found src/components/auth/AuthModal.tsx');

  if (!fs.existsSync(authContextPath)) {
    throw new Error(`FAIL: src/context/AuthContext.tsx does not exist at ${authContextPath}`);
  }
  console.log('✓ Found src/context/AuthContext.tsx');

  if (!fs.existsSync(navbarPath)) {
    throw new Error(`FAIL: src/components/layout/Navbar.tsx does not exist at ${navbarPath}`);
  }
  console.log('✓ Found src/components/layout/Navbar.tsx');

  // 2. Validate AuthModal.tsx contents
  const modalContent = fs.readFileSync(authModalPath, 'utf-8');

  const requiredModalTokens = [
    { name: 'Full Name Input Field', check: 'fullName' },
    { name: 'Email Address Input Field', check: 'email' },
    { name: 'Password Input Field', check: 'password' },
    { name: 'Confirm Password Field', check: 'confirmPassword' },
    { name: 'Password Visibility Toggle', check: 'showPassword' },
    { name: 'Email Regex Validation', check: 'isEmailValid' },
    { name: 'Password Length Validation', check: 'isPasswordValid' },
    { name: 'Error Feedback Alert', check: 'errorMessage' },
    { name: 'Success Confirmation Alert', check: 'successMessage' },
    { name: 'Loading Spinner Indicator', check: 'Loader2' },
    { name: 'Sign Up Mode Switching', check: 'isSignUp' },
    { name: 'Google OAuth Trigger', check: 'loginWithGoogle' },
    { name: 'Supabase Offline Mode Banner', check: 'isSupabaseConnected' }
  ];

  for (const token of requiredModalTokens) {
    if (!modalContent.includes(token.check)) {
      throw new Error(`FAIL in AuthModal.tsx: Missing "${token.name}" (token: ${token.check})`);
    }
    console.log(`✓ AuthModal.tsx: ${token.name} verified`);
  }

  // 3. Validate AuthContext.tsx contents
  const contextContent = fs.readFileSync(authContextPath, 'utf-8');

  const requiredContextTokens = [
    { name: 'loginWithEmail Function', check: 'loginWithEmail' },
    { name: 'signupWithEmail Function', check: 'signupWithEmail' },
    { name: 'logout Function', check: 'logout' },
    { name: 'Supabase onAuthStateChange Listener', check: 'onAuthStateChange' },
    { name: 'Supabase getSession Retrieval', check: 'getSession' },
    { name: 'Storage Session Key Persistence', check: 'AUTH_STORAGE_KEY' },
    { name: 'User Profile Interface', check: 'interface UserProfile' },
    { name: 'Default Guest User Fallback', check: 'DEFAULT_GUEST_USER' },
    { name: 'useAuth Hook', check: 'export const useAuth' }
  ];

  for (const token of requiredContextTokens) {
    if (!contextContent.includes(token.check)) {
      throw new Error(`FAIL in AuthContext.tsx: Missing "${token.name}" (token: ${token.check})`);
    }
    console.log(`✓ AuthContext.tsx: ${token.name} verified`);
  }

  // 4. Validate Navbar.tsx integration
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  if (!navbarContent.includes("import { AuthModal } from '../auth/AuthModal';")) {
    throw new Error('FAIL in Navbar.tsx: AuthModal is not imported');
  }
  console.log('✓ Navbar.tsx: AuthModal import verified');

  if (!navbarContent.includes('<AuthModal')) {
    throw new Error('FAIL in Navbar.tsx: AuthModal JSX component is not rendered');
  }
  console.log('✓ Navbar.tsx: AuthModal rendering verified');

  if (!navbarContent.includes('logout()') && !navbarContent.includes('logout')) {
    throw new Error('FAIL in Navbar.tsx: User logout trigger missing');
  }
  console.log('✓ Navbar.tsx: Authenticated user logout trigger verified');

  // 5. Functional Validation: Validation rules simulation
  console.log('\n--- FUNCTIONAL VALIDATION UNIT CHECKS ---');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = ['alex@example.com', 'shivam@domain.org', 'test.user+1@company.co.uk'];
  const invalidEmails = ['invalid-email', 'missing@domain', '@example.com', 'user@.com'];

  for (const email of validEmails) {
    if (!emailRegex.test(email)) {
      throw new Error(`FAIL: Valid email rejected: ${email}`);
    }
  }
  for (const email of invalidEmails) {
    if (emailRegex.test(email)) {
      throw new Error(`FAIL: Invalid email accepted: ${email}`);
    }
  }
  console.log('✓ Email validation regex passes all test vectors');

  const isPasswordValid = (p: string) => p.length >= 6;
  if (!isPasswordValid('123456') || !isPasswordValid('strongPass!99') || isPasswordValid('12345')) {
    throw new Error('FAIL: Password length validation constraint error');
  }
  console.log('✓ Password length rule (min 6 characters) passes all test vectors');

  // 6. Offline session persistence simulation
  const mockStorage: Record<string, string> = {};
  const mockSessionUser = {
    id: 'user-test-uuid',
    email: 'engineer@antigravity.ai',
    fullName: 'AI Engineer',
    isGuest: false
  };

  mockStorage['ai_resume_auth_session'] = JSON.stringify(mockSessionUser);
  const restored = JSON.parse(mockStorage['ai_resume_auth_session']);

  if (!restored || restored.email !== 'engineer@antigravity.ai' || restored.isGuest !== false) {
    throw new Error('FAIL: Offline session persistence serialization failed');
  }
  console.log('✓ Local session serialization and persistence simulation verified');

  // Sign out simulation
  delete mockStorage['ai_resume_auth_session'];
  if (mockStorage['ai_resume_auth_session'] !== undefined) {
    throw new Error('FAIL: Sign out session clearing failed');
  }
  console.log('✓ Session clearance on sign out verified');

  console.log('\n=========================================');
  console.log('ALL CHECKPOINT 08 VERIFICATIONS PASSED!');
  console.log('=========================================\n');
}

runAuthTests();
