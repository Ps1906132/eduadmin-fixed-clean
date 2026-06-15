/**
 * UNIT TESTS — permissionMatrix.ts
 * Fase 5: Testing — § 5.1 Unit Testing (Policy Tests, Permission Checks)
 *
 * Referensi:
 *  - RINGKASAN_CHECKLIST.md § "5.1 Unit Testing"
 *  - PERMISSION_MATRIX.md (sumber kebenaran untuk semua assertions)
 *  - START_HERE.md § "DISTRIBUSI MODUL" (18 modul, 3 role)
 *
 * Prinsip: TIDAK ada perubahan desain, TIDAK ada penambahan modul.
 * Semua test harus LULUS berdasarkan dokumen yang sudah ada.
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  isModuleOwner,
  getAccessibleModules,
  getOwnedModules,
  PERMISSION_MATRIX,
  MODULE_OWNER,
} from '@/lib/rbac/permissionMatrix';
import type { AdminRoleType, AppModule, CrudAction } from '@/lib/rbac/types';

// =============================================================================
// 1. TOTAL MODUL & ROLE VALIDATION
// Sumber: START_HERE.md § "STATISTIK PROYEK"
// =============================================================================

describe('[UNIT] Struktur Permission Matrix', () => {
  it('MATRIX harus memuat tepat 3 role: admin, kurikulum, keuangan', () => {
    const roles = Object.keys(PERMISSION_MATRIX);
    expect(roles).toHaveLength(3);
    expect(roles).toContain('admin');
    expect(roles).toContain('kurikulum');
    expect(roles).toContain('keuangan');
  });

  it('MODULE_OWNER harus mendefinisikan owner untuk 18 modul', () => {
    const modules = Object.keys(MODULE_OWNER);
    expect(modules).toHaveLength(18);
  });

  it('Admin harus memiliki 9 modul CRUD penuh', () => {
    const owned = getOwnedModules('admin');
    expect(owned).toHaveLength(9);
  });

  it('Kurikulum harus memiliki 6 modul CRUD penuh', () => {
    const owned = getOwnedModules('kurikulum');
    expect(owned).toHaveLength(6);
  });

  it('Keuangan harus memiliki 3 modul CRUD penuh', () => {
    const owned = getOwnedModules('keuangan');
    expect(owned).toHaveLength(3);
  });
});

// =============================================================================
// 2. hasPermission — ADMIN ROLE
// Sumber: PERMISSION_MATRIX.md § "ADMIN ROLE - Modul yang Dikuasai"
// =============================================================================

describe('[UNIT] hasPermission — Admin Role', () => {
  const allCrud: CrudAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  const adminModules: AppModule[] = [
    'data-siswa', 'data-guru', 'kelas-wali', 'mata-pelajaran',
    'bimbingan', 'pengumuman', 'multimedia', 'manajemen-ai', 'pengaturan',
  ];

  // Admin FULL CRUD pada 9 modul miliknya
  it.each(adminModules)('Admin: CRUD penuh pada modul %s', (mod) => {
    allCrud.forEach(action => {
      expect(hasPermission('admin', mod, action)).toBe(true);
    });
  });

  // Admin READ-ONLY pada modul Kurikulum
  const kurikulumModules: AppModule[] = ['jadwal', 'absen', 'jadwal-ujian', 'nilai', 'rapot', 'naik-kelas'];
  it.each(kurikulumModules)('Admin: READ-ONLY pada modul kurikulum %s (bukan CREATE/UPDATE/DELETE)', (mod) => {
    expect(hasPermission('admin', mod, 'READ')).toBe(true);
    expect(hasPermission('admin', mod, 'CREATE')).toBe(false);
    expect(hasPermission('admin', mod, 'UPDATE')).toBe(false);
    expect(hasPermission('admin', mod, 'DELETE')).toBe(false);
  });

  // Admin READ-ONLY pada modul Keuangan
  const keuanganModules: AppModule[] = ['keuangan', 'tabungan', 'laporan'];
  it.each(keuanganModules)('Admin: READ-ONLY pada modul keuangan %s (bukan CREATE/UPDATE/DELETE)', (mod) => {
    expect(hasPermission('admin', mod, 'READ')).toBe(true);
    expect(hasPermission('admin', mod, 'CREATE')).toBe(false);
    expect(hasPermission('admin', mod, 'UPDATE')).toBe(false);
    expect(hasPermission('admin', mod, 'DELETE')).toBe(false);
  });
});

// =============================================================================
// 3. hasPermission — KURIKULUM ROLE
// Sumber: PERMISSION_MATRIX.md § "KURIKULUM ROLE - Modul yang Dikuasai"
// =============================================================================

describe('[UNIT] hasPermission — Kurikulum Role', () => {
  const allCrud: CrudAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  const kurikulumOwnedModules: AppModule[] = ['jadwal', 'absen', 'jadwal-ujian', 'nilai', 'rapot', 'naik-kelas'];

  // Kurikulum FULL CRUD pada 6 modul miliknya
  it.each(kurikulumOwnedModules)('Kurikulum: CRUD penuh pada modul %s', (mod) => {
    allCrud.forEach(action => {
      expect(hasPermission('kurikulum', mod, action)).toBe(true);
    });
  });

  // Kurikulum READ-ONLY pada data master admin
  const readOnlyModules: AppModule[] = ['data-siswa', 'data-guru', 'kelas-wali', 'mata-pelajaran', 'laporan'];
  it.each(readOnlyModules)('Kurikulum: READ-ONLY pada modul admin %s', (mod) => {
    expect(hasPermission('kurikulum', mod, 'READ')).toBe(true);
    expect(hasPermission('kurikulum', mod, 'CREATE')).toBe(false);
    expect(hasPermission('kurikulum', mod, 'UPDATE')).toBe(false);
    expect(hasPermission('kurikulum', mod, 'DELETE')).toBe(false);
  });

  // Kurikulum TIDAK bisa akses modul keuangan
  it('Kurikulum: TIDAK bisa akses modul keuangan (tabungan)', () => {
    expect(hasPermission('kurikulum', 'tabungan', 'READ')).toBe(false);
    expect(hasPermission('kurikulum', 'keuangan', 'READ')).toBe(false);
  });
});

// =============================================================================
// 4. hasPermission — KEUANGAN ROLE
// Sumber: PERMISSION_MATRIX.md § "KEUANGAN ROLE - Modul yang Dikuasai"
// =============================================================================

describe('[UNIT] hasPermission — Keuangan Role', () => {
  const allCrud: CrudAction[] = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  const keuanganOwnedModules: AppModule[] = ['keuangan', 'tabungan', 'laporan'];

  // Keuangan FULL CRUD pada 3 modul miliknya
  it.each(keuanganOwnedModules)('Keuangan: CRUD penuh pada modul %s', (mod) => {
    allCrud.forEach(action => {
      expect(hasPermission('keuangan', mod, action)).toBe(true);
    });
  });

  // Keuangan READ-ONLY pada referensi data
  const readOnlyModules: AppModule[] = ['data-siswa', 'data-guru', 'absen', 'nilai'];
  it.each(readOnlyModules)('Keuangan: READ-ONLY pada %s', (mod) => {
    expect(hasPermission('keuangan', mod, 'READ')).toBe(true);
    expect(hasPermission('keuangan', mod, 'CREATE')).toBe(false);
    expect(hasPermission('keuangan', mod, 'UPDATE')).toBe(false);
    expect(hasPermission('keuangan', mod, 'DELETE')).toBe(false);
  });

  // Keuangan TIDAK bisa akses modul kurikulum murni
  it('Keuangan: TIDAK bisa akses modul kurikulum (jadwal, rapot, naik-kelas)', () => {
    expect(hasPermission('keuangan', 'jadwal', 'READ')).toBe(false);
    expect(hasPermission('keuangan', 'rapot', 'READ')).toBe(false);
    expect(hasPermission('keuangan', 'naik-kelas', 'READ')).toBe(false);
  });

  // Keuangan TIDAK bisa akses modul admin murni
  it('Keuangan: TIDAK bisa akses modul admin (bimbingan, pengumuman, multimedia)', () => {
    expect(hasPermission('keuangan', 'bimbingan', 'READ')).toBe(false);
    expect(hasPermission('keuangan', 'pengumuman', 'READ')).toBe(false);
    expect(hasPermission('keuangan', 'multimedia', 'READ')).toBe(false);
  });
});

// =============================================================================
// 5. isModuleOwner
// Sumber: PERMISSION_MATRIX.md — MODULE_OWNER mapping
// =============================================================================

describe('[UNIT] isModuleOwner', () => {
  it('Admin adalah pemilik modul data-siswa', () => {
    expect(isModuleOwner('admin', 'data-siswa')).toBe(true);
    expect(isModuleOwner('kurikulum', 'data-siswa')).toBe(false);
    expect(isModuleOwner('keuangan', 'data-siswa')).toBe(false);
  });

  it('Kurikulum adalah pemilik modul nilai', () => {
    expect(isModuleOwner('kurikulum', 'nilai')).toBe(true);
    expect(isModuleOwner('admin', 'nilai')).toBe(false);
    expect(isModuleOwner('keuangan', 'nilai')).toBe(false);
  });

  it('Keuangan adalah pemilik modul keuangan', () => {
    expect(isModuleOwner('keuangan', 'keuangan')).toBe(true);
    expect(isModuleOwner('admin', 'keuangan')).toBe(false);
    expect(isModuleOwner('kurikulum', 'keuangan')).toBe(false);
  });

  it('Kurikulum adalah pemilik rapot', () => {
    expect(isModuleOwner('kurikulum', 'rapot')).toBe(true);
  });

  it('Keuangan adalah pemilik tabungan', () => {
    expect(isModuleOwner('keuangan', 'tabungan')).toBe(true);
  });

  it('Admin adalah pemilik pengaturan (sistem)', () => {
    expect(isModuleOwner('admin', 'pengaturan')).toBe(true);
  });
});

// =============================================================================
// 6. getAccessibleModules
// Sumber: PERMISSION_MATRIX.md — Cross-Role Data
// =============================================================================

describe('[UNIT] getAccessibleModules', () => {
  it('Admin dapat akses 18 modul (9 own + 6 kurikulum + 3 keuangan)', () => {
    const modules = getAccessibleModules('admin');
    expect(modules).toHaveLength(18);
  });

  it('Kurikulum dapat akses 11 modul (6 own + 5 referensi)', () => {
    const modules = getAccessibleModules('kurikulum');
    expect(modules).toHaveLength(11);
  });

  it('Keuangan dapat akses 7 modul (3 own + 4 referensi)', () => {
    const modules = getAccessibleModules('keuangan');
    expect(modules).toHaveLength(7);
  });
});

// =============================================================================
// 7. DEFAULT DENY — Prinsip Least Privilege
// Sumber: PERMISSION_MATRIX.md § "SECURITY BEST PRACTICES"
// =============================================================================

describe('[UNIT] Default DENY — Principle of Least Privilege', () => {
  it('hasPermission untuk role yang tidak dikenal → false (default DENY)', () => {
    // @ts-expect-error: Testing unknown role intentionally
    expect(hasPermission('unknown_role', 'data-siswa', 'READ')).toBe(false);
  });

  it('hasPermission untuk modul yang tidak ada → false (default DENY)', () => {
    // @ts-expect-error: Testing unknown module intentionally
    expect(hasPermission('admin', 'modul-tidak-ada', 'READ')).toBe(false);
  });

  it('Kurikulum TIDAK bisa DELETE modul miliknya sendiri... tunggu, seharusnya BISA — verifikasi ALL CRUD', () => {
    // Kurikulum adalah pemilik 'nilai', seharusnya bisa DELETE
    expect(hasPermission('kurikulum', 'nilai', 'DELETE')).toBe(true);
  });

  it('Admin TIDAK bisa CREATE di modul Kurikulum (jadwal)', () => {
    expect(hasPermission('admin', 'jadwal', 'CREATE')).toBe(false);
  });

  it('Keuangan TIDAK bisa UPDATE di modul Admin (data-siswa)', () => {
    expect(hasPermission('keuangan', 'data-siswa', 'UPDATE')).toBe(false);
  });
});
