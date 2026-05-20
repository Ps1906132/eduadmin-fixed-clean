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
            const students = resStudents.ok ? await resStudents.json() : [];
            const studentMap = new Map((students || []).map((s: any) => [s.id, s]));

            // Fetch classes to map classes
            const resClasses = await fetch('/api/classes', { headers });
            const classes = resClasses.ok ? await resClasses.json() : [];
            const classMap = new Map((classes || []).map((c: any) => [c.id, c.name]));

            // 1. Fetch Accounts
            let accounts: any[] = [];
            const resAccounts = await fetch('/api/savings_accounts', { headers });
            if (resAccounts.ok) {
                accounts = await resAccounts.json();
                const mappedData: SavingsData[] = accounts.map((a: any) => {
                    const student = studentMap.get(a.student_id) || {};
                    const className = student.class_id ? classMap.get(student.class_id) || '-' : '-';
                    return {
                        id: a.id,
                        studentId: a.student_id,
                        studentName: student.full_name || 'Siswa',
                        class: className,
                        balance: a.balance
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
                        type: t.type === 'deposit' ? 'setor' : 'tarik',
                        amount: t.amount,
                        date: t.date || new Date().toISOString(),
                        description: t.notes || ''
                    };
                });
                setSavingsTransactions(mappedTxs);
            }
        } catch (err) {
            console.error('Error fetching savings from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavingsData();
    }, [fetchSavingsData]);

    // Sync back to Local Storage & D1 in background


    return {
        savingsData,
        setSavingsData,
        savingsTransactions,
        setSavingsTransactions,
        refreshSavings: fetchSavingsData
    };
};
