-- Migration: Add missing fields to students table
-- Run this migration on your production D1 database

-- Add mother_name column if it doesn't exist
ALTER TABLE students ADD COLUMN mother_name TEXT;

-- Add parent_job column if it doesn't exist
ALTER TABLE students ADD COLUMN parent_job TEXT;

-- Add mother_job column if it doesn't exist
ALTER TABLE students ADD COLUMN mother_job TEXT;
