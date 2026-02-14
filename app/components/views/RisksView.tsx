import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, CheckSquare, FilterX, ShieldCheck, X, FileText, Sparkles, Wand2, Info, ChevronRight, Play } from 'lucide-react';
import { Packer } from 'docx';
import RiskAnalysisTable from '../../components/RiskAnalysisTable';
import LinkedResources from '../../components/LinkedResources';
import EvaluationView from './EvaluationView';
import ActaInicioView from './ActaInicioView';

interface ReviewEntity {
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
}

interface RisksViewProps {
    data: any;
    isLoading: boolean;
    selectedRiskIds: string[];
    onRiskSelect: (id: string, isMulti: boolean) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    filteredControls: any[];
    filteredTests: any[];
}

const RisksView: React.FC<RisksViewProps> = ({
    data,
    isLoading,
    selectedRiskIds,
    onRiskSelect,
    onSelectAll,
    onClearSelection,
    filteredControls,
    filteredTests
}) => {
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewEntities, setReviewEntities] = useState<ReviewEntity[]>([]);
    const [results, setResults] = useState<Record<string, string>>({});
    const [compliance, setCompliance] = useState<Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>>({});

    const [excludedControlIds, setExcludedControlIds] = useState<Set<string>>(new Set());
    const [excludedTestIds, setExcludedTestIds] = useState<Set<string>>(new Set());

    const [isEvaluationActive, setIsEvaluationActive] = useState(false);
    const [currentAudit, setCurrentAudit] = useState<{ codigo: string; fecha_inicio: string } | undefined>();

    // Report Setup Modal State
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [reportMetadata, setReportMetadata] = useState({
        objetivos: '',
        alcance: '',
        metodologia: ''
    });
    const [isRefining, setIsRefining] = useState<Record<string, boolean>>({});
    const [isAutoCompleting, setIsAutoCompleting] = useState(false);
    const [isActaModalOpen, setIsActaModalOpen] = useState(false);

    // Reset exclusions when the main selection is cleared
    useEffect(() => {
        if (selectedRiskIds.length === 0) {
            setExcludedControlIds(new Set());
            setExcludedTestIds(new Set());
        }
    }, [selectedRiskIds]);

    const toggleControlExclusion = (id: string) => {
        setExcludedControlIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleTestExclusion = (id: string) => {
        setExcludedTestIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectedRisks = useMemo(() => {
        if (!data?.risks) return [];
        return data.risks.filter((r: any) => selectedRiskIds.includes(r.id_riesgo));
    }, [data, selectedRiskIds]);

    const refineWithAI = async (field: 'objetivos' | 'alcance' | 'metodologia') => {
        const text = reportMetadata[field];
        if (!text || text.length < 5) return;

        setIsRefining(prev => ({ ...prev, [field]: true }));
        try {
            const res = await fetch('/api/ai/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, field })
            });
            const data = await res.json();
            if (data.refinedText) {
                setReportMetadata(prev => ({ ...prev, [field]: data.refinedText }));
            }
        } catch (err) {
            console.error('AI Refinement failed', err);
        } finally {
            setIsRefining(prev => ({ ...prev, [field]: false }));
        }
    };

    const autoCompleteAll = async () => {
        setIsAutoCompleting(true);
        try {
            // Context: Risk names and linked Control names
            const risks = selectedRisks.map((r: any) => r.descripcion || 'Riesgo sin descripción');
            const reqIds = selectedRisks.map((r: any) => r.id_requerimiento).filter(Boolean);
            const controls = filteredControls
                .filter(c => reqIds.includes(c.id_requerimiento))
                .slice(0, 5)
                .map(c => c.nombre);

            const res = await fetch('/api/ai/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generate_all',
                    context: { risks, controls }
                })
            });
            const d = await res.json();
            if (d.metadata) {
                setReportMetadata(d.metadata);
            }
        } catch (err) {
            console.error('Auto-complete failed', err);
        } finally {
            setIsAutoCompleting(false);
        }
    };

    const openReview = async () => {
        const reqIds = selectedRisks.map((r: any) => r.id_requerimiento).filter(Boolean);
        if (reqIds.length === 0) {
            alert('Los riesgos seleccionados no tienen requerimientos asociados para evaluar.');
            return;
        }

        // Go directly to full-screen evaluation (skip setup modal)
        setIsReviewLoading(true);
        try {
            const res = await fetch('/api/review-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requirementIds: reqIds })
            });
            const d = await res.json();

            const filteredEntities = (d.controls || [])
                .map((req: any) => ({
                    ...req,
                    pruebas: (req.pruebas || []).filter((p: any) => !excludedTestIds.has(p.id_prueba)),
                    riesgos: (req.riesgos || []).filter((r: any) => selectedRiskIds.includes(r.id_riesgo))
                }))
                .filter((req: any) => req.pruebas.length > 0 || req.riesgos.length > 0);

            setReviewEntities(filteredEntities);
            setCurrentAudit({
                codigo: `AUD-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
                fecha_inicio: new Date().toLocaleDateString('es-ES')
            });
            setIsEvaluationActive(true);
        } catch (err) {
            console.error('Failed to load review data', err);
            alert('Error al cargar los datos de evaluación.');
        } finally {
            setIsReviewLoading(false);
        }
    };

    const handleConfirmSetup = async () => {
        const reqIds = selectedRisks.map((r: any) => r.id_requerimiento).filter(Boolean);
        setIsSetupModalOpen(false);
        setIsReviewOpen(true);
        setIsReviewLoading(true);
        setResults({});
        setCompliance({});
        try {
            const res = await fetch('/api/review-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requirementIds: reqIds })
            });
            const d = await res.json();

            const filteredEntities = (d.controls || [])
                .map((req: any) => ({
                    ...req,
                    pruebas: (req.pruebas || []).filter((p: any) => !excludedTestIds.has(p.id_prueba)),
                    riesgos: (req.riesgos || []).filter((r: any) => selectedRiskIds.includes(r.id_riesgo))
                }))
                .filter((req: any) => req.pruebas.length > 0 || req.riesgos.length > 0);

            setReviewEntities(filteredEntities);
            setCurrentAudit({
                codigo: `AUD - ${new Date().getFullYear()} -${Math.floor(Math.random() * 900) + 100} `,
                fecha_inicio: new Date().toLocaleDateString('es-ES')
            });
            setIsEvaluationActive(true);
        } catch (err) {
            console.error('Failed to load review data', err);
        } finally {
            setIsReviewLoading(false);
            setIsReviewOpen(false);
        }
    };

    const closeReview = () => setIsReviewOpen(false);

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
        const monthsSpanish = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const filename = `Riesgos - ${monthsSpanish[now.getMonth()]}${String(now.getDate()).padStart(2, '0')} -${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.docx`;
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

    return (
        <div className="space-y-6">
            {/* Full-screen loading overlay while fetching evaluation data */}
            {isReviewLoading && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Preparando Evaluación</p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Cargando guías de auditoría...</p>
                    </div>
                </div>
            )}
            {/* Top: Header & Risk List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50">
                    <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.15em] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Análisis de Riesgos
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            {(data?.risks || []).length} Total
                        </span>
                        <button
                            onClick={onSelectAll}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-sm hover:bg-slate-900 transition-all"
                        >
                            <CheckSquare className="h-4 w-4" />
                            Seleccionar todo
                        </button>
                        <button
                            onClick={onClearSelection}
                            disabled={selectedRiskIds.length === 0}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-sm ${selectedRiskIds.length > 0
                                ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                                }`}
                        >
                            <FilterX className="h-4 w-4" />
                            Limpiar selección
                        </button>
                        {selectedRiskIds.length > 0 && (
                            <button
                                onClick={openReview}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.12em] shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-300"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                Iniciar Evaluación
                                <span className="ml-1 bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black">
                                    {selectedRiskIds.length}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
                <RiskAnalysisTable
                    risks={data?.risks || []}
                    selectedIds={selectedRiskIds}
                    onSelect={onRiskSelect}
                    onSelectAll={onSelectAll}
                    onClear={onClearSelection}
                    isLoading={isLoading}
                    hideHeader={true}
                />
            </div>

            {/* Bottom: Resources */}
            <section className="space-y-2 pt-4 border-t border-slate-200">
                <LinkedResources
                    controls={filteredControls}
                    tests={filteredTests}
                    isLoading={isLoading}
                    excludedControlIds={excludedControlIds}
                    excludedTestIds={excludedTestIds}
                    onToggleControl={toggleControlExclusion}
                    onToggleTest={toggleTestExclusion}
                />
            </section>
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
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Guías de Revisión de Riesgos</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {reviewEntities.length} Requerimientos asociados evaluados
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
                                                {entity.descripcion && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">Descripción del Requerimiento</label>
                                                        <p className="text-sm text-slate-600 leading-relaxed text-justify">{entity.descripcion}</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs italic text-slate-400">Sin pruebas específicas configuradas.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                                    <label className="text-xs font-bold uppercase text-emerald-900/70">Resultado de evaluación</label>
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
            {/* Modal: Acta de Inicio */}
            {isActaModalOpen && (
                <ActaInicioView
                    auditoriaId="DEMO-123"
                    onClose={() => setIsActaModalOpen(false)}
                    onGoToRisks={() => {
                        setIsActaModalOpen(false);
                        openReview();
                    }}
                />
            )}
            {isEvaluationActive && (
                <EvaluationView
                    entities={reviewEntities}
                    onClose={() => setIsEvaluationActive(false)}
                    auditInfo={currentAudit}
                    reportMetadata={reportMetadata}
                />
            )}

            {/* Report Setup Modal */}
            {isSetupModalOpen && (
                <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black uppercase tracking-tight">Configuración del Informe</h3>
                                        <button
                                            onClick={autoCompleteAll}
                                            disabled={isAutoCompleting}
                                            className="mr-12 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {isAutoCompleting ? (
                                                <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                            )}
                                            Auto-completar con IA
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Define el contexto de la auditoría</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSetupModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            {[
                                { id: 'objetivos', label: 'Objetivos', placeholder: 'P. ej. Evaluar la eficacia del programa de cumplimiento...', icon: ShieldCheck },
                                { id: 'alcance', label: 'Alcance', placeholder: 'P. ej. Todos los procesos operativos de la sede central...', icon: Info },
                                { id: 'metodologia', label: 'Metodología', placeholder: 'P. ej. Revisiones documentales y pruebas sustantivas...', icon: BookOpen },
                            ].map((field) => (
                                <div key={field.id} className="space-y-2 group">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <field.icon className="h-4 w-4 text-slate-400" />
                                            {field.label}
                                        </label>
                                        <button
                                            onClick={() => refineWithAI(field.id as any)}
                                            disabled={isRefining[field.id] || !reportMetadata[field.id as keyof typeof reportMetadata]}
                                            className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-30 disabled:grayscale"
                                        >
                                            {isRefining[field.id] ? (
                                                <div className="h-3 w-3 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                                            ) : (
                                                <Wand2 className="h-3 w-3" />
                                            )}
                                            AI Wizard
                                        </button>
                                    </div>
                                    <textarea
                                        value={reportMetadata[field.id as keyof typeof reportMetadata]}
                                        onChange={(e) => setReportMetadata(prev => ({ ...prev, [field.id]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all min-h-[80px]"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsSetupModalOpen(false)}
                                className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmSetup}
                                disabled={!reportMetadata.objetivos || !reportMetadata.alcance || !reportMetadata.metodologia}
                                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                Comenzar Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RisksView;
