'use client';

import React from 'react';

interface TestItem {
    id_prueba: string;
    codigo: string;
    nombre: string;
    descripcion: string;
}

interface AuditTestsListProps {
    tests: TestItem[];
    isLoading?: boolean;
}

const AuditTestsList: React.FC<AuditTestsListProps> = ({ tests, isLoading }) => {
    return (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[10px] overflow-hidden mt-8 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b border-[var(--card-border)] bg-white/50 dark:bg-black/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]/80 flex items-center gap-3">
                    Pruebas de Auditoría Vinculadas
                    <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                        {tests.length}
                    </span>
                </h3>
            </div>

            {/* Content */}
            <div className="p-0 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-black/10 border-b border-[var(--card-border)]">
                            <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-[150px]">Código</th>
                            <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground w-[300px]">Nombre de la Prueba</th>
                            <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Descripción Detallada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-6"><div className="h-4 bg-muted rounded w-20" /></td>
                                    <td className="px-8 py-6"><div className="h-4 bg-muted rounded w-48" /></td>
                                    <td className="px-8 py-6"><div className="h-4 bg-muted rounded w-full" /></td>
                                </tr>
                            ))
                        ) : tests.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-8 py-16 text-center">
                                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-30">
                                        No hay pruebas que coincidan con los filtros seleccionados
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            tests.map((test) => (
                                <tr
                                    key={test.id_prueba}
                                    className="hover:bg-muted/50 transition-colors group cursor-default"
                                >
                                    <td className="px-8 py-5 text-[11px] font-black text-primary uppercase tracking-tighter">
                                        {test.codigo}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-[var(--foreground)]">
                                        {test.nombre}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-muted-foreground leading-relaxed">
                                        {test.descripcion}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditTestsList;
