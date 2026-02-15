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
    Loader2,
    Eye,
    ShoppingCart,
    Heart,
    MessageSquare,
    X
} from 'lucide-react';

interface Report {
    id: string;
    filename: string;
    title: string;
    description: string;
    category: string;
    download_count: number;
    likes_count: number;
    created_at: string;
}

interface Comment {
    id: string;
    author: string;
    content: string;
    created_at: string;
}

const PreAuditView: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    // UI States for Modals
    const [selectedReportForComments, setSelectedReportForComments] = useState<Report | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');

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

    const handleLike = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (likedIds.has(id)) return; // Simple limit for now

        try {
            const res = await fetch(`/api/premade-reports/like/${id}`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setReports(prev => prev.map(r => r.id === id ? { ...r, likes_count: data.likes_count } : r));
                setLikedIds(prev => new Set(prev).add(id));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const openComments = async (e: React.MouseEvent, report: Report) => {
        e.stopPropagation();
        setSelectedReportForComments(report);
        setIsCommentsLoading(true);
        try {
            const res = await fetch(`/api/premade-reports/comments/${report.id}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Comments fetch error:', error);
        } finally {
            setIsCommentsLoading(false);
        }
    };

    const postComment = async () => {
        if (!selectedReportForComments || !newComment.trim()) return;
        try {
            const res = await fetch(`/api/premade-reports/comments/${selectedReportForComments.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Post comment error:', error);
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
        <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] selection:bg-blue-100 selection:text-blue-900 pb-20 relative">

            <div className="max-w-[1400px] mx-auto px-6 pt-12">
                {/* Header Section */}
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
                                Interactive <span className="font-sans not-italic font-black decoration-blue-500 underline underline-offset-8">Report Lab</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                Explore, interact and download from our premium audit database.
                                Designed for high-performance compliance teams.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${categoryFilter === cat
                                        ? 'bg-black text-white'
                                        : 'bg-white text-slate-400 border border-slate-100 hover:border-black/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full lg:w-96">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-black" />
                        <input
                            type="text"
                            placeholder="Buscar en el catálogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-slate-200 w-full py-4 pl-8 pr-4 text-sm font-medium focus:outline-none focus:border-black transition-all"
                        />
                    </div>
                </div>

                {/* Interactive Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-10 gap-y-20">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="group flex flex-col transition-all">

                                {/* Image Container with Hover Overlay */}
                                <div className="relative aspect-[4/5] bg-[#F1F5F9] rounded-[2.5rem] p-10 mb-8 overflow-hidden group-hover:bg-[#E2E8F0] transition-colors duration-500 flex items-center justify-center border border-transparent group-hover:border-slate-200/50">

                                    <img
                                        src={`/api/premade-reports/image/${report.id}`}
                                        alt={report.title}
                                        className="w-full h-full object-contain shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] group-hover:scale-105 transition-transform duration-700 z-10"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1586282391129-59a998fd034c?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />

                                    {/* CIRCULAR ICON OVERLAY - REQUESTED FEATURE */}
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center gap-4">

                                        {/* PREVIEW */}
                                        <button
                                            title="Previsualizar"
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-[#334155] transition-all hover:scale-110 shadow-xl border border-white/10"
                                        >
                                            <Eye className="h-6 w-6" />
                                        </button>

                                        {/* DOWNLOAD (CART) */}
                                        <button
                                            title="Descargar"
                                            onClick={(e) => handleDownload(report.id, report.title)}
                                            disabled={downloadingId === report.id}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-emerald-600 transition-all hover:scale-110 shadow-xl border border-white/10 disabled:opacity-50"
                                        >
                                            {downloadingId === report.id ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <ShoppingCart className="h-6 w-6" />
                                            )}
                                        </button>

                                        {/* LIKE */}
                                        <button
                                            title="Me gusta"
                                            onClick={(e) => handleLike(e, report.id)}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl border border-white/10 ${likedIds.has(report.id)
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-[#1e293b] text-white hover:bg-rose-500'
                                                }`}
                                        >
                                            <Heart className={`h-6 w-6 ${likedIds.has(report.id) ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* COMMENTS */}
                                        <button
                                            title="Comentarios"
                                            onClick={(e) => openComments(e, report)}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-xl border border-white/10"
                                        >
                                            <MessageSquare className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="absolute top-8 left-8 z-20">
                                        <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg text-[9px] font-black uppercase tracking-widest text-slate-800">
                                            {report.category}
                                        </div>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="px-4">
                                    <h3 className="text-xl font-bold tracking-tight text-black mb-2 transition-opacity group-hover:opacity-70">
                                        {report.title}
                                    </h3>
                                    <p className="text-[12px] text-slate-400 font-medium mb-6 line-clamp-2 italic leading-relaxed">
                                        {report.description}
                                    </p>

                                    <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                            <Download className="h-3 w-3 text-slate-300 group-hover:text-blue-500" />
                                            <span className="text-[10px] font-bold text-slate-400">{report.download_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                                            <Heart className="h-3 w-3 text-slate-300 group-hover:text-rose-500" />
                                            <span className="text-[10px] font-bold text-slate-400">{report.likes_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <Shield className="h-3 w-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-600 tracking-tighter uppercase">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMMENTS SIDEBAR / MODAL */}
            {selectedReportForComments && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedReportForComments(null)} />
                    <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Feedback & Comments</h4>
                                <p className="text-xl font-black text-black leading-tight italic">{selectedReportForComments.title}</p>
                            </div>
                            <button onClick={() => setSelectedReportForComments(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="h-6 w-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {isCommentsLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-20">
                                    <MessageSquare className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-400 text-sm font-medium italic">No hay comentarios aún. ¡Sé el primero!</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="group/comment flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black text-black tracking-tight">{comment.author}</span>
                                            <span className="text-[10px] text-slate-300 font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none text-[13px] text-slate-600 font-medium leading-relaxed border border-transparent group-hover/comment:border-slate-100 transition-all">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <div className="relative">
                                <textarea
                                    rows={3}
                                    placeholder="Escribe tu comentario profesional..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                                />
                                <button
                                    onClick={postComment}
                                    disabled={!newComment.trim()}
                                    className="absolute bottom-4 right-4 bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-20"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] invisible lg:visible">
                <div className="absolute inset-0 bg-[#000] mix-blend-overlay" />
            </div>
        </div>
    );
};

export default PreAuditView;
