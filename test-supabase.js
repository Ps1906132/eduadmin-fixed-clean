#!/usr/bin/env node

/**
 * Script untuk testing koneksi ke Supabase
 * Jalankan dengan: node test-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables tidak lengkap:');
    if (!supabaseUrl) console.log('  - VITE_SUPABASE_URL tidak ditemukan');
    if (!supabaseAnonKey) console.log('  - VITE_SUPABASE_ANON_KEY tidak ditemukan');
    console.log('\n📝 Pastikan Anda sudah mengisi environment variables di file .env.local');
    console.log('📖 Lihat SUPABASE_README.md untuk instruksi setup');
    process.exit(1);
  }

  // Check if using placeholder values
  if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-supabase-anon-key')) {
    console.error('❌ Environment variables masih menggunakan placeholder values');
    console.log('📝 Silakan update .env.local dengan nilai yang benar dari Supabase dashboard');
    process.exit(1);
  }

  console.log('✅ Environment variables ditemukan');

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    console.log('🔄 Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Koneksi gagal:', error.message);

      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n💡 Kemungkinan penyebab:');
        console.log('  - Database schema belum dijalankan');
        console.log('  - Jalankan supabase_schema.sql di Supabase SQL Editor');
      } else if (error.message.includes('JWT')) {
        console.log('\n💡 Kemungkinan penyebab:');
        console.log('  - API key tidak valid');
        console.log('  - Periksa kembali VITE_SUPABASE_ANON_KEY');
      }

      process.exit(1);
    }

    console.log('✅ Koneksi Supabase berhasil!');

    // Test AI tables (yang baru ditambahkan)
    console.log('🔄 Testing AI Management tables...');

    const aiTables = ['ai_providers', 'ai_api_keys', 'ai_chat_sessions', 'ai_chat_messages', 'ai_system_settings'];

    for (const table of aiTables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`⚠️  Table '${table}' belum ada atau belum di-setup`);
        } else {
          console.log(`✅ Table '${table}' siap digunakan`);
        }
      } catch (err) {
        console.log(`⚠️  Error checking table '${table}':`, err.message);
      }
    }

    console.log('\n🎉 Supabase siap digunakan!');
    console.log('📊 Database connection: OK');
    console.log('🔐 Authentication: OK');
    console.log('🤖 AI Management: Tables perlu dicek');

  } catch (error) {
    console.error('❌ Error tidak terduga:', error.message);
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection().catch(console.error);