'use client';

import React from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';

interface TestItem {
    id_prueba: string;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    id_tipo_prueba?: string;
}

interface FilteredTestsListProps {
    tests: TestItem[];
    isLoading?: boolean;
}

const FilteredTestsList: React.FC<FilteredTestsListProps> = ({ tests, isLoading }) => {
    if (isLoading) {
        return <div className="animate-pulse h-24 bg-slate-100 rounded-xl w-full" />;
    }

    if (tests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ClipboardList className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                    Selecciona un riesgo para ver sus pruebas
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                    Pruebas Asociadas ({tests.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-3 border-b border-slate-100">Código</th>
                            <th className="px-6 py-3 border-b border-slate-100">Nombre</th>
                            <th className="px-6 py-3 border-b border-slate-100">Tipo</th>
                            <th className="px-6 py-3 border-b border-slate-100">Descripción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tests.map((test) => (
                            <tr key={test.id_prueba} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-3 font-mono text-xs text-slate-500">{test.codigo || 'N/A'}</td>
                                <td className="px-6 py-3 font-semibold text-slate-700">{test.nombre}</td>
                                <td className="px-6 py-3 text-slate-500">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                        {test.id_tipo_prueba || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-600 max-w-md truncate" title={test.descripcion}>
                                    {test.descripcion || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FilteredTestsList;
