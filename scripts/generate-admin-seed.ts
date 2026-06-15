// scripts/generate-admin-seed.ts
// Usage: npx tsx scripts/generate-admin-seed.ts <email> <password>
// Example: npx tsx scripts/generate-admin-seed.ts admin@eduadmin.com MySecurePass123!
//
// Output: INSERT OR REPLACE statement with bcrypt hash, ready for D1

import bcrypt from 'bcryptjs';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/generate-admin-seed.ts <email> <password>');
    console.error('Example: npx tsx scripts/generate-admin-seed.ts admin@eduadmin.com MySecurePass123!');
    process.exit(1);
  }

  const [email, password] = args;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const id = `admin-${Date.now()}`;

  console.log(`-- Generated on ${new Date().toISOString()}`);
  console.log(`-- Run: wrangler d1 execute eduadmin_db --command="...");
  console.log();
  console.log(`INSERT OR REPLACE INTO profiles (id, email, full_name, password_hash, role, role_type, is_active) VALUES (`);
  console.log(`  '${id}',`);
  console.log(`  '${email}',`);
  console.log(`  'Super Administrator',`);
  console.log(`  '${hash}',`);
  console.log(`  'admin',`);
  console.log(`  'single',`);
  console.log(`  1`);
  console.log(`);`);
  console.log();
  console.log('-- Password has been hashed with bcrypt salt rounds=10');
  console.log('-- KEEP THIS OUTPUT SECURE - delete terminal history after use');
}

main().catch(console.error);
