'use client';

import React, { useEffect, useState, useRef } from 'react';
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
    DownloadCloud,
    Heart,
    MessageSquare,
    X,
    Trash2,
    Edit3,
    Maximize2,
    CheckCircle2,
    Library,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Report {
    id: string;
    filename: string;
    title: string;
    description: string;
    category: string;
    download_count: number;
    likes_count: number;
    isLiked: boolean;
    created_at: string;
}

interface Comment {
    id: string;
    author: string;
    content: string;
    user_id: string;
    created_at: string;
}

const PreAuditView: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // UI States for Modals
    const [selectedReportForComments, setSelectedReportForComments] = useState<Report | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    // Preview State
    const [previewReport, setPreviewReport] = useState<Report | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [user?.id]);

    const fetchReports = async () => {
        try {
            await fetch('/api/premade-reports/sync');
            const res = await fetch(`/api/premade-reports/list?userId=${user?.id || 'guest'}`);
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
        if (!user) return;

        try {
            const res = await fetch(`/api/premade-reports/like/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            if (res.ok) {
                const data = await res.json();
                // Actualizar el estado local inmediatamente
                setReports(prev => prev.map(r => r.id === id ? {
                    ...r,
                    likes_count: data.likes_count,
                    isLiked: data.isLiked
                } : r));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const fetchComments = async (reportId: string) => {
        setIsCommentsLoading(true);
        try {
            const res = await fetch(`/api/premade-reports/comments/${reportId}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Comments fetch error:', error);
        } finally {
            setIsCommentsLoading(false);
        }
    };

    const openComments = async (e: React.MouseEvent, report: Report) => {
        e.stopPropagation();
        setSelectedReportForComments(report);
        setEditingCommentId(null); // Limpiar estado de edición
        fetchComments(report.id);
    };

    const postComment = async () => {
        if (!selectedReportForComments || !newComment.trim() || !user) return;
        try {
            const res = await fetch(`/api/premade-reports/comments/${selectedReportForComments.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    author: user.nombre || user.email || 'Usuario ACEx7',
                    userId: user.id
                })
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

    const deleteComment = async (commentId: string) => {
        if (!user) return;
        if (!confirm('¿Seguro que deseas eliminar este comentario?')) return;
        try {
            const res = await fetch(`/api/premade-reports/comments/repo?commentId=${commentId}&userId=${user.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    };

    const startEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentContent(comment.content);
    };

    const saveEditComment = async (commentId: string) => {
        if (!user || !editCommentContent.trim()) return;
        try {
            const res = await fetch(`/api/premade-reports/comments/repo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editCommentContent,
                    commentId,
                    userId: user.id
                })
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: data.comment.content } : c));
                setEditingCommentId(null);
            }
        } catch (error) {
            console.error('Edit comment error:', error);
        }
    };

    useEffect(() => {
        if (previewReport) {
            fetchPreview(previewReport.id);
        } else {
            setPreviewHtml(null);
        }
    }, [previewReport]);

    const fetchPreview = async (id: string) => {
        setIsPreviewLoading(true);
        try {
            const res = await fetch(`/api/premade-reports/preview/${id}`);
            const data = await res.json();
            setPreviewHtml(data.html || '<p className="text-slate-500">No se pudo cargar el contenido del informe.</p>');
        } catch (error) {
            console.error('Preview error:', error);
            setPreviewHtml('<p className="text-rose-500">Error al procesar el documento real.</p>');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const categories = ['Todos', 'Check list', ...Array.from(new Set(reports.map(r => r.category))).filter(c => c !== 'Check list')];

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'Todos' || r.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] selection:bg-blue-100 selection:text-blue-900 pb-20 relative font-sans">

            <div className="max-w-[1400px] mx-auto px-6 pt-12">
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-12 bg-black" />
                        <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400">
                            ACEx7 Premium Gallery
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl font-normal tracking-tight mb-6 leading-tight font-serif italic text-black/90">
                                Curated <span className="font-sans not-italic font-black decoration-blue-500 underline underline-offset-8">Audit Reports</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                Intelligent, persistent and interactive.
                                Manage feedback, track community interest, and preview real content.
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
                                        ? 'bg-black text-white shadow-xl shadow-slate-200'
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
                            placeholder="Buscar informe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-slate-200 w-full py-4 pl-8 pr-4 text-sm font-medium focus:outline-none focus:border-black transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-12 gap-y-20">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="group relative">

                                {/* Image Container + Action Overlay */}
                                <div className="relative aspect-[4/5] bg-[#F1F5F9] rounded-[2.5rem] p-12 mb-8 overflow-hidden transition-all duration-500 flex items-center justify-center border border-transparent group-hover:border-slate-200 group-hover:bg-[#E2E8F0] shadow-sm">

                                    <img
                                        src={`/api/premade-reports/image/${report.id}`}
                                        alt={report.title}
                                        className="w-full h-full object-contain shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] transition-transform duration-1000 group-hover:scale-110 z-10"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />

                                    {/* INTERACTIVE ICONS */}
                                    <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center gap-4">

                                        {/* PREVIEW */}
                                        <button
                                            title="Vista previa del informe real"
                                            onClick={(e) => { e.stopPropagation(); setPreviewReport(report); }}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-black transition-all hover:scale-110 shadow-2xl border border-white/10"
                                        >
                                            <Eye className="h-6 w-6" />
                                        </button>

                                        {/* DOWNLOAD (Assertive Icon) */}
                                        <button
                                            title="Descargar DOCX"
                                            onClick={(e) => { e.stopPropagation(); handleDownload(report.id, report.title); }}
                                            disabled={downloadingId === report.id}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-2xl border border-white/10 disabled:opacity-50"
                                        >
                                            {downloadingId === report.id ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <DownloadCloud className="h-6 w-6" />
                                            )}
                                        </button>

                                        {/* LIKE (Reversible Toggle) */}
                                        <button
                                            title={report.isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
                                            onClick={(e) => handleLike(e, report.id)}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl border border-white/10 ${report.isLiked
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-[#1e293b] text-white hover:bg-rose-500'
                                                }`}
                                        >
                                            <Heart className={`h-6 w-6 ${report.isLiked ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* COMMENTS */}
                                        <button
                                            title="Gestionar Comentarios"
                                            onClick={(e) => openComments(e, report)}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-emerald-600 transition-all hover:scale-110 shadow-2xl border border-white/10"
                                        >
                                            <MessageSquare className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="absolute top-8 left-8 z-20">
                                        <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-slate-100 shadow-md text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {report.category}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Premium Content</div>
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tighter text-black mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                        {report.title}
                                    </h3>

                                    <p className="text-[13px] text-slate-400 font-medium mb-8 line-clamp-2 italic leading-relaxed">
                                        {report.description}
                                    </p>

                                    {/* Interaction Bar */}
                                    <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <DownloadCloud className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.download_count} Bajadas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className={`h-3.5 w-3.5 ${report.likes_count > 0 ? 'text-rose-500 fill-current' : 'text-slate-200'}`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.likes_count} Estrellas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN REAL DOCUMENT PREVIEW */}
            {previewReport && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500">
                    <button
                        onClick={() => setPreviewReport(null)}
                        className="absolute top-8 right-12 text-white/40 hover:text-white transition-all transform hover:scale-110"
                    >
                        <X className="h-10 w-10" />
                    </button>

                    <div className="max-w-6xl w-full h-[90vh] flex flex-col items-center">
                        <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-full animate-in zoom-in-95 duration-500">

                            {/* Toolbar Simulated */}
                            <div className="h-14 bg-slate-50 border-b border-slate-100 flex items-center px-10 justify-between">
                                <div className="flex items-center gap-6">
                                    <BookOpen className="h-5 w-5 text-blue-600" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">LECTURA PREMIUM • VISTA DE LIBRO</span>
                                </div>
                                <div className="text-[11px] font-bold text-slate-400">SOLO LECTURA</div>
                            </div>

                            {/* Pages Area */}
                            <div className="flex-1 overflow-y-auto bg-slate-200/50 p-12 flex justify-center custom-scrollbar">
                                <div className="flex gap-4 max-w-7xl w-full h-fit">

                                    {/* Left Page (Simulated with cover or empty) */}
                                    <div className="hidden lg:flex flex-1 bg-white shadow-2xl min-h-[1200px] border-r border-slate-100 flex-col items-center p-20 select-none opacity-40 grayscale pointer-events-none">
                                        <div className="w-24 h-24 rounded-full bg-slate-50 mb-10 flex items-center justify-center border border-slate-100">
                                            <Shield className="h-10 w-10 text-slate-200" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-300 italic mb-8">{previewReport.title}</h2>
                                        <div className="space-y-4 w-full">
                                            <div className="h-3 w-full bg-slate-50 rounded" />
                                            <div className="h-3 w-5/6 bg-slate-50 rounded" />
                                            <div className="h-3 w-full bg-slate-50 rounded" />
                                            <div className="h-3 w-4/6 bg-slate-50 rounded" />
                                        </div>
                                    </div>

                                    {/* Right Page (Real Content) */}
                                    <div className="flex-1 bg-white shadow-2xl min-h-[1200px] relative p-16 md:p-24 overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/[0.03] to-transparent pointer-events-none" />

                                        {isPreviewLoading ? (
                                            <div className="flex flex-col items-center justify-center h-[600px] gap-6">
                                                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Convirtiendo documento real...</p>
                                            </div>
                                        ) : (
                                            <div
                                                className="prose prose-slate max-w-none prose-sm md:prose-base font-serif text-slate-800 leading-loose animate-in fade-in duration-1000"
                                                dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                                            />
                                        )}

                                        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-between items-center opacity-30 select-none">
                                            <span className="text-[10px] font-bold">ACEx7 DIGITAL PRE-MADE LIB</span>
                                            <span className="text-[10px] font-black italic">Page 01</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 text-center text-white/40">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-2">{previewReport.title}</p>
                            <p className="text-[10px] font-bold italic tracking-widest text-blue-400">Powered by Mammoth.js & ACEx7 Engine</p>
                        </div>
                    </div>
                </div>
            )}

            {/* COMMENTS SIDEBAR */}
            {selectedReportForComments && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedReportForComments(null)} />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col animate-in slide-in-from-right duration-500">

                        <div className="p-12 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 block mb-3">Audit Feedback</span>
                                <h4 className="text-3xl font-black text-black leading-tight italic tracking-tighter">{selectedReportForComments.title}</h4>
                            </div>
                            <button onClick={() => setSelectedReportForComments(null)} className="p-4 hover:bg-slate-50 rounded-full transition-all group">
                                <X className="h-7 w-7 text-slate-300 group-hover:text-black group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                            {isCommentsLoading ? (
                                <div className="flex flex-col items-center justify-center h-60 gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-slate-100" />
                                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">Sincronizando...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-20 opacity-20">
                                    <MessageSquare className="h-20 w-20 mx-auto mb-8 text-slate-300" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">Sin discusiones activas.</p>
                                </div>
                            ) : (
                                comments.map((comment, idx) => (
                                    <div key={comment.id} className="group/comment space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white border border-white/10 uppercase shadow-lg">
                                                    {comment.author.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-black uppercase tracking-tight leading-none">{comment.author}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase leading-none tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {user && user.id === comment.user_id && (
                                                <div className="flex items-center gap-3 opacity-0 group-hover/comment:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => startEditComment(comment)}
                                                        className="p-2 hover:bg-white hover:shadow-md hover:text-blue-600 rounded-lg text-slate-300 border border-transparent hover:border-blue-50"
                                                        title="Editar Comentario"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteComment(comment.id)}
                                                        className="p-2 hover:bg-white hover:shadow-md hover:text-rose-600 rounded-lg text-slate-300 border border-transparent hover:border-rose-50"
                                                        title="Eliminar Comentario"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-[#F8FAFC] p-8 rounded-[2rem] rounded-tl-none border border-slate-100/50 text-[14px] text-slate-600 font-medium leading-[1.8] group-hover/comment:bg-white group-hover/comment:shadow-xl group-hover/comment:border-blue-100/50 transition-all duration-500">
                                            {editingCommentId === comment.id ? (
                                                <div className="space-y-6">
                                                    <textarea
                                                        value={editCommentContent}
                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                        className="w-full bg-white border-2 border-blue-500/20 rounded-2xl p-6 text-sm focus:outline-none focus:ring-0 focus:border-blue-500 transition-all min-h-[120px] shadow-inner"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-4 justify-end">
                                                        <button
                                                            onClick={() => setEditingCommentId(null)}
                                                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => saveEditComment(comment.id)}
                                                            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-500/20"
                                                        >
                                                            Actualizar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="whitespace-pre-wrap">{comment.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Logic */}
                        <div className="p-12 bg-white border-t border-slate-50">
                            {user ? (
                                <div className="relative group">
                                    <textarea
                                        rows={4}
                                        placeholder="Escribe tu análisis o feedback..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-[2.5rem] p-8 pr-24 text-sm font-medium focus:outline-none focus:bg-white focus:border-black/5 transition-all resize-none shadow-inner"
                                    />
                                    <button
                                        onClick={postComment}
                                        disabled={!newComment.trim()}
                                        className="absolute bottom-6 right-6 bg-black text-white px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transform active:scale-95 disabled:opacity-20 transition-all hover:bg-emerald-600 shadow-2xl"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            ) : (
                                <div className="p-10 bg-slate-50 rounded-[2rem] text-center border-2 border-dashed border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Autenticación requerida para comentar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
                
                .prose strong { color: #000; font-weight: 800; }
                .prose h1, .prose h2, .prose h3 { font-family: serif; font-style: italic; color: #0F172A; }
                .prose p { margin-bottom: 1.5em; }
            `}</style>

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] invisible lg:visible">
                <div className="absolute inset-0 bg-black mix-blend-overlay" />
            </div>
        </div>
    );
};

export default PreAuditView;
