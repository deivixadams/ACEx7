import React, { useMemo, useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare, FilterX, Play, FileText, X, Sparkles, Wand2, Info, BookOpen } from 'lucide-react';
import RiskAnalysisTable from '../../components/RiskAnalysisTable';

interface PreAuditViewProps {
    data: any;
    isLoading: boolean;
    selectedRiskIds: string[];
    onRiskSelect: (id: string, isMulti: boolean) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
}

const PreAuditView: React.FC<PreAuditViewProps> = ({
    data,
    isLoading,
    selectedRiskIds,
    onRiskSelect,
    onSelectAll,
    onClearSelection
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const selectedRisksData = useMemo(() => {
        if (!data?.risks) return [];
        return data.risks.filter((r: any) => selectedRiskIds.includes(r.id_riesgo));
    }, [data, selectedRiskIds]);

    const handleGeneratePreMade = async () => {
        if (selectedRiskIds.length === 0) return;

        setIsGenerating(true);
        try {
            // Contexto para el prompt: entity_name, period_start/end, y los requerimientos/riesgos
            const requirements = selectedRisksData.map((r: any) => ({
                id: r.id_riesgo,
                requirement_text: r.descripcion || '',
                minimum_evidence: "Evidencia documental de cumplimiento",
                risk_text: `${r.tipo || ''}: ${r.descripcion || ''} (Impacto: ${r.impacto || ''}, Prob: ${r.probabilidad || ''})`,
                expected_control: "Control mitigante según política interna",
                suggested_tests: "Prueba de cumplimiento y efectividad operativa"
            }));

            const res = await fetch('/api/reportes/premade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    entity_name: "Entidad de Prueba Demo", // Esto podría venir de un config o input
                    period_start: "01/01/2024",
                    period_end: "31/12/2024",
                    requirements
                })
            });

            if (!res.ok) throw new Error('Error al generar informe');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `INFORME_PREMADE_${new Date().getTime()}.docx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('Error generando el informe PreMade.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Loading Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                    <div className="relative">
                        <div className="h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-black text-white uppercase tracking-[0.2em]">IA Auditora Generando Informe</p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Analizando hallazgos y redactando recomendaciones...</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50">
                    <div>
                        <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.15em] flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            Pre-Auditoría (Informe Pre-Made)
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Selecciona los riesgos evaluados para materializar el informe</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSelectAll}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-sm hover:bg-slate-900 transition-all"
                        >
                            <CheckSquare className="h-4 w-4" />
                            Todo
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
                            Limpiar
                        </button>
                        {selectedRiskIds.length > 0 && (
                            <button
                                onClick={handleGeneratePreMade}
                                disabled={isGenerating}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.12em] shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-300"
                            >
                                <FileText className="h-4 w-4 fill-current" />
                                Generar Informe PreMade
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
        </div>
    );
};

export default PreAuditView;
