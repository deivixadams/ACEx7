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
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[16px] overflow-hidden mt-10 shadow-duralux hover:shadow-duralux-hover transition-all duration-300">
            {/* Header */}
            <div className="px-10 py-8 border-b border-[var(--card-border)] bg-white/50 dark:bg-black/10">
                <h3 className="text-[18px] font-black uppercase tracking-[3px] text-[var(--foreground)] flex items-center gap-5">
                    Trazabilidad de Pruebas
                    <span className="px-4 py-1.5 rounded-xl bg-primary text-white text-[13px] font-black border-2 border-white/20 shadow-lg shadow-primary/30">
                        {tests.length}
                    </span>
                </h3>
            </div>

            {/* Content */}
            <div className="p-0 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-muted border-b border-[var(--card-border)]">
                            <th className="px-10 py-6 text-[12px] font-black uppercase tracking-[4px] text-muted-foreground w-[200px]">Referencia</th>
                            <th className="px-10 py-6 text-[12px] font-black uppercase tracking-[4px] text-muted-foreground w-[400px]">Nombre de la Prueba</th>
                            <th className="px-10 py-6 text-[12px] font-black uppercase tracking-[4px] text-muted-foreground">Descripción Operativa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-10 py-10"><div className="h-6 bg-muted rounded w-28" /></td>
                                    <td className="px-10 py-10"><div className="h-6 bg-muted rounded w-72" /></td>
                                    <td className="px-10 py-10"><div className="h-6 bg-muted rounded w-full" /></td>
                                </tr>
                            ))
                        ) : tests.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-10 py-32 text-center">
                                    <p className="text-[14px] font-black text-muted-foreground uppercase tracking-[5px] opacity-30 italic">
                                        Explora la cadena de auditoría para ver pruebas
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            tests.map((test) => (
                                <tr
                                    key={test.id_prueba}
                                    className="hover:bg-primary/[0.02] transition-colors group cursor-default"
                                >
                                    <td className="px-10 py-10 text-[13px] font-black text-primary uppercase tracking-[2px]">
                                        {test.codigo}
                                    </td>
                                    <td className="px-10 py-10 text-[16px] font-extrabold text-[var(--item-text)] dark:text-white">
                                        {test.nombre}
                                    </td>
                                    <td className="px-10 py-10 text-[15px] text-[var(--foreground)]/70 dark:text-white/60 leading-relaxed font-semibold">
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
