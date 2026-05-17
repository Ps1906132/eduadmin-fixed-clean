/**
 * MIGRATION TESTS — Fase 6: Data Migration
 * Fase 5 Testing mencakup uji migrasi data
 *
 * Referensi:
 *  - RINGKASAN_CHECKLIST.md § "6.1 Test Migration Script"
 *  - RINGKASAN_CHECKLIST.md § "6.3 Post-Migration Data Validation"
 *  - TEKNIS_DATABASE_CODE.md Migration 1 — Add role_type
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  backupCurrentData,
  verifyBackup,
  migrateUserRoleType,
  verifyMigration,
  rollbackMigration,
  getMigrationStatus,
} from '../../lib/rbac/migration';

// =============================================================================
// SETUP — Mock localStorage dengan data user "lama" (sebelum role_type)
// =============================================================================

function setMockUserSession(role: string, withRoleType = false) {
  const user: Record<string, any> = { id: 1, name: 'Test User', role };
  if (withRoleType) user.role_type = role;
  localStorage.setItem('user', JSON.stringify(user));
}

// =============================================================================
// 6.1 PRE-MIGRATION — Backup Tests
// Sumber: RINGKASAN_CHECKLIST.md § "6.1 Backup Plan"
// =============================================================================

describe('[MIGRATION] § 6.1 Pre-Migration — Backup', () => {
  it('backupCurrentData menghasilkan backup_id yang valid', () => {
    setMockUserSession('admin');
    const backupId = backupCurrentData();
    expect(backupId).toMatch(/^backup_\d+$/);
  });

  it('verifyBackup mengembalikan true untuk backup yang valid', () => {
    const backupId = backupCurrentData();
    expect(verifyBackup(backupId)).toBe(true);
  });

  it('verifyBackup mengembalikan false untuk backup_id yang tidak ada', () => {
    expect(verifyBackup('backup_tidak_ada_9999')).toBe(false);
  });

  it('Backup menyimpan data session user yang ada', () => {
    setMockUserSession('kurikulum');
    const backupId = backupCurrentData();
    const raw = localStorage.getItem(`eduadmin_migration_backup_v1_${backupId}`);
    expect(raw).not.toBeNull();
    const backup = JSON.parse(raw!);
    expect(backup.snapshot['user']).toContain('kurikulum');
  });
});

// =============================================================================
// 6.2 MIGRATION EXECUTION — Konversi role → role_type
// Sumber: TEKNIS_DATABASE_CODE.md Migration 1
// =============================================================================

describe('[MIGRATION] § 6.2 Migration Execution — role_type Mapping', () => {
  it('Migrasi user "admin" → role_type: "admin"', () => {
    setMockUserSession('admin');
    const result = migrateUserRoleType();
    expect(result.success).toBe(true);
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('admin');
  });

  it('Migrasi user "super admin" → role_type: "admin"', () => {
    setMockUserSession('super admin');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('admin');
  });

  it('Migrasi user "kurikulum" → role_type: "kurikulum"', () => {
    setMockUserSession('kurikulum');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('kurikulum');
  });

  it('Migrasi user "wakil kurikulum" → role_type: "kurikulum"', () => {
    setMockUserSession('wakil kurikulum');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('kurikulum');
  });

  it('Migrasi user "keuangan" → role_type: "keuangan"', () => {
    setMockUserSession('keuangan');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('keuangan');
  });

  it('Migrasi user "staff tata usaha" → role_type: "keuangan"', () => {
    setMockUserSession('staff tata usaha');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('keuangan');
  });

  it('Migrasi user "operator data" → role_type: "admin"', () => {
    setMockUserSession('operator data');
    migrateUserRoleType();
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('admin');
  });

  it('User yang sudah punya role_type tidak diubah (idempotent)', () => {
    setMockUserSession('admin', true); // Sudah punya role_type = 'admin'
    const result = migrateUserRoleType();
    expect(result.usersUpdated).toBe(0); // Tidak ada yang diperbarui
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('admin');
  });

  it('Migrasi mengembalikan status "completed" jika berhasil', () => {
    setMockUserSession('kurikulum');
    const result = migrateUserRoleType();
    expect(result.status).toBe('completed');
    expect(getMigrationStatus()).toBe('completed');
  });

  it('Migrasi idempotent — aman dijalankan berkali-kali', () => {
    setMockUserSession('keuangan');
    migrateUserRoleType(); // Pertama kali
    migrateUserRoleType(); // Kedua kali — tidak boleh mengubah apapun
    const user = JSON.parse(localStorage.getItem('user')!);
    expect(user.role_type).toBe('keuangan'); // Tetap benar
  });

  it('Tanpa session user — migrasi tetap sukses (tidak ada yang diproses)', () => {
    // Tidak ada user di localStorage
    const result = migrateUserRoleType();
    expect(result.success).toBe(true);
    expect(result.usersProcessed).toBe(0);
  });
});

// =============================================================================
// 6.3 POST-MIGRATION — Verifikasi Integritas Data
// Sumber: RINGKASAN_CHECKLIST.md § "6.3 Post-Migration Data Validation"
// =============================================================================

describe('[MIGRATION] § 6.3 Post-Migration — Verifikasi Integritas', () => {
  it('verifyMigration: valid = true setelah migrasi berhasil', () => {
    setMockUserSession('admin');
    migrateUserRoleType();
    const verification = verifyMigration();
    // Cek field role_type ada dan valid
    const roleTypeCheck = verification.checks.find(c => c.name.includes('role_type ada'));
    expect(roleTypeCheck?.passed).toBe(true);
  });

  it('verifyMigration: role_type adalah nilai enum valid', () => {
    setMockUserSession('kurikulum');
    migrateUserRoleType();
    const verification = verifyMigration();
    const enumCheck = verification.checks.find(c => c.name.includes('nilai enum valid'));
    expect(enumCheck?.passed).toBe(true);
  });

  it('verifyMigration: backward compatibility — field role lama masih ada', () => {
    setMockUserSession('keuangan');
    migrateUserRoleType();
    const verification = verifyMigration();
    const compatCheck = verification.checks.find(c => c.name.includes('Backward compatibility'));
    expect(compatCheck?.passed).toBe(true);
  });
});

// =============================================================================
// ROLLBACK — Restore dari Backup
// Sumber: RINGKASAN_CHECKLIST.md § "6.1 Rollback Plan"
// =============================================================================

describe('[MIGRATION] § 6.1 Rollback Plan — Restore Backup', () => {
  it('Rollback berhasil me-restore data ke kondisi sebelum migrasi', () => {
    // Setup: user dengan role lama (tanpa role_type)
    setMockUserSession('admin');
    const originalData = localStorage.getItem('user');

    // Backup sebelum migrasi
    const backupId = backupCurrentData();

    // Jalankan migrasi (sekarang ada role_type)
    migrateUserRoleType();
    const afterMigration = JSON.parse(localStorage.getItem('user')!);
    expect(afterMigration.role_type).toBe('admin'); // Migrasi berhasil

    // Rollback
    const rollbackResult = rollbackMigration(backupId);
    expect(rollbackResult.success).toBe(true);

    // Verifikasi data kembali ke kondisi awal
    const afterRollback = localStorage.getItem('user');
    expect(afterRollback).toBe(originalData); // Identik dengan sebelum migrasi
  });

  it('Rollback gagal jika backup_id tidak ada', () => {
    const result = rollbackMigration('backup_id_tidak_ada_xyz');
    expect(result.success).toBe(false);
    expect(result.message).toContain('tidak ditemukan');
  });
});
