## 🚀 D1 DATABASE QUICK START GUIDE

### Prerequisites
- [ ] Node.js 16+ installed
- [ ] Wrangler CLI installed (`npm install -g @cloudflare/wrangler`)
- [ ] Cloudflare account
- [ ] EduAdmin project cloned locally

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Create D1 Database
```bash
# Login to Cloudflare
wrangler login

# Create the database
wrangler d1 create eduadmin_db

# Copy the database_id from output
# Example output:
# ✅ Successfully created DB 'eduadmin_db'
#    database_id: 1c7f883c-5992-4f26-8245-b1ee2340b6d0
```

### Step 2: Update Configuration
Update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "eduadmin_db"
database_id = "YOUR-DATABASE-ID-HERE"  # Paste the ID from Step 1

[vars]
VITE_USE_D1 = "true"
JWT_SECRET = "your-super-secret-jwt-key-minimum-32-characters-long-please"
```

⚠️ **Important**: Use a strong random JWT_SECRET
```bash
# Generate a random JWT secret (on Mac/Linux)
openssl rand -base64 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Random]::new().GetBytes(32))
```

### Step 3: Deploy Schema to D1
```bash
# Apply the main schema
wrangler d1 execute eduadmin_db --file d1_schema.sql

# Apply migration/optimization script
wrangler d1 execute eduadmin_db --file d1_migration.sql

# Verify tables were created
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Step 4: Start Development Server
```bash
npm install
npm run dev

# Server should be running at http://localhost:3000
```

### Step 5: Test Admin Login

1. Open app in browser: `http://localhost:3000`
2. Login with:
   - Email: `admin@eduadmin.com`
   - Password: You need to set this first!

⚠️ **First Login**: The database has a placeholder admin user. To login:

**Option A: Set password via database**
```bash
# The admin user was created with a placeholder hash
# You can update it via SQL (in production, hash the password first)

# For development testing, you can reset the admin password
wrangler d1 execute eduadmin_db --command "UPDATE profiles SET password_hash = '\$2a\$10\$YourHashedPasswordHere' WHERE email='admin@eduadmin.com';"
```

**Option B: Create new admin user via API**
```bash
# First, get a token by logging in as any user
# Then create new admin via API endpoint

curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "admin-new",
    "email": "admin@eduadmin.com",
    "full_name": "Administrator",
    "password_hash": "$2a$10$...",
    "role": "admin",
    "is_active": 1
  }'
```

### Step 6: Verify Database Connection
```bash
# Check if tables exist
curl http://localhost:3000/api/diagnostic

# Should show JSON with all tables listed
```

---

## 🔄 MIGRATING DATA

### From localStorage (Browser)
```javascript
// Open browser console (F12) and paste:
const TOKEN = localStorage.getItem('eduadmin_token');
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

// Example: Migrate students
async function migrateStudents() {
  const students = JSON.parse(localStorage.getItem('students_data_v11') || '[]');
  if (students.length === 0) {
    console.log('No students to migrate');
    return;
  }
  
  const data = students.map(s => ({
    id: String(s.id),
    nis: s.nis,
    full_name: s.nama,
    gender: s.gender || null,
    birth_date: s.ttl?.split(', ')[1] || null,
    birth_place: s.ttl?.split(', ')[0] || null,
    parent_name: s.ayah || null,
    status: 'active',
    enrollment_date: new Date().toISOString().split('T')[0]
  }));
  
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: H,
    body: JSON.stringify(data)
  });
  
  const result = await res.json();
  console.log('Migration result:', result);
}

await migrateStudents();
```

### From Supabase Export
1. Export data from Supabase as JSON/CSV
2. Transform to match D1 schema
3. Insert via API or direct SQL

---

## 📊 DATABASE OPERATIONS

### View Database Contents
```bash
# List all tables
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Count records in table
wrangler d1 execute eduadmin_db --command "SELECT COUNT(*) FROM profiles;"

# View specific data
wrangler d1 execute eduadmin_db --command "SELECT id, email, role FROM profiles LIMIT 10;"
```

### Insert Sample Data
```bash
# Insert test student
wrangler d1 execute eduadmin_db --command "
INSERT INTO students (id, nis, full_name, gender, status, enrollment_date)
VALUES ('test-student-1', '20250001', 'Test Student', 'M', 'active', DATE('now'));
"

# Insert test class
wrangler d1 execute eduadmin_db --command "
INSERT INTO classes (id, name, grade_level, academic_year_id, capacity, is_active)
VALUES ('test-class', 'X-A', '10', 'ay-2025-2026', 35, 1);
"
```

### Backup Database
```bash
# Create backup
wrangler d1 backup database eduadmin_db

# List backups
wrangler d1 backup list --database=eduadmin_db

# Restore from backup (if needed)
wrangler d1 backup restore --database=eduadmin_db --backup-id=<backup-id>
```

---

## 🧪 TESTING API ENDPOINTS

### Get All Students
```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Student by ID
```bash
curl "http://localhost:3000/api/students?id=eq.student-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Insert New Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "student-999",
    "nis": "20250999",
    "full_name": "New Student",
    "gender": "F",
    "status": "active",
    "enrollment_date": "2025-07-01"
  }'
```

### Update Student
```bash
curl -X PATCH "http://localhost:3000/api/students?id=eq.student-999" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "Updated Name"
  }'
```

### Delete Student
```bash
curl -X DELETE "http://localhost:3000/api/students?id=eq.student-999" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 DEPLOYMENT

### Deploy to Cloudflare Pages
```bash
# Build the project
npm run build

# Deploy (requires wrangler.toml configured)
npm run deploy
# or
wrangler pages deploy dist/
```

### Environment Variables
Set in Cloudflare dashboard:
```
VITE_USE_D1 = true
JWT_SECRET = your-secret-key
```

### Monitor Performance
1. Visit Cloudflare Dashboard
2. Select Workers & Pages → D1
3. View query analytics and performance metrics

---

## 🔧 TROUBLESHOOTING

### "Table not found" Error
```bash
# Verify tables exist
wrangler d1 execute eduadmin_db --file d1_schema.sql

# Check specific table
wrangler d1 execute eduadmin_db --command "PRAGMA table_info(profiles);"
```

### "Unauthorized" Error
```javascript
// Check if token exists and is valid
console.log(localStorage.getItem('eduadmin_token'));

// Login to get new token
// Token expires after 24 hours
```

### "CORS" Issues
- D1 runs on same origin as app
- Check that API base URL is correct: `/api`
- Verify wrangler.toml has `compatibility_date = "2026-05-15"` or newer

### Database Locked
```bash
# SQLite locks can occur with concurrent writes
# Wait a moment and retry
# In production, use connection pooling

# Check if other processes are using the database
wrangler d1 execute eduadmin_db --command "PRAGMA integrity_check;"
```

### Slow Queries
```bash
# Check if indexes exist
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='index';"

# Reanalyze for query optimizer (monthly maintenance)
wrangler d1 execute eduadmin_db --command "ANALYZE;"
```

---

## 📈 MONITORING & MAINTENANCE

### Regular Maintenance
```bash
# Weekly: Analyze database
wrangler d1 execute eduadmin_db --command "ANALYZE;"

# Monthly: Vacuum to optimize
wrangler d1 execute eduadmin_db --command "VACUUM;"

# Daily: Check integrity
wrangler d1 execute eduadmin_db --command "PRAGMA integrity_check;"
```

### Monitor Query Performance
Queries are logged in audit_logs table:
```bash
wrangler d1 execute eduadmin_db --command "
SELECT module, action, COUNT(*) as count, AVG(timestamp) 
FROM audit_logs 
WHERE timestamp > datetime('now', '-1 day')
GROUP BY module, action;
"
```

---

## 📚 USEFUL LINKS

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [JWT Introduction](https://jwt.io/introduction)

---

## ✅ VERIFICATION CHECKLIST

Before going to production:

- [ ] Database created and schema applied
- [ ] Admin user created and can login
- [ ] All tables visible in `/api/diagnostic`
- [ ] Sample data can be inserted
- [ ] CRUD operations work via API
- [ ] Authentication/JWT working
- [ ] Audit logging capturing events
- [ ] Backup exists
- [ ] Environment variables set
- [ ] Performance acceptable
- [ ] Security headers configured

---

## 🎯 NEXT STEPS

1. **✅ Complete setup** using steps above
2. **📝 Customize** for your school:
   - Update school_settings table
   - Add subject groups and subjects
   - Create academic years
   - Set up schedule periods
3. **👥 Import users** and student data
4. **📅 Create classes** and schedules
5. **🔒 Configure roles** and permissions
6. **🧪 Test all features** thoroughly
7. **🚀 Deploy to production**
8. **📊 Monitor and optimize** performance

---

**Last Updated**: May 22, 2026  
**Version**: 1.0  
**Compatibility**: Node 16+, Cloudflare Workers, Wrangler 3+
