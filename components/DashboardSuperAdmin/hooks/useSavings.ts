import { useState, useEffect } from 'react';
import {
    savingsDataGlobal,
    savingsTransactionsGlobal,
    updateSavingsDataGlobal,
    addSavingsTransactionGlobal,
    SavingsData,
    SavingsTransaction
} from '../../../data/sharedData';

export type { SavingsData, SavingsTransaction };

export const useSavings = () => {
    // Initialize from Local Storage or Global Store
    const [savingsData, setSavingsData] = useState<SavingsData[]>(() => {
        const saved = localStorage.getItem('savings_data_v10');
        return saved ? JSON.parse(saved) : savingsDataGlobal;
    });

    const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(() => {
        const saved = localStorage.getItem('savings_transactions_v10');
        return saved ? JSON.parse(saved) : savingsTransactionsGlobal;
    });

    // Sync back to Local Storage
    useEffect(() => {
        localStorage.setItem('savings_data_v10', JSON.stringify(savingsData));
    }, [savingsData]);

    useEffect(() => {
        localStorage.setItem('savings_transactions_v10', JSON.stringify(savingsTransactions));
    }, [savingsTransactions]);


    return {
        savingsData,
        setSavingsData,
        savingsTransactions,
        setSavingsTransactions,
    };
};
