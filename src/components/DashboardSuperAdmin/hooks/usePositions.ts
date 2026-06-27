import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface Position {
    id: number;
    name: string;
    category: string;
    is_active: number;
}

/** Fetch positions from D1 via API */
export const usePositions = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await fetch('/api/positions?is_active=eq.1&order=id', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPositions(data);
            }
        } catch (err) {
            console.error('Error fetching positions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const addPosition = async (name: string, category: string) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch('/api/positions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, category })
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan "${name}" berhasil ditambahkan`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal menambahkan jabatan');
            }
        } catch (err) {
            console.error('Error adding position:', err);
            toast.error('Gagal menambahkan jabatan');
        }
    };

    const updatePosition = async (id: number, name: string, category: string) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch(`/api/positions?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, category })
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan berhasil diperbarui`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal memperbarui jabatan');
            }
        } catch (err) {
            console.error('Error updating position:', err);
            toast.error('Gagal memperbarui jabatan');
        }
    };

    const deletePosition = async (id: number) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch(`/api/positions?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan berhasil dihapus`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal menghapus jabatan');
            }
        } catch (err) {
            console.error('Error deleting position:', err);
            toast.error('Gagal menghapus jabatan');
        }
    };

    return {
        positions,
        loading,
        addPosition,
        updatePosition,
        deletePosition,
        refetch: fetchPositions
    };
};
