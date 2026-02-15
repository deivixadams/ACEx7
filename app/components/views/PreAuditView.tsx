'use client';

import React, { useEffect, useState } from 'react';
import {
    Download,
    Star,
    Users,
    FileText,
    Search,
    Filter,
    ChevronRight,
    Sparkles,
    Shield,
    TrendingUp,
    Clock
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
            // First run sync to make sure we have data
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

            // Refresh list to update counts
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
        <div className="min-h-screen bg-[#F8FAFC] p-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative mb-12 rounded-[2rem] bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-12 text-white overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 -m-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 -m-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

                <div className="relative z-10 max-w-2xl">
                    <div className="mb-4 flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/20 w-fit">
                        <Sparkles className="h-3 w-3" />
                        Premium Audit Content
                    </div>
                    <h1 className="mb-4 text-5xl font-black tracking-tight leading-[1.1]">
                        Galería de Informes <span className="text-emerald-400 italic font-serif">Pre-Made</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        Accede a nuestra biblioteca exclusiva de informes técnicos redactados por expertos.
                        Documentación de alta fidelidad, lista para descargar y adaptar a tu entidad con un solo clic.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${categoryFilter === cat
                                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-slate-200 translate-y-[-2px]'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                    <input
                        type="text"
                        placeholder="Buscar informes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[2rem] h-[500px] border border-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredReports.map((report) => (
                        <div
                            key={report.id}
                            className="group relative bg-white rounded-[2.5rem] border border-slate-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col overflow-hidden hover:translate-y-[-12px]"
                        >
                            {/* Portada */}
                            <div className="relative aspect-[3/4] overflow-hidden m-4 rounded-[2rem]">
                                <img
                                    src={`/api/premade-reports/image/${report.id}`}
                                    alt={report.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1000&auto=format&fit=crop';
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-black text-slate-800 uppercase tracking-widest shadow-xl">
                                    {report.category}
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="px-8 pb-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-[10px] font-black text-slate-300 ml-1">5.0</span>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors">
                                    {report.title}
                                </h3>

                                <p className="text-[12px] text-slate-400 font-bold leading-relaxed mb-6 line-clamp-2">
                                    {report.description}
                                </p>

                                <div className="mt-auto space-y-6">
                                    <div className="flex items-center justify-between py-4 border-y border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Download className="h-3.5 w-3.5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter leading-none">{report.download_count}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">Descargas</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter leading-none">PLAFT</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">Auditado</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDownload(report.id, report.title)}
                                        disabled={downloadingId === report.id}
                                        className={`w-full relative group/btn overflow-hidden rounded-2xl py-4 flex items-center justify-center gap-3 transition-all ${downloadingId === report.id
                                                ? 'bg-slate-100 text-slate-400 cursor-wait'
                                                : 'bg-[#0F172A] text-white hover:bg-emerald-600 shadow-xl shadow-slate-200 hover:shadow-emerald-200'
                                            }`}
                                    >
                                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.15em]">
                                            {downloadingId === report.id ? 'Descargando...' : 'Obtener Informe'}
                                        </span>
                                        {downloadingId !== report.id && <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredReports.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="inline-flex p-6 bg-slate-50 rounded-full mb-6">
                        <Filter className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Sin resultados</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">No encontramos informes que coincidan con tu búsqueda</p>
                </div>
            )}
        </div>
    );
};

export default PreAuditView;
