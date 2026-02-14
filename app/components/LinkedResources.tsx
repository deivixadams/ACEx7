'use client';

import React from 'react';
import { ClipboardList, ShieldCheck, ListTree } from 'lucide-react';

interface ControlItem {
    id: string;
    nombre: string;
    codigo?: string;
    tipo_control?: string;
    descripcion?: string;
}

interface TestItem {
    id_prueba: string;
    nombre: string;
    descripcion?: string;
    codigo?: string;
    id_tipo_prueba?: string;
}

interface LinkedResourcesProps {
    controls: ControlItem[];
    tests: TestItem[];
    isLoading?: boolean;
    excludedControlIds?: Set<string>;
    excludedTestIds?: Set<string>;
    onToggleControl?: (id: string) => void;
    onToggleTest?: (id: string) => void;
}

const LinkedResources: React.FC<LinkedResourcesProps> = ({
    controls,
    tests,
    isLoading,
    excludedControlIds = new Set(),
    excludedTestIds = new Set(),
    onToggleControl,
    onToggleTest
}) => {
    if (isLoading) {
        return <div className="animate-pulse h-48 bg-slate-100 rounded-xl w-full" />;
    }

    if (controls.length === 0 && tests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                <ListTree className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-center">
                    Selecciona un riesgo para ver controles y pruebas asociados
                </p>
            </div>
        );
    }

    const activeControlsCount = controls.filter(c => !excludedControlIds.has(c.id)).length;
    const activeTestsCount = tests.filter(t => !excludedTestIds.has(t.id_prueba)).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Controls Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="px-5 py-3 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wide text-xs flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Controles Mitigantes ({activeControlsCount}/{controls.length})
                    </h3>
                </div>

                <div className="flex-1 overflow-auto max-h-[400px]">
                    {controls.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 italic">No hay controles vinculados visible.</div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider sticky top-0">
                                <tr>
                                    <th className="px-5 py-2 border-b border-slate-100 w-10"></th>
                                    <th className="px-5 py-2 border-b border-slate-100 w-24">Código</th>
                                    <th className="px-5 py-2 border-b border-slate-100">Nombre del Control</th>
                                    <th className="px-5 py-2 border-b border-slate-100 w-24">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {controls.map((control) => {
                                    const isExcluded = excludedControlIds.has(control.id);
                                    return (
                                        <tr key={control.id} className={`hover:bg-slate-50/50 transition-colors ${isExcluded ? 'opacity-50' : ''}`}>
                                            <td className="px-5 py-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={!isExcluded}
                                                    onChange={() => onToggleControl?.(control.id)}
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-5 py-2.5 font-mono text-slate-500 line-through-label">{control.codigo || 'N/A'}</td>
                                            <td className={`px-5 py-2.5 font-medium ${isExcluded ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {control.nombre}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-500">{control.tipo_control || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Tests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="px-5 py-3 border-b border-slate-100 bg-blue-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wide text-xs flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-blue-600" />
                        Pruebas de Auditoría ({activeTestsCount}/{tests.length})
                    </h3>
                </div>

                <div className="flex-1 overflow-auto max-h-[400px]">
                    {tests.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 italic">No hay pruebas vinculadas visible.</div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider sticky top-0">
                                <tr>
                                    <th className="px-5 py-2 border-b border-slate-100 w-10"></th>
                                    <th className="px-5 py-2 border-b border-slate-100 w-24">Código</th>
                                    <th className="px-5 py-2 border-b border-slate-100">Nombre de la Prueba</th>
                                    <th className="px-5 py-2 border-b border-slate-100">Descripción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tests.map((test) => {
                                    const isExcluded = excludedTestIds.has(test.id_prueba);
                                    return (
                                        <tr key={test.id_prueba} className={`hover:bg-slate-50/50 transition-colors ${isExcluded ? 'opacity-50' : ''}`}>
                                            <td className="px-5 py-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={!isExcluded}
                                                    onChange={() => onToggleTest?.(test.id_prueba)}
                                                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-5 py-2.5 font-mono text-slate-500">{test.codigo || 'N/A'}</td>
                                            <td className={`px-5 py-2.5 font-medium ${isExcluded ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {test.nombre}
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-500 truncate max-w-[200px]" title={test.descripcion}>
                                                {test.descripcion || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default LinkedResources;
