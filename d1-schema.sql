-- =========================================
-- EduAdmin School Management System
-- Cloudflare D1 (SQLite) SQL Schema
-- Created: May 15, 2026
-- =========================================

-- 1. USERS & AUTHENTICATION TABLES
-- =========================================

-- Users table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY, -- Using TEXT for UUID compatibility
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ot', -- 'admin', 'ks', 'gm', 'wk', 'gb', 'ot'
    avatar_url TEXT,
    is_active INTEGER DEFAULT 1, -- 0 for false, 1 for true
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Staff details table
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    employee_number TEXT UNIQUE NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    hire_date TEXT,
    salary REAL,
    phone TEXT,
    address TEXT,
    education_level TEXT,
    specialization TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================
-- 2. ACADEMIC STRUCTURE TABLES
-- =========================================

-- Academic years
CREATE TABLE IF NOT EXISTS academic_years (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "2024/2025"
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Subjects/Mata Pelajaran
CREATE TABLE IF NOT EXISTS subject_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    group_id TEXT REFERENCES subject_groups(id) ON DELETE SET NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Classes/Kelas
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "1A", "2B"
    grade_level INTEGER NOT NULL, -- 1-12
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    homeroom_teacher_id TEXT REFERENCES staff(id) ON DELETE SET NULL,
    capacity INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Students/Siswa
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    nis TEXT UNIQUE NOT NULL,
    nisn TEXT UNIQUE,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('L', 'P')),
    birth_date TEXT,
    birth_place TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'graduated', 'transferred'
    enrollment_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================
-- 3. ATTENDANCE & ACADEMICS
-- =========================================

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'sick', 'permission')),
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0-6
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================
-- 15. AI PROVIDERS & API KEYS MANAGEMENT
-- =========================================

-- AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, -- Display name (e.g., "Google Gemini", "ChatGPT", "Groq")
    provider_type TEXT NOT NULL, -- 'gemini', 'openai', 'groq', 'anthropic', 'socratic', 'custom'
    base_url TEXT, -- For custom providers
    model_name TEXT NOT NULL, -- Model identifier (e.g., "gemini-1.5-flash", "gpt-4", "llama2-70b")
    description TEXT,
    is_active INTEGER DEFAULT 1,
    max_tokens INTEGER DEFAULT 4096,
    temperature REAL DEFAULT 0.7,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- API Keys table
CREATE TABLE IF NOT EXISTS ai_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT REFERENCES ai_providers(id) ON DELETE CASCADE,
    api_key TEXT NOT NULL, 
    is_active INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- AI System Settings
CREATE TABLE IF NOT EXISTS ai_system_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =========================================
-- INITIAL DATA/SEEDING
-- =========================================

-- Insert initial academic year
INSERT INTO academic_years (id, name, start_date, end_date, is_active) VALUES
('ay-2024-2025', '2024/2025', '2024-07-01', '2025-06-30', 1);

-- Insert subject groups
INSERT INTO subject_groups (id, name, description) VALUES
('sg-agama', 'Agama', 'Mata pelajaran agama dan moral'),
('sg-bahasa', 'Bahasa', 'Bahasa Indonesia dan Asing'),
('sg-matematika', 'Matematika', 'Matematika dan Logika'),
('sg-ipa', 'IPA', 'Ilmu Pengetahuan Alam'),
('sg-ips', 'IPS', 'Ilmu Pengetahuan Sosial'),
('sg-seni', 'Seni Budaya', 'Seni dan Budaya'),
('sg-penjas', 'Penjas', 'Pendidikan Jasmani dan Kesehatan'),
('sg-mulok', 'Muatan Lokal', 'Muatan lokal daerah');

-- Insert default AI providers
INSERT INTO ai_providers (id, name, provider_type, model_name, description, max_tokens, temperature) VALUES
('prov-gemini-flash', 'Google Gemini 1.5 Flash', 'gemini', 'gemini-1.5-flash', 'Google Gemini 1.5 Flash - Cepat dan akurat untuk edukasi', 4096, 0.7),
('prov-gemini-pro', 'Google Gemini 1.5 Pro', 'gemini', 'gemini-1.5-pro', 'Google Gemini 1.5 Pro - Model paling canggih dari Google', 8192, 0.7),
('prov-gpt4', 'ChatGPT 4', 'openai', 'gpt-4', 'OpenAI GPT-4 - Model terdepan untuk percakapan', 8192, 0.7),
('prov-groq-llama', 'Groq Llama 2 70B', 'groq', 'llama2-70b-4096', 'Groq Llama 2 70B - Sangat cepat untuk inferensi', 4096, 0.7);

-- Insert default system settings
INSERT INTO ai_system_settings (id, setting_key, setting_value, setting_type, description) VALUES
('set-1', 'default_provider', 'gemini-1.5-flash', 'string', 'Provider AI default yang digunakan'),
('set-2', 'max_tokens_per_request', '2048', 'number', 'Batas maksimal token per request'),
('set-3', 'rate_limit_per_minute', '10', 'number', 'Batas request per menit per user'),
('set-4', 'enable_chat_history', '1', 'boolean', 'Aktifkan penyimpanan riwayat chat');
