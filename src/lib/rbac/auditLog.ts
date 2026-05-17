/**
 * Audit Log System - EduAdmin
 * Fase 2: Infrastructure Setup — Audit Log (setara Migration 2: Create Audit Logs Table)
 *
 * Referensi:
 *  - TEKNIS_DATABASE_CODE.md (Migration 2: Create Audit Logs Table)
 *  - PERMISSION_MATRIX.md § "6. AUDIT LOGGING REQUIREMENTS"
 *  - KODE_SIAP_PAKAI.md § "1. AUDIT LOG TRAIT (Reusable)"
 *
 * Implementasi frontend:
 *  - Menyimpan log ke localStorage (fallback jika API belum tersedia)
 *  - Mengirim log ke /api/audit_logs (ketika backend aktif)
 *  - Tidak menghapus log (immutable — sesuai dokumen)
 */

import type { AuditLogEntry, AuditAction, AuditStatus, AdminRoleType } from './types';
import type { AppModule } from './types';

const STORAGE_KEY = 'eduadmin_audit_logs_v1';
const API_ENDPOINT = '/api/audit_logs';

// =============================================================================
// AUDIT LOG WRITER
// Sumber: KODE_SIAP_PAKAI.md - AuditableTrait::logAudit()
// Sumber: PERMISSION_MATRIX.md - audit_logs table schema
// =============================================================================

/**
 * Tulis satu entri audit log.
 * Mengirim ke API (jika tersedia) dan menyimpan ke localStorage sebagai fallback.
 * Log bersifat IMMUTABLE — tidak ada fungsi delete.
 */
export async function writeAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
  };

  // Simpan ke localStorage (offline fallback)
  _saveToLocalStorage(logEntry);

  // Kirim ke API (async, tidak memblokir UI)
  _sendToApi(logEntry).catch(() => {
    // Gagal kirim API — sudah tersimpan di localStorage, tidak perlu throw
  });
}

/**
 * Buat audit log untuk aksi CRUD standar.
 * Digunakan oleh komponen/hooks saat melakukan operasi data.
 * Sumber: KODE_SIAP_PAKAI.md - AuditableTrait
 */
export function createAuditLog(params: {
  action: AuditAction;
  module: AppModule | string;
  table_name?: string;
  record_id?: string | number;
  user_id?: string | number;
  user_role: AdminRoleType | string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  status?: AuditStatus;
  error_message?: string;
}): void {
  writeAuditLog({
    action:        params.action,
    module:        params.module,
    table_name:    params.table_name,
    record_id:     params.record_id,
    user_id:       params.user_id,
    user_role:     params.user_role,
    old_values:    params.old_values ?? null,
    new_values:    params.new_values ?? null,
    status:        params.status ?? 'success',
    error_message: params.error_message,
  });
}

/**
 * Log aksi UNAUTHORIZED ACCESS.
 * Sumber: PERMISSION_MATRIX.md § "Scenario 4: Admin coba akses Jadwal di URL"
 *         PERMISSION_MATRIX.md § "AUDIT LOGGING REQUIREMENTS"
 */
export function logUnauthorizedAccess(params: {
  user_id?: string | number;
  user_role: AdminRoleType | string;
  module: AppModule | string;
}): void {
  writeAuditLog({
    action:    'UNAUTHORIZED',
    module:    params.module,
    user_id:   params.user_id,
    user_role: params.user_role,
    status:    'unauthorized',
    error_message: `Unauthorized access attempt to module: ${params.module}`,
  });
}

/**
 * Log aksi LOGIN / LOGOUT.
 * Sumber: PERMISSION_MATRIX.md § "Session Management"
 */
export function logAuthEvent(params: {
  action: 'LOGIN' | 'LOGOUT';
  user_id?: string | number;
  user_role: AdminRoleType | string;
}): void {
  writeAuditLog({
    action:    params.action,
    module:    'pengaturan', // session context
    user_id:   params.user_id,
    user_role: params.user_role,
    status:    'success',
  });
}

// =============================================================================
// AUDIT LOG READER (Admin only)
// Sumber: PERMISSION_MATRIX.md: "Only Admin bisa view logs"
// =============================================================================

/**
 * Ambil semua audit log dari localStorage.
 * Hanya dapat dipanggil oleh komponen Admin.
 */
export function getLocalAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Filter log berdasarkan role, modul, atau aksi.
 * Sumber: PERMISSION_MATRIX.md - "Logging Configuration per Role"
 */
export function filterAuditLogs(params: {
  user_role?: string;
  module?: string;
  action?: AuditAction;
  status?: AuditStatus;
  from?: string; // ISO date string
  to?: string;   // ISO date string
}): AuditLogEntry[] {
  let logs = getLocalAuditLogs();

  if (params.user_role) {
    logs = logs.filter((l) => l.user_role === params.user_role);
  }
  if (params.module) {
    logs = logs.filter((l) => l.module === params.module);
  }
  if (params.action) {
    logs = logs.filter((l) => l.action === params.action);
  }
  if (params.status) {
    logs = logs.filter((l) => l.status === params.status);
  }
  if (params.from) {
    logs = logs.filter((l) => l.timestamp && l.timestamp >= params.from!);
  }
  if (params.to) {
    logs = logs.filter((l) => l.timestamp && l.timestamp <= params.to!);
  }

  return logs;
}

// =============================================================================
// PRIVATE HELPERS
// =============================================================================

function _saveToLocalStorage(entry: AuditLogEntry): void {
  try {
    const existing = getLocalAuditLogs();
    // Immutable: hanya tambah, tidak hapus
    existing.push(entry);

    // Retensi: simpan maksimal 1000 entri terbaru di localStorage
    // Sumber: PERMISSION_MATRIX.md - Retention Policy
    const trimmed = existing.slice(-1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage mungkin penuh — abaikan agar tidak memblokir aplikasi
  }
}

async function _sendToApi(entry: AuditLogEntry): Promise<void> {
  // Coba kirim ke backend API (akan gagal jika backend belum tersedia)
  await fetch(API_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(entry),
  });
}
