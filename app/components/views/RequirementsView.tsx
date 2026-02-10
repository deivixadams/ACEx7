'use client';

import React from 'react';
import { FileText, ListFilter } from 'lucide-react';

interface RequirementsViewProps {
    requirements: any[];
    isLoading: boolean;
}

const RequirementsView: React.FC<RequirementsViewProps> = ({ requirements, isLoading }) => {
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
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Requerimientos Normativos
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {requirements.length} Total
                </span>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-6 py-3 w-32 bg-slate-50">Código</th>
                            <th className="px-6 py-3 bg-slate-50">Título / Descripción</th>
                            <th className="px-6 py-3 w-36 bg-slate-50">Categoría</th>
                            <th className="px-6 py-3 w-40 bg-slate-50">Base Normativa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requirements.map((req) => (
                            <tr key={req.id_requerimiento} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-3">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                        {req.codigo || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="space-y-1">
                                        <div className="text-sm font-semibold text-slate-700 leading-snug">{req.titulo || req.nombre}</div>
                                        {req.descripcion && (
                                            <div className="text-xs text-slate-500 leading-relaxed max-w-xl text-justify">
                                                {req.descripcion}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="text-xs font-medium text-slate-600 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                                        {req.categoria || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-500 italic">
                                    {req.base_normativa || req.source_ref || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RequirementsView;
