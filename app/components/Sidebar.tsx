'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view');

    const menuItems = [
        { icon: ShieldAlert, label: 'Riesgos', href: '/?view=risks', id: 'risks' },
        { icon: LayoutDashboard, label: 'Resumen', href: '/?view=summary', id: 'summary' },
        { icon: FileCheck, label: 'Requerimientos', href: '/?view=requirements', id: 'requirements' },
        { icon: BarChart3, label: 'Controles', href: '/?view=controls', id: 'controls' },
        { icon: Settings, label: 'Pruebas', href: '/?view=tests', id: 'tests' },

        // These seem to be separate pages based on original code, leave them as generic links for now if they exist
        { icon: BookOpen, label: 'Corpus Auditoría', href: '/corpus', id: 'corpus' },
        { icon: Map, label: 'Territorios', href: '/territories', id: 'territories' },
    ];

    return (
        <aside className={`w-64 bg-[var(--sidebar-bg)] h-screen flex flex-col fixed left-0 top-0 border-r border-[var(--header-border)] z-50 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Database className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex flex-col justify-center h-12">
                        <span className="text-[24px] font-medium tracking-tight text-[var(--foreground)] leading-none mb-0.5">ACE-X7</span>
                        <span className="text-[10px] font-medium text-[var(--muted-foreground)] tracking-[3px] uppercase">Audit Platform</span>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        // Determine active state
                        let isActive = false;
                        if (item.href.startsWith('/?view=')) {
                            // It's a view toggle on the home page
                            const viewParam = item.href.split('=')[1];
                            isActive = pathname === '/' && (currentView === viewParam || (!currentView && viewParam === 'risks' && item.id === 'risks'));
                        } else {
                            // It's a different route
                            isActive = pathname === item.href;
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${isActive
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.03]'
                                    : 'text-[#64748b] hover:bg-[var(--muted)] hover:text-[var(--foreground)] dark:text-[#94a3b8]'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-100' : 'group-hover:scale-110'}`} />
                                <span className={`text-[15px] font-medium tracking-tight ${isActive ? 'text-white' : 'text-[#64748b] dark:text-[#94a3b8]'}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4">
                <div className="p-5 bg-muted rounded-[20px] border border-white/50 dark:border-white/5 flex items-center gap-4 shadow-sm">
                    <div className="h-11 w-11 rounded-xl bg-[#05CD99]/10 flex items-center justify-center text-[#05CD99] text-sm font-black border border-[#05CD99]/20 shadow-inner">
                        DR
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-extrabold text-[#1B2559] dark:text-white uppercase tracking-wider">Dominicana</span>
                        <span className="text-[10px] text-[#A3AED0] font-bold uppercase tracking-widest">Snapshot Activo</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
