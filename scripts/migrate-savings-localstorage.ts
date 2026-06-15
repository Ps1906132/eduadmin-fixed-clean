/**
 * One-time migration script: localStorage savings → D1
 *
 * Cara pakai:
 * 1. Buka browser di halaman EduAdmin yang sudah login sebagai admin
 * 2. Buka DevTools Console (F12)
 * 3. Jalankan:
 *    const migrator = new SavingsMigrator();
 *    await migrator.migrate();
 *
 * Script ini membaca data dari localStorage dan mengirimnya ke API D1.
 * Setelah sukses, data localStorage akan dihapus.
 */

export class SavingsMigrator {
  private apiBase = '/api';

  private async getHeaders() {
    const token = localStorage.getItem('eduadmin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async migrate() {
    console.log('=== Migrasi Tabungan: localStorage → D1 ===\n');

    const rawSavings = localStorage.getItem('savings_data_v10');
    const rawTransactions = localStorage.getItem('savings_transactions_v10');

    if (!rawSavings && !rawTransactions) {
      console.log('Tidak ada data tabungan di localStorage. Tidak ada yang perlu dimigrasi.');
      return { success: true, message: 'No data to migrate' };
    }

    const savingsData = rawSavings ? JSON.parse(rawSavings) : [];
    const transactions = rawTransactions ? JSON.parse(rawTransactions) : [];

    console.log(`Ditemukan ${savingsData.length} akun tabungan dan ${transactions.length} transaksi.\n`);

    const headers = await this.getHeaders();
    let migratedAccounts = 0;
    let migratedTransactions = 0;
    const errors: string[] = [];

    // Step 1: Find or create savings_accounts
    for (const account of savingsData) {
      try {
        const studentRes = await fetch(`${this.apiBase}/students?nis=eq.${account.nis}`, { headers });
        const students = studentRes.ok ? await studentRes.json() : [];

        if (!students || students.length === 0) {
          errors.push(`Siswa dengan NIS ${account.nis} tidak ditemukan di D1. Lewati akun ${account.nama}.`);
          continue;
        }

        const student = students[0];
        const studentId = student.id;

        // Check if account already exists
        const accRes = await fetch(`${this.apiBase}/savings_accounts?student_id=eq.${studentId}`, { headers });
        const existingAcc = accRes.ok ? await accRes.json() : [];

        if (existingAcc && existingAcc.length > 0) {
          console.log(`Akun untuk ${account.nama} sudah ada di D1 (ID: ${existingAcc[0].id}). Lewati.`);
          migratedAccounts++;
          continue;
        }

        // Create account in D1
        const createRes = await fetch(`${this.apiBase}/savings_accounts`, {
          method: 'POST',
          headers,
          body: JSON.stringify([{
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            student_id: studentId,
            balance: account.saldo || 0,
            status: account.status === 'Nonaktif' ? 'inactive' : 'active',
          }]),
        });

        if (createRes.ok) {
          migratedAccounts++;
          console.log(`✓ Akun ${account.nama} (saldo: ${account.saldo}) berhasil dibuat.`);
        } else {
          errors.push(`Gagal membuat akun untuk ${account.nama}: ${createRes.status}`);
        }
      } catch (err: any) {
        errors.push(`Error migrasi akun ${account.nama}: ${err.message}`);
      }
    }

    // Step 2: Migrate transactions
    for (const tx of transactions) {
      try {
        const date = new Date(tx.date);
        const transactionDate = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();

        const createRes = await fetch(`${this.apiBase}/savings_transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify([{
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            student_id: tx.studentId || '',
            transaction_type: tx.type === 'Setor' ? 'deposit' : 'withdrawal',
            amount: tx.amount,
            description: tx.description || '',
            transaction_date: transactionDate,
            recorded_by: tx.officer || 'Sistem',
          }]),
        });

        if (createRes.ok) {
          migratedTransactions++;
        } else {
          errors.push(`Gagal migrasi transaksi #${tx.id}: ${createRes.status}`);
        }
      } catch (err: any) {
        errors.push(`Error migrasi transaksi #${tx.id}: ${err.message}`);
      }
    }

    console.log(`\n=== Hasil Migrasi ===`);
    console.log(`Akun: ${migratedAccounts}/${savingsData.length}`);
    console.log(`Transaksi: ${migratedTransactions}/${transactions.length}`);

    if (errors.length > 0) {
      console.log(`\nError (${errors.length}):`);
      errors.forEach(e => console.log(`  - ${e}`));
    }

    if (migratedAccounts === savingsData.length && migratedTransactions === transactions.length) {
      console.log('\n✅ Semua data berhasil dimigrasi!');
      console.log('Menghapus data localStorage...');
      localStorage.removeItem('savings_data_v10');
      localStorage.removeItem('savings_transactions_v10');
      console.log('Data localStorage dibersihkan.');
      return { success: true, message: `Migrated ${migratedAccounts} accounts and ${migratedTransactions} transactions` };
    } else {
      console.log('\n⚠️  Beberapa data gagal dimigrasi. Cek error di atas.');
      console.log('Data localStorage TIDAK dihapus.');
      return { success: false, message: `Partial migration: ${migratedAccounts}/${savingsData.length} accounts, ${migratedTransactions}/${transactions.length} transactions` };
    }
  }
}

// Auto-execute if run directly
declare const window: any;
if (typeof window !== 'undefined' && (window as any).SavingsMigrator === undefined) {
  (window as any).SavingsMigrator = SavingsMigrator;
  console.log('SavingsMigrator siap digunakan. Jalankan:');
  console.log('  const m = new SavingsMigrator();');
  console.log('  await m.migrate();');
}
