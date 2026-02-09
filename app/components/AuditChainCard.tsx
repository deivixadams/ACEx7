'use client';

import React from 'react';
import {
    Layers,
    FileText,
    AlertTriangle,
    ShieldCheck,
    ChevronRight,
    LucideIcon
} from 'lucide-react';

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

const getIconForTitle = (title: string): LucideIcon => {
    const t = title.toLowerCase();
    if (t.includes('módulo')) return Layers;
    if (t.includes('requerimiento')) return FileText;
    if (t.includes('riesgo')) return AlertTriangle;
    if (t.includes('control')) return ShieldCheck;
    return Layers;
};

const AuditChainCard: React.FC<AuditChainCardProps> = ({
    title,
    items,
    selectedId,
    onSelect,
    onDoubleClick,
    isLoading,
    colorClass = 'primary'
}) => {
    const Icon = getIconForTitle(title);

    return (
        <div className="flex flex-col h-[460px] bg-[var(--card)] border border-[var(--card-border)] rounded-[12px] shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-[var(--card-border)] flex flex-col gap-4 bg-[var(--background)]/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-[13px] font-medium uppercase tracking-[2px] text-[var(--muted-foreground)] mb-0.5">{title}</h3>
                            <span className="text-3xl font-normal tracking-tight text-[var(--foreground)] leading-none">
                                {items.length}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Large Counter - Non bold */}

            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 bg-white dark:bg-transparent">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[12px] text-[var(--muted-foreground)] uppercase tracking-[2px] text-center px-6 italic">
                        Sin vinculaciones
                    </div>
                ) : (
                    items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            onDoubleClick={() => onDoubleClick(item.id)}
                            className={`w-full text-left px-5 py-4 rounded-xl transition-all flex flex-col gap-1.5 group/item border ${selectedId === item.id
                                ? 'bg-primary border-primary text-white shadow-lg scale-[0.98]'
                                : 'bg-transparent border-transparent hover:bg-[var(--muted)] text-[var(--item-text)]'
                                }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className={`text-[10px] font-medium uppercase tracking-[2px] ${selectedId === item.id ? 'text-white/70' : 'text-primary'}`}>
                                    {item.codigo || 'S/C'}
                                </span>
                                {selectedId === item.id && <ChevronRight className="h-3 w-3 text-white/50" />}
                            </div>
                            <span className={`text-[16px] leading-snug font-normal line-clamp-2 ${selectedId === item.id ? 'text-white' : 'text-[var(--foreground)]'}`}>
                                {item.nombre}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default AuditChainCard;
