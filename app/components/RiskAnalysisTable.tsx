'use client';

import React from 'react';
import { CheckSquare, ListFilter } from 'lucide-react';

interface RiskItem {
    id: string;
    nombre: string;
    codigo?: string;
    tipo?: string;
    descripcion_full?: string;
    impacto?: string;
    probabilidad?: string;
    nivel_riesgo?: string; // New field
}

interface RiskAnalysisTableProps {
    risks: RiskItem[];
    selectedIds: string[];
    onSelect: (id: string, multi: boolean) => void;
    isLoading?: boolean;
}

type RiskLevel = 'High' | 'Medium' | 'Low' | 'Unknown';

const getRiskLevel = (item: RiskItem): RiskLevel => {
    // 1. Try explicit nivel_riesgo field first
    const n = (item.nivel_riesgo || '').toUpperCase();
    if (n.includes('ALTO') || n.includes('HIGH') || n.includes('CRITIC') || n.includes('EXTREM')) return 'High';
    if (n.includes('MEDIO') || n.includes('MEDIA') || n.includes('MEDIUM')) return 'Medium';
    if (n.includes('BAJO') || n.includes('BAJA') || n.includes('LOW')) return 'Low';

    // 2. Fallback to Probabilidad if Nivel missing
    const p = (item.probabilidad || '').toUpperCase();
    // Check typical spanish feminine/masculine forms
    if (p.includes('ALTA') || p.includes('ALTO') || p.includes('HIGH')) return 'High';
    if (p.includes('MEDIA') || p.includes('MEDIO') || p.includes('MEDIUM')) return 'Medium';
    if (p.includes('BAJA') || p.includes('BAJO') || p.includes('LOW')) return 'Low';

    // 3. Fallback to Impacto? (Usually text, so risky, but maybe keywords exist)
    const i = (item.impacto || '').toUpperCase();
    if (i.includes('ALTO') || i.includes('ALTA') || i.includes('HIGH') || i.includes('CRITICAL')) return 'High';

    return 'Unknown';
};

const RiskLevelCell: React.FC<{ level: RiskLevel }> = ({ level }) => {
    if (level === 'High') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-bold text-[11px] uppercase tracking-wide border border-rose-200">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-rose-600" />
                Alto
            </span>
        );
    }
    if (level === 'Medium') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-[11px] uppercase tracking-wide border border-amber-200">
                <div className="w-2 h-2 bg-amber-500" />
                Medio
            </span>
        );
    }
    if (level === 'Low') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[11px] uppercase tracking-wide border border-emerald-200">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-emerald-600" />
                Bajo
            </span>
        );
    }
    return <span className="text-slate-400 text-xs font-mono">-</span>;
};

const RiskAnalysisTable: React.FC<RiskAnalysisTableProps> = ({ risks, selectedIds, onSelect, isLoading }) => {

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-emerald-500 rounded-full" />
            </div>
        );
    }

    if (risks.length === 0) {
        return (
            <div className="w-full p-20 text-center border bg-white rounded-xl">
                <ListFilter className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No hay riesgos visibles</h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-4 py-3 w-10 text-center">
                                <span className="sr-only">Selección</span>
                            </th>
                            <th className="px-4 py-3 w-32">Nivel</th>
                            <th className="px-4 py-3 min-w-[300px]">Riesgo</th>
                            <th className="px-4 py-3 w-48">Impacto</th>
                            <th className="px-4 py-3 w-32">Tipo</th>
                            <th className="px-4 py-3 w-32">Probabilidad</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {risks.map((risk) => {
                            const isSelected = selectedIds.includes(risk.id);
                            const level = getRiskLevel(risk);

                            return (
                                <tr
                                    key={risk.id}
                                    onClick={(e) => onSelect(risk.id, isSelected ? true : e.ctrlKey || e.metaKey)}
                                    className={`
                    group cursor-pointer transition-colors duration-150
                    ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}
                  `}
                                >
                                    <td className="px-4 py-3 text-center">
                                        <div className={`
                      w-5 h-5 rounded border flex items-center justify-center mx-auto transition-colors
                      ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300 group-hover:border-emerald-400'}
                    `}>
                                            {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <RiskLevelCell level={level} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-semibold leading-snug block ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                                            {risk.nombre}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-slate-600 leading-tight block line-clamp-2" title={risk.impacto}>
                                            {risk.impacto || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-slate-500 font-medium">{risk.tipo || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-slate-600">{risk.probabilidad || '-'}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-400 font-medium text-right uppercase tracking-wider">
                {risks.length} Registros
            </div>
        </div>
    );
};

export default RiskAnalysisTable;
