/**
 * usePermissions Hook - EduAdmin
 * Fase 2: Infrastructure Setup — Middleware / Authorization Layer (Frontend)
 *
 * Referensi:
 *  - TEKNIS_DATABASE_CODE.md § "3. MIDDLEWARE" (AdminMiddleware, KurikulumMiddleware, KeuanganMiddleware)
 *  - PERMISSION_MATRIX.md § "Principle of Least Privilege"
 *  - KODE_SIAP_PAKAI.md § "7. HELPER FUNCTIONS" (AuthHelper)
 *
 * Hook ini adalah implementasi frontend dari Middleware PHP yang ada di dokumen.
 * Tidak ada perubahan desain atau penambahan modul.
 */

import { useMemo, useCallback } from 'react';
import { hasPermission, getAccessibleModules, isModuleOwner, getOwnedModules } from './permissionMatrix';
import { logUnauthorizedAccess } from './auditLog';
import { mapRoleToCode } from './roleMapping';
import type { AdminRoleType, AppModule, CrudAction } from './types';

// =============================================================================
// UTILITY: getCurrentUserRole
// Get the current user's normalized role from localStorage.
// Used by hooks (useGrades, useSubjects, etc.) for permission checks outside React components.
// =============================================================================

export function getCurrentUserRole(): AdminRoleType {
  try {
    const saved = localStorage.getItem('eduadmin_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const role = parsed.roleCode || parsed.role || parsed.role_type || '';
      const normalized = mapRoleToCode(role);
      return normalized as AdminRoleType;
    }
  } catch (e) {
    console.warn('getCurrentUserRole: failed to parse user data', e);
  }
  return 'ortu' as AdminRoleType; // default fallback
}

// =============================================================================
// HOOK: usePermissions
// Setara dengan AdminMiddleware, KurikulumMiddleware, KeuanganMiddleware
// Sumber: TEKNIS_DATABASE_CODE.md § "3. MIDDLEWARE"
// =============================================================================

interface UsePermissionsReturn {
  /** Apakah user dapat melakukan aksi tertentu pada modul tertentu */
  can: (module: AppModule, action: CrudAction) => boolean;
  /** Apakah user adalah pemilik CRUD penuh dari modul ini */
  owns: (module: AppModule) => boolean;
  /** Daftar semua modul yang dapat diakses (minimal READ) */
  accessibleModules: AppModule[];
  /** Daftar modul dengan CRUD penuh milik role ini */
  ownedModules: AppModule[];
  /** Apakah role ini adalah admin */
  isAdmin: boolean;
  /** Apakah role ini adalah kurikulum */
  isKurikulum: boolean;
  /** Apakah role ini adalah keuangan */
  isKeuangan: boolean;
  /** Apakah role ini adalah kepala sekolah */
  isKS: boolean;
  /** Apakah role ini adalah guru bimbel */
  isGB: boolean;
}

/**
 * Hook utama untuk kontrol akses berbasis role.
 * Digunakan oleh komponen untuk cek izin sebelum render/aksi.
 *
 * Contoh penggunaan:
 *   const { can, owns } = usePermissions(userRole);
 *   if (can('jadwal', 'CREATE')) { ... }
 */
export function usePermissions(
  role: AdminRoleType | string | undefined,
  userId?: string | number
): UsePermissionsReturn {
  // Normalisasi role — hanya 3 role inti yang didukung
  const normalizedRole = _normalizeRole(role);

  const accessibleModules = useMemo(
    () => (normalizedRole ? getAccessibleModules(normalizedRole) : []),
    [normalizedRole]
  );

  const ownedModules = useMemo(
    () => (normalizedRole ? getOwnedModules(normalizedRole) : []),
    [normalizedRole]
  );

  /**
   * Cek izin untuk aksi tertentu pada modul tertentu.
   * Log aksi UNAUTHORIZED jika ditolak.
   * Sumber: TEKNIS_DATABASE_CODE.md - AdminMiddleware.handle()
   */
  const can = useCallback(
    (module: AppModule, action: CrudAction): boolean => {
      if (!normalizedRole) {
        logUnauthorizedAccess({
          user_id:   userId,
          user_role: role ?? 'unknown',
          module,
        });
        return false;
      }

      const allowed = hasPermission(normalizedRole, module, action);

      if (!allowed) {
        logUnauthorizedAccess({
          user_id:   userId,
          user_role: normalizedRole,
          module,
        });
      }

      return allowed;
    },
    [normalizedRole, userId, role]
  );

  /**
   * Cek apakah role adalah pemilik utama modul (CRUD penuh).
   * Sumber: PERMISSION_MATRIX.md - MODULE_OWNER
   */
  const owns = useCallback(
    (module: AppModule): boolean => {
      if (!normalizedRole) return false;
      return isModuleOwner(normalizedRole, module);
    },
    [normalizedRole]
  );

  return {
    can,
    owns,
    accessibleModules,
    ownedModules,
    isAdmin:     normalizedRole === 'admin',
    isKurikulum: normalizedRole === 'kurikulum',
    isKeuangan:  normalizedRole === 'keuangan',
    isKS:        normalizedRole === 'ks',
    isGB:        normalizedRole === 'gb',
  };
}

// =============================================================================
// UTILITY: normalizeRole
// Mengubah roleCode legacy ke AdminRoleType
// Sumber: App.tsx — role 'admin'|'kurikulum'|'keuangan' sudah sesuai
// =============================================================================

function _normalizeRole(role: string | undefined): AdminRoleType | null {
  if (!role) return null;
  const lowerRole = role.toLowerCase();
  
  // ADMIN: Managing Core Records (Siswa, Guru, Settings)
  if (
    lowerRole === 'admin' || 
    lowerRole === 'super admin' || 
    lowerRole === 'operator' || 
    lowerRole === 'operator data' || 
    lowerRole === 'multimedia'
  ) {
    return 'admin';
  }

  // KS (KEPALA SEKOLAH): READ ONLY
  if (
    lowerRole === 'ks' ||
    lowerRole.includes('kepala sekolah')
  ) {
    return 'ks';
  }

  // KURIKULUM: Managing Academic Data (Jadwal, Nilai, Rapot)
  if (
    lowerRole === 'kurikulum' || 
    lowerRole.includes('wakil kurikulum') || 
    lowerRole.includes('wakil kepala') ||
    lowerRole.includes('waka kurikulum')
  ) {
    return 'kurikulum';
  }

  // KEUANGAN: Managing Financial Data (Pembayaran, Tabungan)
  if (
    lowerRole === 'keuangan' || 
    lowerRole.includes('bendahara') || 
    lowerRole.includes('staf keuangan') ||
    lowerRole.includes('tata usaha') ||
    lowerRole.includes('staf tu')
  ) {
    return 'keuangan';
  }

  // GB (GURU BIMBEL): Managing Bimbel Data (Absensi, Progress, Materi)
  if (
    lowerRole === 'gb' ||
    lowerRole.includes('bimbel') ||
    lowerRole.includes('tentor')
  ) {
    return 'gb';
  }
  
  return null;
}
