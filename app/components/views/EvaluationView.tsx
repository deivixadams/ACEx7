'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Save,
    FileText,
    ShieldCheck,
    AlertCircle,
    Brain,
    ChevronRight,
    ChevronLeft,
    Layout,
    Search,
    Check,
    X,
    Calendar,
    LogOut,
    Download
} from 'lucide-react';

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

interface EvaluationViewProps {
    entities: ReviewEntity[];
    onClose: () => void;
    auditInfo?: {
        id?: number | string;
        codigo: string;
        fecha_inicio: string;
    };
    reportMetadata?: {
        objetivos: string;
        alcance: string;
        metodologia: string;
    };
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ entities, onClose, auditInfo, reportMetadata }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [compliance, setCompliance] = useState<Record<string, 'cumple' | 'no_cumple' | 'parcial' | ''>>({});
    const [results, setResults] = useState<Record<string, string>>({});
    const [isRefining, setIsRefining] = useState(false);
    const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const currentEntity = entities[currentIndex];

    const progress = useMemo(() => {
        const completed = Object.values(compliance).filter(v => v !== '').length;
        return (completed / entities.length) * 100;
    }, [compliance, entities]);

    const filteredEntities = entities.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save results to DB
            const res = await fetch('/api/evaluaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auditoria_id: auditInfo?.id || 1, // Defaulting to 1 for demo if no ID
                    results,
                    compliance,
                    fecha: evaluationDate
                })
            });

            if (!res.ok) throw new Error('Failed to save');

            // 2. Clear loading and ask for report
            setIsSaving(false);
            setShowConfirmModal(true);
        } catch (err) {
            console.error(err);
            setIsSaving(false);
            alert('Error al guardar la evaluación');
        }
    };

    const downloadReport = async () => {
        const reportId = auditInfo?.id || 'demo';
        try {
            // Switch to POST to send reportMetadata
            const res = await fetch(`/api/reportes/${reportId}/export/docx`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportMetadata,
                    // Also sending evaluation data for completeness
                    compliance,
                    results,
                    entities: entities.map(e => ({
                        id: e.id_control,
                        nombre: e.nombre
                    }))
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate report');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            const now = new Date();
            const filename = `Informe-Final-${reportId}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.docx`;

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
            setShowConfirmModal(false);
        } catch (err: any) {
            console.error('Download error:', err);
            alert(`Error al generar el informe: ${err.message}`);
        }
    };

    const refineFindingWithAI = async () => {
        const id = currentEntity.id_control;
        const existingText = results[id] || '';
        const complianceState = compliance[id] || '';

        setIsRefining(true);
        try {
            const res = await fetch('/api/ai/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'hallazgo_evaluation',
                    text: existingText,
                    field: 'hallazgo',
                    context: {
                        controlName: currentEntity.nombre,
                        controlDescription: currentEntity.descripcion,
                        criticidad: currentEntity.criticidad_etiqueta,
                        complianceState,
                        risks: currentEntity.riesgos.map(r => ({
                            descripcion: r.descripcion,
                            tipo: r.tipo,
                            nivel_riesgo: r.nivel_riesgo,
                            impacto: r.impacto
                        })),
                        tests: currentEntity.pruebas.map(t => ({
                            nombre: t.nombre,
                            como_hacer: t.como_hacer_la_prueba,
                            evidencia_minima: t.evidencia_minima,
                            criterio_aceptacion: t.criterio_aceptacion
                        }))
                    }
                })
            });
            const data = await res.json();
            if (data.refinedText) {
                setResults(prev => ({ ...prev, [id]: data.refinedText }));
            }
        } catch (err) {
            console.error('AI Refinement failed', err);
        } finally {
            setIsRefining(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < entities.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Bar - Premium Header */}
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10 font-sans">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2" />
                    <div>
                        <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Evaluación de Auditoría</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {auditInfo?.codigo || 'AUD-2026-X7'} • <span className="text-emerald-600 font-black">{evaluationDate}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Date Picker Integration */}
                    <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <input
                            type="date"
                            value={evaluationDate}
                            onChange={(e) => setEvaluationDate(e.target.value)}
                            className="bg-transparent text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none border-none p-0 cursor-pointer"
                        />
                    </div>

                    {/* Progress Bar */}
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <div className="flex justify-between w-48 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Progreso</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Guardar
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 group"
                        >
                            <LogOut className="h-4 w-4 text-rose-500" />
                            Cerrar
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Navigation Panel */}
                <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar requerimiento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>
                    <nav className="flex-1 overflow-auto py-2">
                        {filteredEntities.map((e, idx) => {
                            const isSelected = entities[currentIndex].id_control === e.id_control;
                            const status = compliance[e.id_control];

                            return (
                                <button
                                    key={e.id_control}
                                    onClick={() => {
                                        const globalIdx = entities.findIndex(item => item.id_control === e.id_control);
                                        setCurrentIndex(globalIdx);
                                    }}
                                    className={`w-full px-4 py-3 flex items-start gap-3 transition-all hover:bg-slate-50 border-r-2 ${isSelected ? 'bg-emerald-50/50 border-emerald-500 shadow-sm' : 'border-transparent'
                                        }`}
                                >
                                    <div className="mt-0.5 flex flex-col items-center gap-1">
                                        {status ? (
                                            <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                                                <Check className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        ) : (
                                            <Circle className="h-4 w-4 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>
                                            {e.nombre}
                                        </h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            {e.criticidad_etiqueta || 'Nivel Normal'}
                                        </p>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 text-slate-300 mt-1 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-slate-50/50 p-8">
                    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

                        {/* Summary Header */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldCheck className="h-32 w-32" />
                            </div>

                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                                <Layout className="h-4 w-4" />
                                Detalle del Ítem
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 leading-tight mb-4">
                                {currentEntity.nombre}
                            </h2>

                            {currentEntity.descripcion && (
                                <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {currentEntity.descripcion}
                                </p>
                            )}
                        </div>

                        {/* Audit Guides & Evidence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Procedures */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Procedimientos de Prueba
                                </h3>
                                <div className="space-y-4 flex-1">
                                    {currentEntity.pruebas.length > 0 ? (
                                        currentEntity.pruebas.map((t) => (
                                            <div key={t.id_prueba} className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[11px] font-bold text-blue-900 leading-tight">{t.nombre}</span>
                                                    <span className="text-[9px] font-mono text-blue-400">{t.codigo_prueba}</span>
                                                </div>
                                                {t.como_hacer_la_prueba && (
                                                    <div className="text-[11px] text-slate-600 leading-normal">
                                                        <span className="font-bold text-blue-700/70">PASOS:</span> {t.como_hacer_la_prueba}
                                                    </div>
                                                )}
                                                {t.evidencia_minima && (
                                                    <div className="text-[11px] text-slate-600 leading-normal border-t border-blue-100/50 pt-2">
                                                        <span className="font-bold text-blue-700/70">EVIDENCIA:</span> {t.evidencia_minima}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center py-10 text-slate-400 italic text-xs">
                                            No hay procedimientos configurados
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Linked Risks */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
                                <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Riesgos Asociados
                                </h3>
                                <div className="space-y-3">
                                    {currentEntity.riesgos.map((r) => (
                                        <div key={r.id_riesgo} className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                                            <div className="text-[11px] font-bold text-rose-900 mb-2">{r.descripcion}</div>
                                            <div className="flex gap-2">
                                                <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-500 uppercase tracking-tighter">NI: {r.nivel_riesgo}</span>
                                                <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-slate-400 uppercase tracking-tighter">{r.tipo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Form */}
                        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-100 shadow-xl shadow-emerald-500/5 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dictamen de Auditoría</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecciona el estado de cumplimiento</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {[
                                        {
                                            id: 'cumple', label: 'Cumple', icon: Check,
                                            active: 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm',
                                            iconActive: 'text-emerald-500'
                                        },
                                        {
                                            id: 'parcial', label: 'Parcial', icon: AlertCircle,
                                            active: 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm',
                                            iconActive: 'text-amber-500'
                                        },
                                        {
                                            id: 'no_cumple', label: 'No Cumple', icon: X,
                                            active: 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm',
                                            iconActive: 'text-rose-500'
                                        }
                                    ].map((opt) => {
                                        const isActive = compliance[currentEntity.id_control] === opt.id;

                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => setCompliance(prev => ({ ...prev, [currentEntity.id_control]: isActive ? '' : opt.id as any }))}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2
                                                    ${isActive
                                                        ? opt.active
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                                                `}
                                            >
                                                <opt.icon className={`h-3.5 w-3.5 ${isActive ? opt.iconActive : ''}`} />
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        Observaciones y Hallazgos
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    </label>
                                    <button
                                        onClick={refineFindingWithAI}
                                        disabled={isRefining || !results[currentEntity.id_control]}
                                        className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors group disabled:opacity-30"
                                    >
                                        {isRefining ? (
                                            <div className="h-3.5 w-3.5 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                                        ) : (
                                            <Brain className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                        )}
                                        Asistente IA
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-3xl p-6 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all min-h-[160px] "
                                    placeholder="Describe los hallazgos detallados, evidencias revisadas y conclusiones..."
                                    value={results[currentEntity.id_control] || ''}
                                    onChange={(e) => setResults(prev => ({ ...prev, [currentEntity.id_control]: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pb-10">
                            <button
                                onClick={handleBack}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                            >
                                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Anterior
                            </button>

                            <div className="flex items-center gap-2">
                                {entities.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-slate-800' : 'w-1.5 bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={currentIndex === entities.length - 1}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-lg"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Confirmation Modal for Report Generation */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 group"
                        >
                            <X className="h-5 w-5 group-hover:text-rose-500" />
                        </button>

                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <FileText className="h-8 w-8 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Evaluación Guardada</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">¿Deseas generar el informe de auditoría con los resultados actuales?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Solo Guardar
                            </button>
                            <button
                                onClick={downloadReport}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                            >
                                <Download className="h-4 w-4" />
                                Generar Informe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationView;
