'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

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
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[12px] overflow-hidden mt-10 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Header */}
            <div className="px-10 py-8 border-b border-[var(--card-border)] bg-[var(--background)]/30 flex items-center justify-between">
                <h3 className="text-[18px] font-medium uppercase tracking-[3px] text-[var(--foreground)] flex items-center gap-5">
                    Trazabilidad de Pruebas
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-medium text-[var(--muted-foreground)] tracking-widest">Cruces Encontrados:</span>
                    <span className="px-5 py-2 rounded-lg bg-primary text-white text-[16px] font-medium border border-white/10 shadow-lg">
                        {tests.length}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-0 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-[var(--muted)]/50 border-b border-[var(--card-border)]">
                            <th className="px-10 py-6 text-[11px] font-medium uppercase tracking-[4px] text-[var(--muted-foreground)] w-[200px]">Referencia</th>
                            <th className="px-10 py-6 text-[11px] font-medium uppercase tracking-[4px] text-[var(--muted-foreground)] w-[400px]">Enfoque de la Prueba</th>
                            <th className="px-10 py-6 text-[11px] font-medium uppercase tracking-[4px] text-[var(--muted-foreground)]">Detalle Metodológico</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-10 py-10"><div className="h-6 bg-[var(--muted)] rounded w-28" /></td>
                                    <td className="px-10 py-10"><div className="h-6 bg-[var(--muted)] rounded w-72" /></td>
                                    <td className="px-10 py-10"><div className="h-6 bg-[var(--muted)] rounded w-full" /></td>
                                </tr>
                            ))
                        ) : tests.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-10 py-32 text-center text-[var(--muted-foreground)] italic font-light tracking-widest uppercase">
                                    Selecciona elementos de la cadena para visualizar las pruebas de auditoría
                                </td>
                            </tr>
                        ) : (
                            tests.map((test) => (
                                <tr
                                    key={test.id_prueba}
                                    className="hover:bg-[var(--primary)]/[0.03] transition-colors group cursor-default"
                                >
                                    <td className="px-10 py-10 text-[13px] font-medium text-primary uppercase tracking-[2px]">
                                        {test.codigo}
                                    </td>
                                    <td className="px-10 py-10 text-[16px] font-medium text-[var(--foreground)]">
                                        {test.nombre}
                                    </td>
                                    <td className="px-10 py-10 text-[15px] text-[var(--foreground)]/70 leading-relaxed font-normal">
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
