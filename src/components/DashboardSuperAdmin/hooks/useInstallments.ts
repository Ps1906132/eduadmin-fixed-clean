import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface StudentBillInstallment {
    id: string;
    bill_id: string;
    installment_no: number;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
    paid_amount: number;
    paid_date: string | null;
    created_at?: string;
}

export interface InstallmentSummary {
    bill_id: string;
    total_installments: number;
    paid_installments: number;
    pending_installments: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    is_fully_paid: boolean;
}

export const useInstallments = () => {
    const [loading, setLoading] = useState(false);
    const [installments, setInstallments] = useState<StudentBillInstallment[]>([]);

    const fetchInstallments = useCallback(async (billId?: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            let url = '/api/student_bill_installments';
            if (billId) {
                url += `?bill_id=eq.${billId}`;
            }

            const res = await fetch(url, { headers });
            if (res.ok) {
                const data = await res.json();
                setInstallments(data.map((i: any) => ({
                    id: i.id,
                    bill_id: i.bill_id,
                    installment_no: i.installment_no,
                    amount: i.amount,
                    due_date: i.due_date,
                    status: i.status,
                    paid_amount: i.paid_amount || 0,
                    paid_date: i.paid_date,
                    created_at: i.created_at
                })));
            }
        } catch (err) {
            toast.error('Gagal memuat data cicilan');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstallments();
    }, [fetchInstallments]);

    // Create installments for a bill (when creating CICILAN type bill)
    const createInstallments = async (billId: string, installmentsData: Omit<StudentBillInstallment, 'id' | 'bill_id'>[]) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Prepare batch insert data
            const insertData = installmentsData.map(inst => ({
                bill_id: billId,
                installment_no: inst.installment_no,
                amount: inst.amount,
                due_date: inst.due_date,
                status: 'pending',
                paid_amount: 0
            }));

            const res = await fetch('/api/student_bill_installments', {
                method: 'POST',
                headers,
                body: JSON.stringify(insertData)
            });

            if (res.ok) {
                fetchInstallments(billId);
                return { success: true };
            }
            return { success: false, error: 'Gagal membuat cicilan' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Update installment status (when payment is made)
    const payInstallment = async (installmentId: string, paidAmount: number) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const res = await fetch(`/api/student_bill_installments?id=eq.${installmentId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    status: 'paid',
                    paid_amount: paidAmount,
                    paid_date: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                // Check if all installments for this bill are paid
                const installment = installments.find(i => i.id === installmentId);
                if (installment) {
                    const billInstallments = installments.filter(i => i.bill_id === installment.bill_id);
                    const allPaid = billInstallments.every(i => i.id === installmentId || i.status === 'paid');

                    if (allPaid) {
                        // Update bill status to 'paid'
                        await fetch(`/api/student_bills?id=eq.${installment.bill_id}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({ status: 'paid', updated_at: new Date().toISOString() })
                        });
                    }
                }

                fetchInstallments();
                return { success: true };
            }
            return { success: false, error: 'Gagal memperbarui cicilan' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Mark overdue installments
    const markOverdue = async () => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const today = new Date().toISOString().split('T')[0];
            const overdueInstallments = installments.filter(
                i => i.status === 'pending' && i.due_date < today
            );

            for (const inst of overdueInstallments) {
                await fetch(`/api/student_bill_installments?id=eq.${inst.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status: 'overdue' })
                });
            }

            if (overdueInstallments.length > 0) {
                fetchInstallments();
            }
            return { success: true };
        } catch (err) {
            console.error('Error marking overdue installments:', err);
            return { success: false, error: 'Gagal menandai cicilan lewat jatuh tempo' };
        }
    };

    // Get installments for a specific bill
    const getInstallmentsByBill = (billId: string): StudentBillInstallment[] => {
        return installments
            .filter(i => i.bill_id === billId)
            .sort((a, b) => a.installment_no - b.installment_no);
    };

    // Get summary for a bill
    const getInstallmentSummary = (billId: string): InstallmentSummary => {
        const billInstallments = installments.filter(i => i.bill_id === billId);
        const totalInstallments = billInstallments.length;
        const paidInstallments = billInstallments.filter(i => i.status === 'paid').length;
        const pendingInstallments = billInstallments.filter(i => i.status === 'pending' || i.status === 'overdue').length;
        const totalAmount = billInstallments.reduce((sum, i) => sum + i.amount, 0);
        const paidAmount = billInstallments.reduce((sum, i) => sum + i.paid_amount, 0);
        const remainingAmount = totalAmount - paidAmount;

        return {
            bill_id: billId,
            total_installments: totalInstallments,
            paid_installments: paidInstallments,
            pending_installments: pendingInstallments,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            is_fully_paid: totalInstallments > 0 && paidInstallments === totalInstallments
        };
    };

    // Delete all installments for a bill (when deleting a bill)
    const deleteInstallmentsByBill = async (billId: string) => {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const res = await fetch(`/api/student_bill_installments?bill_id=eq.${billId}`, {
                method: 'DELETE',
                headers
            });

            if (res.ok) {
                fetchInstallments();
                return { success: true };
            }
            return { success: false, error: 'Gagal menghapus cicilan' };
        } catch (err) {
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    return {
        loading,
        installments,
        fetchInstallments,
        createInstallments,
        payInstallment,
        markOverdue,
        getInstallmentsByBill,
        getInstallmentSummary,
        deleteInstallmentsByBill
    };
};

export default useInstallments;
