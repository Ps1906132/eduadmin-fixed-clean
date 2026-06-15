import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCHEMA_FILE = join(__dirname, '..', 'd1_schema.sql');
const D1_SQL_DIR = join(__dirname, '..', 'd1_sql');

function extractTableNames(sql: string): string[] {
  const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi;
  const tables: string[] = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    tables.push(match[1].toLowerCase());
  }
  return [...new Set(tables)];
}

function extractTableNameFromFile(filePath: string): string | null {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
  return match ? match[1].toLowerCase() : null;
}

function main() {
  const schemaSql = readFileSync(SCHEMA_FILE, 'utf-8');
  const schemaTables = extractTableNames(schemaSql);

  const sqlFiles = readdirSync(D1_SQL_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const fileTables: string[] = [];
  const warnings: string[] = [];

  for (const file of sqlFiles) {
    const tableName = extractTableNameFromFile(join(D1_SQL_DIR, file));
    if (tableName) {
      fileTables.push(tableName);
    } else {
      warnings.push(`⚠️  Tidak ditemukan CREATE TABLE di ${file}`);
    }
  }

  const inSchemaOnly = schemaTables.filter(t => !fileTables.includes(t));
  const inFilesOnly = fileTables.filter(t => !schemaTables.includes(t));

  console.log('\n=== Validasi d1_schema.sql vs d1_sql/ ===\n');
  console.log(`Total tabel di d1_schema.sql: ${schemaTables.length}`);
  console.log(`Total tabel di d1_sql/ files:  ${fileTables.length}`);
  console.log();

  if (inSchemaOnly.length === 0) {
    console.log('✅ Semua tabel di d1_schema.sql memiliki file individual di d1_sql/');
  } else {
    console.log(`❌ Tabel berikut ADA di schema tapi TIDAK punya file di d1_sql/ (${inSchemaOnly.length}):`);
    for (const t of inSchemaOnly) {
      console.log(`   - ${t}`);
    }
  }

  console.log();

  if (inFilesOnly.length === 0) {
    console.log('✅ Semua file di d1_sql/ sesuai dengan tabel di d1_schema.sql');
  } else {
    console.log(`❌ Tabel berikut ADA di d1_sql/ tapi TIDAK ada di d1_schema.sql (${inFilesOnly.length}):`);
    for (const t of inFilesOnly) {
      console.log(`   - ${t}`);
    }
  }

  console.log();

  if (warnings.length > 0) {
    for (const w of warnings) {
      console.log(w);
    }
    console.log();
  }

  const success = inSchemaOnly.length === 0 && inFilesOnly.length === 0;
  process.exit(success ? 0 : 1);
}

main();
