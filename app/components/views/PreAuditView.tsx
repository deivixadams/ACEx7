'use client';

import React, { useEffect, useState } from 'react';
import {
    Download,
    Star,
    Search,
    Filter,
    ChevronRight,
    Sparkles,
    Shield,
    FileText,
    ArrowUpRight,
    Loader2
} from 'lucide-react';

interface Report {
    id: string;
    filename: string;
    title: string;
    description: string;
    category: string;
    download_count: number;
    created_at: string;
}

const PreAuditView: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            await fetch('/api/premade-reports/sync');
            const res = await fetch('/api/premade-reports/list');
            const data = await res.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (id: string, title: string) => {
        setDownloadingId(id);
        try {
            const response = await fetch(`/api/premade-reports/download/${id}`);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Informe_${title.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            fetchReports();
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const categories = ['Todos', ...Array.from(new Set(reports.map(r => r.category)))];

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'Todos' || r.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] selection:bg-blue-100 selection:text-blue-900 pb-20">
            {/* Minimalist Navigation/Status Bar (Optional, can be hidden if global exists) */}

            <div className="max-w-[1400px] mx-auto px-6 pt-12">
                {/* Clean Header Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-12 bg-black" />
                        <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400">
                            Excellence in Audit
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl font-normal tracking-tight mb-6 leading-tight font-serif italic text-black/90">
                                Pre-made <span className="font-sans not-italic font-black decoration-blue-500 underline underline-offset-8">Report Gallery</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                Acceda a nuestra curaduría de informes técnicos.
                                Documentación estructurada, diseñada para profesionales exigentes.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm">
                            <div className="flex -space-x-2 overflow-hidden px-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 border border-slate-200" />
                                ))}
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-4 border-l border-slate-100 pl-4">
                                +500 Usuarios Activos
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters & Search - Sophisticated Controls */}
                <div className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${categoryFilter === cat
                                        ? 'bg-black text-white shadow-xl shadow-slate-200'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:border-black/10 hover:text-black'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full lg:w-96">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-slate-200 w-full py-4 pl-8 pr-4 text-sm font-medium focus:outline-none focus:border-black transition-all placeholder:text-slate-300 placeholder:italic"
                        />
                    </div>
                </div>

                {/* Modern Grid Layout */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-10 gap-y-20">
                        {filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="group cursor-pointer flex flex-col"
                            >
                                {/* Padded Image Container - Essential fix for full image visibility */}
                                <div className="relative aspect-[4/5] bg-[#F1F5F9] rounded-[2.5rem] p-10 mb-8 transition-all duration-700 group-hover:bg-[#E2E8F0] overflow-hidden flex items-center justify-center border border-transparent group-hover:border-slate-200/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                                    <img
                                        src={`/api/premade-reports/image/${report.id}`}
                                        alt={report.title}
                                        className="w-full h-full object-contain shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700 z-10"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586282391129-59a998fd034c?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />

                                    {/* Action Reveal */}
                                    <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 flex justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(report.id, report.title);
                                            }}
                                            disabled={downloadingId === report.id}
                                            className="bg-black text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                                        >
                                            {downloadingId === report.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            {downloadingId === report.id ? 'Descargando' : 'Obtener Ahora'}
                                        </button>
                                    </div>

                                    <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-lg">
                                            <ArrowUpRight className="h-5 w-5 text-black" />
                                        </div>
                                    </div>
                                </div>

                                {/* Refined Content Text */}
                                <div className="px-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {report.category}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            <span className="text-[11px] font-black text-slate-700 mt-0.5">5.00</span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold tracking-tight text-black mb-3 leading-[1.2] group-hover:opacity-60 transition-opacity">
                                        {report.title}
                                    </h3>

                                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
                                        {report.description}
                                    </p>

                                    <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                {report.download_count} Descargas
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                                Certificado
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredReports.length === 0 && !isLoading && (
                    <div className="text-center py-40">
                        <div className="inline-flex p-8 bg-slate-50 rounded-full mb-8">
                            <Filter className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-3xl font-bold text-black mb-3">No hay coincidencias</h3>
                        <p className="text-slate-400 font-medium text-sm">Pruebe ajustando sus filtros o términos de búsqueda</p>
                    </div>
                )}
            </div>

            {/* Background Grain/Texture (Subtle luxury detail) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]">
                <div className="absolute inset-0 bg-[#000] mix-blend-overlay" />
            </div>
        </div>
    );
};

export default PreAuditView;
