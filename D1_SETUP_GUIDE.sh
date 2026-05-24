#!/bin/bash
# ========================================
# D1 SETUP & MIGRATION GUIDE
# Cloudflare D1 Database Setup Script
# ========================================

echo "🔧 EduAdmin D1 Setup Script"
echo "=========================================="

# ========================================
# STEP 1: CREATE D1 DATABASE (if not exists)
# ========================================

echo ""
echo "📦 Step 1: Creating D1 database..."
echo ""
echo "Run this command in your terminal:"
echo ""
echo "  wrangler d1 create eduadmin_db"
echo ""
echo "Then copy the database_id from the output and update wrangler.toml:"
echo ""
echo "  [[d1_databases]]"
echo "  binding = \"DB\""
echo "  database_name = \"eduadmin_db\""
echo "  database_id = \"YOUR-DATABASE-ID-HERE\""
echo ""

# ========================================
# STEP 2: APPLY SCHEMA
# ========================================

echo ""
echo "📋 Step 2: Applying schema to D1..."
echo ""
echo "Run this command:"
echo ""
echo "  wrangler d1 execute eduadmin_db --file d1_schema.sql"
echo ""
echo "Or via HTTP (from browser console after login as admin):"
echo ""

cat << 'EOF'
const TOKEN = localStorage.getItem('eduadmin_token');
const SCHEMA = `[PASTE ENTIRE d1_schema.sql CONTENT HERE]`;
const statements = SCHEMA.split(';').filter(s => s.trim());

for (const stmt of statements) {
  if (stmt.trim()) {
    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ sql: stmt.trim() })
      });
      const result = await res.json();
      console.log('✅', stmt.substring(0, 50) + '...', result);
    } catch(e) {
      console.error('❌', stmt.substring(0, 50) + '...', e.message);
    }
  }
}
EOF

echo ""

# ========================================
# STEP 3: VERIFY SCHEMA
# ========================================

echo ""
echo "✅ Step 3: Verify schema was created..."
echo ""
echo "Visit: http://localhost:3000/api/diagnostic"
echo ""
echo "You should see all tables listed with their column information."
echo ""

# ========================================
# STEP 4: SEED DATA (OPTIONAL)
# ========================================

echo ""
echo "🌱 Step 4: Seed initial data (OPTIONAL)..."
echo ""
echo "The schema.sql includes default data for:"
echo "  - Admin user: admin@eduadmin.com"
echo "  - Academic years: 2025/2026 S1 & S2"
echo ""
echo "To add more seed data, create a separate file: d1_seed_data.sql"
echo ""

# ========================================
# STEP 5: MIGRATE FROM SUPABASE/LOCALSTORAGE
# ========================================

echo ""
echo "📤 Step 5: Migrate existing data..."
echo ""
echo "Option A: From localStorage (Browser Console)"
echo "  - Open app in browser and login as admin"
echo "  - Run this in browser console:"
echo ""

cat << 'EOF'
const TOKEN = localStorage.getItem('eduadmin_token');
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

async function migrateData() {
  console.log('Starting migration...');
  
  // 1. Migrate Students
  const students = JSON.parse(localStorage.getItem('students_data_v11') || '[]');
  if (students.length > 0) {
    const res = await fetch('/api/students', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(students.map(s => ({
        id: String(s.id),
        nis: s.nis,
        full_name: s.nama,
        gender: s.gender || null,
        birth_date: s.ttl?.split(', ')[1] || null,
        birth_place: s.ttl?.split(', ')[0] || null,
        parent_name: s.ayah || null,
        status: 'active',
        enrollment_date: new Date().toISOString().split('T')[0]
      }))
    });
    console.log(`✅ Students migrated:`, await res.json());
  }

  // 2. Migrate Teachers/Staff
  const teachers = JSON.parse(localStorage.getItem('teachers_data_v11') || '[]');
  if (teachers.length > 0) {
    const res = await fetch('/api/profiles', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(teachers.map(t => ({
        id: String(t.id),
        email: t.email || `${t.username}@eduadmin.com`,
        full_name: t.nama,
        role: t.role || 'gm',
        is_active: 1
      }))
    });
    console.log(`✅ Teachers migrated:`, await res.json());
  }

  // 3. Migrate Classes
  const classes = JSON.parse(localStorage.getItem('classes_data_v11') || '[]');
  if (classes.length > 0) {
    const res = await fetch('/api/classes', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(classes.map(c => ({
        id: String(c.id),
        name: c.nama,
        grade_level: c.tingkat || '10',
        academic_year_id: 'ay-2025-2026',
        is_active: 1
      }))
    });
    console.log(`✅ Classes migrated:`, await res.json());
  }

  // 4. Migrate Student Bills
  const bills = JSON.parse(localStorage.getItem('finance_student_bills_v10') || '[]');
  if (bills.length > 0) {
    const res = await fetch('/api/student_bills', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(bills.map(b => ({
        id: String(b.id),
        student_id: String(b.studentId),
        payment_name: b.paymentName,
        amount: b.amount,
        period: b.period,
        status: b.status,
        type: b.type || 'BULANAN'
      }))
    });
    console.log(`✅ Bills migrated:`, await res.json());
  }

  // 5. Migrate Savings Accounts
  const savings = JSON.parse(localStorage.getItem('savings_data_v10') || '[]');
  if (savings.length > 0) {
    const res = await fetch('/api/savings_accounts', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(savings.map(s => ({
        id: String(s.id || `sav-${s.studentId}`),
        student_id: String(s.studentId),
        balance: s.balance || s.saldo || 0
      }))
    });
    console.log(`✅ Savings migrated:`, await res.json());
  }

  // 6. Migrate Announcements
  const announcements = JSON.parse(localStorage.getItem('announcements_data_v10') || '[]');
  if (announcements.length > 0) {
    const res = await fetch('/api/announcements', { 
      method: 'POST', 
      headers: H,
      body: JSON.stringify(announcements.map(a => ({
        id: String(a.id),
        title: a.title,
        content: a.content || '',
        category: a.category,
        target: a.target || 'all',
        status: a.status || 'Draft',
        viewers: a.viewers || 0,
        created_by: 'admin-001'
      }))
    });
    console.log(`✅ Announcements migrated:`, await res.json());
  }

  console.log('🎉 Migration complete!');
}

await migrateData();
EOF

echo ""
echo ""

# ========================================
# STEP 6: CONFIGURE ENVIRONMENT
# ========================================

echo "⚙️ Step 6: Configure environment variables..."
echo ""
echo "Add these to wrangler.toml [vars] section:"
echo ""
echo "  VITE_USE_D1 = \"true\""
echo "  JWT_SECRET = \"your-super-secret-jwt-key-min-32-chars\""
echo ""

# ========================================
# STEP 7: TEST CONNECTION
# ========================================

echo ""
echo "🧪 Step 7: Test D1 connection..."
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Open app in browser and login as admin"
echo ""
echo "3. Check console for any errors"
echo ""
echo "4. Visit: http://localhost:3000/api/diagnostic"
echo ""

# ========================================
# STEP 8: BACKUP & PRODUCTION READY
# ========================================

echo ""
echo "💾 Step 8: Backup before deploying to production..."
echo ""
echo "Backup your D1 database:"
echo "  wrangler d1 backup database eduadmin_db"
echo ""
echo "Download backup from Cloudflare dashboard:"
echo "  https://dash.cloudflare.com/"
echo ""

# ========================================
# TROUBLESHOOTING
# ========================================

echo ""
echo "🔧 TROUBLESHOOTING TIPS"
echo "=========================================="
echo ""
echo "❓ Error: Table not found"
echo "   ✓ Run: wrangler d1 execute eduadmin_db --file d1_schema.sql"
echo "   ✓ Verify: /api/diagnostic endpoint shows all tables"
echo ""
echo "❓ Error: Unauthorized - Missing token"
echo "   ✓ Make sure you're logged in"
echo "   ✓ Check localStorage has 'eduadmin_token'"
echo ""
echo "❓ Error: JWT_SECRET not set"
echo "   ✓ Add JWT_SECRET to wrangler.toml [vars]"
echo "   ✓ Use a random 32+ character string"
echo ""
echo "❓ Migration data not appearing"
echo "   ✓ Check browser console for fetch errors"
echo "   ✓ Verify Authorization header is sent"
echo "   ✓ Check API response status codes"
echo ""
echo "❓ Performance issues"
echo "   ✓ Check indexes are created: /api/diagnostic"
echo "   ✓ Monitor query performance in audit_logs"
echo "   ✓ Review D1 analytics in Cloudflare dashboard"
echo ""

# ========================================
# NEXT STEPS
# ========================================

echo ""
echo "📋 NEXT STEPS"
echo "=========================================="
echo ""
echo "1. ✅ Run setup steps 1-7 above"
echo "2. 📝 Update auth handling in functions/api/[[path]].ts"
echo "3. 🔒 Implement role-based access control (RBAC)"
echo "4. 📊 Add audit logging for all operations"
echo "5. 🚀 Deploy to Cloudflare Workers/Pages"
echo "6. 📈 Monitor performance and logs"
echo "7. 🔄 Schedule regular backups"
echo ""

echo "=========================================="
echo "✨ D1 Setup Complete!"
echo "=========================================="
