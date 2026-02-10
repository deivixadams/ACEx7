'use client';

import React from 'react';
import { ClipboardList, ListFilter } from 'lucide-react';

interface TestsViewProps {
    tests: any[];
    isLoading: boolean;
}

const TestsView: React.FC<TestsViewProps> = ({ tests, isLoading }) => {
    if (isLoading) {
        return <div className="animate-pulse h-96 bg-slate-100 rounded-xl w-full" />;
    }

    if (tests.length === 0) {
        return (
            <div className="w-full p-20 text-center border bg-white rounded-xl">
                <ListFilter className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No hay pruebas disponibles</h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-emerald-600" />
                    Programa de Pruebas
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {tests.length} Total
                </span>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-6 py-3 w-32 bg-slate-50">Código</th>
                            <th className="px-6 py-3 bg-slate-50">Nombre / Descripción</th>
                            <th className="px-6 py-3 w-40 bg-slate-50">Tipo</th>
                            <th className="px-6 py-3 w-28 bg-slate-50 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tests.map((test) => (
                            <tr key={test.id_prueba} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-3">
                                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                        {test.codigo || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-sm font-semibold text-slate-700 mb-1">{test.nombre}</div>
                                    <div className="text-xs text-slate-500 leading-relaxed max-w-2xl text-justify">
                                        {test.descripcion || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {test.id_tipo_prueba || 'STANDARD'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-200" title="Pendiente" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TestsView;
