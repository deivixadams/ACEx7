'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, FilterX, ListFilter, ShieldCheck, X } from 'lucide-react';

interface ControlsViewProps {
    controls: any[];
    isLoading: boolean;
}

type ReviewControl = {
    id_control: string;
    nombre: string;
    descripcion: string | null;
    criticidad: number | null;
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

const ControlsView: React.FC<ControlsViewProps> = ({ controls, isLoading }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewControls, setReviewControls] = useState<ReviewControl[]>([]);
    const [results, setResults] = useState<Record<string, string>>({});
    const [compliance, setCompliance] = useState<Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>>({});

    const selectedCount = selectedIds.size;

    const selectedControls = useMemo(() => {
        if (selectedIds.size === 0) return [];
        return controls.filter((c) => selectedIds.has(c.id));
    }, [controls, selectedIds]);

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
        if (selectedControls.length === 0) {
            alert('Selecciona al menos un control.');
            return;
        }
        setIsReviewOpen(true);
        setIsReviewLoading(true);
        // Reset evaluation state for the new session
        setResults({});
        setCompliance({});
        try {
            const res = await fetch('/api/review-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ controlIds: selectedControls.map((c) => c.id) })
            });
            const data = await res.json();
            setReviewControls(data.controls || []);
        } catch (err) {
            console.error('Failed to load review data', err);
        } finally {
            setIsReviewLoading(false);
        }
    };

    const downloadWordFile = async (
        controlIds: string[],
        currentResults: Record<string, string>,
        currentCompliance: Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>
    ) => {
        const res = await fetch('/api/review-guides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                controlIds,
                download: true,
                results: currentResults,
                compliance: currentCompliance
            })
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const disposition = res.headers.get('content-disposition') || '';
        const match = disposition.match(/filename="?([^\"]+)"?/);
        const filename = match?.[1] || `Cumplimiento-${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}.docx`;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleClearResult = (controlId: string) => {
        setResults((prev) => ({ ...prev, [controlId]: '' }));
        setCompliance((prev) => ({ ...prev, [controlId]: '' }));
    };

    const handleEvaluate = async () => {
        if (reviewControls.length === 0) return;
        await downloadWordFile(reviewControls.map((c) => c.id_control), results, compliance);
    };

    const maturity = useMemo(() => {
        const total = reviewControls.length;
        if (total === 0) return { ic: 0, score: 1, gatingReason: '' };

        let sum = 0;
        let noCumpleCount = 0;
        let hasCriticalNoCumple = false;

        reviewControls.forEach((c) => {
            const state = compliance[c.id_control] || '';
            if (state === 'cumple') sum += 1.0;
            if (state === 'parcial') sum += 0.5;
            if (state === 'no_cumple') {
                sum += 0.0;
                noCumpleCount += 1;
                if (c.criticidad === 2) hasCriticalNoCumple = true;
            }
            if (state === '') sum += 0.0;
        });

        const ic = sum / total;

        // Scoring rules based on updated thresholds
        let score = 1;
        if (ic >= 0.95) score = 5;
        else if (ic >= 0.8) score = 4;
        else if (ic >= 0.6) score = 3;
        else if (ic >= 0.4) score = 2;
        else score = 1;

        // Gating Rules
        if (noCumpleCount === total) {
            return { ic, score: 1, gatingReason: 'Incumplimiento total (100%)' };
        }
        if (noCumpleCount / total > 0.3) {
            return { ic, score: 1, gatingReason: `Alto nivel de incumplimiento (${Math.round((noCumpleCount / total) * 100)}%)` };
        }

        if (hasCriticalNoCumple && score > 2) {
            return { ic, score: 2, gatingReason: 'No cumple en control crítico' };
        }

        return { ic, score, gatingReason: '' };
    }, [reviewControls, compliance]);

    if (isLoading) {
        return <div className="animate-pulse h-96 bg-slate-100 rounded-xl w-full" />;
    }

    if (controls.length === 0) {
        return (
            <div className="w-full p-20 text-center border bg-white rounded-xl">
                <ListFilter className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No hay controles disponibles</h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    Matriz de Controles
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                        {controls.length} Total
                    </span>
                    <button
                        onClick={openReview}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md hover:bg-emerald-700 transition-all"
                    >
                        <BookOpen className="h-4 w-4" />
                        Guías de revisión
                    </button>
                    <button
                        onClick={clearSelection}
                        disabled={selectedCount === 0}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${selectedCount > 0
                            ? 'bg-slate-700 text-white hover:bg-slate-800'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <FilterX className="h-4 w-4" />
                        Limpiar selección
                    </button>
                </div>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-4 py-3 w-10 bg-slate-50">&nbsp;</th>
                            <th className="px-6 py-3 w-48 bg-slate-50">Nombre</th>
                            <th className="px-6 py-3 min-w-[200px] bg-slate-50">Descripción</th>
                            <th className="px-6 py-3 w-32 bg-slate-50">Tipo</th>
                            <th className="px-6 py-3 min-w-[200px] bg-slate-50">Evidencia Esperada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {controls.map((control) => {
                            const isSelected = selectedIds.has(control.id);
                            return (
                                <tr key={control.id} className={`transition-colors group ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(control.id)}
                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            aria-label={`Seleccionar ${control.nombre}`}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="text-sm font-semibold text-slate-900">{control.nombre}</div>
                                        {control.codigo && (
                                            <span className="font-mono text-[10px] text-slate-400">{control.codigo}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="text-xs text-slate-600 leading-relaxed max-w-xl text-justify">
                                            {control.descripcion || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                                            {control.tipo_control || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-2">
                                            {control.evidencia_esperada || <span className="text-slate-300">No definida</span>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isReviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={closeReview}
                    />
                    <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-800 uppercase tracking-wider">Guías de revisión</div>
                                    <div className="text-xs text-slate-500">Controles seleccionados: {selectedCount}</div>
                                </div>
                            </div>
                            <button
                                onClick={closeReview}
                                className="p-2 rounded-lg hover:bg-slate-100"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            {isReviewLoading ? (
                                <div className="animate-pulse h-48 bg-slate-100 rounded-xl w-full" />
                            ) : (
                                <div className="space-y-8">
                                    {reviewControls.map((control) => (
                                        <div key={control.id_control} className="border border-slate-200 rounded-xl p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-lg font-bold text-slate-800">{control.nombre}</div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${control.criticidad === 2
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : control.criticidad === 1
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}>
                                                            {control.criticidad_etiqueta || 'Normal'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-600 mt-1">
                                                        {control.descripcion || '-'}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 uppercase tracking-wider">
                                                    {compliance[control.id_control] === 'cumple' && 'Cumple'}
                                                    {compliance[control.id_control] === 'no_cumple' && 'No cumple'}
                                                    {compliance[control.id_control] === 'parcial' && 'Cumple parcial'}
                                                    {(!compliance[control.id_control] || compliance[control.id_control] === '') && 'Sin evaluar'}
                                                </span>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="text-xs font-bold uppercase text-slate-600 mb-2">Riesgo asociado</div>
                                                    {control.riesgos.length === 0 ? (
                                                        <div className="text-xs text-slate-400">Sin riesgos asociados.</div>
                                                    ) : (
                                                        <ul className="space-y-2">
                                                            {control.riesgos.map((r) => (
                                                                <li key={r.id_riesgo} className="text-xs text-slate-700">
                                                                    {r.descripcion || r.id_riesgo}
                                                                    {r.tipo ? ` | ${r.tipo}` : ''}
                                                                    {r.nivel_riesgo ? ` | ${r.nivel_riesgo}` : ''}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-4">
                                                    <div className="text-xs font-bold uppercase text-slate-600 mb-2">Detalle de la prueba</div>
                                                    {control.pruebas.length === 0 ? (
                                                        <div className="text-xs text-slate-400">Sin pruebas asociadas.</div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {control.pruebas.map((t) => (
                                                                <div key={t.id_prueba} className="text-xs text-slate-700">
                                                                    <div className="font-semibold">{t.nombre}{t.codigo_prueba ? ` (${t.codigo_prueba})` : ''}</div>
                                                                    {t.como_hacer_la_prueba && <div>Cómo hacer la prueba: {t.como_hacer_la_prueba}</div>}
                                                                    {t.evidencia_minima && <div>Evidencia mínima: {t.evidencia_minima}</div>}
                                                                    {t.fuente_evidencia && <div>Fuente evidencia: {t.fuente_evidencia}</div>}
                                                                    {t.criterio_aceptacion && <div>Criterio aceptación: {t.criterio_aceptacion}</div>}
                                                                    {t.muestreo_sugerido && <div>Muestreo sugerido: {t.muestreo_sugerido}</div>}
                                                                    {t.descripcion && <div>Descripción: {t.descripcion}</div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="text-xs font-bold uppercase text-slate-600">Resultado de evaluación (max 2000 caracteres)</label>
                                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={compliance[control.id_control] === 'cumple'}
                                                            onChange={() => setCompliance((prev) => ({ ...prev, [control.id_control]: prev[control.id_control] === 'cumple' ? '' : 'cumple' }))}
                                                            className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        Cumple
                                                    </label>
                                                    <label className="flex items-center gap-2 text-xs font-bold text-rose-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={compliance[control.id_control] === 'no_cumple'}
                                                            onChange={() => setCompliance((prev) => ({ ...prev, [control.id_control]: prev[control.id_control] === 'no_cumple' ? '' : 'no_cumple' }))}
                                                            className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                                                        />
                                                        No cumple
                                                    </label>
                                                    <label className="flex items-center gap-2 text-xs font-bold text-amber-800">
                                                        <input
                                                            type="checkbox"
                                                            checked={compliance[control.id_control] === 'parcial'}
                                                            onChange={() => setCompliance((prev) => ({ ...prev, [control.id_control]: prev[control.id_control] === 'parcial' ? '' : 'parcial' }))}
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
                                                    value={results[control.id_control] || ''}
                                                    onChange={(e) => setResults((prev) => ({ ...prev, [control.id_control]: e.target.value }))}
                                                />
                                            </div>

                                            <div className="mt-4 flex items-center gap-3">
                                                <button
                                                    onClick={() => handleClearResult(control.id_control)}
                                                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-300"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                                <span>IC: {maturity.ic.toFixed(2)}</span>
                                <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                                    Madurez: {maturity.score}
                                </span>
                                {maturity.gatingReason && (
                                    <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                                        {maturity.gatingReason}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleEvaluate}
                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-700"
                                >
                                    Evaluar
                                </button>
                                <button
                                    onClick={closeReview}
                                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-300"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlsView;
