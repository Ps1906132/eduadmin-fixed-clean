/**
 * DATA MIGRATION UTILITY — EduAdmin RBAC
 * Fase 6: Data Migration — § 6.1 Pre-Migration & § 6.2 Migration Execution
 *
 * Referensi:
 *  - RINGKASAN_CHECKLIST.md § "FASE 6: CHECKLIST DATA MIGRATION"
 *  - TEKNIS_DATABASE_CODE.md (Migration 1: Add role_type, Migration 2: audit_logs)
 *  - PERMISSION_MATRIX.md § "Data Sharing Antar Role"
 *
 * FUNGSI UTAMA:
 *  1. migrateUserRoleType()  — Migrasi field role → role_type pada data user
 *  2. backupCurrentData()    — Backup snapshot semua data sebelum migrasi
 *  3. verifyMigration()      — Verifikasi integritas data post-migrasi
 *  4. rollbackMigration()    — Restore data dari backup jika ada masalah
 *
 * PRINSIP: Tidak mengubah desain UI. Hanya beroperasi pada layer data.
 */

import type { AdminRoleType, EduAdminUser } from './types';

// =============================================================================
// KONSTANTA STORAGE KEYS
// Sumber: TEKNIS_DATABASE_CODE.md — localStorage key conventions
// =============================================================================

const MIGRATION_BACKUP_KEY  = 'eduadmin_migration_backup_v1';
const MIGRATION_LOG_KEY     = 'eduadmin_migration_log_v1';
const MIGRATION_STATUS_KEY  = 'eduadmin_migration_status_v1';
const USER_SESSION_KEY      = 'user';  // Key dari App.tsx yang menyimpan session user

export type MigrationStatus = 'not_started' | 'in_progress' | 'completed' | 'rolled_back' | 'failed';

export interface MigrationResult {
  success:         boolean;
  status:          MigrationStatus;
  timestamp:       string;
  usersProcessed:  number;
  usersUpdated:    number;
  errors:          string[];
  log:             string[];
}

// =============================================================================
// 6.1 PRE-MIGRATION — Backup & Verification
// Sumber: RINGKASAN_CHECKLIST.md § "6.1 Pre-Migration"
// =============================================================================

/**
 * Backup semua data relevan ke localStorage sebelum migrasi dimulai.
 * Setara dengan "Full database backup" di § 6.1.
 *
 * @returns backup_id — identifier untuk restore nanti
 */
export function backupCurrentData(): string {
  const backupId = `backup_${Date.now()}`;
  const snapshot: Record<string, string | null> = {};

  // Backup semua localStorage keys yang relevan dengan RBAC
  const keysToBackup = [
    USER_SESSION_KEY,
    'auth_user',
    'current_user',
    'users_data',
    'students_data',
    'eduadmin_audit_logs_v1',
  ];

  keysToBackup.forEach(key => {
    snapshot[key] = localStorage.getItem(key);
  });

  // Simpan seluruh localStorage sebagai snapshot tambahan
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !snapshot[key]) {
      snapshot[key] = localStorage.getItem(key);
    }
  }

  const backup = {
    backup_id:  backupId,
    timestamp:  new Date().toISOString(),
    snapshot,
  };

  localStorage.setItem(`${MIGRATION_BACKUP_KEY}_${backupId}`, JSON.stringify(backup));
  _logMigration(`✅ Backup selesai: ${backupId} | Keys: ${Object.keys(snapshot).length}`);

  return backupId;
}

/**
 * Verifikasi backup tersedia dan valid sebelum migrasi.
 * Setara dengan "Backup verification" di § 6.1.
 */
export function verifyBackup(backupId: string): boolean {
  try {
    const raw = localStorage.getItem(`${MIGRATION_BACKUP_KEY}_${backupId}`);
    if (!raw) return false;
    const backup = JSON.parse(raw);
    return !!backup.backup_id && !!backup.timestamp && !!backup.snapshot;
  } catch {
    return false;
  }
}

// =============================================================================
// 6.2 MIGRATION EXECUTION
// Sumber: RINGKASAN_CHECKLIST.md § "6.2 Migration Execution"
// Setara: TEKNIS_DATABASE_CODE.md Migration 1 — Add role_type ENUM
// =============================================================================

/**
 * Peta konversi dari role string lama ke AdminRoleType baru.
 * Sumber: PERMISSION_MATRIX.md — Role definitions
 *         TEKNIS_DATABASE_CODE.md — Migration 1 ENUM values
 */
const ROLE_MIGRATION_MAP: Record<string, AdminRoleType> = {
  // Admin variants
  'admin':             'admin',
  'super admin':       'admin',
  'superadmin':        'admin',
  'operator data':     'admin',
  'multimedia':        'admin',

  // Kurikulum variants
  'kurikulum':         'kurikulum',
  'wakil kurikulum':   'kurikulum',
  'waka kurikulum':    'kurikulum',

  // Keuangan variants
  'keuangan':          'keuangan',
  'staff tata usaha':  'keuangan',
  'tata usaha':        'keuangan',
  'tu':                'keuangan',
};

/**
 * Migrasi field role → role_type pada user object di localStorage.
 * Setara dengan: ALTER TABLE users ADD COLUMN role_type ENUM('admin','kurikulum','keuangan')
 *
 * Proses:
 *   1. Baca data user dari localStorage
 *   2. Tambahkan field role_type berdasarkan nilai role yang ada
 *   3. Simpan kembali dengan format baru
 *   4. Log setiap perubahan
 */
export function migrateUserRoleType(): MigrationResult {
  const result: MigrationResult = {
    success:        false,
    status:         'in_progress',
    timestamp:      new Date().toISOString(),
    usersProcessed: 0,
    usersUpdated:   0,
    errors:         [],
    log:            [],
  };

  _logMigration('🚀 Mulai migrasi role_type...');
  _setMigrationStatus('in_progress');

  try {
    // --- Migrasi sesi user aktif ---
    const sessionRaw = localStorage.getItem(USER_SESSION_KEY);
    if (sessionRaw) {
      try {
        const sessionUser = JSON.parse(sessionRaw) as EduAdminUser;
        result.usersProcessed++;

        if (!sessionUser.role_type) {
          const existingRole = (sessionUser.role || sessionUser.roleCode || '').toLowerCase();
          const mappedRole = ROLE_MIGRATION_MAP[existingRole];

          if (mappedRole) {
            sessionUser.role_type = mappedRole;
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionUser));
            result.usersUpdated++;
            result.log.push(`✅ Session user: "${existingRole}" → role_type: "${mappedRole}"`);
            _logMigration(`  Session user "${existingRole}" → "${mappedRole}"`);
          } else {
            result.errors.push(`⚠️ Role tidak dikenali pada session user: "${existingRole}" — dibiarkan tanpa role_type`);
            _logMigration(`  ⚠️ Role tidak dikenali: "${existingRole}"`);
          }
        } else {
          result.log.push(`ℹ️ Session user sudah memiliki role_type: "${sessionUser.role_type}" — dilewati`);
        }
      } catch (e) {
        result.errors.push(`❌ Gagal parse session user: ${String(e)}`);
      }
    }

    // --- Migrasi data users_data (jika tersedia sebagai array) ---
    const usersDataRaw = localStorage.getItem('users_data');
    if (usersDataRaw) {
      try {
        const usersArray = JSON.parse(usersDataRaw) as EduAdminUser[];
        if (Array.isArray(usersArray)) {
          const updatedUsers = usersArray.map(user => {
            result.usersProcessed++;
            if (!user.role_type) {
              const existingRole = (user.role || user.roleCode || '').toLowerCase();
              const mappedRole = ROLE_MIGRATION_MAP[existingRole];
              if (mappedRole) {
                result.usersUpdated++;
                result.log.push(`✅ User ID ${user.id}: "${existingRole}" → role_type: "${mappedRole}"`);
                return { ...user, role_type: mappedRole };
              }
            }
            return user;
          });
          localStorage.setItem('users_data', JSON.stringify(updatedUsers));
        }
      } catch (e) {
        result.errors.push(`❌ Gagal migrate users_data: ${String(e)}`);
      }
    }

    result.success = true;
    result.status  = 'completed';
    _setMigrationStatus('completed');
    _logMigration(`✅ Migrasi selesai: ${result.usersProcessed} diproses, ${result.usersUpdated} diperbarui`);

  } catch (e) {
    result.success = false;
    result.status  = 'failed';
    result.errors.push(`❌ Fatal error: ${String(e)}`);
    _setMigrationStatus('failed');
    _logMigration(`❌ Migrasi GAGAL: ${String(e)}`);
  }

  // Simpan log hasil migrasi
  _saveMigrationResult(result);
  return result;
}

// =============================================================================
// 6.3 POST-MIGRATION — Verifikasi & Integritas Data
// Sumber: RINGKASAN_CHECKLIST.md § "6.3 Post-Migration"
// =============================================================================

/**
 * Verifikasi integritas data setelah migrasi.
 * Setara dengan "Data Validation" di § 6.3.
 *
 * Cek:
 *  1. Session user memiliki role_type yang valid
 *  2. role_type termasuk dalam enum yang diizinkan
 *  3. Backward compatibility: field role lama masih ada
 */
export function verifyMigration(): {
  valid:    boolean;
  checks:   Array<{ name: string; passed: boolean; detail: string }>;
} {
  const validRoleTypes: AdminRoleType[] = ['admin', 'kurikulum', 'keuangan'];
  const checks: Array<{ name: string; passed: boolean; detail: string }> = [];

  // CHECK 1: Session user memiliki role_type
  const sessionRaw = localStorage.getItem(USER_SESSION_KEY);
  if (sessionRaw) {
    try {
      const user = JSON.parse(sessionRaw) as EduAdminUser;
      const hasRoleType = !!user.role_type;
      const isValidEnum = hasRoleType && validRoleTypes.includes(user.role_type as AdminRoleType);

      checks.push({
        name:   'Session user: field role_type ada',
        passed: hasRoleType,
        detail: hasRoleType ? `role_type = "${user.role_type}"` : 'MISSING role_type',
      });

      checks.push({
        name:   'Session user: role_type adalah nilai enum valid',
        passed: isValidEnum,
        detail: isValidEnum
          ? `"${user.role_type}" ∈ {admin, kurikulum, keuangan} ✓`
          : `"${user.role_type}" BUKAN nilai enum yang valid ✗`,
      });

      // Backward compatibility: field role lama masih ada
      checks.push({
        name:   'Backward compatibility: field role lama masih ada',
        passed: !!user.role || !!user.roleCode,
        detail: user.role ? `role = "${user.role}" ✓` : 'field role tidak ditemukan (opsional)',
      });
    } catch {
      checks.push({
        name: 'Session user: data valid JSON', passed: false, detail: 'Gagal parse session JSON',
      });
    }
  } else {
    checks.push({
      name: 'Session user: data tersedia', passed: false, detail: 'Tidak ada session user di localStorage',
    });
  }

  // CHECK 2: Audit log sistem berjalan
  const auditLogs = localStorage.getItem('eduadmin_audit_logs_v1');
  checks.push({
    name:   'Audit log: storage key tersedia',
    passed: auditLogs !== null,
    detail: auditLogs
      ? `${JSON.parse(auditLogs).length} entri log tersimpan`
      : 'Belum ada log (normal jika aplikasi baru dijalankan)',
  });

  const allPassed = checks.every(c => c.passed);
  return { valid: allPassed, checks };
}

// =============================================================================
// ROLLBACK — Restore dari Backup
// Sumber: RINGKASAN_CHECKLIST.md § "6.1 Rollback Plan"
// =============================================================================

/**
 * Restore data dari backup yang tersimpan.
 * Setara dengan "Restore script" di § 6.1 Rollback Plan.
 * Estimasi rollback < 30 detik (sesuai target < 30 menit di dokumen).
 */
export function rollbackMigration(backupId: string): { success: boolean; message: string } {
  try {
    const backupRaw = localStorage.getItem(`${MIGRATION_BACKUP_KEY}_${backupId}`);
    if (!backupRaw) {
      return { success: false, message: `Backup "${backupId}" tidak ditemukan` };
    }

    const backup = JSON.parse(backupRaw);
    const snapshot = backup.snapshot as Record<string, string | null>;

    // Restore semua key dari snapshot
    Object.entries(snapshot).forEach(([key, value]) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    });

    _setMigrationStatus('rolled_back');
    _logMigration(`🔄 Rollback berhasil ke backup: ${backupId}`);

    return {
      success: true,
      message: `Rollback berhasil dari backup ${backupId} (${new Date(backup.timestamp).toLocaleString('id-ID')})`,
    };
  } catch (e) {
    return { success: false, message: `Rollback gagal: ${String(e)}` };
  }
}

// =============================================================================
// STATUS & LOG HELPERS
// =============================================================================

export function getMigrationStatus(): MigrationStatus {
  return (localStorage.getItem(MIGRATION_STATUS_KEY) as MigrationStatus) || 'not_started';
}

export function getMigrationLog(): string[] {
  try {
    const raw = localStorage.getItem(MIGRATION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Private helpers
function _setMigrationStatus(status: MigrationStatus): void {
  localStorage.setItem(MIGRATION_STATUS_KEY, status);
}

function _logMigration(message: string): void {
  try {
    const existing = getMigrationLog();
    existing.push(`[${new Date().toISOString()}] ${message}`);
    localStorage.setItem(MIGRATION_LOG_KEY, JSON.stringify(existing.slice(-500)));
  } catch { /* abaikan jika localStorage penuh */ }
}

function _saveMigrationResult(result: MigrationResult): void {
  try {
    localStorage.setItem('eduadmin_last_migration_result', JSON.stringify(result));
  } catch { /* abaikan */ }
}
