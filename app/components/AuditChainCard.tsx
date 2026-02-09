'use client';

import React from 'react';

interface AuditItem {
    id: string;
    nombre: string;
    codigo?: string;
}

interface AuditChainCardProps {
    title: string;
    items: AuditItem[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onDoubleClick: (id: string | undefined) => void;
    isLoading?: boolean;
    colorClass?: string;
}

const AuditChainCard: React.FC<AuditChainCardProps> = ({
    title,
    items,
    selectedId,
    onSelect,
    onDoubleClick,
    isLoading,
    colorClass = 'primary'
}) => {
    return (
        <div className="flex flex-col h-[400px] bg-[var(--card)] border border-[var(--card-border)] rounded-[10px] shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[var(--card-border)] flex items-center justify-between bg-white/50 dark:bg-black/5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)] opacity-60">{title}</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-primary border border-[var(--card-border)]">
                    {items.length}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-1">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] font-bold text-[var(--foreground)]/20 uppercase tracking-widest text-center px-4">
                        Sin datos vinculados
                    </div>
                ) : (
                    items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            onDoubleClick={() => onDoubleClick(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex flex-col gap-1 group/item ${selectedId === item.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]'
                                    : 'hover:bg-muted text-[var(--foreground)]/80 hover:text-[var(--foreground)]'
                                }`}
                        >
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedId === item.id ? 'text-white/70' : 'text-primary'}`}>
                                {item.codigo || 'S/C'}
                            </span>
                            <span className="text-xs font-semibold leading-relaxed line-clamp-2">
                                {item.nombre}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-[var(--card-border)] bg-gray-50/50 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[8px] font-bold text-muted-foreground uppercase text-center">
                    Simple clic para filtrar • Doble clic para detalle
                </p>
            </div>
        </div>
    );
};

export default AuditChainCard;
