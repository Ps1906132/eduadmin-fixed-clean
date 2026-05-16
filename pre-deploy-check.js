#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Jalankan sebelum deploy ke Cloudflare Pages
 */

import { readFileSync } from 'fs';
import dotenv from 'dotenv';

console.log('🔍 EduAdmin - Pre-Deployment Checklist\n');

// Load environment variables
dotenv.config({ path: '.env.local' });

const checks = [
  {
    name: 'Supabase URL configured',
    check: () => process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('your-project-id'),
    message: 'Set VITE_SUPABASE_URL in .env.local'
  },
  {
    name: 'Supabase Anon Key configured',
    check: () => process.env.VITE_SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_ANON_KEY.includes('your-supabase-anon-key'),
    message: 'Set VITE_SUPABASE_ANON_KEY in .env.local'
  },
  {
    name: 'Gemini API Key configured (Optional)',
    check: () => {
      // Gemini API key sekarang optional karena menggunakan sistem database
      return true; // Selalu pass karena optional
    },
    message: 'Optional: Set GEMINI_API_KEY in .env.local sebagai fallback (sistem utama menggunakan database)'
  },
  {
    name: 'Build script exists',
    check: () => {
      try {
        const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts.build;
      } catch {
        return false;
      }
    },
    message: 'Add build script to package.json'
  },
  {
    name: 'Vite config exists',
    check: () => {
      try {
        readFileSync('vite.config.ts', 'utf8');
        return true;
      } catch {
        return false;
      }
    },
    message: 'Create vite.config.ts'
  }
];

let allPassed = true;

checks.forEach(({ name, check, message }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';

  console.log(`${status} ${name}`);

  if (!passed) {
    console.log(`   💡 ${message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for deployment.');
  console.log('\n📋 Deployment Steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Connect to Cloudflare Pages');
  console.log('3. Set environment variables in Cloudflare');
  console.log('4. Deploy!');
} else {
  console.log('⚠️  Some checks failed. Please fix before deploying.');
  process.exit(1);
}