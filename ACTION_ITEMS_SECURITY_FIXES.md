# 🔧 ACTION ITEMS - PERBAIKAN KODE

## PRIORITY 1: SECURITY FIXES (WAJIB)

---

### FIX #1: Remove Hardcoded Credentials dari Login.tsx

**CURRENT (WRONG):**
```typescript
// Login.tsx - Line 34
if (password === 'admin123' || password === 'admin') {
    // ❌ HARDCODED ADMIN CREDENTIALS
}

// Login.tsx - Line 67
if (studentAccount && (password === studentAccount.nis || password === '123456' || password === 'ortu123')) {
    // ❌ HARDCODED DEFAULT PASSWORDS
}

// Login.tsx - Line 117
if (import.meta.env.DEV && username === 'admin' && password === 'admin123') {
    // ❌ DEVELOPMENT ADMIN FALLBACK - REMOVE COMPLETELY
}
```

**CORRECTED:**
```typescript
// Login.tsx - Replace entire handleLegacyLogin function

const handleLegacyLogin = () => {
    // Hanya untuk DEMO/TESTING - buka hanya dengan explicit flag
    if (process.env.NODE_ENV !== 'development') {
        setError('Database tidak terhubung. Hubungi administrator.');
        setIsLoading(false);
        return;
    }

    // Fallback untuk development - REMOVE SEBELUM PRODUCTION
    console.warn('⚠️ Using development fallback - NOT FOR PRODUCTION');
    
    setError('Login failed. Please contact administrator.');
    setIsLoading(false);
};
```

---

### FIX #2: Setup Password Hashing

**INSTALL DEPENDENCY:**
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

**CREATE: utils/auth.ts**
```typescript
import bcrypt from 'bcryptjs';

/**
 * Hash password dengan bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Verify password
 * @param password Plain text password
 * @param hash Hashed password
 * @returns true if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * HANYA untuk development/testing
 * Generate temporary password
 * @returns Temporary password (20 chars)
 */
export function generateTempPassword(): string {
    // DO NOT USE IN PRODUCTION
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}
```

**UPDATE: components/Login.tsx**
```typescript
import { verifyPassword } from '../utils/auth';

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // Try D1 database login
        const response = await db.from('profiles')
            .select('*')
            .eq('email', username);

        if (response.data && response.data.length > 0) {
            const profile = response.data[0];
            
            // ✅ USE BCRYPT untuk verify
            const isValid = await verifyPassword(password, profile.password_hash);
            
            if (isValid) {
                onLogin(profile.role, {
                    id: profile.id,
                    nama: profile.full_name,
                    email: profile.email,
                    role: profile.role,
                });
                return;
            }
        }
        
        setError('Username atau password salah');
    } catch (error) {
        console.error('Login error:', error);
        setError('Terjadi kesalahan. Coba lagi.');
    } finally {
        setIsLoading(false);
    }
};
```

---

### FIX #3: Move GEMINI API Key to Backend

**CREATE: functions/api/gemini.ts (Backend)**
```typescript
// Backend endpoint - NOT exposed to client
export async function handleGeminiRequest(req: Request): Promise<Response> {
    // Get API key dari secure environment
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return new Response('API Key not configured', { status: 500 });
    }

    try {
        const body = await req.json();
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify(body)
        });

        return response;
    } catch (error) {
        return new Response('API Error', { status: 500 });
    }
}
```

**UPDATE: components/BelajarAISiswa.tsx (Frontend)**
```typescript
// ❌ BEFORE - API Key exposed
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    headers: {
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY  // ❌ EXPOSED
    }
});

// ✅ AFTER - Call backend
const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});
```

---

### FIX #4: Secure Database Queries

**CURRENT (WRONG): src/lib/db.ts**
```typescript
// ❌ NOT SANITIZED - SQL Injection Risk
const queryParams = `select=${selectColumns}`;
for (const [key, val] of Object.entries(filters)) {
    queryParams += `&${key}=${val}`;  // ❌ DANGEROUS
}
```

**CORRECTED:**
```typescript
// ✅ SAFE - Parameterized & Validated
const queryParams = new URLSearchParams();
queryParams.set('select', selectColumns);

for (const [key, val] of Object.entries(filters)) {
    // Validate key (whitelist approach)
    if (['eq', 'gt', 'lt', 'gte', 'lte'].includes(key)) {
        queryParams.set(key, String(val));
    }
}

const response = await fetch(`${API_BASE}/${table}?${queryParams.toString()}`);
```

---

### FIX #5: Remove Password from State/Props

**CURRENT (WRONG): DashboardSuperAdmin.tsx Line 631**
```typescript
// ❌ Password stored di state
const [newTutoringTeacher, setNewTutoringTeacher] = useState({
    name: '',
    source: 'internal',
    password: ''  // ❌ REMOVE
});

// ❌ Password exposed di render
<input 
    value={newTutoringTeacher.password}  // ❌ REMOVE
    onChange={(e) => setNewTutoringTeacher({...newTutoringTeacher, password: e.target.value})}
/>
```

**CORRECTED:**
```typescript
// ✅ Password handled di backend only
const [newTutoringTeacher, setNewTutoringTeacher] = useState({
    name: '',
    source: 'internal',
    // ❌ HAPUS password field
});

// Saat submit, backend generate password securely
const handleAddTutoringTeacher = async () => {
    try {
        const response = await fetch('/api/teachers/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTutoringTeacher)
            // ❌ JANGAN include password
        });
        
        const result = await response.json();
        // Backend return temporary password untuk diberi ke guru
        toast.success(`Guru berhasil ditambahkan. Password temporary: ${result.tempPassword}`);
    } catch (error) {
        setError('Gagal menambahkan guru');
    }
};
```

---

## PRIORITY 2: ERROR HANDLING & VALIDATION

### FIX #6: Add Proper Error Handling

**CREATE: utils/errorHandler.ts**
```typescript
export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof AuthenticationError) {
        return 'Username atau password salah';
    }
    if (error instanceof DatabaseError) {
        return 'Database error. Coba lagi nanti.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
}
```

**UPDATE: Login.tsx**
```typescript
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // ... login logic
    } catch (error) {
        // ✅ PROPER ERROR HANDLING
        const message = getErrorMessage(error);
        setError(message);
        
        // Log untuk debugging
        console.error('Login error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
            username: username  // ❌ JANGAN log password
        });
    } finally {
        setIsLoading(false);
    }
};
```

---

### FIX #7: Add Environment Validation

**UPDATE: vite.config.ts**
```typescript
import { defineConfig } from 'vite';

// ✅ Validate environment di build time
const validateEnv = () => {
    const requiredVars = ['VITE_API_URL'];  // ❌ REMOVE VITE_GEMINI_API_KEY
    
    if (process.env.NODE_ENV === 'production') {
        requiredVars.forEach(varName => {
            if (!process.env[varName]) {
                throw new Error(`Missing required environment variable: ${varName}`);
            }
        });
    }
};

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: false,  // ✅ Production tidak perlu sourcemap
        minify: 'terser',
    },
    // ... rest config
});
```

---

### FIX #8: Add CSRF Protection

**CREATE: utils/csrf.ts**
```typescript
/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

/**
 * Get CSRF token dari session
 */
export function getCsrfToken(): string | null {
    return sessionStorage.getItem('csrf_token');
}

/**
 * Set CSRF token (call di page load)
 */
export function initCsrfToken(): void {
    let token = getCsrfToken();
    if (!token) {
        token = generateCsrfToken();
        sessionStorage.setItem('csrf_token', token);
    }
}
```

**UPDATE: All Forms**
```typescript
// ✅ Add CSRF token ke semua form submissions
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const csrfToken = getCsrfToken();
    
    const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || ''  // ✅ Add CSRF token
        },
        body: JSON.stringify(data)
    });
};
```

---

## PRIORITY 3: PERFORMANCE OPTIMIZATION

### FIX #9: Code Splitting & Lazy Loading

**UPDATE: vite.config.ts**
```typescript
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    ui: ['lucide-react', 'framer-motion'],
                    // ✅ Split dashboard components
                    dashboards: [
                        'components/DashboardSuperAdmin',
                        'components/DashboardOrangTua',
                        'components/DashboardGuruMapel'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 500  // ✅ Warn jika > 500KB
    }
});
```

**CREATE: components lazy loading**
```typescript
// ✅ Lazy load dashboard components
import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

const DashboardSuperAdmin = lazy(() => import('./DashboardSuperAdmin'));
const DashboardOrangTua = lazy(() => import('./DashboardOrangTua'));

export function App() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            {activeTab === 'admin' && <DashboardSuperAdmin />}
            {activeTab === 'ortu' && <DashboardOrangTua />}
        </Suspense>
    );
}
```

---

## TESTING CHECKLIST

```bash
# 1. Build check
npm run build

# 2. Security audit
npm audit

# 3. Type checking
npx tsc --noEmit

# 4. Manual testing
npm run dev
# - Try login dengan berbagai username/password
# - Check browser DevTools (no API keys exposed)
# - Check Network tab (sensitive data)

# 5. Production build
npm run build
npm run preview
# - Test functionality
# - Check performance (load time)
# - Test all critical flows
```

---

## DEPLOYMENT CHECKLIST

```
Before deploy to production:

[ ] All PRIORITY 1 fixes applied
[ ] All PRIORITY 2 fixes applied  
[ ] npm audit passed
[ ] npm run build successful
[ ] npm run preview tested
[ ] .env.local NOT in git
[ ] Environment variables configured
[ ] Database migrations run
[ ] Backend endpoints deployed
[ ] API keys restricted (Google Console)
[ ] HTTPS enabled
[ ] Security headers configured
[ ] Monitoring setup
[ ] Error logging setup
[ ] Backup configured
```

---

**Generated:** May 16, 2026  
**For:** Pre-publication security fixes
**Next Step:** Apply Priority 1 fixes first
