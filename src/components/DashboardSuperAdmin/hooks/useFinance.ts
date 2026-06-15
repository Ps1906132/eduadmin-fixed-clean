import { useState, useEffect, useCallback } from 'react';
import { schoolSettingsGlobal } from '../../../data/sharedData';

export interface CashAccount {
    id: number;
    name: string;
    type: 'KAS' | 'BANK';
    balance: number;
    isPrimary: boolean;
    number: string;
}

export interface PaymentType {
    id: number;
    name: string;
    type: 'BULANAN' | 'SEKALI' | 'TAHUNAN';
    amount: number;
    category: string;
}

export interface StudentBill {
    id: number | string;
    studentId: number | string;
    studentName: string;
    class: string;
    paymentName: string;
    amount: number;
    period: string;
    status: string;
    dueDate?: string;
    type?: string;
}

export interface Expense {
    id: number | string;
    date: string;
    description: string;
    category: string;
    amount: number;
    proof: string;
}

const initialPaymentTypes: PaymentType[] = [];

export const useFinance = () => {
    const [financialYear, setFinancialYear] = useState(schoolSettingsGlobal.academicYear || '2025/2026');
    const [loading, setLoading] = useState(false);

    // State diisi oleh fetchFinanceData() saat mount
    const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>(initialPaymentTypes);
    const [studentBills, setStudentBills] = useState<StudentBill[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    const fetchFinanceData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch students to map bills
            const resStudents = await fetch('/api/students', { headers });
            const students = resStudents.ok ? await resStudents.json() : [];
            const studentMap = new Map((students || []).map((s: any) => [s.id, s]));

            // Fetch classes to map classes
            const resClasses = await fetch('/api/classes', { headers });
            const classes = resClasses.ok ? await resClasses.json() : [];
            const classMap = new Map((classes || []).map((c: any) => [c.id, c.name]));

            // 1. Fetch Bills
            const resBills = await fetch('/api/student_bills', { headers });
            if (resBills.ok) {
                const dbBills = await resBills.json();
                const mappedBills: StudentBill[] = dbBills.map((b: any) => {
                    const student = studentMap.get(b.student_id) || {};
                    const className = student.class_id ? classMap.get(student.class_id) || '-' : '-';
                    return {
                        id: b.id,
                        studentId: b.student_id,
                        studentName: student.full_name || 'Siswa',
                        class: className,
                        paymentName: b.payment_name || 'SPP',
                        amount: b.amount,
                        period: b.period || '2025-01',
                        status: b.status === 'paid' ? 'Lunas' : 'Belum Lunas',
                        dueDate: b.due_date,
                        type: b.type
                    };
                });
                setStudentBills(mappedBills);
            }

            // 2. Fetch Expenses
            const resExpenses = await fetch('/api/expenses', { headers });
            if (resExpenses.ok) {
                const dbExpenses = await resExpenses.json();
                const mappedExpenses: Expense[] = dbExpenses.map((e: any) => ({
                    id: e.id,
                    date: e.date,
                    description: e.description || '',
                    category: e.category,
                    amount: e.amount,
                    proof: e.proof || ''
                }));
                setExpenses(mappedExpenses);
            }

            // 3. Fetch Payments Transactions
            const resPayments = await fetch('/api/payment_transactions', { headers });
            if (resPayments.ok) {
                const dbPayments = await resPayments.json();
                setPaymentHistory(dbPayments);
            }
        } catch (err) {
            console.error('Error fetching finance data from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    // Auto-save & background sync effects


    const addPayment = async (payment: any) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/payment_transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    student_id: payment.studentId,
                    amount: payment.amount,
                    type: payment.type,
                    payment_date: payment.date,
                    status: 'success',
                    notes: payment.method
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan transaksi' };
        } catch (err) {
            console.error('Error saving payment:', err);
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    const addExpense = async (expense: any) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date: expense.date,
                    amount: expense.amount,
                    category: expense.category,
                    description: expense.description,
                    proof: expense.proof
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan pengeluaran' };
        } catch (err) {
            console.error('Error saving expense:', err);
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    return {
        financialYear,
        setFinancialYear,
        cashAccounts,
        setCashAccounts,
        paymentTypes,
        setPaymentTypes,
        studentBills,
        setStudentBills,
        expenses,
        setExpenses,
        paymentHistory,
        setPaymentHistory,
        addPayment,
        addExpense,
        refreshFinance: fetchFinanceData
    };
};
