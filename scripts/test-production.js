#!/usr/bin/env node

/**
 * Script untuk test koneksi Supabase di production
 * Jalankan dengan: node test-production.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testProductionConnection() {
  console.log('🧪 Testing Production Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables tidak ditemukan');
    console.log('💡 Pastikan environment variables sudah diset di Cloudflare Pages');
    process.exit(1);
  }

  console.log('✅ Environment variables ditemukan');
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    console.log('\n🔄 Testing connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Connection successful!');

    // Test AI tables
    console.log('\n🔄 Testing AI Management tables...');
    const aiTables = ['ai_providers', 'ai_api_keys', 'ai_system_settings'];

    for (const table of aiTables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`⚠️  Table '${table}' not ready:`, error.message);
        } else {
          console.log(`✅ Table '${table}' ready`);
        }
      } catch (err) {
        console.log(`❌ Error testing '${table}':`, err.message);
      }
    }

    console.log('\n🎉 Production setup complete!');
    console.log('🚀 Ready for deployment to Cloudflare Pages');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testProductionConnection();