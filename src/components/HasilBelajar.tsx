import React, { useState } from 'react';
import { ChevronRight, ClipboardList, FileSpreadsheet, BookOpen } from 'lucide-react';
import RapotSiswa from './RapotSiswa';
import DetailNilai from './DetailNilai';

interface HasilBelajarProps {
    onBack: () => void;
    user: any;
}

const HasilBelajar: React.FC<HasilBelajarProps> = ({ onBack, user }) => {
    const [internalView, setInternalView] = useState<'menu' | 'rapot' | 'detail'>('menu');
    const [detailCategory, setDetailCategory] = useState<'Nilai Ulangan' | 'Nilai Ujian'>('Nilai Ulangan');
    const [chartData, setChartData] = useState<any[]>([]);

    React.useEffect(() => {
        const levels = ['1', '2', '3', '4', '5', '6'];
        const colors = ['bg-yellow-400', 'bg-[#9F8FEF]', 'bg-[#EE8686]', 'bg-[#8DBF82]', 'bg-[#4AB7CC]', 'bg-orange-400'];
        const borders = ['border-yellow-600', 'border-[#7c69db]', 'border-[#d66565]', 'border-[#6ea063]', 'border-[#388A99]', 'border-orange-600'];

        const dynamicData: any[] = [];
        const studentName = user?.studentName || user?.nama;
        const currentClass = user?.studentClass || '1A';
        const parallel = currentClass.replace(/\d+/, '');

        levels.forEach((lvl, idx) => {
            const className = `${lvl}${parallel}`;
            let totalGrade = 0;
            let subjectCount = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(`grades_v2_${className}_`)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key) || '[]');
                        const student = data.find((s: any) => s.studentName === studentName);
                        if (student && student.finalScore) {
                            totalGrade += student.finalScore;
                            subjectCount++;
                        }
                    } catch (e) { }
                }
            }

            if (subjectCount > 0) {
                dynamicData.push({
                    label: `Kelas ${lvl}`,
                    value: Math.round(totalGrade / subjectCount),
                    color: colors[idx],
                    borderColor: borders[idx]
                });
            }
        });

        if (dynamicData.length === 0) {
            setChartData([{ label: 'No Data', value: 0, color: 'bg-slate-200', borderColor: 'border-slate-300' }]);
        } else {
            setChartData(dynamicData);
        }
    }, [user]);

    if (internalView === 'rapot') {
        return <RapotSiswa onBack={() => setInternalView('menu')} user={user} />;
    }

    if (internalView === 'detail') {
        return <DetailNilai onBack={() => setInternalView('menu')} category={detailCategory} user={user} />;
    }

    const handleMenuClick = (label: string) => {
        if (label === 'Rapot Semester') {
            setInternalView('rapot');
        } else if (label === 'Nilai Ulangan') {
            setDetailCategory('Nilai Ulangan');
            setInternalView('detail');
        } else if (label === 'Nilai Ujian') {
            setDetailCategory('Nilai Ujian');
            setInternalView('detail');
        }
    };


    // Helper to calculate polyline points dynamically based on data length
    const getPolylinePoints = () => {
        const count = chartData.length;
        if (count === 0) return "";
        const segmentWidth = 100 / count;

        return chartData.map((data, index) => {
            const x = (segmentWidth / 2) + (index * segmentWidth);
            const y = 100 - data.value; // Inverted Y-axis
            return `${x}%,${y}%`;
        }).join(' ');
    };

    const count = chartData.length;
    const segmentWidth = count > 0 ? 100 / count : 0;
    const lastPoint = count > 0 ? chartData[count - 1] : { value: 0 };
    const lastX = count > 0 ? (segmentWidth / 2) + ((count - 1) * segmentWidth) : 0;
    const lastY = count > 0 ? 100 - lastPoint.value : 100;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <h3 className="font-bold text-slate-800 text-lg">Hasil Belajar</h3>
            </div>

            <div className="p-6">
                {/* Submenus */}
                <div className="grid grid-cols-3 gap-2 mb-10">
                    {[
                        { label: 'Nilai Ulangan', icon: <ClipboardList size={28} /> },
                        { label: 'Nilai Ujian', icon: <FileSpreadsheet size={28} /> },
                        { label: 'Rapot Semester', icon: <BookOpen size={28} /> }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleMenuClick(item.label)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-800 text-slate-800 group-hover:bg-[#004AAD] group-hover:border-[#004AAD] group-hover:text-white transition-all">
                                {item.icon}
                            </div>
                            <span className="text-[10px] sm:text-xs text-center font-bold text-slate-700 leading-tight max-w-[80px]">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="mb-4 pt-4">
                    <h4 className="font-bold text-slate-800 text-lg mb-6">Grafik capaian belajar</h4>

                    <div className="relative h-64 w-full pr-4 pb-2">
                        {/* Chart Container with Axes */}
                        <div className="relative h-full w-full border-l-[3px] border-b-[3px] border-slate-600 flex items-end justify-around px-2">

                            {/* Axis Arrow Heads */}
                            <div className="absolute -top-2 -left-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-slate-600"></div>
                            <div className="absolute -bottom-[6px] -right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[12px] border-l-slate-600"></div>

                            {/* Dynamic Bars */}
                            {chartData.map((data, index) => (
                                <div
                                    key={index}
                                    className={`w-[15%] max-w-[40px] ${data.color} border ${data.borderColor} relative group cursor-pointer hover:brightness-110 transition-all`}
                                    style={{ height: `${data.value * 0.8}%` }} // Scale nicely within container
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {data.value}
                                    </div>
                                    {/* Label below bar if needed, but mockup didn't show it clearly, can add via tooltip or below axis */}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                        {data.label}
                                    </div>
                                </div>
                            ))}

                            {/* Trend Line (SVG Overlay) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                                <polyline
                                    points={getPolylinePoints()}
                                    fill="none"
                                    stroke="#E07932"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {/* Arrow Head at the end of line */}
                                <path
                                    d={`M ${lastX}% ${lastY}% l -4 6 m 4 -6 l -8 2`}
                                    stroke="#E07932"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>

                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-medium">Keterangan: Tren Nilai Akademik Siswa</p>
                </div>
            </div>
        </div>
    );
};

export default HasilBelajar;
