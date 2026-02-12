'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, FileText, FilterX, ListFilter, ShieldCheck, X } from 'lucide-react';

interface RequirementsViewProps {
    requirements: any[];
    isLoading: boolean;
}

type ReviewEntity = {
    id_control: string;
    nombre: string;
    descripcion: string | null;
    criticidad?: number | null;
    criticidad_etiqueta: string | null;
    riesgos: Array<{
        id_riesgo: string;
        descripcion: string | null;
        tipo: string | null;
        impacto: string | null;
        probabilidad: string | null;
        nivel_riesgo: string | null;
    }>;
    pruebas: Array<{
        id_prueba: string;
        nombre: string;
        codigo_prueba: string | null;
        descripcion: string | null;
        como_hacer_la_prueba: string | null;
        evidencia_minima: string | null;
        fuente_evidencia: string | null;
        criterio_aceptacion: string | null;
        muestreo_sugerido: string | null;
    }>;
};

const RequirementsView: React.FC<RequirementsViewProps> = ({ requirements, isLoading }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewEntities, setReviewEntities] = useState<ReviewEntity[]>([]);
    const [results, setResults] = useState<Record<string, string>>({});
    const [compliance, setCompliance] = useState<Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>>({});

    const selectedCount = selectedIds.size;

    const selectedRequirements = useMemo(() => {
        if (selectedIds.size === 0) return [];
        return requirements.filter((r) => selectedIds.has(r.id_requerimiento));
    }, [requirements, selectedIds]);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const closeReview = () => {
        setIsReviewOpen(false);
    };

    const openReview = async () => {
        if (selectedRequirements.length === 0) {
            alert('Selecciona al menos un requerimiento.');
            return;
        }
        setIsReviewOpen(true);
        setIsReviewLoading(true);
        setResults({});
        setCompliance({});
        try {
            const res = await fetch('/api/review-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requirementIds: selectedRequirements.map((r) => r.id_requerimiento) })
            });
            const data = await res.json();
            setReviewEntities(data.controls || []);
        } catch (err) {
            console.error('Failed to load review data', err);
        } finally {
            setIsReviewLoading(false);
        }
    };

    const downloadWordFile = async (
        ids: string[],
        currentResults: Record<string, string>,
        currentCompliance: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>
    ) => {
        const res = await fetch('/api/review-guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requirementIds: ids,
                download: true,
                results: currentResults,
                compliance: currentCompliance,
                isRequirement: true
            })
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const disposition = res.headers.get('content-disposition') || '';
        const match = disposition.match(/filename="?([^\"]+)"?/);

        // Month names fornomenclature
        const monthsSpanish = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const fallbackName = `Requerimiento-${monthsSpanish[now.getMonth()]}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.docx`;

        const filename = match?.[1] || fallbackName;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleClearResult = (id: string) => {
        setResults((prev) => ({ ...prev, [id]: '' }));
        setCompliance((prev) => ({ ...prev, [id]: '' }));
    };

    const handleEvaluate = async () => {
        if (reviewEntities.length === 0) return;
        await downloadWordFile(reviewEntities.map((e) => e.id_control), results, compliance);
    };

    const maturity = useMemo(() => {
        const total = reviewEntities.length;
        if (total === 0) return { ic: 0, score: 1, gatingReason: '' };

        let sum = 0;
        let noCumpleCount = 0;
        let hasCriticalNoCumple = false;

        reviewEntities.forEach((e) => {
            const state = compliance[e.id_control] || '';
            if (state === 'cumple') sum += 1.0;
            if (state === 'parcial') sum += 0.5;
            if (state === 'no_cumple') {
                sum += 0.0;
                noCumpleCount += 1;
                const isHighRisk = e.criticidad === 2 ||
                    e.criticidad_etiqueta?.toLowerCase().includes('alto') ||
                    e.criticidad_etiqueta?.toLowerCase().includes('crítico');
                if (isHighRisk) hasCriticalNoCumple = true;
            }
        });

        const ic = sum / total;
        let score = 1;
        if (ic >= 0.95) score = 5;
        else if (ic >= 0.8) score = 4;
        else if (ic >= 0.6) score = 3;
        else if (ic >= 0.4) score = 2;
        else score = 1;

        if (noCumpleCount === total) return { ic, score: 1, gatingReason: 'Incumplimiento total (100%)' };
        if (noCumpleCount / total > 0.3) return { ic, score: 1, gatingReason: 'Alto nivel de incumplimiento (>30%)' };
        if (hasCriticalNoCumple && score > 2) return { ic, score: 2, gatingReason: 'No cumple en requerimiento crítico' };

        return { ic, score, gatingReason: '' };
    }, [reviewEntities, compliance]);

    if (isLoading) {
        return <div className="animate-pulse h-96 bg-slate-100 rounded-xl w-full" />;
    }

    if (requirements.length === 0) {
        return (
            <div className="w-full p-20 text-center border bg-white rounded-xl">
                <ListFilter className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No hay requerimientos disponibles</h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Requerimientos Normativos
                    </h2>
                    {selectedCount > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                                {selectedCount} Seleccionados
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                title="Limpiar selección"
                            >
                                <FilterX className="h-4 w-4" />
                            </button>
                            <button
                                onClick={openReview}
                                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <BookOpen className="h-3 w-3" />
                                Guías de revisión
                            </button>
                        </div>
                    )}
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {requirements.length} Total
                </span>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-4 py-3 w-10 bg-slate-50"></th>
                            <th className="px-6 py-3 w-32 bg-slate-50">Código</th>
                            <th className="px-6 py-3 bg-slate-50">Título / Descripción</th>
                            <th className="px-6 py-3 w-36 bg-slate-50">Categoría</th>
                            <th className="px-6 py-3 w-40 bg-slate-50">Riesgo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {requirements.map((req) => (
                            <tr
                                key={req.id_requerimiento}
                                className={`transition-colors group ${selectedIds.has(req.id_requerimiento) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                            >
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(req.id_requerimiento)}
                                        onChange={() => toggleSelect(req.id_requerimiento)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </td>
                                <td className="px-6 py-3">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                        {req.codigo || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-700 leading-snug">{req.titulo || req.nombre}</div>
                                        {req.descripcion && (
                                            <div className="text-xs text-slate-500 leading-relaxed max-w-xl text-justify">
                                                {req.descripcion}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 uppercase">
                                        {req.categoria || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${req.nivel_riesgo?.toLowerCase().includes('alto') || req.nivel_riesgo?.toLowerCase().includes('crítico')
                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                        : req.nivel_riesgo?.toLowerCase().includes('medio')
                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {req.nivel_riesgo || 'Bajo'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Evaluation Modal */}
            {isReviewOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-white overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2 rounded-xl">
                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Guías de Revisión Normativa</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {reviewEntities.length} Requerimientos seleccionados
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeReview} className="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
                                <X className="h-5 w-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto p-6 space-y-8">
                            {isReviewLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando guías...</p>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    {reviewEntities.map((entity, idx) => (
                                        <div key={entity.id_control} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-white text-[10px] font-black">
                                                        {idx + 1}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-700 leading-snug">{entity.nombre}</h4>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${entity.criticidad_etiqueta?.toLowerCase().includes('alto') || entity.criticidad_etiqueta?.toLowerCase().includes('crítico')
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {entity.criticidad_etiqueta || 'Nivel Normal'}
                                                </span>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Description */}
                                                {entity.descripcion && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Descripción del Requerimiento</label>
                                                        <p className="text-sm text-slate-600 leading-relaxed text-justify">{entity.descripcion}</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Risks Section */}
                                                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-rose-500" />
                                                            Riesgo Vinculado
                                                        </label>
                                                        {entity.riesgos.length > 0 ? (
                                                            entity.riesgos.map((r) => (
                                                                <div key={r.id_riesgo} className="space-y-1">
                                                                    <div className="text-xs font-bold text-slate-700">{r.id_riesgo}: {r.descripcion}</div>
                                                                    <div className="flex gap-2">
                                                                        <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 uppercase">{r.tipo}</span>
                                                                        <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-rose-600 uppercase">NI: {r.nivel_riesgo}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs italic text-slate-400">Sin riesgos específicos vinculados.</div>
                                                        )}
                                                    </div>

                                                    {/* Tests Section */}
                                                    <div className="space-y-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                                                        <label className="text-[10px] font-bold uppercase text-blue-600 tracking-wider flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-blue-500" />
                                                            Procedimientos de Auditoría
                                                        </label>
                                                        {entity.pruebas.length > 0 ? (
                                                            entity.pruebas.map((t) => (
                                                                <div key={t.id_prueba} className="space-y-2 bg-white/60 p-3 rounded-lg border border-blue-100">
                                                                    <div className="text-xs font-bold text-blue-800 uppercase flex justify-between">
                                                                        <span>{t.nombre}</span>
                                                                        <span className="text-[9px] opacity-70">{t.codigo_prueba}</span>
                                                                    </div>
                                                                    {t.como_hacer_la_prueba && (
                                                                        <div className="text-[11px] text-slate-600 leading-snug">
                                                                            <span className="font-bold text-blue-700/70">PASOS:</span> {t.como_hacer_la_prueba}
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-100">
                                                                        <div>
                                                                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Evidencia</span>
                                                                            <span className="text-[10px] text-slate-600 line-clamp-2">{t.evidencia_minima || 'N/A'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-[9px] font-bold text-slate-400 block uppercase">Criterio</span>
                                                                            <span className="text-[10px] text-slate-600 line-clamp-2">{t.criterio_aceptacion || 'Normativo'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs italic text-slate-400">Sin pruebas específicas configuradas.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Evaluation Result */}
                                                <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                    <label className="text-xs font-bold uppercase text-emerald-900/70">Resultado de evaluación (max 2000 caracteres)</label>
                                                    <div className="mt-3 flex flex-wrap items-center gap-4">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                                                            <input
                                                                type="checkbox"
                                                                checked={compliance[entity.id_control] === 'cumple'}
                                                                onChange={() => setCompliance((prev) => ({ ...prev, [entity.id_control]: prev[entity.id_control] === 'cumple' ? '' : 'cumple' }))}
                                                                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                            Cumple
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-rose-800">
                                                            <input
                                                                type="checkbox"
                                                                checked={compliance[entity.id_control] === 'no_cumple'}
                                                                onChange={() => setCompliance((prev) => ({ ...prev, [entity.id_control]: prev[entity.id_control] === 'no_cumple' ? '' : 'no_cumple' }))}
                                                                className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                                                            />
                                                            No cumple
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-amber-800">
                                                            <input
                                                                type="checkbox"
                                                                checked={compliance[entity.id_control] === 'parcial'}
                                                                onChange={() => setCompliance((prev) => ({ ...prev, [entity.id_control]: prev[entity.id_control] === 'parcial' ? '' : 'parcial' }))}
                                                                className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                                            />
                                                            Cumple parcial
                                                        </label>
                                                    </div>
                                                    <textarea
                                                        maxLength={2000}
                                                        rows={4}
                                                        className="mt-2 w-full rounded-lg border border-emerald-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
                                                        placeholder="Escribe el resultado de la prueba aquí..."
                                                        value={results[entity.id_control] || ''}
                                                        onChange={(e) => setResults((prev) => ({ ...prev, [entity.id_control]: e.target.value }))}
                                                    />
                                                </div>

                                                <div className="mt-4 flex items-center gap-3 text-sm">
                                                    <button
                                                        onClick={() => handleClearResult(entity.id_control)}
                                                        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-300"
                                                    >
                                                        Limpiar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex gap-10">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Índice Cumplimiento</div>
                                    <div className="text-2xl font-black text-slate-800">{(maturity.ic * 100).toFixed(0)}%</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Madurez</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <div key={s} className={`h-4 w-2 rounded-sm ${s <= maturity.score ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xl font-black text-emerald-600 ml-1">{maturity.score}</span>
                                    </div>
                                </div>
                                {maturity.gatingReason && (
                                    <div className="space-y-1 animate-pulse">
                                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            Limitador Activado
                                        </div>
                                        <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{maturity.gatingReason}</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeReview}
                                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold uppercase hover:bg-slate-200 transition-all border border-slate-200/50"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleEvaluate}
                                    className="flex items-center gap-3 px-8 py-3 bg-emerald-600 text-white text-xs font-black uppercase rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95"
                                >
                                    <FileText className="h-4 w-4" />
                                    Generar Evaluación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequirementsView;
