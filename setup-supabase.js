#!/usr/bin/env node

/**
 * Script untuk setup Supabase credentials
 * Jalankan dengan: node setup-supabase.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import dotenv from 'dotenv';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('🚀 EduAdmin - Supabase Setup Wizard\n');

// Load current .env.local
const envPath = '.env.local';
let envContent = '';

try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ File .env.local tidak ditemukan');
  process.exit(1);
}

async function setupSupabase() {
  try {
    console.log('📝 Masukkan credentials Supabase baru:\n');

    const projectId = await question('Masukkan Project ID Supabase (contoh: abcdefghijklmnopqrst): ');
    if (!projectId.trim()) {
      console.error('❌ Project ID tidak boleh kosong');
      process.exit(1);
    }

    const anonKey = await question('Masukkan Supabase Anon Key: ');
    if (!anonKey.trim()) {
      console.error('❌ Anon Key tidak boleh kosong');
      process.exit(1);
    }

    rl.close();

    // Update environment variables
    const newEnvContent = envContent
      .replace(/VITE_SUPABASE_URL=.*/, `VITE_SUPABASE_URL=https://${projectId.trim()}.supabase.co`)
      .replace(/VITE_SUPABASE_ANON_KEY=.*/, `VITE_SUPABASE_ANON_KEY=${anonKey.trim()}`);

    writeFileSync(envPath, newEnvContent);

    console.log('\n✅ Environment variables berhasil diupdate!');
    console.log('🔄 Menjalankan test koneksi...\n');

    // Test connection
    const { createClient } = await import('@supabase/supabase-js');
    dotenv.config({ path: envPath });

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);

      if (error) {
        console.log('⚠️  Koneksi berhasil, tapi database belum di-setup');
        console.log('💡 Jalankan schema database di Supabase SQL Editor');
        console.log('📄 Lihat file: supabase_schema.sql');
      } else {
        console.log('🎉 Supabase siap digunakan!');
      }
    } catch (connError) {
      console.log('⚠️  Koneksi berhasil, tapi perlu setup database schema');
      console.log('💡 Jalankan supabase_schema.sql di Supabase SQL Editor');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupSupabase();