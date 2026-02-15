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
    FileDown,
    Heart,
    MessageSquare,
    X,
    Trash2,
    Edit3,
    Maximize2,
    CheckCircle2
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
                setReports(prev => prev.map(r => r.id === id ? { ...r, likes_count: data.likes_count, isLiked: data.isLiked } : r));
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
                            Professional Compliance Hub
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <h1 className="text-6xl font-normal tracking-tight mb-6 leading-tight font-serif italic text-black/90">
                                Pre-made <span className="font-sans not-italic font-black decoration-blue-500 underline underline-offset-8">Audit Library</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                                Explore, interact and acquire certified reports.
                                High-end documentation for world-class auditors.
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
                            placeholder="Search catalogue..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-b border-slate-200 w-full py-4 pl-8 pr-4 text-sm font-medium focus:outline-none focus:border-black transition-all"
                        />
                    </div>
                </div>

                {/* Main Grid */}
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

                                {/* Image Container with Interactive Icons */}
                                <div className="relative aspect-[4/5] bg-[#F1F5F9] rounded-[2.5rem] p-12 mb-8 overflow-hidden transition-all duration-500 flex items-center justify-center border border-transparent group-hover:border-slate-200 group-hover:bg-[#E2E8F0]">

                                    <img
                                        src={`/api/premade-reports/image/${report.id}`}
                                        alt={report.title}
                                        className="w-full h-full object-contain shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] transition-transform duration-1000 group-hover:scale-110 z-10"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />

                                    {/* INTERACTIVE ICON OVERLAY */}
                                    <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center gap-4">

                                        {/* PREVIEW */}
                                        <button
                                            title="Vista previa Estilo Libro"
                                            onClick={(e) => { e.stopPropagation(); setPreviewReport(report); }}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-black transition-all hover:scale-110 shadow-2xl border border-white/10"
                                        >
                                            <Eye className="h-6 w-6" />
                                        </button>

                                        {/* DOWNLOAD (New asserted icon) */}
                                        <button
                                            title="Descargar Informe"
                                            onClick={(e) => { e.stopPropagation(); handleDownload(report.id, report.title); }}
                                            disabled={downloadingId === report.id}
                                            className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-2xl border border-white/10 disabled:opacity-50"
                                        >
                                            {downloadingId === report.id ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <FileDown className="h-6 w-6" />
                                            )}
                                        </button>

                                        {/* LIKE (Toggle) */}
                                        <button
                                            title={report.isLiked ? "Remover Like" : "Me gusta"}
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
                                            title="Comentarios y Feedback"
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

                                {/* Report Details */}
                                <div className="px-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />)}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {new Date(report.created_at).getFullYear()}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black tracking-tighter text-black mb-3 leading-tight transition-opacity group-hover:opacity-70">
                                        {report.title}
                                    </h3>

                                    <p className="text-[13px] text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed italic">
                                        {report.description}
                                    </p>

                                    {/* Stats Mini */}
                                    <div className="flex items-center gap-8 pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-2 group/stat">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.download_count} Downloads</span>
                                        </div>
                                        <div className="flex items-center gap-2 group/stat">
                                            <div className={`h-1.5 w-1.5 rounded-full shadow-sm ${report.likes_count > 0 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.likes_count} Estrellas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN BOOK PREVIEW MODAL */}
            {previewReport && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <button
                        onClick={() => setPreviewReport(null)}
                        className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="h-10 w-10" />
                    </button>

                    <div className="max-w-6xl w-full h-full flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-4xl aspect-[4/3] bg-white rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex">
                            {/* Left Page (Simulated with cover/blank) */}
                            <div className="flex-1 border-r border-slate-100/50 relative bg-slate-50/50">
                                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/5 to-transparent z-10" />
                                <div className="p-20 flex flex-col justify-center h-full opacity-30 select-none grayscale">
                                    <h2 className="text-4xl font-black mb-6 italic">{previewReport.title}</h2>
                                    <div className="space-y-4">
                                        <div className="h-4 w-full bg-slate-200 rounded" />
                                        <div className="h-4 w-5/6 bg-slate-200 rounded" />
                                        <div className="h-4 w-full bg-slate-200 rounded" />
                                        <div className="h-4 w-4/6 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Page (Main Cover) */}
                            <div className="flex-1 relative bg-white flex items-center justify-center p-12">
                                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/10 to-transparent z-10" />
                                <img
                                    src={`/api/premade-reports/image/${previewReport.id}`}
                                    alt="Preview"
                                    className="max-h-full max-w-full object-contain shadow-2xl rounded"
                                />
                                <div className="absolute bottom-8 right-8 text-[#0F172A]/20 font-black italic select-none">Pag. 01</div>
                            </div>
                        </div>

                        <div className="mt-12 text-center text-white/60">
                            <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-2">{previewReport.title}</h2>
                            <p className="text-sm font-bold italic tracking-wider uppercase">Visualización de solo lectura • ACEx7 Premium Architecture</p>
                        </div>
                    </div>
                </div>
            )}

            {/* COMMENTS SIDEBAR */}
            {selectedReportForComments && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReportForComments(null)} />
                    <div className="relative w-full max-w-xl bg-white h-full shadow-[0_0_100px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500">

                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Comentarios & Auditoría</span>
                                <h4 className="text-2xl font-black text-black leading-none italic">{selectedReportForComments.title}</h4>
                            </div>
                            <button onClick={() => setSelectedReportForComments(null)} className="p-3 hover:bg-slate-50 rounded-full transition-all">
                                <X className="h-6 w-6 text-slate-300 hover:text-black" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-12">
                            {isCommentsLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-100" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <MessageSquare className="h-16 w-16 mx-auto mb-6 text-slate-200" />
                                    <p className="text-sm font-black uppercase tracking-widest italic">Aún no hay feedback.</p>
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="group/comment space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">
                                                    {comment.author.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-black uppercase tracking-tighter leading-none">{comment.author}</p>
                                                    <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase leading-none">{new Date(comment.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* ACTIONS (Only for author) */}
                                            {user && user.id === comment.user_id && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                    <button onClick={() => startEditComment(comment)} className="p-1.5 hover:bg-slate-100 rounded text-slate-300 hover:text-blue-500">
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => deleteComment(comment.id)} className="p-1.5 hover:bg-slate-100 rounded text-slate-300 hover:text-rose-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-[#FAFBFD] p-6 rounded-[1.5rem] rounded-tl-none border border-slate-50 text-[13px] text-slate-600 font-medium leading-relaxed group-hover/comment:border-slate-100 transition-all">
                                            {editingCommentId === comment.id ? (
                                                <div className="space-y-4">
                                                    <textarea
                                                        value={editCommentContent}
                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                        className="w-full bg-white border border-blue-200 rounded-xl p-3 text-sm focus:outline-none"
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                                                        <button onClick={() => saveEditComment(comment.id)} className="text-[10px] font-black uppercase text-blue-600">Guardar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                comment.content
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="p-10 bg-white border-t border-slate-50">
                            {user ? (
                                <div className="relative group">
                                    <textarea
                                        rows={3}
                                        placeholder="Añadir comentario técnico..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] p-6 pr-24 text-sm font-medium focus:outline-none focus:bg-white focus:border-black/5 transition-all resize-none"
                                    />
                                    <button
                                        onClick={postComment}
                                        disabled={!newComment.trim()}
                                        className="absolute bottom-4 right-4 bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transform active:scale-95 disabled:opacity-20 transition-all hover:bg-emerald-600 shadow-xl"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-50 rounded-2xl text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inicie sesión para comentar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] invisible lg:visible">
                <div className="absolute inset-0 bg-black mix-blend-overlay" />
            </div>
        </div>
    );
};

export default PreAuditView;
