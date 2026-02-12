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
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { user } = useAuth();
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
            <header className="h-[80px] bg-[var(--header-bg)] border-b border-[var(--header-border)] flex items-center justify-between px-10 sticky top-0 z-50 shadow-sm" />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <>
            <header className="h-[80px] bg-[var(--header-bg)] border-b border-[var(--header-border)] flex items-center justify-between px-10 sticky top-0 z-50 shadow-sm shadow-dark/5">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleSidebar}
                        className="p-3 text-[var(--foreground)] opacity-30 hover:opacity-100 hover:bg-muted rounded-xl transition-all active:scale-95 group"
                    >
                        <Play className={`h-6 w-6 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    <div className="hidden md:flex items-center gap-4 group cursor-pointer px-6 py-2.5 bg-muted rounded-xl border border-transparent hover:border-primary/20 transition-all" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[13px] font-bold text-muted-foreground mr-6 tracking-tight">Escribe para buscar...</span>
                        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-black/20 border border-muted-foreground/20 italic">CTRL</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-black/20 border border-muted-foreground/20 italic">K</span>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                            <Bell className="h-5 w-5" />
                        </button>
                        <span className="absolute top-2.5 right-2.5 h-4 w-4 bg-primary text-[10px] font-black text-white flex items-center justify-center rounded-full border-2 border-white dark:border-[#111C44] shadow-lg shadow-primary/40">
                            3
                        </span>
                    </div>

                    {/* User Profile */}
                    <div className="ml-6 flex items-center gap-4 pl-6 border-l border-[var(--header-border)] group cursor-pointer transition-all hover:translate-x-1">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-[14px] font-black text-[#1B2559] dark:text-white leading-tight tracking-tight uppercase truncate max-w-[150px]">
                                {user?.nombre || 'Auditor'}
                            </span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[2px] mt-0.5">
                                {user?.rol_nombre || 'Consultor'}
                            </span>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-muted border-2 border-transparent group-hover:border-primary/30 overflow-hidden shadow-2xl transition-all p-0.5 group-hover:scale-110">
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt="User"
                                    className="h-full w-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-black text-sm rounded-xl">
                                    {user?.nombre?.substring(0, 2).toUpperCase() || 'AU'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                    <div
                        className="absolute inset-0 bg-[#0B1437]/60 backdrop-blur-md transition-opacity animate-in fade-in"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--card-border)] rounded-[20px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                        <div className="flex items-center px-8 py-7 border-b border-[var(--card-border)] bg-gray-50/50 dark:bg-black/20">
                            <Search className="h-7 w-7 text-primary mr-5" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar en la base de auditoría..."
                                className="flex-1 bg-transparent border-none outline-none text-2xl text-[#1B2559] dark:text-white placeholder:text-muted-foreground/30 font-black tracking-tight"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-muted-foreground/40 px-3 py-1.5 rounded-lg bg-muted border border-[var(--card-border)] italic">ESC</span>
                            </div>
                        </div>

                        <div className="p-6 max-h-[450px] overflow-y-auto custom-scrollbar">
                            <div className="text-[11px] font-black text-muted-foreground uppercase tracking-[3px] px-6 mb-4 opacity-50">Sugerencias Recientes</div>
                            {[
                                'Requisitos Ley 155-17 Auditoría',
                                'Hallazgos de alto riesgo en cumplimiento preventivo',
                                'Nuevas normativas AML para entidades financieras',
                                'Reporte de transacciones sospechosas'
                            ].map((item, i) => (
                                <button key={i} className="w-full text-left px-6 py-4 rounded-2xl hover:bg-muted transition-all text-[15px] font-bold text-muted-foreground hover:text-primary flex items-center justify-between group border border-transparent hover:border-primary/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors ring-4 ring-transparent group-hover:ring-primary/10" />
                                        {item}
                                    </div>
                                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </button>
                            ))}
                        </div>

                        <div className="px-8 py-5 bg-muted border-t border-[var(--card-border)] flex items-center justify-between text-[11px] font-extrabold text-muted-foreground">
                            <div className="uppercase tracking-widest opacity-60">Audit Corpus Engine x7 Predictivo</div>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2 font-black text-primary px-3 py-1 rounded-lg bg-primary/5"><ChevronDown className="h-4 w-4" /> SELECCIONAR</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
