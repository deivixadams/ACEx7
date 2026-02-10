'use client';

import React from 'react';
import { ShieldCheck, ListFilter } from 'lucide-react';

interface ControlsViewProps {
    controls: any[];
    isLoading: boolean;
}

const ControlsView: React.FC<ControlsViewProps> = ({ controls, isLoading }) => {
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
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    Matriz de Controles
                </h2>
                <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {controls.length} Total
                </span>
            </div>

            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                        <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <th className="px-6 py-3 w-48 bg-slate-50">Nombre</th>
                            <th className="px-6 py-3 min-w-[200px] bg-slate-50">Descripción</th>
                            <th className="px-6 py-3 w-32 bg-slate-50">Tipo</th>
                            <th className="px-6 py-3 min-w-[200px] bg-slate-50">Evidencia Esperada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {controls.map((control) => (
                            <tr key={control.id} className="hover:bg-slate-50 transition-colors group">
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ControlsView;
