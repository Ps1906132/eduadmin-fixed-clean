import { useState, useEffect, useCallback } from 'react';
import {
    SavingsData,
    SavingsTransaction
} from '../../../data/sharedData';

export type { SavingsData, SavingsTransaction };

export const useSavings = () => {
    const [loading, setLoading] = useState(false);

    const [savingsData, setSavingsData] = useState<SavingsData[]>([]);
    const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);

    const fetchSavingsData = useCallback(async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch students to map account names
            const resStudents = await fetch('/api/students', { headers });
            const students: any[] = resStudents.ok ? await resStudents.json() : [];
            const studentMap = new Map(students.map((s: any) => [s.id, s]));

            // Fetch classes to map classes
            const resClasses = await fetch('/api/classes', { headers });
            const classes: any[] = resClasses.ok ? await resClasses.json() : [];
            const classMap = new Map(classes.map((c: any) => [c.id, c.name]));

            // 1. Fetch Accounts
            let accounts: any[] = [];
            const resAccounts = await fetch('/api/savings_accounts', { headers });
            if (resAccounts.ok) {
                accounts = await resAccounts.json();
                const mappedData: SavingsData[] = accounts.map((a: any) => {
                    const student: any = studentMap.get(a.student_id) || {};
                    const className = student.class_id ? classMap.get(student.class_id) || '-' : '-';
                    return {
                        id: a.id,
                        studentId: a.student_id,
                        nis: student.nis || '',
                        nama: student.full_name || 'Siswa',
                        kelas: className,
                        saldo: a.balance,
                        status: a.is_active === 0 ? 'Nonaktif' : 'Aktif'
                    };
                });
                setSavingsData(mappedData);
            }

            // 2. Fetch Transactions
            const resTxs = await fetch('/api/savings_transactions', { headers });
            if (resTxs.ok) {
                const txs = await resTxs.json();
                const mappedTxs: SavingsTransaction[] = txs.map((t: any) => {
                    const account = accounts?.find((a: any) => a.id === t.account_id);
                    const student = account ? studentMap.get(account.student_id) || {} : {};
                    return {
                        id: t.id,
                        studentId: account?.student_id || '',
                        studentName: student.full_name || 'Siswa',
                        type: t.type === 'deposit' ? 'Setor' : 'Tarik',
                        amount: t.amount,
                        balanceAfter: t.balance_after || 0,
                        date: t.date || new Date().toISOString(),
                        description: t.notes || '',
                        officer: t.officer || 'Sistem'
                    };
                });
                setSavingsTransactions(mappedTxs);
            }
        } catch (err) {
            // Silent fail - data will show empty state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavingsData();
    }, [fetchSavingsData]);

    const addSavingsTransaction = async (transaction: any) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            // Find or create account first
            let accountId = transaction.accountId;
            let currentBalance = 0;
            
            if (!accountId) {
                const resAcc = await fetch(`/api/savings_accounts?student_id=eq.${transaction.studentId}`, { headers });
                const accs = resAcc.ok ? await resAcc.json() : [];
                if (accs.length > 0) {
                    accountId = accs[0].id;
                    currentBalance = accs[0].balance || 0;
                } else {
                    // Create account
                    const resNew = await fetch('/api/savings_accounts', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ student_id: transaction.studentId, balance: 0, is_active: 1 })
                    });
                    if (resNew.ok) {
                        const newAcc = await resNew.json();
                        accountId = newAcc.id || transaction.studentId;
                        currentBalance = 0;
                    }
                }
            } else {
                // Get current balance for existing account
                const resAcc = await fetch(`/api/savings_accounts?id=eq.${accountId}`, { headers });
                const acc = resAcc.ok ? (await resAcc.json())[0] : null;
                currentBalance = acc ? acc.balance || 0 : 0;
            }

            // Calculate new balance
            const newBalance = transaction.type === 'setor' 
                ? currentBalance + transaction.amount 
                : currentBalance - transaction.amount;

            const res = await fetch('/api/savings_transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    account_id: accountId,
                    student_id: transaction.studentId,
                    type: transaction.type === 'setor' ? 'deposit' : 'withdrawal',
                    amount: transaction.amount,
                    balance_after: newBalance,
                    date: transaction.date || new Date().toISOString(),
                    notes: transaction.description,
                    officer: transaction.officer || 'Sistem'
                })
            });

            if (res.ok) {
                // Update balance in savings_accounts table
                await fetch(`/api/savings_accounts?id=eq.${accountId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ balance: newBalance })
                });

                fetchSavingsData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan transaksi tabungan' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    return {
        savingsData,
        setSavingsData,
        savingsTransactions,
        setSavingsTransactions,
        addSavingsTransaction,
        refreshSavings: fetchSavingsData
    };
};
