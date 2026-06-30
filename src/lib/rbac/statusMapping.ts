export const PAYMENT_STATUS_MAP: Record<string, string> = {
    paid: 'Lunas',
    pending: 'Belum Lunas',
    partial: 'Cicilan',
    cancelled: 'Dibatalkan',
};

export const BILL_STATUS_MAP: Record<string, string> = {
    paid: 'Lunas',
    pending: 'Belum Lunas',
    partial: 'Belum Lunas',
    cancelled: 'Dibatalkan',
};

export function mapBillStatus(status: string): string {
    return BILL_STATUS_MAP[status] || status;
}

export function isPaid(status: string): boolean {
    return status === 'paid';
}

export function isUnpaid(status: string): boolean {
    return status === 'pending' || status === 'partial';
}
