import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { schoolSettingsGlobal } from '../../../data/sharedData';

export interface CashAccount {
    id: string;
    name: string;
    type: 'KAS' | 'BANK';
    balance: number;
    is_primary: boolean;
    number: string;
}

export interface PaymentType {
    id: string;
    name: string;
    type: 'BULANAN' | 'SEKALI' | 'TAHUNAN' | 'CICILAN';
    amount: number;
    category: string;
    is_active: boolean;
}

export interface PaymentTypeClass {
    id: string;
    payment_type_id: string;
    academic_year_id: string;
    custom_amount: number;
}

export interface StudentBillInstallment {
    id: string;
    bill_id: string;
    installment_no: number;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
    paid_amount: number;
    paid_date: string | null;
}

export interface FinanceSetting {
    id: string;
    key: string;
    value: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    is_active: boolean;
    sort_order: number;
}

export interface SchoolBankAccount {
    id: string;
    bank: string;
    number: string;
    name: string;
    is_active: boolean;
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

export const useFinance = () => {
    const [financialYear, setFinancialYear] = useState(schoolSettingsGlobal.academicYear || '2025/2026');
    const [loading, setLoading] = useState(false);

    // State diisi oleh fetchFinanceData() saat mount
    const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [paymentTypeClasses, setPaymentTypeClasses] = useState<PaymentTypeClass[]>([]);
    const [studentBillInstallments, setStudentBillInstallments] = useState<StudentBillInstallment[]>([]);
    const [financeSettings, setFinanceSettings] = useState<FinanceSetting[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [schoolBankAccounts, setSchoolBankAccounts] = useState<SchoolBankAccount[]>([]);
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
            const students: any[] = resStudents.ok ? await resStudents.json() : [];
            const studentMap = new Map(students.map((s: any) => [s.id, s]));

            // Fetch classes to map classes
            const resClasses = await fetch('/api/classes', { headers });
            const classes: any[] = resClasses.ok ? await resClasses.json() : [];
            const classMap = new Map(classes.map((c: any) => [c.id, c.name]));

            // 1. Fetch Payment Types
            const resPaymentTypes = await fetch('/api/payment_types', { headers });
            if (resPaymentTypes.ok) {
                const dbPaymentTypes = await resPaymentTypes.json();
                setPaymentTypes(dbPaymentTypes.map((pt: any) => ({
                    id: pt.id,
                    name: pt.name,
                    type: pt.type,
                    amount: pt.amount,
                    category: pt.category || 'Lainnya',
                    is_active: pt.is_active === 1
                })));
            }

            // 2. Fetch Payment Type Classes (nominal per tahun)
            const resPaymentTypeClasses = await fetch('/api/payment_type_classes', { headers });
            if (resPaymentTypeClasses.ok) {
                const dbPTC = await resPaymentTypeClasses.json();
                setPaymentTypeClasses(dbPTC.map((ptc: any) => ({
                    id: ptc.id,
                    payment_type_id: ptc.payment_type_id,
                    academic_year_id: ptc.academic_year_id,
                    custom_amount: ptc.custom_amount
                })));
            }

            // 3. Fetch Cash Accounts
            const resCashAccounts = await fetch('/api/cash_accounts', { headers });
            if (resCashAccounts.ok) {
                const dbCashAccounts = await resCashAccounts.json();
                setCashAccounts(dbCashAccounts.map((ca: any) => ({
                    id: ca.id,
                    name: ca.name,
                    type: ca.type,
                    balance: ca.balance || 0,
                    is_primary: ca.is_primary === 1,
                    number: ca.number || ''
                })));
            }

            // 4. Fetch Finance Settings
            const resFinanceSettings = await fetch('/api/finance_settings', { headers });
            if (resFinanceSettings.ok) {
                const dbFinanceSettings = await resFinanceSettings.json();
                setFinanceSettings(dbFinanceSettings.map((fs: any) => ({
                    id: fs.id,
                    key: fs.key,
                    value: fs.value
                })));
            }

            // 5. Fetch Expense Categories
            const resExpenseCategories = await fetch('/api/expense_categories', { headers });
            if (resExpenseCategories.ok) {
                const dbExpenseCategories = await resExpenseCategories.json();
                setExpenseCategories(dbExpenseCategories.map((ec: any) => ({
                    id: ec.id,
                    name: ec.name,
                    is_active: ec.is_active === 1,
                    sort_order: ec.sort_order || 0
                })));
            }

            // 6. Fetch School Bank Accounts
            const resSchoolBankAccounts = await fetch('/api/school_bank_accounts', { headers });
            if (resSchoolBankAccounts.ok) {
                const dbSchoolBankAccounts = await resSchoolBankAccounts.json();
                setSchoolBankAccounts(dbSchoolBankAccounts.map((sba: any) => ({
                    id: sba.id,
                    bank: sba.bank,
                    number: sba.number,
                    name: sba.name,
                    is_active: sba.is_active === 1
                })));
            }

            // 7. Fetch Student Bill Installments
            const resInstallments = await fetch('/api/student_bill_installments', { headers });
            if (resInstallments.ok) {
                const dbInstallments = await resInstallments.json();
                setStudentBillInstallments(dbInstallments.map((si: any) => ({
                    id: si.id,
                    bill_id: si.bill_id,
                    installment_no: si.installment_no,
                    amount: si.amount,
                    due_date: si.due_date,
                    status: si.status,
                    paid_amount: si.paid_amount || 0,
                    paid_date: si.paid_date
                })));
            }

            // 8. Fetch Bills
            let dbBills: any[] = [];
            const resBills = await fetch('/api/student_bills', { headers });
            if (resBills.ok) {
                dbBills = await resBills.json();
                const mappedBills: StudentBill[] = dbBills.map((b: any) => {
                    const student: any = studentMap.get(b.student_id) || {};
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

            // 9. Fetch Expenses
            const resExpenses = await fetch('/api/expenses', { headers });
            if (resExpenses.ok) {
                const dbExpenses = await resExpenses.json();
                const mappedExpenses: Expense[] = dbExpenses.map((e: any) => ({
                    id: e.id,
                    date: e.date || e.expense_date,
                    description: e.description || '',
                    category: e.category,
                    amount: e.amount,
                    proof: e.proof || ''
                }));
                setExpenses(mappedExpenses);
            }

            // 10. Fetch Payments Transactions
            const resPayments = await fetch('/api/payment_transactions', { headers });
            if (resPayments.ok) {
                const dbPayments = await resPayments.json();
                const mappedPayments = dbPayments.map((p: any) => {
                    const bill = dbBills.find((b: any) => b.id === p.bill_id);
                    const student = studentMap.get(p.student_id) || {};
                    return {
                        id: p.id,
                        billId: p.bill_id,
                        studentId: p.student_id,
                        studentName: student.nama || student.full_name || '-',
                        studentNis: student.nis || '-',
                        studentClass: student.kelas || '-',
                        paymentName: bill?.payment_name || 'Pembayaran',
                        amount: p.amount,
                        date: p.transaction_date || p.payment_date || '',
                        paymentMethod: p.payment_method || 'Tunai',
                        status: p.status || 'success',
                        type: p.type || '',
                        notes: p.notes || ''
                    };
                });
                setPaymentHistory(mappedPayments);
            }
        } catch (err) {
            toast.error('Gagal memuat data keuangan dari database');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);


    const addPayment = async (payment: any) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        const billId = payment.billId;
        if (!billId) {
            console.error('addPayment: billId wajib diisi');
            return { success: false, error: 'billId tidak ditemukan' };
        }

        try {
            // 1. POST ke payment_transactions
            const res = await fetch('/api/payment_transactions', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    bill_id: billId,
                    student_id: payment.studentId,
                    amount: payment.amount,
                    payment_method: payment.method || 'Tunai',
                    transaction_date: payment.date,
                    payment_date: payment.date,
                    type: payment.type,
                    status: 'success',
                    recorded_by: payment.recordedBy || null,
                    notes: payment.notes || ''
                })
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                return { success: false, error: errBody.error || 'Gagal menyimpan transaksi' };
            }

            // 2. PATCH student_bills → status = 'paid'
            const patchRes = await fetch(`/api/student_bills?id=eq.${billId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    status: 'paid',
                    updated_at: new Date().toISOString()
                })
            });
            if (!patchRes.ok) {
                console.warn('addPayment: transaksi tersimpan tapi gagal update status bill');
            }

            fetchFinanceData();
            return { success: true };
        } catch (err) {
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
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Payment Types CRUD
    const addPaymentType = async (paymentType: Omit<PaymentType, 'id'>) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/payment_types', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: paymentType.name,
                    type: paymentType.type,
                    amount: paymentType.amount,
                    category: paymentType.category,
                    is_active: paymentType.is_active ? 1 : 0
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan jenis pembayaran' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    const updatePaymentType = async (id: string, paymentType: Partial<PaymentType>) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const updateData: any = {};
            if (paymentType.name !== undefined) updateData.name = paymentType.name;
            if (paymentType.type !== undefined) updateData.type = paymentType.type;
            if (paymentType.amount !== undefined) updateData.amount = paymentType.amount;
            if (paymentType.category !== undefined) updateData.category = paymentType.category;
            if (paymentType.is_active !== undefined) updateData.is_active = paymentType.is_active ? 1 : 0;

            const res = await fetch(`/api/payment_types?id=eq.${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updateData)
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal memperbarui jenis pembayaran' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Cash Accounts CRUD
    const addCashAccount = async (cashAccount: Omit<CashAccount, 'id'>) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/cash_accounts', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: cashAccount.name,
                    type: cashAccount.type,
                    balance: cashAccount.balance,
                    number: cashAccount.number,
                    is_primary: cashAccount.is_primary ? 1 : 0
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan akun kas' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Finance Settings CRUD
    const updateFinanceSetting = async (key: string, value: string) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            // Check if setting exists
            const existing = financeSettings.find(fs => fs.key === key);
            if (existing) {
                const res = await fetch(`/api/finance_settings?id=eq.${existing.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ value, updated_at: new Date().toISOString() })
                });
                if (res.ok) {
                    fetchFinanceData();
                    return { success: true };
                }
            } else {
                const res = await fetch('/api/finance_settings', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ key, value })
                });
                if (res.ok) {
                    fetchFinanceData();
                    return { success: true };
                }
            }
            return { success: false, error: 'Gagal menyimpan pengaturan' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Expense Categories CRUD
    const addExpenseCategory = async (name: string) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/expense_categories', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name,
                    is_active: 1,
                    sort_order: expenseCategories.length + 1
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan kategori' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    const deleteExpenseCategory = async (id: string) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const res = await fetch(`/api/expense_categories?id=eq.${id}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menghapus kategori' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // School Bank Accounts CRUD
    const addSchoolBankAccount = async (bankAccount: Omit<SchoolBankAccount, 'id'>) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            const res = await fetch('/api/school_bank_accounts', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    bank: bankAccount.bank,
                    number: bankAccount.number,
                    name: bankAccount.name,
                    is_active: bankAccount.is_active ? 1 : 0
                })
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menyimpan rekening bank' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    const deleteSchoolBankAccount = async (id: string) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const res = await fetch(`/api/school_bank_accounts?id=eq.${id}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                fetchFinanceData();
                return { success: true };
            }
            return { success: false, error: 'Gagal menghapus rekening bank' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Helper: Get payment amount (with class/year override)
    const getPaymentAmount = (paymentTypeId: string, academicYearId?: string): number => {
        if (academicYearId) {
            const ptc = paymentTypeClasses.find(
                ptc => ptc.payment_type_id === paymentTypeId && ptc.academic_year_id === academicYearId
            );
            if (ptc) return ptc.custom_amount;
        }
        const pt = paymentTypes.find(pt => pt.id === paymentTypeId);
        return pt ? pt.amount : 0;
    };

    // Helper: Get finance setting value
    const getFinanceSetting = (key: string): string => {
        const setting = financeSettings.find(fs => fs.key === key);
        return setting ? setting.value : '';
    };

    return {
        financialYear,
        setFinancialYear,
        cashAccounts,
        setCashAccounts,
        paymentTypes,
        setPaymentTypes,
        paymentTypeClasses,
        setPaymentTypeClasses,
        studentBillInstallments,
        setStudentBillInstallments,
        financeSettings,
        setFinanceSettings,
        expenseCategories,
        setExpenseCategories,
        schoolBankAccounts,
        setSchoolBankAccounts,
        studentBills,
        setStudentBills,
        expenses,
        setExpenses,
        paymentHistory,
        setPaymentHistory,
        addPayment,
        addExpense,
        addPaymentType,
        updatePaymentType,
        addCashAccount,
        updateFinanceSetting,
        addExpenseCategory,
        deleteExpenseCategory,
        addSchoolBankAccount,
        deleteSchoolBankAccount,
        getPaymentAmount,
        getFinanceSetting,
        refreshFinance: fetchFinanceData
    };
};
