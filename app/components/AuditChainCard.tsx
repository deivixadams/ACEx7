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
        <div className="flex flex-col h-[420px] bg-[var(--card)] border border-[var(--card-border)] rounded-[12px] shadow-duralux hover:shadow-duralux-hover transition-all duration-300 group">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--card-border)] flex items-center justify-between bg-white/50 dark:bg-black/5">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-[var(--foreground)] opacity-50">{title}</h3>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-muted text-primary border border-[var(--card-border)]">
                    {items.length}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] font-bold text-[var(--foreground)] opacity-20 uppercase tracking-widest text-center px-6">
                        Sin datos vinculados
                    </div>
                ) : (
                    items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            onDoubleClick={() => onDoubleClick(item.id)}
                            className={`w-full text-left px-5 py-4 rounded-xl transition-all flex flex-col gap-1.5 group/item border ${selectedId === item.id
                                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[0.98]'
                                    : 'bg-transparent border-transparent hover:bg-muted text-[var(--foreground)]/80 hover:text-[var(--foreground)]'
                                }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedId === item.id ? 'text-white/70' : 'text-primary'}`}>
                                {item.codigo || 'S/C'}
                            </span>
                            <span className="text-[14px] font-bold leading-tight line-clamp-2">
                                {item.nombre}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-[var(--card-border)] bg-gray-50/50 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-muted-foreground uppercase text-center tracking-wide">
                    Click para filtrar • Doble click para detalle
                </p>
            </div>
        </div>
    );
};

export default AuditChainCard;
