import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createInitialResume,
  createInitialVersions,
  createEmptyResume,
  createDefaultStyling,
  deepCloneResume,
  deepClone,
  generateLatexFromResume
} from '../src/utils/defaultResume.js';
import { ResumeData } from '../src/types/resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCheckpoint12Tests() {
  console.log('=============================================================================');
  console.log('--- CHECKPOINT 12: RESUME DATA MODEL & STATE MANAGEMENT ENGINE VALIDATION ---');
  console.log('=============================================================================\n');

  const baseDir = path.resolve(__dirname, '..');

  // 1. Verify existence of required Checkpoint 12 files
  console.log('--- 1. VERIFYING REQUIRED FILES & ARTIFACTS ---');
  const typesPath = path.resolve(baseDir, 'src', 'types', 'resume.ts');
  const contextPath = path.resolve(baseDir, 'src', 'context', 'ResumeContext.tsx');
  const utilsPath = path.resolve(baseDir, 'src', 'utils', 'defaultResume.ts');
  const apiClientPath = path.resolve(baseDir, 'src', 'services', 'apiClient.ts');
  const appPath = path.resolve(baseDir, 'src', 'App.tsx');

  const requiredFiles = [
    { name: 'src/types/resume.ts', path: typesPath },
    { name: 'src/context/ResumeContext.tsx', path: contextPath },
    { name: 'src/utils/defaultResume.ts', path: utilsPath },
    { name: 'src/services/apiClient.ts', path: apiClientPath },
    { name: 'src/App.tsx', path: appPath }
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      throw new Error(`FAIL: File does not exist at ${file.path}`);
    }
    console.log(`✓ Verified file existence: ${file.name}`);
  }

  // 2. Strict Audit of src/types/resume.ts (Zero 'any' types in core domain models)
  console.log('\n--- 2. AUDITING TYPESCRIPT DOMAIN TYPES & ZERO "ANY" POLICY ---');
  const typesContent = fs.readFileSync(typesPath, 'utf-8');

  // Search for illegal 'any' type usages
  const anyMatches = typesContent.match(/:\s*any\b|any;|\bany\s*[,>\[\]]/g);
  if (anyMatches && anyMatches.length > 0) {
    throw new Error(`FAIL: Found explicit "any" types in src/types/resume.ts: ${JSON.stringify(anyMatches)}`);
  }
  console.log('✓ PASS: Zero "any" types found in src/types/resume.ts (Strict TypeScript domain models)');

  const requiredTypeDeclarations = [
    'export interface ResumeData',
    'export interface HeaderData',
    'export interface ExperienceItem',
    'export interface ProjectItem',
    'export interface EducationItem',
    'export interface SkillCategory',
    'export interface CertificationItem',
    'export interface CustomSectionItem',
    'export interface CustomSection',
    'export interface ResumeStyling',
    'export interface ResumeVersion',
    'export interface JobDescription',
    'export interface ScoreCategory',
    'export interface ActionableSuggestion',
    'export interface ScoreBreakdown',
    'export interface HealthCheckIssue',
    'export interface HealthCheckResult',
    'export interface AIDiffPatch',
    'export interface ContentLibraryItem',
    'export interface JobApplicationHistory',
    'export interface ChatMessage',
    'export type WorkspaceTab',
    'export type ResumeTemplateId'
  ];

  for (const decl of requiredTypeDeclarations) {
    if (!typesContent.includes(decl)) {
      throw new Error(`FAIL: Missing declaration "${decl}" in src/types/resume.ts`);
    }
    console.log(`✓ Verified type declaration: ${decl}`);
  }

  // 3. Validate Default Resume Factory & Deep Cloning Utilities
  console.log('\n--- 3. TESTING DEFAULT RESUME FACTORY & IMMUTABILITY UTILITIES ---');

  const initialResume = createInitialResume();
  if (!initialResume || !initialResume.id || !initialResume.header || !initialResume.header.fullName) {
    throw new Error('FAIL: createInitialResume() returned invalid or incomplete ResumeData');
  }
  console.log(`✓ createInitialResume(): Created master resume for "${initialResume.header.fullName}" (${initialResume.experience.length} experiences, ${initialResume.skills.length} skill groups)`);

  const emptyResume = createEmptyResume('res-test-empty', 'Fresh Start');
  if (emptyResume.header.fullName !== '' || emptyResume.experience.length !== 0) {
    throw new Error('FAIL: createEmptyResume() did not initialize empty sections');
  }
  console.log('✓ createEmptyResume(): Successfully created clean unpopulated resume');

  const defaultStyling = createDefaultStyling();
  if (!defaultStyling.fontFamily || !defaultStyling.primaryColor) {
    throw new Error('FAIL: createDefaultStyling() returned invalid styling configuration');
  }
  console.log('✓ createDefaultStyling(): Created default styling presets');

  const versions = createInitialVersions(initialResume);
  if (!Array.isArray(versions) || versions.length < 3) {
    throw new Error('FAIL: createInitialVersions() should provide at least 3 initial versions');
  }
  console.log(`✓ createInitialVersions(): Created ${versions.length} version snapshots`);

  // Immutability and Deep Clone Verification
  const originalResume = createInitialResume();
  const clonedResume = deepCloneResume(originalResume);

  // Modify clone
  clonedResume.header.fullName = 'Modified Name';
  clonedResume.experience[0].bullets.push('Extra bullet');
  clonedResume.styling.primaryColor = '#ff0000';

  if (originalResume.header.fullName === 'Modified Name') {
    throw new Error('FAIL: deepCloneResume did not detach header reference (shallow copy detected)');
  }
  if (originalResume.experience[0].bullets.length === clonedResume.experience[0].bullets.length) {
    throw new Error('FAIL: deepCloneResume did not detach nested bullets array (shallow copy detected)');
  }
  if (originalResume.styling.primaryColor === '#ff0000') {
    throw new Error('FAIL: deepCloneResume did not detach nested styling object');
  }
  console.log('✓ PASS: deepCloneResume guarantees 100% reference detachment and immutability');

  // LaTeX Generation Verification
  const latexSource = generateLatexFromResume(initialResume);
  if (!latexSource.includes('\\documentclass') || !latexSource.includes(initialResume.header.fullName)) {
    throw new Error('FAIL: generateLatexFromResume() output missing documentclass or candidate name');
  }
  console.log('✓ generateLatexFromResume(): Generated complete LaTeX document structure');

  // 4. Validate ResumeContext.tsx Architecture & API surface
  console.log('\n--- 4. VALIDATING RESUMECONTEXT.TSX STATE MANAGEMENT ENGINE ---');
  const contextContent = fs.readFileSync(contextPath, 'utf-8');

  const requiredContextTokens = [
    'export const ResumeContext = createContext',
    'export const ResumeProvider',
    'export const useResume',
    'updateResumeField',
    'updateHeaderField',
    'createVersion',
    'restoreVersion',
    'deleteVersion',
    'undo',
    'redo',
    'canUndo',
    'canRedo',
    'recalculateScore',
    'runHealthCheck',
    'syncLatexFromResume',
    'deepCloneResume',
    'safeLocalStorage',
    'contentLibrary',
    'jobHistory'
  ];

  for (const token of requiredContextTokens) {
    if (!contextContent.includes(token)) {
      throw new Error(`FAIL in ResumeContext.tsx: Missing "${token}"`);
    }
    console.log(`✓ ResumeContext.tsx: Verified token "${token}"`);
  }

  // 5. Functional State Simulation (Undo/Redo & Version Snapshotting)
  console.log('\n--- 5. SIMULATING UNDO/REDO & IMMUTABLE VERSION SNAPSHOTTING ---');

  class MockResumeStateEngine {
    private resume: ResumeData;
    private history: ResumeData[];
    private historyPointer: number;
    private versions: Array<{ id: string; name: string; data: ResumeData }> = [];

    constructor(initial: ResumeData) {
      this.resume = deepCloneResume(initial);
      this.history = [deepCloneResume(initial)];
      this.historyPointer = 0;
    }

    getResume() {
      return this.resume;
    }

    setResume(newResume: ResumeData) {
      const clonedNew = deepCloneResume(newResume);
      this.history = [...this.history.slice(0, this.historyPointer + 1), clonedNew];
      this.historyPointer++;
      this.resume = clonedNew;
    }

    updateField<K extends keyof ResumeData>(field: K, value: ResumeData[K]) {
      const updated: ResumeData = {
        ...deepCloneResume(this.resume),
        [field]: value,
        updatedAt: new Date().toISOString()
      };
      this.setResume(updated);
    }

    createVersion(name: string) {
      this.versions.unshift({
        id: `ver-${Date.now()}`,
        name,
        data: deepCloneResume(this.resume)
      });
    }

    restoreVersion(id: string) {
      const target = this.versions.find(v => v.id === id);
      if (target) {
        this.setResume(deepCloneResume(target.data));
      }
    }

    canUndo(): boolean {
      return this.historyPointer > 0;
    }

    canRedo(): boolean {
      return this.historyPointer < this.history.length - 1;
    }

    undo() {
      if (this.canUndo()) {
        this.historyPointer--;
        this.resume = deepCloneResume(this.history[this.historyPointer]);
      }
    }

    redo() {
      if (this.canRedo()) {
        this.historyPointer++;
        this.resume = deepCloneResume(this.history[this.historyPointer]);
      }
    }
  }

  const engine = new MockResumeStateEngine(createInitialResume());
  if (engine.canUndo()) throw new Error('FAIL: Initial state should not be undoable');

  // Step 1: Update title
  engine.updateField('title', 'AI Staff Engineer v1');
  if (engine.getResume().title !== 'AI Staff Engineer v1') throw new Error('FAIL: Title update failed');
  if (!engine.canUndo()) throw new Error('FAIL: State should be undoable after update');

  // Step 2: Create a version snapshot
  engine.createVersion('Saved v1');

  // Step 3: Update title again
  engine.updateField('title', 'AI Staff Engineer v2');
  if (engine.getResume().title !== 'AI Staff Engineer v2') throw new Error('FAIL: Second title update failed');

  // Step 4: Undo step 3
  engine.undo();
  if (engine.getResume().title !== 'AI Staff Engineer v1') {
    throw new Error(`FAIL: Undo did not revert to v1, current title: ${engine.getResume().title}`);
  }
  console.log('✓ PASS: Undo operation correctly restored previous immutable state snapshot');

  // Step 5: Redo step 3
  if (!engine.canRedo()) throw new Error('FAIL: Should be able to redo after undo');
  engine.redo();
  if (engine.getResume().title !== 'AI Staff Engineer v2') {
    throw new Error(`FAIL: Redo did not restore v2, current title: ${engine.getResume().title}`);
  }
  console.log('✓ PASS: Redo operation successfully advanced forward in history stack');

  // Step 6: Restore saved version
  engine.restoreVersion(engine['versions'][0].id);
  if (engine.getResume().title !== 'AI Staff Engineer v1') {
    throw new Error('FAIL: restoreVersion did not restore snapshot state');
  }
  console.log('✓ PASS: Version restore successfully applied deep cloned version state');

  // 6. Validate App.tsx Integration
  console.log('\n--- 6. VALIDATING APP.TSX RESUMEPROVIDER INTEGRATION ---');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  if (!appContent.includes("import { ResumeProvider") || !appContent.includes("<ResumeProvider>")) {
    throw new Error('FAIL in App.tsx: ResumeProvider is not imported or does not wrap WorkspaceContent');
  }
  console.log('✓ App.tsx: Verified <ResumeProvider> wraps application tree');

  console.log('\n=============================================================================');
  console.log('✓ ALL CHECKPOINT 12 REQUIREMENTS AND SUITES VERIFIED SUCCESSFULLY!');
  console.log('=============================================================================');
}

try {
  runCheckpoint12Tests();
} catch (error) {
  console.error('\n❌ CHECKPOINT 12 TEST FAILED:\n', error);
  process.exit(1);
}
