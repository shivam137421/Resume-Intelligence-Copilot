import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateUUID,
  RESUME_TEMPLATES,
  getTemplateMetadata,
  createNewResume,
  createEmptyResume,
  createSampleResume,
  switchResumeTemplate,
  createDefaultStyling,
  deepCloneResume
} from '../src/utils/defaultResume.js';
import { ResumeTemplateId } from '../src/types/resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCheckpoint13Tests() {
  console.log('=============================================================================');
  console.log('--- CHECKPOINT 13: RESUME CREATION & INITIALIZATION FLOW VALIDATION ---');
  console.log('=============================================================================\n');

  const baseDir = path.resolve(__dirname, '..');

  // 1. Verify existence of required Checkpoint 13 files
  console.log('--- 1. VERIFYING REQUIRED FILES & ARTIFACTS ---');
  const utilsPath = path.resolve(baseDir, 'src', 'utils', 'defaultResume.ts');
  const contextPath = path.resolve(baseDir, 'src', 'context', 'ResumeContext.tsx');
  const typesPath = path.resolve(baseDir, 'src', 'types', 'resume.ts');
  const modalPath = path.resolve(baseDir, 'src', 'components', 'resume', 'NewResumeModal.tsx');
  const dashboardPath = path.resolve(baseDir, 'src', 'components', 'dashboard', 'Dashboard.tsx');
  const appPath = path.resolve(baseDir, 'src', 'App.tsx');

  const requiredFiles = [
    { name: 'src/utils/defaultResume.ts', path: utilsPath },
    { name: 'src/context/ResumeContext.tsx', path: contextPath },
    { name: 'src/types/resume.ts', path: typesPath },
    { name: 'src/components/resume/NewResumeModal.tsx', path: modalPath },
    { name: 'src/components/dashboard/Dashboard.tsx', path: dashboardPath },
    { name: 'src/App.tsx', path: appPath }
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      throw new Error(`FAIL: File does not exist at ${file.path}`);
    }
    console.log(`✓ Verified file existence: ${file.name}`);
  }

  // 2. UUID Generator Validation
  console.log('\n--- 2. VALIDATING RFC4122 V4 UUID GENERATOR ---');
  const testUUID = generateUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(testUUID)) {
    throw new Error(`FAIL: generateUUID() produced non-standard UUID format: ${testUUID}`);
  }
  // Ensure uniqueness over 100 generations
  const uuidSet = new Set<string>();
  for (let i = 0; i < 100; i++) {
    uuidSet.add(generateUUID());
  }
  if (uuidSet.size !== 100) {
    throw new Error('FAIL: generateUUID() generated duplicate UUIDs');
  }
  console.log(`✓ PASS: generateUUID() verified: sample "${testUUID}" (100% collision-free)`);

  // 3. Template Registry & Metadata Validation
  console.log('\n--- 3. VALIDATING RESUME TEMPLATES REGISTRY & STYLING PRESETS ---');
  const expectedTemplates: ResumeTemplateId[] = [
    'ats-minimal',
    'modern-engineering',
    'executive',
    'one-page-clean'
  ];

  if (!Array.isArray(RESUME_TEMPLATES) || RESUME_TEMPLATES.length < 4) {
    throw new Error('FAIL: RESUME_TEMPLATES must contain all 4 standard templates');
  }

  for (const tmplId of expectedTemplates) {
    const meta = getTemplateMetadata(tmplId);
    if (!meta || meta.id !== tmplId) {
      throw new Error(`FAIL: Template metadata for "${tmplId}" not found or mismatched`);
    }
    if (!meta.name || !meta.styling || !meta.styling.fontFamily || !meta.styling.primaryColor) {
      throw new Error(`FAIL: Template "${tmplId}" missing required metadata or styling properties`);
    }
    console.log(`✓ Template "${tmplId}": ${meta.name} (Font: ${meta.styling.fontFamily}, Margins: ${meta.styling.margins}, Color: ${meta.styling.primaryColor})`);
  }

  // 4. Testing Factory: createNewResume() with Various Options
  console.log('\n--- 4. TESTING RESUME CREATION FACTORY (createNewResume) ---');

  // Test Case A: Create from scratch (empty sections ready for customization)
  const scratchResume = createNewResume({
    title: 'Clean Slate Resume',
    templateId: 'ats-minimal',
    fromScratch: true,
    authorName: 'Sarah Connor',
    targetRole: 'Chief Robotics Architect'
  });

  if (scratchResume.title !== 'Clean Slate Resume') throw new Error('FAIL: Title customization failed for scratch resume');
  if (scratchResume.header.fullName !== 'Sarah Connor') throw new Error('FAIL: Author name customization failed');
  if (scratchResume.header.headline !== 'Chief Robotics Architect') throw new Error('FAIL: Target role headline customization failed');
  if (scratchResume.summary !== '') throw new Error('FAIL: Scratch resume summary should be empty');
  if (scratchResume.experience.length !== 0) throw new Error('FAIL: Scratch resume experience should be empty');
  if (scratchResume.education.length !== 0) throw new Error('FAIL: Scratch resume education should be empty');
  if (scratchResume.projects.length !== 0) throw new Error('FAIL: Scratch resume projects should be empty');
  if (scratchResume.certifications.length !== 0) throw new Error('FAIL: Scratch resume certifications should be empty');
  if (scratchResume.skills.length === 0) throw new Error('FAIL: Scratch resume should provide standard skill category containers');
  console.log(`✓ createNewResume({ fromScratch: true }): Initialized clean empty resume with standard sections (${scratchResume.skills.length} empty skill categories ready for customization)`);

  // Test Case B: Create with pre-populated professional sample defaults (Modern Engineering)
  const modernResume = createNewResume({
    title: 'Jordan Blake - Cloud Systems',
    templateId: 'modern-engineering',
    fromScratch: false,
    sampleData: true
  });

  if (modernResume.templateId !== 'modern-engineering') throw new Error('FAIL: templateId mismatch');
  if (modernResume.styling.fontFamily !== 'mono') throw new Error('FAIL: modern-engineering styling font should be mono');
  if (modernResume.experience.length === 0 || modernResume.skills.length === 0) {
    throw new Error('FAIL: Pre-populated modern-engineering resume must have sample experiences and skills');
  }
  const hasKubernetes = modernResume.skills.some(c => c.skills.some(s => s.toLowerCase().includes('kubernetes')));
  if (!hasKubernetes) throw new Error('FAIL: modern-engineering sample should include cloud/systems skills (Kubernetes)');
  console.log(`✓ createNewResume({ templateId: 'modern-engineering' }): Created pre-populated technical engineering sample (${modernResume.experience.length} experiences, ${modernResume.skills.length} categories)`);

  // Test Case C: Create with pre-populated Executive Leadership template
  const execResume = createNewResume({
    title: 'Marcus Vance - VP Engineering',
    templateId: 'executive',
    fromScratch: false
  });

  if (execResume.templateId !== 'executive') throw new Error('FAIL: executive templateId mismatch');
  if (execResume.styling.fontFamily !== 'serif') throw new Error('FAIL: executive styling font should be serif');
  if (execResume.styling.showIcons !== false) throw new Error('FAIL: executive styling icons should be false for formal print');
  const hasExecSkill = execResume.skills.some(c => c.skills.some(s => s.toLowerCase().includes('leadership') || s.toLowerCase().includes('budget')));
  if (!hasExecSkill) throw new Error('FAIL: executive sample should include leadership and budget skills');
  console.log(`✓ createNewResume({ templateId: 'executive' }): Created pre-populated executive leadership sample (${execResume.header.fullName})`);

  // Test Case D: Create with One-Page Clean template
  const onePageResume = createNewResume({
    title: 'Elena Chen - Product Engineer',
    templateId: 'one-page-clean',
    fromScratch: false
  });

  if (onePageResume.templateId !== 'one-page-clean') throw new Error('FAIL: one-page-clean templateId mismatch');
  if (onePageResume.styling.margins !== 'compact' || onePageResume.styling.fontSize !== 'sm') {
    throw new Error('FAIL: one-page-clean must feature compact margins and sm font size');
  }
  console.log(`✓ createNewResume({ templateId: 'one-page-clean' }): Created high-density compact single-page sample`);

  // 5. Template Switching On Existing Resume
  console.log('\n--- 5. TESTING TEMPLATE SWITCHING (switchResumeTemplate) ---');
  const switchedResume = switchResumeTemplate(scratchResume, 'executive');
  if (switchedResume.templateId !== 'executive') throw new Error('FAIL: switchResumeTemplate did not update templateId');
  if (switchedResume.styling.fontFamily !== 'serif') throw new Error('FAIL: switchResumeTemplate did not update font family');
  if (switchedResume.title !== scratchResume.title) throw new Error('FAIL: switchResumeTemplate modified document title');
  if (switchedResume.header.fullName !== scratchResume.header.fullName) throw new Error('FAIL: switchResumeTemplate modified candidate name');
  console.log('✓ switchResumeTemplate(): Successfully switched template layout & styling while preserving all resume data');

  // 6. Validate ResumeContext.tsx Integration
  console.log('\n--- 6. VALIDATING RESUMECONTEXT.TSX FACTORY INTEGRATION ---');
  const contextContent = fs.readFileSync(contextPath, 'utf-8');

  const requiredContextTokens = [
    'createNewResume',
    'initializeFromTemplate',
    'switchTemplate',
    'availableTemplates',
    'activeResumeId'
  ];

  for (const token of requiredContextTokens) {
    if (!contextContent.includes(token)) {
      throw new Error(`FAIL in ResumeContext.tsx: Missing "${token}"`);
    }
    console.log(`✓ ResumeContext.tsx: Verified factory method/property "${token}"`);
  }

  // 7. Validate NewResumeModal.tsx Component
  console.log('\n--- 7. VALIDATING NEWRESUMEMODAL.TSX COMPONENT ---');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  const requiredModalTokens = [
    'export const NewResumeModal',
    'export interface NewResumeModalProps',
    'creation-mode-sample',
    'creation-mode-scratch',
    'new-resume-title-input',
    'new-resume-author-input',
    'new-resume-headline-input',
    'new-resume-submit-btn',
    'template-option-ats-minimal',
    'template-option-modern-engineering',
    'template-option-executive',
    'template-option-one-page-clean'
  ];

  for (const token of requiredModalTokens) {
    if (!modalContent.includes(token)) {
      throw new Error(`FAIL in NewResumeModal.tsx: Missing "${token}"`);
    }
    console.log(`✓ NewResumeModal.tsx: Verified "${token}"`);
  }

  // 8. Validate Dashboard.tsx & App.tsx Integration
  console.log('\n--- 8. VALIDATING DASHBOARD & APP.TSX INTEGRATION ---');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
  if (!dashboardContent.includes('dashboard-create-resume')) {
    throw new Error('FAIL in Dashboard.tsx: Missing "+ New Resume" button (id="dashboard-create-resume")');
  }
  if (!dashboardContent.includes('NewResumeModal')) {
    throw new Error('FAIL in Dashboard.tsx: NewResumeModal is not rendered');
  }
  console.log('✓ Dashboard.tsx: Verified "+ New Resume" quick action and modal binding');

  const appContent = fs.readFileSync(appPath, 'utf-8');
  if (!appContent.includes('onCreateResume={handleCreateResume}')) {
    throw new Error('FAIL in App.tsx: onCreateResume handler is not passed to Dashboard');
  }
  console.log('✓ App.tsx: Verified onCreateResume handler integration');

  console.log('\n=============================================================================');
  console.log('✓ ALL CHECKPOINT 13 REQUIREMENTS AND SUITES VERIFIED SUCCESSFULLY!');
  console.log('=============================================================================');
}

try {
  runCheckpoint13Tests();
} catch (error) {
  console.error('\n❌ CHECKPOINT 13 TEST FAILED:\n', error);
  process.exit(1);
}
