/**
 * Shared role mapping function — source of truth.
 * Sumber: PERJANJIAN_KERJA.md §3.2
 */
export function mapRoleToCode(role: string): string {
  const r = (role || '').toLowerCase().trim();
  if (r === 'admin' || r === 'super admin' || r === 'operator data') return 'admin';
  if (r === 'kurikulum' || r.includes('wakil kurikulum') || r.includes('waka kurikulum')) return 'kurikulum';
  if (r === 'ks' || r.includes('kepala sekolah') || r.includes('kepsek')) return 'ks';
  if (r === 'keuangan' || r.includes('bendahara')) return 'keuangan';
  if (r.includes('guru') || r === 'wk' || r === 'gm' || r.includes('wali kelas') || r.includes('guru kelas') || r.includes('guru mata pelajaran')) return 'guru';
  if (r === 'gb' || r.includes('bimbel') || r.includes('tentor')) return 'gb';
  return 'ortu';
}
