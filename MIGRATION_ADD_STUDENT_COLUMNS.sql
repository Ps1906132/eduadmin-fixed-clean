-- ========================================
-- EDUADMIN D1 MIGRATION
-- Add missing columns to students table
-- Run this in Cloudflare D1 Dashboard → SQL Editor
-- ========================================

-- Add parent fields columns if not exist
ALTER TABLE students ADD COLUMN mother_name TEXT;
ALTER TABLE students ADD COLUMN parent_job TEXT;
ALTER TABLE students ADD COLUMN mother_job TEXT;
ALTER TABLE students ADD COLUMN username TEXT;

-- Confirm changes
PRAGMA table_info(students);
