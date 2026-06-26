import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserRole } from '../../../lib/rbac/usePermissions';
import { hasPermission } from '../../../lib/rbac/permissionMatrix';

export interface GradeRecord {
    id?: string;
    studentId: string;
    subjectId: string;
    classId: string;
    academicYearId: string;
    gradeValue: number;
    assessmentType: string;
    remarks?: string;
}

export const useGrades = () => {
    const [loading, setLoading] = useState(false);

    const fetchGrades = useCallback(async (filters?: { classId?: string, subjectId?: string, academicYearId?: string }) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return [];
            
            let url = '/api/grades';
            const params = new URLSearchParams();
            if (filters?.classId) params.append('class_id', `eq.${filters.classId}`);
            if (filters?.subjectId) params.append('subject_id', `eq.${filters.subjectId}`);
            if (filters?.academicYearId) params.append('academic_year_id', `eq.${filters.academicYearId}`);
            
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                return data;
            }
            return [];
        } catch (err) {
            console.error('Error fetching grades:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const saveGradesBatch = async (records: GradeRecord[]) => {
        const role = getCurrentUserRole();
        if (!hasPermission(role, 'nilai', 'UPDATE')) {
            console.error('Permission denied: nilai UPDATE');
            return { success: false, error: 'Anda tidak memiliki hak akses untuk mengubah nilai' };
        }

        setLoading(true);
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };

        try {
            for (const record of records) {
                // Upsert logic: check if exists first or use a dedicated upsert endpoint if available
                // For simplicity here, we'll assume we can POST to an endpoint that handles upsert
                // or we do it manually. D1 bridge handles standard REST.
                
                const body = {
                    student_id: record.studentId,
                    subject_id: record.subjectId,
                    class_id: record.classId,
                    academic_year_id: record.academicYearId,
                    grade_value: record.gradeValue,
                    assessment_type: record.assessmentType,
                    remarks: record.remarks || ''
                };

                // Try to find existing first to get ID for PATCH
                const checkRes = await fetch(`/api/grades?student_id=eq.${record.studentId}&subject_id=eq.${record.subjectId}&assessment_type=eq.${record.assessmentType}`, { headers });
                const existing = checkRes.ok ? await checkRes.json() : [];

                if (existing.length > 0) {
                    await fetch(`/api/grades?id=eq.${existing[0].id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/grades', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            ...body,
                            id: `grd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                        })
                    });
                }
            }
            return { success: true };
        } catch (err: any) {
            console.error('Error saving grades:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const fetchReportData = useCallback(async (classId: string, studentId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return null;

            const res = await fetch(`/api/grades?class_id=eq.${classId}&student_id=eq.${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                // Map special types back to an object
                const report: any = {
                    ekstra: [],
                    absen: {},
                    pribadian: {},
                    tahfidz: {}
                };

                data.forEach((g: any) => {
                    if (g.assessment_type === 'sikap') report.sikap = g.remarks;
                    if (g.assessment_type === 'catatan_wali') report.catatan = g.remarks;
                    if (g.assessment_type === 'pribadian') {
                        try { report.pribadian = JSON.parse(g.remarks); } catch (e) { report.pribadian = {}; }
                    }
                    if (g.assessment_type === 'tahfidz') {
                        try { report.tahfidz = JSON.parse(g.remarks); } catch (e) { report.tahfidz = {}; }
                    }
                    if (g.assessment_type === 'ekstra') {
                        try { report.ekstra = JSON.parse(g.remarks); } catch (e) { report.ekstra = []; }
                    }
                    if (g.assessment_type === 'absen_override') {
                        try { report.absen = JSON.parse(g.remarks); } catch (e) { report.absen = {}; }
                    }
                    // Subject remarks
                    if (g.subject_id && g.remarks) {
                        report[`mapel_${g.subject_id}_desc`] = g.remarks;
                    }
                });
                return report;
            }
            return null;
        } catch (err) {
            console.error('Error fetching report data:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const saveReportData = async (classId: string, studentId: string, data: any) => {
        const role = getCurrentUserRole();
        if (!hasPermission(role, 'nilai', 'UPDATE')) {
            console.error('Permission denied: nilai UPDATE');
            return { success: false, error: 'Anda tidak memiliki hak akses untuk mengubah nilai' };
        }

        const records: GradeRecord[] = [];
        const token = localStorage.getItem('eduadmin_token');
        let academicYearId = '';
        try {
            let ayRes = await fetch('/api/academic_years?is_active=eq.1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ayRes.ok) {
                const ayData = await ayRes.json();
                if (Array.isArray(ayData) && ayData.length > 0) {
                    academicYearId = ayData[0].id;
                }
            }
            if (!academicYearId) {
                ayRes = await fetch('/api/academic_years?order=start_date.desc&limit=1', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (ayRes.ok) {
                    const ayData = await ayRes.json();
                    if (Array.isArray(ayData) && ayData.length > 0) {
                        academicYearId = ayData[0].id;
                    }
                }
            }
        } catch (e) {
            console.warn('Gagal mengambil tahun ajaran:', e);
        }
        if (!academicYearId) {
            console.error('Tahun ajaran tidak ditemukan, data rapor tidak tersimpan');
            return { success: false, error: 'Tahun ajaran tidak ditemukan' };
        }

        if (data.sikap) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'sikap', remarks: data.sikap });
        if (data.catatan) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'catatan_wali', remarks: data.catatan });
        if (data.pribadian) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'pribadian', remarks: JSON.stringify(data.pribadian) });
        if (data.tahfidz) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'tahfidz', remarks: JSON.stringify(data.tahfidz) });
        if (data.ekstra) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'ekstra', remarks: JSON.stringify(data.ekstra) });
        if (data.absen) records.push({ studentId, classId, subjectId: 'system', academicYearId, gradeValue: 0, assessmentType: 'absen_override', remarks: JSON.stringify(data.absen) });

        // Save individual mapel descriptions if present
        Object.keys(data).forEach(key => {
            if (key.startsWith('mapel_') && key.endsWith('_desc')) {
                const subjectId = key.replace('mapel_', '').replace('_desc', '');
                records.push({ studentId, classId, subjectId, academicYearId, gradeValue: 0, assessmentType: 'desc', remarks: data[key] });
            }
        });

        return saveGradesBatch(records);
    };

    return {
        loading,
        fetchGrades,
        saveGradesBatch,
        fetchReportData,
        saveReportData
    };
};
