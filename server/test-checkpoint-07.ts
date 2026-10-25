import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runSchemaTests() {
  console.log('--- CHECKPOINT 07 AUTOMATED VALIDATION TEST ---');
  const schemaPath = path.resolve(__dirname, '..', 'supabase', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`FAIL: supabase/schema.sql does not exist at ${schemaPath}`);
  }
  console.log('✓ Found supabase/schema.sql');

  const content = fs.readFileSync(schemaPath, 'utf-8');

  // 1. Verify UUID extension
  if (!content.includes('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')) {
    throw new Error('FAIL: Missing uuid-ossp extension declaration');
  }
  console.log('✓ UUID extension verified');

  // 2. Verify all 7 required tables
  const expectedTables = [
    'profiles',
    'resumes',
    'resume_versions',
    'content_library',
    'jd_analyses',
    'job_applications',
    'user_settings'
  ];

  for (const table of expectedTables) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\s*\\(`, 'i');
    if (!tableRegex.test(content)) {
      throw new Error(`FAIL: Missing table definition for public.${table}`);
    }
    console.log(`✓ Table public.${table} verified`);
  }

  // 3. Verify Row Level Security (RLS) is enabled on all 7 tables
  for (const table of expectedTables) {
    const rlsRegex = new RegExp(`ALTER TABLE public\\.${table}\\s+ENABLE ROW LEVEL SECURITY;`, 'i');
    if (!rlsRegex.test(content)) {
      throw new Error(`FAIL: Missing ENABLE ROW LEVEL SECURITY for public.${table}`);
    }
    console.log(`✓ RLS enabled for public.${table}`);
  }

  // 4. Verify RLS policies with auth.uid()
  const expectedPolicies = [
    { table: 'profiles', policyName: 'Users can view own profile', check: 'auth.uid() = id' },
    { table: 'profiles', policyName: 'Users can update own profile', check: 'auth.uid() = id' },
    { table: 'resumes', policyName: 'Users can manage own resumes', check: 'auth.uid() = user_id' },
    { table: 'resume_versions', policyName: 'Users can manage own resume versions', check: 'auth.uid() = user_id' },
    { table: 'content_library', policyName: 'Users can manage own content library', check: 'auth.uid() = user_id' },
    { table: 'jd_analyses', policyName: 'Users can manage own JD analyses', check: 'auth.uid() = user_id' },
    { table: 'job_applications', policyName: 'Users can manage own job history', check: 'auth.uid() = user_id' },
    { table: 'user_settings', policyName: 'Users can manage own settings', check: 'auth.uid() = user_id' }
  ];

  for (const policy of expectedPolicies) {
    if (!content.includes(policy.policyName) || !content.includes(policy.check)) {
      throw new Error(`FAIL: Missing policy "${policy.policyName}" or auth check "${policy.check}"`);
    }
    console.log(`✓ Policy "${policy.policyName}" verified`);
  }

  // 5. Verify trigger handle_new_user
  if (!content.includes('FUNCTION public.handle_new_user()') || !content.includes('TRIGGER on_auth_user_created')) {
    throw new Error('FAIL: Missing handle_new_user function or on_auth_user_created trigger');
  }
  console.log('✓ Auth signup trigger handle_new_user verified');

  // 6. Verify GIN indexing on JSONB columns
  const expectedIndexes = [
    'idx_resumes_header',
    'idx_resumes_skills',
    'idx_resumes_experience',
    'idx_content_library_data',
    'idx_content_library_tags',
    'idx_jd_analyses_extracted'
  ];

  for (const idx of expectedIndexes) {
    if (!content.includes(idx)) {
      throw new Error(`FAIL: Missing index ${idx}`);
    }
    console.log(`✓ GIN Index ${idx} verified`);
  }

  console.log('\n=========================================');
  console.log('ALL CHECKPOINT 07 VERIFICATIONS PASSED!');
  console.log('=========================================\n');
}

runSchemaTests();
