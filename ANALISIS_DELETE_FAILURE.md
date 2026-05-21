# ANALISIS: Penyebab Gagal Menghapus Data (Delete Class Failure Analysis)

## 🔴 ROOT CAUSE (Penyebab Utama)

### BACKEND API TIDAK BERJALAN ❌
```
Error: AggregateError [ECONNREFUSED]
Target: http://localhost:8788
```

**Penjelasan**: Aplikasi frontend (port 3000) mencoba menghubungi backend API (port 8788) tetapi backend **tidak running**.

---

## 📊 ARSITEKTUR KONEKSI SAAT INI

```
Browser (localhost:3000)
    ↓
[Vite Server - proxy]
    ↓
Mencari → http://localhost:8788 ❌ CONNECTION REFUSED
    ↓
Error: ECONNREFUSED
```

---

## 🔍 ENDPOINT YANG GAGAL

Semua API calls terblokir karena backend tidak tersedia:

```
❌ /api/students
❌ /api/classes
❌ /api/profiles
❌ /api/subject_groups
❌ /api/subjects
❌ /api/savings_accounts
❌ /api/savings_transactions
```

---

## 📍 LOKASI KODE DELETE FUNCTION

**File**: `components/DashboardSuperAdmin/hooks/useClasses.ts` (Line 119-157)

```typescript
const handleDeleteClass = async (id: string | number) => {
    if (!confirm("Hapus kelas ini?")) return;

    const originalClasses = classes;
    const updatedClasses = classes.filter(c => c.id !== id);
    setClasses(updatedClasses);

    try {
        const token = localStorage.getItem('eduadmin_token');
        const res = await fetch(`/api/classes?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            // ❌ MASALAH DI SINI: res.ok = false (API tidak terjangkau)
            const errorMsg = await res.text();
            setClasses(originalClasses);  // Rollback
            alert('Gagal menghapus kelas. Silakan coba lagi.');
            return;
        }
        
        localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
        fetchClasses();
    } catch (err) {
        setClasses(originalClasses);  // Rollback
        alert('Gagal menghapus kelas. Periksa koneksi internet Anda.');
    }
};
```

---

## 🎯 MASALAH CHECKBOX BROWSER

### Scenario yang dijelaskan user:
> "di saat centang kotak jangan izinkan localhost:3000, maka data akan kembali dan tidak bisa dihapus sama sekali"

### Apa yang terjadi:
1. Browser menampilkan dialog permission untuk localhost:3000
2. User mencentang: "Don't ask localhost:3000 again" ✓
3. Browser BLOCKS semua requests dari localhost:3000
4. **Akibatnya**: Data delete SELALU gagal (permanent block)

### Screenshot menunjukkan:
```
Dialog: "Gagal menghapus kelas. Silakan coba lagi."
Checkbox: "Jangan izinkan localhost:3000 menanyakan Anda lagi" ✓
```

Ketika checkbox ini dicentang, permission browser di-DENY, sehingga:
- ❌ Semua fetch requests diblokir oleh browser
- ❌ Tidak bisa DELETE
- ❌ Tidak bisa GET
- ❌ Data tertahan di optimistic state (tidak bisa rollback)

---

## 🔧 SOLUSI

### Solusi Segera (Immediate Fix)

#### 1. **JALANKAN BACKEND API**
```bash
# Terminal baru, jalankan Wrangler (backend API)
wrangler dev

# atau jika ada script di package.json:
npm run api:dev
```

**Konfigurasi proxy di `vite.config.ts`**:
```typescript
server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',  // ← Backend harus jalan di port ini
        changeOrigin: true,
        secure: false,
      }
    }
}
```

#### 2. **RESET BROWSER PERMISSIONS** (jika checkbox sudah dicentang)
Buka DevTools → Application → Cookies → localhost:3000 → Hapus semua permissions

**Atau**: Use Incognito Mode untuk test tanpa cached permissions

---

## 🛡️ PREVENTIVE IMPROVEMENTS

### Problem: Checkbox "Don't ask again" Memblocker Permanent

**Solusi**: Implementasi API Request Interceptor dengan fallback

```typescript
// Add to useClasses.ts - Better Error Handling
const handleDeleteClass = async (id: string | number) => {
    if (!confirm("Hapus kelas ini?")) return;

    const originalClasses = classes;
    const updatedClasses = classes.filter(c => c.id !== id);
    setClasses(updatedClasses);

    try {
        const token = localStorage.getItem('eduadmin_token');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(`/api/classes?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        
        localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
        fetchClasses();
        
    } catch (err: any) {
        setClasses(originalClasses);
        
        // Better error messaging
        if (err.name === 'AbortError') {
            alert('Backend tidak merespons. Pastikan Wrangler/API sedang berjalan di port 8788');
        } else if (err.message.includes('CORS') || err.message.includes('permission')) {
            alert('Browser permission blocked. Cek browser permissions untuk localhost:3000');
        } else {
            alert(`Gagal menghapus: ${err.message}`);
        }
        
        console.error('Delete error:', {
            error: err.message,
            type: err.name,
            apiTarget: 'http://localhost:8788'
        });
    }
};
```

---

## ✅ CHECKLIST UNTUK FIX

- [ ] **Jalankan Backend**: `wrangler dev` (port 8788)
- [ ] **Jalankan Frontend**: `npm run dev` (port 3000)
- [ ] **Reset Browser Permissions**: Open DevTools → Storage → Delete localhost:3000 permissions
- [ ] **Refresh Page**: Ctrl+Shift+R (hard refresh)
- [ ] **Test Delete**: Coba delete class lagi
- [ ] **Verify Terminal**: Pastikan tidak ada ECONNREFUSED errors

---

## 📋 STATUS KONDISI SAAT INI

| Komponen | Status | Action |
|----------|--------|--------|
| Vite Frontend (port 3000) | ✅ Running | - |
| Backend API (port 8788) | ❌ NOT RUNNING | Start Wrangler |
| API Proxy Config | ✅ Configured | - |
| Browser Permissions | ⚠️ May be blocked | Reset if needed |
| Delete Logic | ✅ Implemented | Awaits API |

---

## 🚀 LANJUTAN: OPTIONAL ENHANCEMENTS

### 1. **Offline Mode Support**
```typescript
// Allow delete in offline mode (local storage only)
const handleDeleteOffline = (id: string | number) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    localStorage.setItem('classes_data_v11', JSON.stringify(updated));
    alert('Kelas dihapus (mode offline). Akan tersinkronisasi saat API kembali.');
};
```

### 2. **API Status Checker**
```typescript
const checkAPIHealth = async () => {
    try {
        const res = await fetch('/api/classes?limit=1', { method: 'GET' });
        return res.ok;
    } catch {
        return false;
    }
};
```

### 3. **Remove "Don't Ask Again" Checkbox** (Security)
Better to show message every time than risk permanent blocks

---

## 📞 DEBUG COMMANDS

```bash
# Check if port 8788 is listening
netstat -ano | findstr :8788

# Check if port 3000 is listening
netstat -ano | findstr :3000

# Kill process on port 8788 if stuck
taskkill /PID <PID> /F

# Restart Wrangler
wrangler dev --port 8788
```

---

**Kesimpulan**: Backend API **HARUS berjalan** untuk delete functionality bekerja. Checkbox browser bisa memblok semua requests secara permanen - sebaiknya dihindari atau dihapus dari UI.
