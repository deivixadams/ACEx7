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
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[12px] overflow-hidden mt-8 shadow-duralux hover:shadow-duralux-hover transition-all duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[var(--card-border)] bg-white/50 dark:bg-black/5">
                <h3 className="text-[16px] font-extrabold uppercase tracking-widest text-[#1B2559] dark:text-white flex items-center gap-4">
                    Pruebas de Auditoría Vinculadas
                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[12px] font-black border border-primary/20">
                        {tests.length}
                    </span>
                </h3>
            </div>

            {/* Content */}
            <div className="p-0 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-muted border-b border-[var(--card-border)]">
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[3px] text-muted-foreground w-[180px]">Código</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[3px] text-muted-foreground w-[350px]">Nombre de la Prueba</th>
                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[3px] text-muted-foreground">Descripción Detallada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-8 py-8"><div className="h-5 bg-muted rounded w-24" /></td>
                                    <td className="px-8 py-8"><div className="h-5 bg-muted rounded w-64" /></td>
                                    <td className="px-8 py-8"><div className="h-5 bg-muted rounded w-full" /></td>
                                </tr>
                            ))
                        ) : tests.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-8 py-24 text-center">
                                    <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-[4px] opacity-20">
                                        No hay pruebas vinculadas
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            tests.map((test) => (
                                <tr
                                    key={test.id_prueba}
                                    className="hover:bg-muted/30 transition-colors group cursor-default"
                                >
                                    <td className="px-8 py-8 text-[12px] font-black text-primary uppercase tracking-widest">
                                        {test.codigo}
                                    </td>
                                    <td className="px-8 py-8 text-[15px] font-bold text-[#2B3674] dark:text-white/90">
                                        {test.nombre}
                                    </td>
                                    <td className="px-8 py-8 text-[14px] text-muted-foreground leading-relaxed">
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
