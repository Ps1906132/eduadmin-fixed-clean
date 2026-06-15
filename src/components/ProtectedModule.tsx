/**
 * ProtectedModule Component - EduAdmin
 * Fase 2: Infrastructure Setup — Policy / Authorization Guard (Frontend)
 *
 * Referensi:
 *  - TEKNIS_DATABASE_CODE.md § "3. MIDDLEWARE" — handle() => response 403
 *  - KODE_SIAP_PAKAI.md § "3. AUTHORIZATION POLICY" (SchedulePolicy)
 *  - KODE_SIAP_PAKAI.md § "5. BLADE TEMPLATE" @can/@endcan
 *  - PERMISSION_MATRIX.md § "Scenario 4: Admin coba akses Jadwal di URL"
 *
 * Komponen ini membungkus modul dan menampilkan pesan 403 jika tidak ada izin.
 * TIDAK mengubah tampilan atau desain modul yang dilindungi.
 */

import React from 'react';
import { usePermissions } from '@/lib/rbac/usePermissions';
import type { AppModule, CrudAction, AdminRoleType } from '@/lib/rbac/types';

interface ProtectedModuleProps {
  /** Role user yang sedang login */
  userRole: AdminRoleType | string | undefined;
  /** ID user untuk audit log */
  userId?: string | number;
  /** Modul yang akan diakses */
  module: AppModule;
  /** Aksi minimal yang diperlukan (default: READ) */
  requiredAction?: CrudAction;
  /** Konten yang akan ditampilkan jika akses diizinkan */
  children: React.ReactNode;
}

/**
 * Guard komponen — membungkus modul dengan pengecekan permission.
 * Jika tidak ada izin, tampilkan halaman 403.
 * Jika ada izin, render children apa adanya (tanpa mengubah desain).
 *
 * Setara dengan Middleware handle() di TEKNIS_DATABASE_CODE.md
 */
const ProtectedModule: React.FC<ProtectedModuleProps> = ({
  userRole,
  userId,
  module,
  requiredAction = 'READ',
  children,
}) => {
  const { can } = usePermissions(userRole, userId);

  // Cek izin — log unauthorized sudah otomatis di dalam hook
  const isAllowed = can(module, requiredAction);

  if (!isAllowed) {
    return <UnauthorizedView module={module} userRole={userRole} />;
  }

  return <>{children}</>;
};

// =============================================================================
// UNAUTHORIZED VIEW (403)
// Sumber: PERMISSION_MATRIX.md § "Scenario 4: Admin coba akses Jadwal"
//         Response: "403 Forbidden — Anda tidak memiliki akses ke modul ini"
// Desain mengikuti style existing app (Tailwind classes dari DashboardSuperAdmin)
// =============================================================================

const UnauthorizedView: React.FC<{ module: string; userRole?: string }> = ({
  module,
  userRole,
}) => {
  const moduleLabel = module.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:      '60vh',
        padding:        '2rem',
        textAlign:      'center',
      }}
    >
      {/* Shield icon — tidak mengubah desain, inline SVG */}
      <div
        style={{
          width:           '80px',
          height:          '80px',
          borderRadius:    '50%',
          background:      '#FEF2F2',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    '1.5rem',
          border:          '2px solid #FECACA',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2
        style={{
          fontSize:     '1.5rem',
          fontWeight:   '700',
          color:        '#1E293B',
          marginBottom: '0.5rem',
        }}
      >
        403 — Akses Ditolak
      </h2>

      <p
        style={{
          color:        '#64748B',
          fontSize:     '1rem',
          marginBottom: '0.25rem',
        }}
      >
        Anda tidak memiliki akses ke modul{' '}
        <strong>{moduleLabel}</strong>.
      </p>

      {userRole && (
        <p
          style={{
            color:     '#94A3B8',
            fontSize:  '0.875rem',
            marginTop: '0.25rem',
          }}
        >
          Role Anda: <strong>{userRole}</strong>
        </p>
      )}

      <p
        style={{
          color:     '#94A3B8',
          fontSize:  '0.8rem',
          marginTop: '1rem',
        }}
      >
        Hubungi Administrator jika Anda merasa ini adalah kesalahan.
      </p>
    </div>
  );
};

export default ProtectedModule;
