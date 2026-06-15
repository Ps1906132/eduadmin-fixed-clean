import { useState, useEffect, FC } from 'react';
import { Shield, Search, Filter, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, User, Globe, Database } from 'lucide-react';

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_role: string | null;
  action: string;
  module: string;
  table_name: string | null;
  record_id: string | null;
  status: string;
  ip_address: string | null;
  error_message: string | null;
  timestamp: string;
}

interface AuditLogViewProps {
  onBack: () => void;
}

const AuditLogView: FC<AuditLogViewProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('eduadmin_token');
      const params = new URLSearchParams();
      params.set('order', 'timestamp');
      params.set('dir', 'desc');
      params.set('limit', '200');
      const res = await fetch(`/api/audit_logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    if (filterAction && log.action !== filterAction) return false;
    if (filterStatus && log.status !== filterStatus) return false;
    if (filterUser && !log.user_role?.toLowerCase().includes(filterUser.toLowerCase())) return false;
    return true;
  });

  const actions = [...new Set(logs.map(l => l.action))];
  const statuses = [...new Set(logs.map(l => l.status))];

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="text-green-500" />;
      case 'failed': return <XCircle size={14} className="text-red-500" />;
      case 'denied': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'rate_limited': return <Clock size={14} className="text-orange-500" />;
      case 'unauthorized': return <Shield size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Audit Log</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLogs} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={onBack} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Kembali
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-500"><Filter size={14} /> Filter:</div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Semua Aksi</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white">
          <option value="">Semua Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari role user..." value={filterUser} onChange={e => setFilterUser(e.target.value)} className="text-xs border border-gray-200 rounded pl-6 pr-2 py-1 bg-white w-40" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Memuat data audit log...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <Database size={32} className="mb-2" />
            <span className="text-sm">Belum ada data audit log</span>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-gray-500 uppercase tracking-wider">
                  <th className="p-3 font-semibold">Waktu</th>
                  <th className="p-3 font-semibold">Aksi</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Modul</th>
                  <th className="p-3 font-semibold">Tabel</th>
                  <th className="p-3 font-semibold">IP</th>
                  <th className="p-3 font-semibold">Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 whitespace-nowrap text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium">{log.action}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        {statusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-gray-600">
                      <span className="flex items-center gap-1"><User size={12} />{log.user_id || '-'}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">{log.user_role || '-'}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">{log.module || '-'}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-gray-500">{log.table_name || '-'}</td>
                    <td className="p-3 whitespace-nowrap text-gray-500">
                      <span className="flex items-center gap-1"><Globe size={12} />{log.ip_address || '-'}</span>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-gray-400 italic">{log.error_message || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-3 text-[10px] text-gray-400 text-right">
        Menampilkan {filteredLogs.length} dari {logs.length} entri
      </div>
    </div>
  );
};

export default AuditLogView;
