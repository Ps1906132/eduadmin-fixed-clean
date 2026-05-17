/**
 * RBAC Module Index (Barrel Export)
 * Fase 1 & 2: EduAdmin Permission System
 *
 * Referensi: TEKNIS_DATABASE_CODE.md, PERMISSION_MATRIX.md, KODE_SIAP_PAKAI.md
 */

// Types (Fase 1 — setara role_type migration)
export type {
  AdminRoleType,
  AllRoleType,
  CrudAction,
  AppModule,
  AdminModule,
  KurikulumModule,
  KeuanganModule,
  ModulePermission,
  EduAdminUser,
  AuditLogEntry,
  AuditAction,
  AuditStatus,
} from './types';

// Permission Matrix (Fase 1 — setara tabel PERMISSION_MATRIX.md)
export {
  PERMISSION_MATRIX,
  MODULE_OWNER,
  hasPermission,
  getAccessibleModules,
  isModuleOwner,
  getOwnedModules,
} from './permissionMatrix';

// Audit Log (Fase 2 — setara Migration 2: audit_logs table)
export {
  writeAuditLog,
  createAuditLog,
  logUnauthorizedAccess,
  logAuthEvent,
  getLocalAuditLogs,
  filterAuditLogs,
} from './auditLog';

// Permission Hook (Fase 2 — setara Middleware)
export { usePermissions } from './usePermissions';

// Migration Utility (Fase 6 — Data Migration)
export {
  backupCurrentData,
  verifyBackup,
  migrateUserRoleType,
  verifyMigration,
  rollbackMigration,
  getMigrationStatus,
  getMigrationLog,
} from './migration';
export type { MigrationStatus, MigrationResult } from './migration';
