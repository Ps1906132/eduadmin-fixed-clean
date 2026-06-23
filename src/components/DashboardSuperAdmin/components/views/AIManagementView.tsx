import { useState, useEffect, FC } from 'react';
import { Plus, Edit, Trash2, Key, Settings, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { db, isConfigured as isDbConfigured, getConfigError } from '@/lib/db';

const getUserId = (): string | null => {
  try {
    const raw = localStorage.getItem('eduadmin_user');
    if (!raw) return null;
    return JSON.parse(raw).id || null;
  } catch { return null; }
};

interface AIManagementProvider {
  id: string;
  name: string;
  provider_type: string;
  model_name: string;
  description: string;
  is_active: boolean;
  max_tokens: number;
  temperature: number;
}

interface APIKey {
  id: string;
  provider_id: string;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface AIManagementViewProps {
  onBack: () => void;
}

const AIManagementView: FC<AIManagementViewProps> = ({ onBack }) => {
  const [providers, setProviders] = useState<AIManagementProvider[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'providers' | 'keys' | 'settings'>('providers');

  // Modal states
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIManagementProvider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  // Form states
  const [providerForm, setProviderForm] = useState({
    name: '',
    provider_type: 'gemini' as const,
    model_name: '',
    description: '',
    max_tokens: 4096,
    temperature: 0.7
  });

  const [keyForm, setKeyForm] = useState({
    api_key: '',
    expires_at: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isDbConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [providersRes, keysRes] = await Promise.all([
        db.from('ai_providers').select('*').order('name'),
        db.from('ai_api_keys').select('*').order('created_at', { ascending: false })
      ]);

      if (providersRes.error) throw providersRes.error;
      if (keysRes.error) throw keysRes.error;

      setProviders((providersRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        provider_type: p.type,
        model_name: p.model_name || '',
        description: p.description || '',
        is_active: !!p.is_active,
        max_tokens: p.max_tokens || 4096,
        temperature: p.temperature ?? 0.7
      })));
      setApiKeys(keysRes.data || []);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    try {
      const payload = {
        id: 'ai-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        name: providerForm.name,
        type: providerForm.provider_type,
        is_active: 1
      };
      const { data, error } = await (db
        .from('ai_providers')
        .insert([payload])
        .select() as any);

      if (error) throw error;

      setProviders([...providers, ...data]);
      setShowAddProvider(false);
      resetProviderForm();
    } catch (error) {
      console.error('Error adding provider:', error);
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;

    try {
      const payload = {
        name: providerForm.name,
        type: providerForm.provider_type,
        is_active: editingProvider.is_active ? 1 : 0
      };
      const { data, error } = await (db
        .from('ai_providers')
        .update(payload)
        .eq('id', editingProvider.id) as any);

      if (error) throw error;

      setProviders(providers.map(p => p.id === editingProvider.id ? data[0] : p));
      setEditingProvider(null);
      resetProviderForm();
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const handleToggleProvider = async (providerId: string, isActive: boolean) => {
    try {
      const { error } = await (db
        .from('ai_providers')
        .update({ is_active: !isActive })
        .eq('id', providerId) as any);

      if (error) throw error;

      setProviders(providers.map(p =>
        p.id === providerId ? { ...p, is_active: !isActive } : p
      ));
    } catch (error) {
      console.error('Error toggling provider:', error);
    }
  };

  const handleAddApiKey = async () => {
    try {
      const payload = {
        id: 'key-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        provider_id: selectedProvider,
        api_key: keyForm.api_key,
        is_active: 1,
        created_by: getUserId()
      };
      const { data, error } = await (db
        .from('ai_api_keys')
        .insert([payload])
        .select() as any);

      if (error) throw error;

      setApiKeys([...data, ...apiKeys]);
      setShowAddKey(false);
      resetKeyForm();
    } catch (error) {
      console.error('Error adding API key:', error);
    }
  };

  const handleToggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await (db
        .from('ai_api_keys')
        .update({ is_active: !isActive })
        .eq('id', keyId) as any);

      if (error) throw error;

      setApiKeys(apiKeys.map(k =>
        k.id === keyId ? { ...k, is_active: !isActive } : k
      ));
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus API key ini?')) return;

    try {
      const { error } = await (db
        .from('ai_api_keys')
        .delete()
        .eq('id', keyId) as any);

      if (error) throw error;

      setApiKeys(apiKeys.filter(k => k.id !== keyId));
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      provider_type: 'gemini',
      model_name: '',
      description: '',
      max_tokens: 4096,
      temperature: 0.7
    });
  };

  const resetKeyForm = () => {
    setKeyForm({
      api_key: '',
      expires_at: ''
    });
    setSelectedProvider('');
  };

  const startEditProvider = (provider: AIManagementProvider) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name,
      provider_type: provider.provider_type as any,
      model_name: provider.model_name,
      description: provider.description,
      max_tokens: provider.max_tokens,
      temperature: provider.temperature
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen AI</h2>
          <p className="text-gray-600">Kelola provider AI dan API keys</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      {!isDbConfigured() && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-bold text-amber-900 mb-2">Database Belum Terhubung</h3>
          <p className="text-amber-700 max-w-md mb-4">
            {getConfigError() || 'Koneksi ke D1 API gagal.'}
          </p>
          <div className="bg-white p-4 rounded-xl border border-amber-100 text-sm text-left w-full max-w-md">
            <p className="font-bold mb-2">Cara Memperbaiki:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Pastikan file <code className="bg-gray-100 px-1 rounded">.env</code> sudah ada</li>
              <li>Periksa koneksi internet Anda</li>
              <li>Pastikan backend proxy di <code className="bg-gray-100 px-1 rounded">/api</code> berjalan</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'providers', label: 'Provider AI', icon: Settings },
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'settings', label: 'Pengaturan', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="py-4">
          {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Provider AI</h3>
            <button
              onClick={() => setShowAddProvider(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Provider
            </button>
          </div>

          <div className="grid gap-4">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${provider.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                      <p className="text-xs text-gray-500">Model: {provider.model_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleProvider(provider.id, provider.is_active)}
                      className={`p-1 rounded ${provider.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      {provider.is_active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => startEditProvider(provider)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">API Keys</h3>
            <button
              onClick={() => setShowAddKey(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Tambah API Key
            </button>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((key) => {
              const provider = providers.find(p => p.id === key.provider_id);
              return (
                <div key={key.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-semibold">{provider?.name || 'Unknown Provider'}</h4>
                        <p className="text-sm text-gray-600">
                          Digunakan: {key.usage_count}x |
                          Status: {key.is_active ? 'Aktif' : 'Non-aktif'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dibuat: {new Date(key.created_at).toLocaleDateString('id-ID')}
                          {key.last_used_at && ` | Terakhir digunakan: ${new Date(key.last_used_at).toLocaleDateString('id-ID')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleApiKey(key.id, key.is_active)}
                        className={`p-1 rounded ${key.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        {key.is_active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pengaturan Sistem AI</h3>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600">Pengaturan sistem AI akan ditambahkan di sini.</p>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Add Provider Modal */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProvider ? 'Edit Provider' : 'Tambah Provider AI'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Provider</label>
                <input
                  type="text"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Google Gemini 1.5 Flash"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Provider</label>
                <select
                  value={providerForm.provider_type}
                  onChange={(e) => setProviderForm({ ...providerForm, provider_type: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="socratic">Socratic by Google</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model Name</label>
                <input
                  type="text"
                  value={providerForm.model_name}
                  onChange={(e) => setProviderForm({ ...providerForm, model_name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., gemini-1.5-flash"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={providerForm.description}
                  onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Deskripsi provider..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={editingProvider ? handleUpdateProvider : handleAddProvider}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingProvider ? 'Update' : 'Tambah'}
              </button>
              <button
                onClick={() => {
                  setShowAddProvider(false);
                  setEditingProvider(null);
                  resetProviderForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add API Key Modal */}
      {showAddKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="password"
                  value={keyForm.api_key}
                  onChange={(e) => setKeyForm({ ...keyForm, api_key: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Masukkan API key..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Kadaluarsa (Opsional)</label>
                <input
                  type="datetime-local"
                  value={keyForm.expires_at}
                  onChange={(e) => setKeyForm({ ...keyForm, expires_at: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddApiKey}
                disabled={!selectedProvider || !keyForm.api_key}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tambah API Key
              </button>
              <button
                onClick={() => {
                  setShowAddKey(false);
                  resetKeyForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIManagementView;