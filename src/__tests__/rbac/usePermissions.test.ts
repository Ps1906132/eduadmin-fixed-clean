/**
 * INTEGRATION TESTS — usePermissions Hook
 * Fase 5: Testing — § 5.2 Integration Testing (Cross-Role Scenarios)
 *
 * Referensi:
 *  - RINGKASAN_CHECKLIST.md § "5.2 Integration Testing"
 *  - TEKNIS_DATABASE_CODE.md § "3. MIDDLEWARE" (AdminMiddleware, KurikulumMiddleware, KeuanganMiddleware)
 *  - PERMISSION_MATRIX.md § "Cross-Role Data Dependencies"
 *
 * Test ini mensimulasikan 3 user berbeda role dan memverifikasi
 * bahwa hook menghasilkan keputusan akses yang benar sesuai PERMISSION_MATRIX.md.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/lib/rbac/usePermissions';

// =============================================================================
// MOCK USER SESSIONS — Sesuai skenario UAT di RINGKASAN_CHECKLIST.md § 5.3
// =============================================================================

const mockAdminUser = { role: 'admin', id: 1 };
const mockKurikulumUser = { role: 'kurikulum', id: 2 };
const mockKeuanganUser = { role: 'keuangan', id: 3 };

// Legacy role aliases yang harus dinormalisasi (sesuai usePermissions._normalizeRole)
const mockSuperAdmin = { role: 'super admin', id: 10 };
const mockStaffTU = { role: 'staff tata usaha', id: 11 };
const mockWakilKurikulum = { role: 'wakil kurikulum', id: 12 };

// =============================================================================
// 1. ADMIN USER SESSION
// Sumber: RINGKASAN_CHECKLIST.md § "5.3 UAT — Test dengan Admin user"
// =============================================================================

describe('[INTEGRATION] usePermissions — Admin Session', () => {
  it('isAdmin = true, isKurikulum = false, isKeuangan = false', () => {
    const { result } = renderHook(() => usePermissions(mockAdminUser.role, mockAdminUser.id));
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isKurikulum).toBe(false);
    expect(result.current.isKeuangan).toBe(false);
  });

  it('Admin: can CREATE data-siswa (modul miliknya)', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.can('data-siswa', 'CREATE')).toBe(true);
  });

  it('Admin: TIDAK can CREATE jadwal (modul kurikulum)', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.can('jadwal', 'CREATE')).toBe(false);
  });

  it('Admin: TIDAK can CREATE keuangan (modul keuangan)', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.can('keuangan', 'CREATE')).toBe(false);
  });

  it('Admin: owns data-siswa = true, owns jadwal = false', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.owns('data-siswa')).toBe(true);
    expect(result.current.owns('jadwal')).toBe(false);
  });

  it('Admin: accessibleModules memuat 18 modul', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.accessibleModules).toHaveLength(18);
  });

  it('Admin: ownedModules memuat 9 modul', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    expect(result.current.ownedModules).toHaveLength(9);
  });

  // Normalisasi role legacy
  it('Role "super admin" dinormalisasi menjadi admin', () => {
    const { result } = renderHook(() => usePermissions(mockSuperAdmin.role, mockSuperAdmin.id));
    expect(result.current.isAdmin).toBe(true);
  });
});

// =============================================================================
// 2. KURIKULUM USER SESSION
// Sumber: RINGKASAN_CHECKLIST.md § "5.3 UAT — Test dengan Kurikulum user"
// =============================================================================

describe('[INTEGRATION] usePermissions — Kurikulum Session', () => {
  it('isKurikulum = true, isAdmin = false, isKeuangan = false', () => {
    const { result } = renderHook(() => usePermissions(mockKurikulumUser.role, mockKurikulumUser.id));
    expect(result.current.isKurikulum).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isKeuangan).toBe(false);
  });

  it('Kurikulum: can CREATE nilai (modul miliknya)', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.can('nilai', 'CREATE')).toBe(true);
    expect(result.current.can('nilai', 'UPDATE')).toBe(true);
    expect(result.current.can('nilai', 'DELETE')).toBe(true);
  });

  it('Kurikulum: can READ data-siswa (read-only referensi)', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.can('data-siswa', 'READ')).toBe(true);
  });

  it('Kurikulum: TIDAK can CREATE data-siswa (bukan pemilik)', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.can('data-siswa', 'CREATE')).toBe(false);
    expect(result.current.can('data-siswa', 'UPDATE')).toBe(false);
    expect(result.current.can('data-siswa', 'DELETE')).toBe(false);
  });

  it('Kurikulum: TIDAK can READ keuangan (no access)', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.can('keuangan', 'READ')).toBe(false);
  });

  it('Kurikulum: owns nilai = true, owns data-siswa = false', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.owns('nilai')).toBe(true);
    expect(result.current.owns('data-siswa')).toBe(false);
  });

  it('Kurikulum: accessibleModules memuat 11 modul', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.accessibleModules).toHaveLength(11);
  });

  it('Kurikulum: ownedModules memuat 6 modul', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    expect(result.current.ownedModules).toHaveLength(6);
  });

  // Normalisasi role legacy
  it('Role "wakil kurikulum" dinormalisasi menjadi kurikulum', () => {
    const { result } = renderHook(() => usePermissions(mockWakilKurikulum.role, mockWakilKurikulum.id));
    expect(result.current.isKurikulum).toBe(true);
  });
});

// =============================================================================
// 3. KEUANGAN USER SESSION
// Sumber: RINGKASAN_CHECKLIST.md § "5.3 UAT — Test dengan Keuangan user"
// =============================================================================

describe('[INTEGRATION] usePermissions — Keuangan Session', () => {
  it('isKeuangan = true, isAdmin = false, isKurikulum = false', () => {
    const { result } = renderHook(() => usePermissions(mockKeuanganUser.role, mockKeuanganUser.id));
    expect(result.current.isKeuangan).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isKurikulum).toBe(false);
  });

  it('Keuangan: can CRUD keuangan (modul miliknya)', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.can('keuangan', 'CREATE')).toBe(true);
    expect(result.current.can('keuangan', 'READ')).toBe(true);
    expect(result.current.can('keuangan', 'UPDATE')).toBe(true);
    expect(result.current.can('keuangan', 'DELETE')).toBe(true);
  });

  it('Keuangan: can READ data-siswa (referensi nama & ID)', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.can('data-siswa', 'READ')).toBe(true);
  });

  it('Keuangan: TIDAK can CREATE/UPDATE/DELETE data-siswa', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.can('data-siswa', 'CREATE')).toBe(false);
    expect(result.current.can('data-siswa', 'UPDATE')).toBe(false);
    expect(result.current.can('data-siswa', 'DELETE')).toBe(false);
  });

  it('Keuangan: TIDAK can READ jadwal (no access)', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.can('jadwal', 'READ')).toBe(false);
  });

  it('Keuangan: TIDAK can READ pengaturan (modul admin)', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.can('pengaturan', 'READ')).toBe(false);
  });

  it('Keuangan: owns keuangan = true, owns nilai = false', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.owns('keuangan')).toBe(true);
    expect(result.current.owns('nilai')).toBe(false);
  });

  it('Keuangan: accessibleModules memuat 7 modul', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.accessibleModules).toHaveLength(7);
  });

  it('Keuangan: ownedModules memuat 3 modul', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    expect(result.current.ownedModules).toHaveLength(3);
  });

  // Normalisasi role legacy
  it('Role "staff tata usaha" dinormalisasi menjadi keuangan', () => {
    const { result } = renderHook(() => usePermissions(mockStaffTU.role, mockStaffTU.id));
    expect(result.current.isKeuangan).toBe(true);
  });
});

// =============================================================================
// 4. CROSS-ROLE DATA INTEGRITY — Verify No Data Leakage
// Sumber: RINGKASAN_CHECKLIST.md § "5.2 Integration Testing — Verify no data leakage"
// =============================================================================

describe('[INTEGRATION] Cross-Role — No Data Leakage', () => {
  it('Keuangan TIDAK bisa akses modul Kurikulum murni: jadwal, jadwal-ujian, rapot, naik-kelas', () => {
    const { result } = renderHook(() => usePermissions('keuangan'));
    // absen DIKECUALIKAN — Keuangan boleh READ absen untuk kalkulasi potongan honor
    // Sumber: PERMISSION_MATRIX.md § "KEUANGAN ROLE" baris 6
    ['jadwal', 'jadwal-ujian', 'rapot', 'naik-kelas'].forEach(mod => {
      expect(result.current.can(mod as any, 'READ')).toBe(false);
    });
    // Verifikasi absen memang bisa diREAD oleh Keuangan (sesuai dokumen)
    expect(result.current.can('absen', 'READ')).toBe(true);
  });

  it('Kurikulum TIDAK bisa akses modul Keuangan: keuangan, tabungan', () => {
    const { result } = renderHook(() => usePermissions('kurikulum'));
    ['keuangan', 'tabungan'].forEach(mod => {
      expect(result.current.can(mod as any, 'READ')).toBe(false);
    });
  });

  it('Admin TIDAK bisa CREATE/UPDATE/DELETE di semua modul non-miliknya (jadwal, keuangan)', () => {
    const { result } = renderHook(() => usePermissions('admin'));
    ['jadwal', 'nilai', 'rapot', 'keuangan', 'tabungan', 'laporan'].forEach(mod => {
      expect(result.current.can(mod as any, 'CREATE')).toBe(false);
      expect(result.current.can(mod as any, 'UPDATE')).toBe(false);
      expect(result.current.can(mod as any, 'DELETE')).toBe(false);
    });
  });
});

// =============================================================================
// 5. SESSION TIDAK DIKENAL / NULL ROLE
// Sumber: PERMISSION_MATRIX.md § "Default DENY"
// =============================================================================

describe('[INTEGRATION] usePermissions — Session Tidak Dikenal', () => {
  it('Role undefined → semua isXxx = false', () => {
    const { result } = renderHook(() => usePermissions(undefined));
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isKurikulum).toBe(false);
    expect(result.current.isKeuangan).toBe(false);
  });

  it('Role undefined → can() = false untuk semua modul', () => {
    const { result } = renderHook(() => usePermissions(undefined));
    expect(result.current.can('data-siswa', 'READ')).toBe(false);
    expect(result.current.can('nilai', 'READ')).toBe(false);
    expect(result.current.can('keuangan', 'READ')).toBe(false);
  });

  it('Role tidak dikenal ("guru mapel") → accessibleModules kosong', () => {
    const { result } = renderHook(() => usePermissions('guru mapel'));
    expect(result.current.accessibleModules).toHaveLength(0);
  });
});
