
'use client';

import React, { useState } from 'react';
import {
    FileText, Shield, Map, Clock,
    CheckCircle, ChevronRight, Download,
    Sparkles, Info, Users, X, Wand2, Edit3, Calendar, Gavel,
    Layout, ArrowRight, Save, Trash2
} from 'lucide-react';

interface ActaInicioProps {
    auditoriaId: string;
    onClose: () => void;
    onSaveSuccess?: () => void;
    onGoToRisks?: () => void;
}

export default function ActaInicioView({ auditoriaId, onClose, onSaveSuccess, onGoToRisks }: ActaInicioProps) {
    const [isAutoCompleting, setIsAutoCompleting] = useState<string | null>(null);
    const [isGeneratingActa, setIsGeneratingActa] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        entidad_nombre: 'SOLUCIONES FINANCIERAS S.A.',
        codigo_auditoria: auditoriaId || 'AUD-2026-X1',
        periodo_inicio: '2025-01-01',
        periodo_fin: '2025-12-31',
        objetivo: '',
        alcance: '',
        marco_normativo: 'Ley 155-17 contra el Lavado de Activos y Financiamiento del Terrorismo; Recomendaciones del GAFI.',
        metodologia: '',
        lider_equipo: 'Juan Pérez',
        auditores: 'Ana García, Carlos Ruiz',
        cronograma: [
            { hito: 'Inicio Auditoría', fecha: '2026-02-15' },
            { hito: 'Trabajo de Campo', fecha: '2026-03-01' },
            { hito: 'Informe Preliminar', fecha: '2026-04-15' },
            { hito: 'Cierre Formal', fecha: '2026-05-10' },
        ],
    });

    const handleAIComplete = async (field: string) => {
        setIsAutoCompleting(field);

        try {
            {
                const currentVal = (formData as any)[field];
                const res = await fetch('/api/ai/refine-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: currentVal, field })
                });
                const data = await res.json();
                if (data.refinedText) {
                    setFormData(prev => ({ ...prev, [field]: data.refinedText }));
                }
            }
        } catch (error) {
            console.error("AI Generation Error", error);
        } finally {
            setIsAutoCompleting(null);
        }
    };

    const handleGenerateActa = async () => {
        setIsGeneratingActa(true);
        try {
            const res = await fetch('/api/acta-inicio/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Error al generar el acta.');
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Acta_Inicio_${formData.codigo_auditoria}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating Acta:', error);
            alert('Error de conexión al generar el acta.');
        } finally {
            setIsGeneratingActa(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-white text-slate-900 flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">

            {/* Header */}
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-5">
                    <div className="h-11 w-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none mb-1 overflow-hidden text-ellipsis whitespace-nowrap">Configuración: Acta de Inicio</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formData.codigo_auditoria}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Módulo AML / Compliance</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Content Area - Centralized Full Form */}
            <div className="flex-1 overflow-hidden px-6 py-4 bg-slate-50/30">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4 h-full flex flex-col">

                    {/* Section: Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                        <FormField label="Entidad a Auditar" icon={Info}>
                            <input
                                type="text"
                                value={formData.entidad_nombre}
                                onChange={(e) => setFormData({ ...formData, entidad_nombre: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                            />
                        </FormField>
                        <FormField label="Periodo de Auditoría (Anual)" icon={Calendar}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="date"
                                    value={formData.periodo_inicio}
                                    onChange={(e) => setFormData({ ...formData, periodo_inicio: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />
                                <div className="h-[2px] w-4 bg-slate-200 shrink-0" />
                                <input
                                    type="date"
                                    value={formData.periodo_fin}
                                    onChange={(e) => setFormData({ ...formData, periodo_fin: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </FormField>
                    </div>

                    <hr className="border-slate-100 shrink-0" />

                    {/* Section: Text Fields with AI Assist — 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                        <TextSection
                            title="Objetivo General"
                            description="Define la meta principal de la revisión (AML/CFT)."
                            value={formData.objetivo}
                            onChange={(val: string) => setFormData({ ...formData, objetivo: val })}
                            onAI={() => handleAIComplete('objetivo')}
                            isLoading={isAutoCompleting === 'objetivo'}
                            placeholder="Describa el objetivo principal..."
                            icon={Shield}
                        />

                        <TextSection
                            title="Alcance de la Auditoría"
                            description="Detalla los procesos, áreas y periodos específicos."
                            value={formData.alcance}
                            onChange={(val: string) => setFormData({ ...formData, alcance: val })}
                            onAI={() => handleAIComplete('alcance')}
                            isLoading={isAutoCompleting === 'alcance'}
                            placeholder="Especifique el alcance técnico..."
                            icon={Map}
                        />

                        <TextSection
                            title="Metodología de Trabajo"
                            description="Técnicas de muestreo y ejecución basadas en riesgos."
                            value={formData.metodologia}
                            onChange={(val: string) => setFormData({ ...formData, metodologia: val })}
                            onAI={() => handleAIComplete('metodologia')}
                            isLoading={isAutoCompleting === 'metodologia'}
                            placeholder="Explique la metodología aplicada..."
                            icon={Wand2}
                        />
                    </div>

                    <hr className="border-slate-100 shrink-0" />

                    {/* Section: Team & Schedule Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-emerald-600" />
                                Equipo Auditor
                            </h3>
                            <div className="space-y-4">
                                <FormField label="Líder de Proyecto">
                                    <input
                                        type="text"
                                        value={formData.lider_equipo}
                                        onChange={(e) => setFormData({ ...formData, lider_equipo: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                                    />
                                </FormField>
                                <FormField label="Auditores Asignados">
                                    <textarea
                                        value={formData.auditores}
                                        onChange={(e) => setFormData({ ...formData, auditores: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 min-h-[60px] resize-none"
                                    />
                                </FormField>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                Cronograma Estimado
                            </h3>
                            <div className="space-y-2">
                                {formData.cronograma.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-xs font-bold text-slate-600">{item.hito}</span>
                                        <input
                                            type="date"
                                            value={item.fecha}
                                            onChange={(e) => {
                                                const updated = [...formData.cronograma];
                                                updated[idx] = { ...updated[idx], fecha: e.target.value };
                                                setFormData({ ...formData, cronograma: updated });
                                            }}
                                            className="bg-transparent text-xs font-black text-slate-900 outline-none text-right"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <div className="max-w-6xl mx-auto flex items-center justify-end w-full">
                    <div className="flex items-center gap-4">
                        <button className="px-8 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                            Guardar Borrador
                        </button>
                        <button
                            onClick={handleGenerateActa}
                            disabled={isGeneratingActa}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                        >
                            {isGeneratingActa ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="h-5 w-5" />
                            )}
                            Generar Acta
                        </button>
                        <button
                            onClick={onGoToRisks}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            Comenzar Evaluación
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>


        </div >
    );
}

function FormField({ label, icon: Icon, children }: { label: string, icon?: any, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                {Icon && <Icon className="h-3 w-3" />}
                {label}
            </label>
            {children}
        </div>
    );
}

function TextSection({ title, description, value, onChange, onAI, isLoading, placeholder, icon: Icon }: any) {
    return (
        <div className="flex flex-col gap-2 min-h-0">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-emerald-600" />
                        {title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">{description}</p>
                </div>
                <button
                    onClick={onAI}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all shrink-0"
                >
                    {isLoading ? (
                        <div className="h-3 w-3 border-2 border-emerald-700/20 border-t-emerald-700 rounded-full animate-spin" />
                    ) : (
                        <Sparkles className="h-3 w-3" />
                    )}
                    IA
                </button>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-medium text-slate-600 outline-none focus:border-emerald-500 focus:bg-white transition-all flex-1 resize-none leading-relaxed"
            />
        </div>
    );
}
