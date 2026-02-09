'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
    Search,
    ChevronDown,
    Maximize,
    Minimize,
    Moon,
    Sun,
    Bell,
    ArrowRight,
    Play
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';

const Header = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const [mounted, setMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    if (!mounted) {
        return (
            <header className="h-[70px] bg-[var(--header-bg)] border-b border-[var(--header-border)] flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm" />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <>
            <header className="h-[70px] bg-[var(--header-bg)] border-b border-[var(--header-border)] flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm shadow-black/5">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleSidebar}
                        className="p-2.5 text-[var(--foreground)] opacity-40 hover:opacity-100 hover:bg-muted rounded-lg transition-all active:scale-95 group"
                    >
                        <Play className={`h-5 w-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    <div className="hidden md:flex items-center gap-2 group cursor-pointer px-4 py-2 bg-muted rounded-lg border border-transparent hover:border-primary/20 transition-all" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground mr-4">Buscar auditorías...</span>
                        <span className="text-[10px] font-bold text-muted-foreground/40 px-1.5 py-0.5 rounded bg-white dark:bg-black/20 border border-muted-foreground/10">CTRL K</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                            <Bell className="h-5 w-5" />
                        </button>
                        <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                            3
                        </span>
                    </div>

                    {/* User Profile */}
                    <div className="ml-4 flex items-center gap-3 pl-4 border-l border-[var(--header-border)] group cursor-pointer transition-all hover:translate-x-1">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-xs font-bold text-[var(--foreground)]">F. Auditor</span>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Supervisor</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-muted border border-[var(--header-border)] overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all p-0.5">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                                alt="User"
                                className="h-full w-full object-cover rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                    <div
                        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity animate-in fade-in"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--card-border)] rounded-[10px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                        <div className="flex items-center px-6 py-5 border-b border-[var(--card-border)]">
                            <Search className="h-6 w-6 text-primary mr-4" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar en la base de auditoría..."
                                className="flex-1 bg-transparent border-none outline-none text-xl text-[var(--foreground)] placeholder:text-muted-foreground/30 font-medium"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/40 px-2 py-1 rounded bg-muted border border-[var(--card-border)]">ESC</span>
                            </div>
                        </div>

                        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[2px] px-4 mb-3">Sugerencias Recientes</div>
                            {[
                                'Requisitos Ley 155-17 Auditoría',
                                'Hallazgos de alto riesgo en cumplimiento preventivo',
                                'Nuevas normativas AML para entidades financieras',
                                'Reporte de transacciones sospechosas'
                            ].map((item, i) => (
                                <button key={i} className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted transition-all text-sm text-muted-foreground hover:text-primary flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                        {item}
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>

                        <div className="px-6 py-4 bg-muted border-t border-[var(--card-border)] flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                            <div>Audit Corpus Engine x7 Predictivo</div>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1 font-black text-primary"><ChevronDown className="h-3 w-3" /> SELECCIONAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
