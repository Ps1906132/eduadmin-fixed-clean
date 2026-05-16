import React, { useState } from 'react';
import { Search, BookOpen, Book, Star, ChevronLeft, Filter, Bookmark } from 'lucide-react';

interface PerpustakaanProps {
    onBack: () => void;
}

const PerpustakaanSiswa: React.FC<PerpustakaanProps> = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');

    const categories = ['Semua', 'Pelajaran', 'Islami', 'Cerita Anak', 'Ensiklopedia'];

    const books = [
        {
            id: 1,
            title: 'Kisah 25 Nabi & Rasul',
            author: 'Tim Gema Insani',
            category: 'Islami',
            rating: 4.8,
            coverColor: 'bg-emerald-500',
            image: null // Placeholder for image logic
        },
        {
            id: 2,
            title: 'Matematika Asyik Kelas 4',
            author: 'Pusat Kurikulum',
            category: 'Pelajaran',
            rating: 4.5,
            coverColor: 'bg-blue-500',
            image: null
        },
        {
            id: 3,
            title: 'Ensiklopedia Hewan',
            author: 'National Geographic',
            category: 'Ensiklopedia',
            rating: 4.9,
            coverColor: 'bg-orange-500',
            image: null
        },
        {
            id: 4,
            title: 'Si Kancil yang Cerdik',
            author: 'Balai Pustaka',
            category: 'Cerita Anak',
            rating: 4.7,
            coverColor: 'bg-pink-500',
            image: null
        },
        {
            id: 5,
            title: 'Adab Sehari-hari',
            author: 'Khalifa Media',
            category: 'Islami',
            rating: 4.9,
            coverColor: 'bg-teal-500',
            image: null
        }
    ];

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Semua' || book.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                        <BookOpen className="text-[#004AAD]" />
                        Perpustakaan
                    </h2>
                    <p className="text-xs text-slate-500">Jelajahi dunia ilmu pengetahuan</p>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-[#004AAD]">
                    <Bookmark size={20} />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Cari buku, penulis..."
                    className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200">
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* Kategori */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-[#004AAD] text-white shadow-md shadow-blue-900/20'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Book List */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20 pr-1">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="group bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                        {/* Book Cover Placeholder */}
                        <div className={`aspect-[3/4] rounded-xl ${book.coverColor} mb-3 relative overflow-hidden shadow-inner flex items-center justify-center`}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                            {/* Stylized Book Pattern */}
                            <div className="text-white/30 transform rotate-12 scale-150">
                                <Book size={64} strokeWidth={1} />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">{book.title}</h3>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide line-clamp-1">{book.category}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-600 line-clamp-1">{book.author}</p>
                                <div className="flex items-center gap-0.5 text-amber-400">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-[10px] font-bold text-slate-600">{book.rating}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredBooks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Buku tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerpustakaanSiswa;
