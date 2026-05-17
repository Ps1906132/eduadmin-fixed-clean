/**
 * RBAC Type Definitions - EduAdmin
 * Fase 1: Perencanaan & Analisis
 *
 * Referensi:
 *  - PERMISSION_MATRIX.md
 *  - TEKNIS_DATABASE_CODE.md (Migration 1: Add Role Type to Users)
 *  - TAHAPAN_PEMISAHAN_MODUL.md (1.2 Mapping Hak Akses per Role)
 *
 * PENTING: Tidak ada perubahan desain atau penambahan fitur di luar dokumen.
 */

// =============================================================================
// ROLE TYPES
// Sesuai TEKNIS_DATABASE_CODE.md: enum('admin', 'kurikulum', 'keuangan')
// Role lain (guru, wali kelas, dsb.) dipertahankan apa adanya (tidak diubah)
// =============================================================================

export type AdminRoleType = 'admin' | 'kurikulum' | 'keuangan';

export type AllRoleType =
  | 'admin'
  | 'kurikulum'
  | 'keuangan'
  | 'multimedia'  // role existing, dipertahankan
  | 'ks'          // kepala sekolah, dipertahankan
  | 'wk'          // wali kelas, dipertahankan
  | 'gm'          // guru mapel, dipertahankan
  | 'gb'          // guru bimbel, dipertahankan
  | 'ot';         // orang tua, dipertahankan

// =============================================================================
// CRUD ACTIONS
// Sesuai PERMISSION_MATRIX.md: CREATE, READ, UPDATE, DELETE
// =============================================================================

export type CrudAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

// =============================================================================
// MODULE NAMES
// Sesuai START_HERE.md & TAHAPAN_PEMISAHAN_MODUL.md:
//   - Admin: 9 modul
//   - Kurikulum: 6 modul
//   - Keuangan: 3 modul
// =============================================================================

export type AdminModule =
  | 'data-siswa'          // Data Siswa & Kelas
  | 'data-guru'           // Data Guru & Staff
  | 'kelas-wali'          // Kelas & Wali Kelas
  | 'mata-pelajaran'      // Mata Pelajaran
  | 'bimbingan'           // Bimbingan Belajar
  | 'pengumuman'          // Pengumuman
  | 'multimedia'          // Manajemen Multimedia
  | 'manajemen-ai'        // Manajemen AI
  | 'pengaturan';         // Pengaturan Sistem

export type KurikulumModule =
  | 'jadwal'              // Jadwal
  | 'absen'               // Absen
  | 'jadwal-ujian'        // Jadwal Ujian
  | 'nilai'               // Manajemen Nilai
  | 'rapot'               // Rapot
  | 'naik-kelas';         // Naik Kelas

export type KeuanganModule =
  | 'keuangan'            // Keuangan Sekolah
  | 'tabungan'            // Tabungan Siswa
  | 'laporan';            // Laporan Keuangan

export type AppModule = AdminModule | KurikulumModule | KeuanganModule;

// =============================================================================
// PERMISSION ENTRY
// Sesuai PERMISSION_MATRIX.md tabel per role
// =============================================================================

export interface ModulePermission {
  module: AppModule;
  actions: CrudAction[];
  notes?: string;
}

// =============================================================================
// USER WITH ROLE (Sesuai TEKNIS_DATABASE_CODE.md - User Model)
// Field role_type ditambahkan ke user object
// =============================================================================

export interface EduAdminUser {
  id?: string | number;
  name?: string;
  email?: string;
  role_type: AdminRoleType;  // field utama dari Migration 1
  role?: string;             // alias / backward compat
  roleCode?: string;         // alias / backward compat
  is_active?: boolean;
  last_login_at?: string;
  [key: string]: any;
}

// =============================================================================
// AUDIT LOG ENTRY
// Sesuai TEKNIS_DATABASE_CODE.md (Migration 2: Create Audit Logs Table)
// Implementasi frontend: disimpan via API /api/audit_logs
// =============================================================================

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'UNAUTHORIZED';
export type AuditStatus = 'success' | 'failed' | 'unauthorized';

export interface AuditLogEntry {
  id?: number;
  timestamp?: string;           // DEFAULT CURRENT_TIMESTAMP
  user_id?: string | number;
  user_role: AdminRoleType | string;
  module: AppModule | string;
  action: AuditAction;
  table_name?: string;
  record_id?: string | number;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string;
  user_agent?: string;
  status: AuditStatus;
  error_message?: string;
}
