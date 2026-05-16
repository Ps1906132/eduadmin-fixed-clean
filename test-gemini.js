#!/usr/bin/env node

/**
 * Script untuk testing koneksi ke Google Gemini API
 * Jalankan dengan: node test-gemini.js
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGeminiConnection() {
  console.log('🧪 Testing Google Gemini API Connection...\n');

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY tidak ditemukan di .env.local');
    console.log('📝 Pastikan Anda sudah mengisi GEMINI_API_KEY di file .env.local');
    process.exit(1);
  }

  console.log('✅ API Key ditemukan');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenAI({ apiKey });

    console.log('🔄 Mengirim test message ke Gemini API...');

    // Test message
    const testMessage = 'Halo! Berikan penjelasan singkat tentang apa itu matematika dalam 2-3 kalimat saja.';

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: testMessage }]
      }]
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      console.log('✅ Koneksi berhasil!');
      console.log('📄 Respons dari AI:');
      console.log('---');
      console.log(text);
      console.log('---');
      console.log('\n🎉 Fitur "Belajar dengan AI" siap digunakan!');
    } else {
      console.error('❌ Respons kosong dari API');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error koneksi ke Gemini API:');
    console.error(error.message);

    if (error.message.includes('API_KEY')) {
      console.log('\n💡 Pastikan API key yang Anda masukkan valid dan aktif');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 Kuota API mungkin habis, cek dashboard Google AI Studio');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Periksa koneksi internet Anda');
    }

    process.exit(1);
  }
}

// Run test
testGeminiConnection();