import { useState, useEffect } from 'react';
import { initialFinanceDataGlobal, schoolSettingsGlobal } from '../../../data/sharedData';

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
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    proof: string;
}

const initialPaymentTypes: PaymentType[] = [];

export const useFinance = () => {
    const [financialYear, setFinancialYear] = useState(schoolSettingsGlobal.academicYear || '2025/2026');

    // Initialize from LocalStorage or Fallback
    const [cashAccounts, setCashAccounts] = useState<CashAccount[]>(() => {
        const saved = localStorage.getItem('finance_cash_accounts_v10');
        return saved ? JSON.parse(saved) : initialFinanceDataGlobal.cashAccounts;
    });

    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>(initialPaymentTypes);

    const [studentBills, setStudentBills] = useState<StudentBill[]>(() => {
        const saved = localStorage.getItem('finance_student_bills_v10');
        return saved ? JSON.parse(saved) : initialFinanceDataGlobal.studentBills;
    });

    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const saved = localStorage.getItem('finance_expenses_v10');
        return saved ? JSON.parse(saved) : initialFinanceDataGlobal.expenses;
    });

    const [paymentHistory, setPaymentHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('payments_data_v10');
        return saved ? JSON.parse(saved) : [];
    });

    // Auto-save effects
    useEffect(() => {
        localStorage.setItem('finance_cash_accounts_v10', JSON.stringify(cashAccounts));
    }, [cashAccounts]);

    useEffect(() => {
        localStorage.setItem('finance_student_bills_v10', JSON.stringify(studentBills));
    }, [studentBills]);

    useEffect(() => {
        localStorage.setItem('finance_expenses_v10', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('payments_data_v10', JSON.stringify(paymentHistory));
    }, [paymentHistory]);

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
    };
};
