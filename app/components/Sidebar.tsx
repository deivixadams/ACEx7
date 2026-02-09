'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    BookOpen,
    ShieldAlert,
    Settings,
    LayoutDashboard,
    FileCheck,
    Map,
    Database
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
    const { isSidebarOpen } = useSidebar();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: BookOpen, label: 'Corpus Auditoría', href: '/corpus' },
        { icon: FileCheck, label: 'Requerimientos', href: '/requirements' },
        { icon: ShieldAlert, label: 'Riesgos', href: '/risks' },
        { icon: BarChart3, label: 'Controles', href: '/controls' },
        { icon: Settings, label: 'Pruebas', href: '/tests' },
        { icon: Map, label: 'Territorios', href: '/territories' },
    ];

    return (
        <aside className={`w-64 bg-[var(--sidebar-bg)] h-screen flex flex-col fixed left-0 top-0 border-r border-[var(--header-border)] z-50 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10 px-4">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-[var(--foreground)] leading-none italic">ACE</span>
                        <span className="text-[10px] font-bold text-primary tracking-[3px] uppercase mt-0.5">PLATFORM</span>
                    </div>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-[var(--foreground)]'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-100' : 'group-hover:scale-110'}`} />
                                <span className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4">
                <div className="p-4 bg-muted rounded-xl border border-[var(--border)] flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-black border border-emerald-500/20">
                        DR
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Dominicana</span>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">Activa</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
