import { GoogleGenAI } from '@google/genai';
import { db as supabase } from '../src/lib/db';

// Cache untuk API key dan client
let geminiClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

/**
 * Mendapatkan API key aktif dari database
 */
async function getActiveApiKey(providerType: string = 'gemini'): Promise<string> {
  try {
    // Cek cache terlebih dahulu
    if (cachedApiKey) {
      return cachedApiKey;
    }

    // Query API key aktif dari database
    // Note: D1 bridge doesn't support joins yet, so we fetch all active keys and filter
    const { data: keys, error } = await supabase
      .from('ai_api_keys')
      .select('*')
      .eq('is_active', 1);

    if (error || !keys || keys.length === 0) {
      // Fallback ke environment variables jika database belum siap
      const envKey = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY) as string | undefined;
      if (envKey && envKey !== 'your_gemini_api_key_here') {
        cachedApiKey = envKey;
        return envKey;
      }
      throw new Error('Tidak ada API key aktif untuk provider Gemini');
    }

    // In a real app, we would join with ai_providers. 
    // For now, we'll use the first active key or filter if provider info was available.
    // If multiple providers exist, we'd need to fetch ai_providers table too.
    cachedApiKey = keys[0].api_key;
    return cachedApiKey!;

  } catch (error) {
    console.error('Error getting API key:', error);
    throw new Error('Gagal mendapatkan API key dari database');
  }
}

/**
 * Mendapatkan atau membuat Gemini client
 */
async function getGeminiClient(): Promise<GoogleGenAI> {
  if (!geminiClient) {
    const apiKey = await getActiveApiKey('gemini');
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Simpan chat session ke database
 */
export async function saveChatSession(userId: string, message: string, response: string): Promise<void> {
  try {
    // NOTE: Chat sessions storage is currently disabled as the D1 schema
    // for ai_chat_sessions and ai_chat_messages is not yet finalized.
    console.log('Chat session saving skipped (D1 migration in progress)');
    return;

  } catch (error) {
    console.warn('Failed to save chat session:', error);
  }
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface ChatSession {
  history: GeminiMessage[];
  currentMessage: string;
}

/**
 * Mengirim pesan ke backend proxy Gemini dan mendapatkan respons
 * @param message Pesan dari user
 * @param history Riwayat percakapan sebelumnya (opsional)
 * @returns Respons dari AI
 */
export async function sendToGemini(message: string, history: GeminiMessage[] = []): Promise<string> {
  try {
    // Persiapkan payload untuk API
    const contents = [
      // System instruction sebagai first message
      {
        role: 'user',
        parts: [{ text: `Kamu adalah asisten AI pembelajaran yang ramah dan membantu untuk siswa sekolah dasar di Indonesia.
        Tugasmu adalah membantu siswa belajar berbagai mata pelajaran dengan cara yang menyenangkan dan mudah dipahami.

        Pedoman komunikasi:
        - Gunakan bahasa Indonesia yang sederhana dan ramah
        - Jelaskan konsep dengan analogi yang mudah dipahami
        - Berikan contoh-contoh konkret
        - Dorong siswa untuk berpikir kritis
        - Jika siswa bertanya tentang topik yang tidak sesuai untuk usia sekolah dasar, arahkan ke topik yang lebih sesuai
        - Selalu akhiri dengan pertanyaan untuk mendorong diskusi lebih lanjut

        Mata pelajaran yang bisa dibantu:
        - Matematika (penjumlahan, pengurangan, perkalian, pembagian, geometri)
        - Bahasa Indonesia (membaca, menulis, tata bahasa)
        - IPA (sains dasar, alam sekitar)
        - IPS (sejarah, geografi, kewarganegaraan)
        - Seni dan budaya
        - Pendidikan agama Islam
        - Bahasa Inggris dasar` }]
      },
      {
        role: 'model',
        parts: [{ text: 'Baik, saya akan membantu siswa sekolah dasar belajar dengan cara yang menyenangkan dan mudah dipahami.' }]
      },
      // History chat
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }]
      })),
      // Pesan user saat ini
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const token = typeof window !== 'undefined' ? localStorage.getItem('eduadmin_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Panggil Backend Proxy (functions/api/gemini.ts)
    // Ini lebih aman karena API Key dikelola di server
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';

    return text;

  } catch (error: any) {
    console.error('Error calling Gemini Backend:', error);

    // Handle berbagai jenis error
    if (error.message.includes('not configured')) {
      return '❌ Layanan AI belum dikonfigurasi di server. Silakan hubungi administrator.';
    }
    if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('429')) {
      return '❌ Kuota layanan AI telah habis. Silakan coba lagi beberapa saat lagi.';
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '❌ Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }

    return `❌ Terjadi kesalahan: ${error.message}`;
  }
}

/**
 * Membuat title untuk chat session berdasarkan pesan pertama
 * @param firstMessage Pesan pertama dari user
 * @returns Title yang di-generate
 */
export function generateChatTitle(firstMessage: string): string {
  const lower = firstMessage.toLowerCase();

  // Deteksi topik berdasarkan kata kunci
  if (lower.includes('matematika') || lower.includes('hitung') || lower.includes('kali') || lower.includes('bagi')) {
    return 'Belajar Matematika';
  }
  if (lower.includes('bahasa indonesia') || lower.includes('membaca') || lower.includes('menulis')) {
    return 'Belajar Bahasa Indonesia';
  }
  if (lower.includes('ipa') || lower.includes('sains') || lower.includes('alam')) {
    return 'Belajar IPA';
  }
  if (lower.includes('ips') || lower.includes('sejarah') || lower.includes('geografi')) {
    return 'Belajar IPS';
  }
  if (lower.includes('islam') || lower.includes('agama') || lower.includes('quran')) {
    return 'Belajar Agama Islam';
  }
  if (lower.includes('english') || lower.includes('inggris')) {
    return 'Belajar Bahasa Inggris';
  }
  if (lower.includes('puisi') || lower.includes('cerita') || lower.includes('menulis')) {
    return 'Kreativitas & Sastra';
  }

  // Default title
  return 'Belajar Bersama AI';
}