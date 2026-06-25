/**
 * PERMISSION MATRIX - EduAdmin
 * Fase 1: Perencanaan & Analisis — Mapping Hak Akses per Role
 *
 * Referensi utama: PERMISSION_MATRIX.md
 * Referensi pendukung: TAHAPAN_PEMISAHAN_MODUL.md (Tabel 1.2)
 *
 * ATURAN:
 *  - Tidak ada modul di luar 18 modul yang terdefinisi
 *  - Tidak ada role di luar admin, kurikulum, keuangan (untuk 3 role inti)
 *  - Default DENY, explicit ALLOW (Principle of Least Privilege)
 */

import type { AdminRoleType, AppModule, CrudAction, ModulePermission } from './types';

// =============================================================================
// PERMISSION MATRIX
// Sumber: PERMISSION_MATRIX.md - Tabel 1 (Admin), Tabel 2 (Kurikulum), Tabel 3 (Keuangan)
// =============================================================================

const ALL_CRUD: CrudAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
const READ_ONLY: CrudAction[] = ['READ'];

/**
 * ADMIN ROLE — 9 Modul Penuh + READ pada modul lain
 * Sumber: PERMISSION_MATRIX.md § "ADMIN ROLE - Modul yang Dikuasai"
 */
const ADMIN_PERMISSIONS: ModulePermission[] = [
  // 9 Modul Admin — Full CRUD
  { module: 'data-siswa',    actions: ALL_CRUD,  notes: 'Full access, audit log' },
  { module: 'data-guru',     actions: ALL_CRUD,  notes: 'Full access, sensitive data' },
  { module: 'kelas-wali',    actions: ALL_CRUD,  notes: 'Setup & maintain' },
  { module: 'mata-pelajaran',actions: ALL_CRUD,  notes: 'Master data' },
  { module: 'bimbingan',     actions: ALL_CRUD,  notes: 'Manage BK activity' },
  { module: 'pengumuman',    actions: ALL_CRUD,  notes: 'School-wide announcements' },
  { module: 'multimedia',    actions: ALL_CRUD,  notes: 'Upload/manage media' },
  { module: 'manajemen-ai',  actions: ALL_CRUD,  notes: 'AI integration settings' },
  { module: 'pengaturan',    actions: ALL_CRUD,  notes: 'System configuration' },

  // Modul Kurikulum — READ ONLY untuk Admin
  { module: 'jadwal',        actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },
  { module: 'absen',         actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },
  { module: 'jadwal-ujian',  actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },
  { module: 'nilai',         actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },
  { module: 'rapot',         actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },
  { module: 'naik-kelas',    actions: READ_ONLY, notes: 'READ ONLY untuk Kurikulum' },

  // Modul Keuangan — READ ONLY untuk Admin
  { module: 'keuangan',      actions: READ_ONLY, notes: 'READ ONLY untuk Keuangan' },
  { module: 'tabungan',      actions: READ_ONLY, notes: 'READ ONLY untuk Keuangan' },
  { module: 'laporan',       actions: READ_ONLY, notes: 'READ ONLY untuk Keuangan' },
];

/**
 * KURIKULUM ROLE — 6 Modul Penuh + READ pada data master
 * Sumber: PERMISSION_MATRIX.md § "KURIKULUM ROLE - Modul yang Dikuasai"
 */
const KURIKULUM_PERMISSIONS: ModulePermission[] = [
  // 6 Modul Kurikulum — Full CRUD
  { module: 'jadwal',        actions: ALL_CRUD,  notes: 'Full control, primary owner' },
  { module: 'absen',         actions: READ_ONLY,  notes: 'View attendance statistics (input by Guru)' },
  { module: 'jadwal-ujian',  actions: ALL_CRUD,  notes: 'Exam scheduling' },
  { module: 'nilai',         actions: ALL_CRUD,  notes: 'Grade input & management' },
  { module: 'rapot',         actions: ALL_CRUD,  notes: 'Generate & manage reports' },
  { module: 'naik-kelas',    actions: ALL_CRUD,  notes: 'Grade promotion' },

  // Data Master Admin — VIEW ONLY (untuk referensi)
  { module: 'data-siswa',    actions: READ_ONLY, notes: 'View only' },
  { module: 'data-guru',     actions: READ_ONLY, notes: 'View only' },
  { module: 'kelas-wali',    actions: READ_ONLY, notes: 'View only' },
  { module: 'mata-pelajaran',actions: READ_ONLY, notes: 'View only' },
  { module: 'laporan',       actions: READ_ONLY, notes: 'View academic reports only' },
];

/**
 * KEUANGAN ROLE — 3 Modul Penuh + READ terbatas
 * Sumber: PERMISSION_MATRIX.md § "KEUANGAN ROLE - Modul yang Dikuasai"
 */
const KEUANGAN_PERMISSIONS: ModulePermission[] = [
  // 3 Modul Keuangan — Full CRUD
  { module: 'keuangan',      actions: ALL_CRUD,  notes: 'Full financial management' },
  { module: 'tabungan',      actions: ALL_CRUD,  notes: 'Student savings account' },
  { module: 'laporan',       actions: ALL_CRUD,  notes: 'Financial reporting & export' },

  // Data referensi — VIEW ONLY
  { module: 'data-siswa',    actions: READ_ONLY, notes: 'View name & ID only' },
  { module: 'data-guru',     actions: READ_ONLY, notes: 'View gaji section only' },
  { module: 'absen',         actions: READ_ONLY, notes: 'View for attendance deductions' },
  { module: 'nilai',         actions: READ_ONLY, notes: 'View for performance bonus' },
];

/**
 * KS ROLE (KEPALA SEKOLAH) — READ ONLY pada semua modul yang dapat diakses
 * Sumber: PERJANJIAN_KERJA.md §2.3 — "Kepala sekolah hanya bisa melihat data"
 */
const KS_PERMISSIONS: ModulePermission[] = [
  // Data Master — READ ONLY
  { module: 'data-siswa',     actions: READ_ONLY, notes: 'READ ONLY' },
  { module: 'data-guru',      actions: READ_ONLY, notes: 'READ ONLY' },
  { module: 'kelas-wali',     actions: READ_ONLY, notes: 'READ ONLY' },
  { module: 'mata-pelajaran', actions: READ_ONLY, notes: 'READ ONLY' },

  // Modul Akademik — READ ONLY
  { module: 'nilai',          actions: READ_ONLY, notes: 'READ ONLY' },
  { module: 'pengumuman',     actions: READ_ONLY, notes: 'READ ONLY (bisa CREATE)' },
  { module: 'multimedia',     actions: READ_ONLY, notes: 'READ ONLY' },
  { module: 'laporan',        actions: READ_ONLY, notes: 'READ ONLY' },
];

// =============================================================================
// PERMISSION MATRIX MAP (role → permissions[])
// =============================================================================

export const PERMISSION_MATRIX: Record<AdminRoleType, ModulePermission[]> = {
  admin:     ADMIN_PERMISSIONS,
  kurikulum: KURIKULUM_PERMISSIONS,
  keuangan:  KEUANGAN_PERMISSIONS,
  ks:        KS_PERMISSIONS,
};

// =============================================================================
// MODUL OWNERSHIP — Siapa pemilik utama tiap modul
// Sumber: START_HERE.md § "DISTRIBUSI MODUL"
// =============================================================================

export const MODULE_OWNER: Record<AppModule, AdminRoleType> = {
  // Admin modules
  'data-siswa':     'admin',
  'data-guru':      'admin',
  'kelas-wali':     'admin',
  'mata-pelajaran': 'admin',
  'bimbingan':      'admin',
  'pengumuman':     'admin',
  'multimedia':     'admin',
  'manajemen-ai':   'admin',
  'pengaturan':     'admin',

  // Kurikulum modules
  'jadwal':         'kurikulum',
  'absen':          'kurikulum',
  'jadwal-ujian':   'kurikulum',
  'nilai':          'kurikulum',
  'rapot':          'kurikulum',
  'naik-kelas':     'kurikulum',

  // Keuangan modules
  'keuangan':       'keuangan',
  'tabungan':       'keuangan',
  'laporan':        'keuangan',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Cek apakah role memiliki permission untuk action tertentu pada modul tertentu.
 * Default DENY — harus ada explicit ALLOW.
 * Sumber: PERMISSION_MATRIX.md § "SECURITY BEST PRACTICES - Principle of Least Privilege"
 */
export function hasPermission(
  role: AdminRoleType,
  module: AppModule,
  action: CrudAction
): boolean {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return false;

  const modulePermission = permissions.find((p) => p.module === module);
  if (!modulePermission) return false;

  return modulePermission.actions.includes(action);
}

/**
 * Ambil semua modul yang dapat diakses oleh role tertentu (minimal READ).
 * Sumber: TEKNIS_DATABASE_CODE.md - User Model canAccess()
 */
export function getAccessibleModules(role: AdminRoleType): AppModule[] {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return [];
  return permissions.map((p) => p.module);
}

/**
 * Cek apakah role adalah pemilik utama (CRUD penuh) pada modul tertentu.
 * Sumber: PERMISSION_MATRIX.md — Cross-Role Data Dependencies
 */
export function isModuleOwner(role: AdminRoleType, module: AppModule): boolean {
  return MODULE_OWNER[module] === role;
}

/**
 * Ambil daftar modul CRUD penuh untuk suatu role.
 */
export function getOwnedModules(role: AdminRoleType): AppModule[] {
  const permissions = PERMISSION_MATRIX[role];
  if (!permissions) return [];
  return permissions
    .filter((p) => p.actions.length === 4) // CREATE, READ, UPDATE, DELETE
    .map((p) => p.module);
}
