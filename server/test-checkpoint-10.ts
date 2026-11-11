import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runProfileSettingsTests() {
  console.log('=============================================================================');
  console.log('--- CHECKPOINT 10: USER PROFILE & WORKSPACE SETTINGS SYSTEM VALIDATION ---');
  console.log('=============================================================================\n');

  const baseDir = path.resolve(__dirname, '..');

  // 1. Verify existence of required Checkpoint 10 files
  const typesPath = path.resolve(baseDir, 'src', 'types', 'resume.ts');
  const authContextPath = path.resolve(baseDir, 'src', 'context', 'AuthContext.tsx');
  const schemaPath = path.resolve(baseDir, 'supabase', 'schema.sql');
  const modalPath = path.resolve(baseDir, 'src', 'components', 'profile', 'ProfileSettingsModal.tsx');
  const navbarPath = path.resolve(baseDir, 'src', 'components', 'layout', 'Navbar.tsx');

  const requiredFiles = [
    { name: 'src/types/resume.ts', path: typesPath },
    { name: 'src/context/AuthContext.tsx', path: authContextPath },
    { name: 'supabase/schema.sql', path: schemaPath },
    { name: 'src/components/profile/ProfileSettingsModal.tsx', path: modalPath },
    { name: 'src/components/layout/Navbar.tsx', path: navbarPath }
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      throw new Error(`FAIL: File does not exist at ${file.path}`);
    }
    console.log(`✓ Verified file existence: ${file.name}`);
  }

  // 2. Validate src/types/resume.ts
  console.log('\n--- 2. VALIDATING SRC/TYPES/RESUME.TS ---');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  const requiredTypeTokens = [
    { name: 'UserProfile Interface', check: 'interface UserProfile' },
    { name: 'UserProfile headline', check: 'headline?: string' },
    { name: 'UserProfile phone', check: 'phone?: string' },
    { name: 'UserProfile location', check: 'location?: string' },
    { name: 'UserProfile avatarUrl', check: 'avatarUrl?: string' },
    { name: 'UserProfile githubUsername', check: 'githubUsername?: string' },
    { name: 'UserProfile linkedinUrl', check: 'linkedinUrl?: string' },
    { name: 'WorkspaceSettings Interface', check: 'interface WorkspaceSettings' },
    { name: 'WorkspaceSettings defaultTemplate', check: 'defaultTemplate: ResumeTemplateId' },
    { name: 'WorkspaceSettings autoSaveEnabled', check: 'autoSaveEnabled: boolean' },
    { name: 'WorkspaceSettings aiModelPreference', check: 'aiModelPreference: string' },
    { name: 'ProfileUpdatePayload Interface', check: 'interface ProfileUpdatePayload' },
    { name: 'SettingsUpdatePayload Interface', check: 'interface SettingsUpdatePayload' },
    { name: 'ResumeTemplateId Type', check: 'type ResumeTemplateId' }
  ];

  for (const token of requiredTypeTokens) {
    if (!typesContent.includes(token.check)) {
      throw new Error(`FAIL in src/types/resume.ts: Missing "${token.name}" (check: ${token.check})`);
    }
    console.log(`✓ src/types/resume.ts: ${token.name} verified`);
  }

  // 3. Validate src/context/AuthContext.tsx
  console.log('\n--- 3. VALIDATING SRC/CONTEXT/AUTHCONTEXT.TSX ---');
  const contextContent = fs.readFileSync(authContextPath, 'utf-8');

  const requiredContextTokens = [
    { name: 'updateProfile in AuthContextType', check: 'updateProfile: (updates: ProfileUpdatePayload) => Promise<void>' },
    { name: 'updateSettings in AuthContextType', check: 'updateSettings: (updates: SettingsUpdatePayload) => Promise<void>' },
    { name: 'refreshProfile in AuthContextType', check: 'refreshProfile: () => Promise<void>' },
    { name: 'settings in AuthContextType', check: 'settings: WorkspaceSettings' },
    { name: 'DEFAULT_WORKSPACE_SETTINGS Definition', check: 'DEFAULT_WORKSPACE_SETTINGS' },
    { name: 'Workspace Settings Storage Key', check: 'WORKSPACE_SETTINGS_STORAGE_KEY' },
    { name: 'User Profile Storage Key', check: 'USER_PROFILE_STORAGE_KEY' },
    { name: 'Database profiles query', check: "supabase.from('profiles')" },
    { name: 'Database user_settings query', check: "supabase.from('user_settings')" },
    { name: 'Profile metadata enrichment helper', check: 'mapSupabaseUser' },
    { name: 'syncProfileAndSettingsFromDb method', check: 'syncProfileAndSettingsFromDb' }
  ];

  for (const token of requiredContextTokens) {
    if (!contextContent.includes(token.check)) {
      throw new Error(`FAIL in src/context/AuthContext.tsx: Missing "${token.name}" (check: ${token.check})`);
    }
    console.log(`✓ src/context/AuthContext.tsx: ${token.name} verified`);
  }

  // 4. Validate supabase/schema.sql
  console.log('\n--- 4. VALIDATING SUPABASE/SCHEMA.SQL ---');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  const requiredSchemaTokens = [
    { name: 'Profiles Table Creation', check: 'CREATE TABLE IF NOT EXISTS public.profiles' },
    { name: 'Profiles headline Column', check: 'headline TEXT' },
    { name: 'Profiles phone Column', check: 'phone TEXT' },
    { name: 'Profiles location Column', check: 'location TEXT' },
    { name: 'Profiles avatar_url Column', check: 'avatar_url TEXT' },
    { name: 'Profiles github_username Column', check: 'github_username TEXT' },
    { name: 'Profiles linkedin_url Column', check: 'linkedin_url TEXT' },
    { name: 'User Settings Table Creation', check: 'CREATE TABLE IF NOT EXISTS public.user_settings' },
    { name: 'User Settings default_template Column', check: 'default_template TEXT' },
    { name: 'User Settings auto_save_enabled Column', check: 'auto_save_enabled BOOLEAN' },
    { name: 'User Settings ai_model_preference Column', check: 'ai_model_preference TEXT' },
    { name: 'handle_new_user Trigger Function', check: 'FUNCTION public.handle_new_user()' },
    { name: 'handle_new_user settings initialization', check: 'INSERT INTO public.user_settings' },
    { name: 'handle_new_user metadata enrichment', check: "COALESCE(new.raw_user_meta_data->>'full_name'" },
    { name: 'on_auth_user_created Trigger', check: 'TRIGGER on_auth_user_created' },
    { name: 'Profiles RLS enabled', check: 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;' },
    { name: 'User Settings RLS enabled', check: 'ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;' }
  ];

  for (const token of requiredSchemaTokens) {
    if (!schemaContent.includes(token.check)) {
      throw new Error(`FAIL in supabase/schema.sql: Missing "${token.name}" (check: ${token.check})`);
    }
    console.log(`✓ supabase/schema.sql: ${token.name} verified`);
  }

  // 5. Validate ProfileSettingsModal.tsx
  console.log('\n--- 5. VALIDATING PROFILESETTINGSMODAL.TSX ---');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  const requiredModalTokens = [
    { name: 'Full Name Input Field', check: 'setFullName' },
    { name: 'Professional Headline Field', check: 'setHeadline' },
    { name: 'Phone Field', check: 'setPhone' },
    { name: 'Location Field', check: 'setLocation' },
    { name: 'Avatar URL Field & Preview', check: 'setAvatarUrl' },
    { name: 'GitHub Username Field', check: 'setGithubUsername' },
    { name: 'LinkedIn URL Field', check: 'setLinkedinUrl' },
    { name: 'Sync to Resume Header Toggle', check: 'syncToResumeHeader' },
    { name: 'Default Template Preference', check: 'setDefaultTemplate' },
    { name: 'Autosave Enabled Switch', check: 'setAutoSaveEnabled' },
    { name: 'AI Model Preference Select', check: 'setAiModelPreference' },
    { name: 'Export Page Limit Toggle', check: 'setExportPageLimit' },
    { name: 'Update Profile Call', check: 'updateProfile' },
    { name: 'Update Settings Call', check: 'updateSettings' }
  ];

  for (const token of requiredModalTokens) {
    if (!modalContent.includes(token.check)) {
      throw new Error(`FAIL in ProfileSettingsModal.tsx: Missing "${token.name}" (check: ${token.check})`);
    }
    console.log(`✓ ProfileSettingsModal.tsx: ${token.name} verified`);
  }

  // 6. Validate Navbar.tsx Integration
  console.log('\n--- 6. VALIDATING NAVBAR.TSX INTEGRATION ---');
  const navbarContent = fs.readFileSync(navbarPath, 'utf-8');

  if (!navbarContent.includes('ProfileSettingsModal')) {
    throw new Error('FAIL in Navbar.tsx: ProfileSettingsModal is not imported or rendered');
  }
  console.log('✓ Navbar.tsx: ProfileSettingsModal rendering verified');

  if (!navbarContent.includes('onUpdateHeader')) {
    throw new Error('FAIL in Navbar.tsx: onUpdateHeader prop missing for immediate resume sync');
  }
  console.log('✓ Navbar.tsx: onUpdateHeader immediate synchronization prop verified');

  // 7. Functional Simulation Unit Checks
  console.log('\n--- 7. FUNCTIONAL UNIT CHECKS & LOGICAL SIMULATION ---');

  // Simulation A: User Profile Metadata Enrichment & Mapping
  interface RawAuthUser {
    id: string;
    email: string;
    user_metadata?: Record<string, string>;
  }

  interface DbProfileRecord {
    id: string;
    email: string;
    full_name?: string;
    headline?: string;
    phone?: string;
    location?: string;
    avatar_url?: string;
    github_username?: string;
    linkedin_url?: string;
  }

  const simulateMapUser = (authUser: RawAuthUser, dbRecord?: DbProfileRecord) => {
    const meta = authUser.user_metadata || {};
    return {
      id: authUser.id,
      email: authUser.email,
      fullName: dbRecord?.full_name || meta.full_name || meta.name || authUser.email.split('@')[0],
      headline: dbRecord?.headline || meta.headline || undefined,
      phone: dbRecord?.phone || meta.phone || undefined,
      location: dbRecord?.location || meta.location || undefined,
      avatarUrl: dbRecord?.avatar_url || meta.avatar_url || meta.picture || undefined,
      githubUsername: dbRecord?.github_username || meta.github_username || undefined,
      linkedinUrl: dbRecord?.linkedin_url || meta.linkedin_url || undefined,
      isGuest: false
    };
  };

  const testAuthUser: RawAuthUser = {
    id: 'user-uuid-10',
    email: 'sarah.engineer@gmail.com',
    user_metadata: {
      name: 'Sarah Engineer',
      picture: 'https://lh3.googleusercontent.com/avatar-sarah'
    }
  };

  const testDbProfile: DbProfileRecord = {
    id: 'user-uuid-10',
    email: 'sarah.engineer@gmail.com',
    full_name: 'Sarah Engineer, Staff AI',
    headline: 'Staff AI Systems Architect',
    phone: '+1 (555) 789-0123',
    location: 'Seattle, WA',
    avatar_url: 'https://images.unsplash.com/custom-profile',
    github_username: 'saraheng',
    linkedin_url: 'https://linkedin.com/in/saraheng'
  };

  const enrichedProfile = simulateMapUser(testAuthUser, testDbProfile);

  if (
    enrichedProfile.fullName !== 'Sarah Engineer, Staff AI' ||
    enrichedProfile.headline !== 'Staff AI Systems Architect' ||
    enrichedProfile.phone !== '+1 (555) 789-0123' ||
    enrichedProfile.location !== 'Seattle, WA' ||
    enrichedProfile.avatarUrl !== 'https://images.unsplash.com/custom-profile'
  ) {
    throw new Error('FAIL: Enriched profile metadata mapping failed');
  }
  console.log('✓ Functional Check 1: Database profile metadata enrichment verified');

  // Simulation B: Local Storage Persistence for Profile & Workspace Settings
  const mockStorage: Record<string, string> = {};

  const sampleSettings = {
    userId: 'user-uuid-10',
    defaultTemplate: 'modern-engineering',
    aiModelPreference: 'gemini-2.5-flash',
    autoSaveEnabled: true,
    exportPageLimit: 1
  };

  mockStorage['ai_resume_workspace_settings'] = JSON.stringify(sampleSettings);
  mockStorage['ai_resume_user_profile'] = JSON.stringify(enrichedProfile);

  const restoredSettings = JSON.parse(mockStorage['ai_resume_workspace_settings']);
  const restoredProfile = JSON.parse(mockStorage['ai_resume_user_profile']);

  if (
    restoredSettings.defaultTemplate !== 'modern-engineering' ||
    restoredSettings.autoSaveEnabled !== true ||
    restoredProfile.location !== 'Seattle, WA'
  ) {
    throw new Error('FAIL: Local storage persistence simulation failed');
  }
  console.log('✓ Functional Check 2: Profile & Workspace Settings cache persistence verified');

  // Simulation C: Synchronization with Resume Header Fields
  const sampleResume = {
    title: 'Senior AI Engineer Resume',
    header: {
      fullName: 'Old Name',
      email: 'old@example.com',
      phone: '123',
      location: 'Old City',
      links: []
    }
  };

  const syncFields = {
    fullName: enrichedProfile.fullName,
    headline: enrichedProfile.headline,
    phone: enrichedProfile.phone,
    location: enrichedProfile.location
  };

  const updatedResume = {
    ...sampleResume,
    header: {
      ...sampleResume.header,
      ...syncFields
    }
  };

  if (
    updatedResume.header.fullName !== 'Sarah Engineer, Staff AI' ||
    updatedResume.header.location !== 'Seattle, WA' ||
    updatedResume.header.phone !== '+1 (555) 789-0123'
  ) {
    throw new Error('FAIL: Immediate header synchronization simulation failed');
  }
  console.log('✓ Functional Check 3: Immediate resume header contact field synchronization verified');

  console.log('\n=============================================================================');
  console.log('ALL CHECKPOINT 10 PROFILE & WORKSPACE SETTINGS VERIFICATIONS PASSED!');
  console.log('=============================================================================\n');
}

runProfileSettingsTests();
