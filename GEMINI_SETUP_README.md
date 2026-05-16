# Panduan Setup API Key Google Gemini untuk Fitur "Belajar dengan AI"

## 📋 Persyaratan

Sebelum menggunakan fitur "Belajar dengan AI", Anda perlu mengatur API Key Google Gemini. Fitur ini menggunakan Google Gemini 1.5 Flash untuk memberikan pengalaman belajar yang interaktif.

## 🔑 Langkah-langkah Setup

### 1. Dapatkan API Key Google Gemini

1. Kunjungi [Google AI Studio](https://aistudio.google.com/)
2. Login dengan akun Google Anda
3. Klik "Create API Key" atau "Get API Key"
4. Copy API key yang dihasilkan

### 2. Konfigurasi Environment Variables

1. **Copy file environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit file `.env.local`** dan isi API key:
   ```env
   # Google Gemini API Key untuk fitur AI
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

   **Contoh:**
   ```env
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvw
   ```

### 3. Restart Development Server

Setelah mengatur API key, restart development server:

```bash
npm run dev
```

## 🧪 Testing Fitur AI

1. Login sebagai **Orang Tua**, **Wali Kelas**, **Guru Mapel**, atau **Guru Bimbel**
2. Klik menu **"Belajar dengan AI"** atau **"Belajar dengan ku"**
3. Kirim pesan untuk testing:
   - "Bantu saya belajar matematika"
   - "Jelaskan apa itu fotosintesis"
   - "Buatkan puisi tentang sekolah"

## ⚠️ Troubleshooting

### Error: "API Key Google Gemini belum dikonfigurasi"
- Pastikan file `.env.local` ada di root project
- Pastikan `GEMINI_API_KEY` sudah diisi dengan API key yang valid
- Restart development server setelah mengubah environment variables

### Error: "Kuota API Google Gemini telah habis"
- Cek kuota API di [Google AI Studio Dashboard](https://aistudio.google.com/)
- Upgrade ke plan berbayar jika diperlukan
- Tunggu reset kuota (biasanya bulanan)

### Error: "Tidak dapat terhubung ke server AI"
- Periksa koneksi internet
- Pastikan tidak ada firewall yang memblokir akses ke Google APIs
- Coba lagi dalam beberapa saat

## 🔒 Keamanan

- **Jangan commit** file `.env.local` ke repository (sudah ada di `.gitignore`)
- **Jangan bagikan** API key ke orang lain
- API key hanya digunakan untuk komunikasi dengan Google Gemini API
- Semua komunikasi dienkripsi dan aman

## 💡 Fitur AI

Fitur "Belajar dengan AI" dapat membantu siswa belajar:

- **Matematika**: Penjumlahan, pengurangan, perkalian, pembagian, geometri
- **Bahasa Indonesia**: Membaca, menulis, tata bahasa
- **IPA**: Sains dasar, alam sekitar
- **IPS**: Sejarah, geografi, kewarganegaraan
- **Agama Islam**: Pendidikan agama dasar
- **Bahasa Inggris**: Kosakata dan grammar dasar
- **Kreativitas**: Puisi, cerita, seni

## 📞 Dukungan

Jika mengalami masalah dengan setup API key, hubungi tim development atau lihat dokumentasi Google Gemini API di [sini](https://ai.google.dev/docs).