'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    FileCheck,
    Map,
    Database,
    Building,
    Users,
    Lock,
    Library,
    Save,
    ChevronDown,
    ChevronRight,
    ShieldAlert,
    BarChart3,
    Settings
} from 'lucide-react';

import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { isSidebarOpen } = useSidebar();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view');

    const menuItems = [
        { icon: LayoutDashboard, label: 'Resumen', href: '/?view=summary', id: 'summary' },
        { icon: ShieldAlert, label: 'Riesgos', href: '/?view=risks', id: 'risks' },
        { icon: FileCheck, label: 'Requerimientos', href: '/?view=requirements', id: 'requirements' },
        { icon: BarChart3, label: 'Controles', href: '/?view=controls', id: 'controls' },
        { icon: Settings, label: 'Pruebas', href: '/?view=tests', id: 'tests' },
        {
            icon: Map,
            label: 'Gestión',
            href: '#',
            id: 'management',
            subItems: [
                { icon: Building, label: 'Empresa', href: '/?view=company', id: 'company' },
                { icon: Users, label: 'Usuarios', href: '/?view=users', id: 'users' },
                { icon: Lock, label: 'Roles', href: '/?view=roles', id: 'roles' },
                { icon: Library, label: 'Biblioteca', href: '/?view=library', id: 'library' },
                { icon: Save, label: 'Respaldo', href: '/?view=backup', id: 'backup' },
            ]
        },
    ];

    const { user, logout } = useAuth();

    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({ management: true });

    const toggleSubMenu = (id: string) => {
        setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
                        if (item.subItems) {
                            const isSubActive = item.subItems.some(sub => currentView === sub.id);
                            const isOpen = openSubMenus[item.id];

                            return (
                                <div key={item.id} className="space-y-1">
                                    <button
                                        onClick={() => toggleSubMenu(item.id)}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${isSubActive
                                            ? 'bg-slate-800 text-white shadow-lg'
                                            : 'text-[#64748b] hover:bg-[var(--muted)] hover:text-[var(--foreground)] dark:text-[#94a3b8]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-[15px] font-medium tracking-tight">{item.label}</span>
                                        </div>
                                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>

                                    {isOpen && (
                                        <div className="pl-4 space-y-1 mt-1 animate-in slide-in-from-top-1 duration-200">
                                            {item.subItems.map((sub) => {
                                                const isSubItemActive = currentView === sub.id;
                                                return (
                                                    <Link
                                                        key={sub.id}
                                                        href={sub.href}
                                                        className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${isSubItemActive
                                                            ? 'bg-primary/10 text-primary font-bold'
                                                            : 'text-[#64748b] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                                            }`}
                                                    >
                                                        <sub.icon className="h-4 w-4" />
                                                        <span className="text-[13px]">{sub.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Determine active state
                        let isActive = false;
                        if (item.href.startsWith('/?view=')) {
                            // It's a view toggle on the home page
                            const viewParam = item.href.split('=')[1];
                            isActive = pathname === '/' && (currentView === viewParam || (!currentView && viewParam === 'summary' && item.id === 'summary'));
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


        </aside>
    );
};

export default Sidebar;
