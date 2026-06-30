import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Search, PlayCircle, PauseCircle, ArrowLeft, AlertCircle } from 'lucide-react';

interface AlQuranSiswaProps {
    onBack: () => void;
}

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

interface Ayah {
    number: number;
    text: string; // Arabic or Translation depending on edition
    numberInSurah: number;
    audio?: string;
    translation?: string;
}

const AlQuranSiswa: React.FC<AlQuranSiswaProps> = ({ onBack }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Audio State
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingAyah, setPlayingAyah] = useState<number | null>(null); // global ayah number

    // Fetch Surah List on Mount
    useEffect(() => {
        const fetchSurahs = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://api.alquran.cloud/v1/surah');
                const data = await response.json();
                if (data.code === 200) {
                    setSurahs(data.data);
                } else {
                    setError('Gagal memuat daftar surat.');
                }
            } catch (err) {
                setError('Terjadi kesalahan koneksi.');
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
            }
        };
    }, [currentAudio]);

    // Fetch Surah Details (Arabic, Translation, Audio)
    const handleSelectSurah = async (surah: Surah) => {
        setSelectedSurah(surah);
        setLoading(true);
        setAyahs([]);
        setPlayingAyah(null);
        if (currentAudio) currentAudio.pause();

        try {
            // Fetching Arabic (Uthmani), Indonesian Translation, and Audio (Alafasy)
            // Reverted to Uthmani because Tajweed edition returns special markup that broke the display
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-uthmani,id.indonesian,ar.alafasy`);
            const data = await response.json();

            if (data.code === 200 && data.data.length === 3) {
                const arabicData = data.data[0].ayahs;
                const transData = data.data[1].ayahs;
                const audioData = data.data[2].ayahs;

                // Merge data
                const mergedAyahs = arabicData.map((ayah: any, index: number) => {
                    let cleanText = ayah.text;
                    // Remove Bismillah from Verse 1 for all Surahs except Al-Fatihah (1)
                    if (surah.number !== 1 && ayah.numberInSurah === 1) {
                        // Exact Uthmani Bismillah string from api.alquran.cloud
                        const bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
                        if (cleanText.startsWith(bismillah)) {
                            cleanText = cleanText.replace(bismillah, "").trim();
                        }
                    }

                    return {
                        number: ayah.number, // Global Ayah Number
                        numberInSurah: ayah.numberInSurah,
                        text: cleanText,
                        translation: transData[index].text,
                        audio: audioData[index].audio
                    };
                });

                setAyahs(mergedAyahs);
            } else {
                setError('Gagal memuat ayat.');
            }
        } catch (err) {
            setError('Gagal memuat detail surat.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAudio = (url: string, globalAyahNumber: number) => {
        if (currentAudio) {
            currentAudio.pause();
        }

        if (playingAyah === globalAyahNumber) {
            // If clicking the same ayah that is playing, just stop it (toggle pause behavior or stop)
            setPlayingAyah(null);
            setCurrentAudio(null);
        } else {
            const audio = new Audio(url);
            audio.play();
            audio.onended = () => setPlayingAyah(null);
            setCurrentAudio(audio);
            setPlayingAyah(globalAyahNumber);
        }
    };

    // Filter Surahs
    const filteredSurahs = surahs.filter(s =>
        s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.includes(searchQuery) ||
        s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- RENDER SURAH DETAIL ---
    if (selectedSurah) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                {/* Header Detail */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-[#004AAD] text-white">
                    <button onClick={() => setSelectedSurah(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 text-center pr-10">
                        <h3 className="font-bold text-xl font-serif">{selectedSurah.name}</h3>
                        <p className="text-xs opacity-80">{selectedSurah.englishName} • {selectedSurah.numberOfAyahs} Ayat</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004AAD]"></div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-3xl mx-auto">
                            {/* Bismillah for all surahs except At-Tawbah (9) */}
                            {selectedSurah.number !== 9 && (
                                <div className="text-center py-6 font-serif text-3xl text-slate-800 mb-4">
                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                </div>
                            )}

                            {ayahs.map((ayah) => (
                                <div key={ayah.number} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition-shadow">
                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between mb-6 bg-slate-50 rounded-xl p-2 px-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-[#004AAD] text-white text-xs font-bold rounded-full">
                                                {ayah.numberInSurah}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => ayah.audio && handlePlayAudio(ayah.audio, ayah.number)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${playingAyah === ayah.number ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                        >
                                            {playingAyah === ayah.number ? (
                                                <>
                                                    <PauseCircle size={16} /> Stop
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle size={16} /> Putar Audio
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Arabic Text */}
                                    <p className="text-right font-serif text-3xl leading-[2.5] text-slate-800 mb-6" dir="rtl">
                                        {ayah.text}
                                    </p>

                                    {/* Translation */}
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {ayah.translation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // --- RENDER SURAH LIST ---
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Al-Qur'an Digital</h3>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 pt-6 pb-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari Surat (e.g., Al-Fatihah)..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading && surahs.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004AAD]"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-40 text-red-500 gap-2">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSurahs.map((surah) => (
                            <button
                                key={surah.number}
                                onClick={() => handleSelectSurah(surah)}
                                className="flex items-center p-4 border border-slate-100 rounded-2xl hover:border-[#BFDBFE] hover:bg-blue-50/30 transition-all text-left group"
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-[#004AAD] font-bold rounded-lg mr-4 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-100 transition-colors">
                                    {surah.number}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-slate-800">{surah.englishName}</h4>
                                        <span className="text-[#004AAD] font-serif font-bold text-lg">{surah.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{surah.englishNameTranslation}</span>
                                        <span>{surah.numberOfAyahs} Ayat</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredSurahs.length === 0 && (
                            <div className="col-span-full text-center py-10 text-slate-400">
                                Tidak ada surat yang ditemukan.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlQuranSiswa;
