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
        <div className="flex flex-col h-[440px] bg-[var(--card)] border border-[var(--card-border)] rounded-[14px] shadow-duralux hover:shadow-duralux-hover transition-all duration-300 group">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center justify-between bg-white/30 dark:bg-black/10">
                <h3 className="text-[13px] font-black uppercase tracking-[1.5px] text-[var(--foreground)] opacity-60 italic">{title}</h3>
                <span className="px-3.5 py-1.5 rounded-lg text-[14px] font-black bg-primary/5 text-primary border-2 border-primary/20 shadow-inner">
                    {items.length}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[12px] font-bold text-[var(--foreground)] opacity-20 uppercase tracking-[3px] text-center px-8 leading-relaxed">
                        Sin datos vinculados
                    </div>
                ) : (
                    items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            onDoubleClick={() => onDoubleClick(item.id)}
                            className={`w-full text-left px-6 py-5 rounded-2xl transition-all flex flex-col gap-2 border-2 ${selectedId === item.id
                                    ? 'bg-primary border-primary text-white shadow-[0_15px_30px_-5px_rgba(67,24,255,0.4)] scale-[0.97]'
                                    : 'bg-transparent border-transparent hover:bg-muted text-[var(--item-text)]'
                                }`}
                        >
                            <span className={`text-[11px] font-black uppercase tracking-[3px] ${selectedId === item.id ? 'text-white/70' : 'text-primary/70'}`}>
                                {item.codigo || 'S/C'}
                            </span>
                            <span className={`text-[15px] font-extrabold leading-tight line-clamp-2 ${selectedId === item.id ? 'text-white' : 'text-[var(--item-text)]'}`}>
                                {item.nombre}
                            </span>
                        </button>
                    ))
                )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-[var(--card-border)] bg-gray-50/30 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] font-black text-muted-foreground uppercase text-center tracking-widest italic opacity-60">
                    Interactuar para Filtrar
                </p>
            </div>
        </div>
    );
};

export default AuditChainCard;
