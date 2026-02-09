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
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                        <Database className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[22px] font-black tracking-tighter text-[#1B2559] dark:text-white leading-none italic uppercase">ACE</span>
                        <span className="text-[10px] font-black text-primary tracking-[4px] uppercase mt-1">CORE 2026</span>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${isActive
                                        ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.03]'
                                        : 'text-[#A3AED0] hover:bg-muted hover:text-[#1B2559] dark:hover:text-white'
                                    }`}
                            >
                                <item.icon className={`h-6 w-6 transition-transform ${isActive ? 'scale-100' : 'group-hover:scale-110'}`} />
                                <span className={`text-[15px] font-bold tracking-tight ${isActive ? 'text-white' : ''}`}>{item.label}</span>
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
