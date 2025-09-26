#!/usr/bin/env node

/*
 * Modern Build Script
 * Advanced build operations and optimizations
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import { buildMonitor } from '../build.config.js';

const args = process.argv.slice(2);
const mode = args.includes('--dev') ? 'development' : 'production';
const analyze = args.includes('--analyze');
const profile = args.includes('--profile');
const clean = args.includes('--clean');

console.log('🔧 Modern Build System');
console.log(`Mode: ${mode}`);
console.log(`Analyze: ${analyze}`);
console.log(`Profile: ${profile}`);
console.log(`Clean: ${clean}`);

// Clean build directory if requested
if (clean) {
  console.log('🧹 Cleaning build directory...');
  const distPath = resolve(process.cwd(), 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
  }
  mkdirSync(distPath, { recursive: true });
}

// Start build monitoring
const startTime = buildMonitor.start();

try {
  // Build command
  let buildCmd = 'vite build';

  if (mode === 'development') {
    buildCmd += ' --mode development';
  } else {
    buildCmd += ' --mode production';
  }

  if (profile) {
    buildCmd += ' --profile';
  }

  console.log(`🏗️  Running: ${buildCmd}`);

  // Execute build
  execSync(buildCmd, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: mode,
      BUILD_MONITOR: 'true',
    }
  });

  // Bundle analysis
  if (analyze) {
    console.log('📊 Running bundle analysis...');
    execSync('npm run analyze', { stdio: 'inherit' });
  }

  // Build monitoring
  const duration = buildMonitor.end(startTime);

  // Success message
  console.log('🎉 Build completed successfully!');
  console.log(`⏱️  Total time: ${duration}ms`);

  // Performance recommendations
  if (duration > 5000) {
    console.log('⚠️  Build time is slow. Consider:');
    console.log('   - Enabling build caching');
    console.log('   - Optimizing dependencies');
    console.log('   - Using incremental builds');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
