'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Lock,
    Check,
    UserCheck,
    Eye,
    Settings,
    ShieldAlert,
    Loader2
} from 'lucide-react';

interface Role {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

const RolesView = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        activo: true
    });

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            console.error('Failed to fetch roles', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            fetchRoles();
            setShowForm(false);
            setFormData({ nombre: '', descripcion: '', activo: true });
        } catch (error) {
            console.error('Failed to create role', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-500 font-medium">Cargando catálogo de permisos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with New Role Button */}
            <div className="bg-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden border border-slate-700 shadow-2xl">
                <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1 rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                            <Lock className="h-3 w-3" />
                            Niveles de Seguridad
                        </div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight">Configuración de Matrices de Acceso</h2>
                        <p className="text-slate-300 font-medium leading-relaxed">
                            Define los roles y permisos que gobiernan el acceso a los datos de cumplimiento y auditoría en la plataforma ACE-X7.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3"
                    >
                        <ShieldAlert className="h-5 w-5" />
                        Crear Nuevo Rol
                    </button>
                </div>
                {/* Decorative element */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <Shield className="absolute -right-16 -bottom-16 h-80 w-80 text-white/5 rotate-12 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all group relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${role.activo ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <ShieldAlert className="h-7 w-7" />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">{role.nombre}</h4>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tighter italic">
                                    {role.descripcion}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Rol</span>
                                    <div className={`flex items-center gap-1.5 ${role.activo ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        <Check className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase">{role.activo ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                Gestionar Permisos
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Create Role Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20 p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Perfil de Seguridad</h3>
                            <button onClick={() => setShowForm(false)} className="bg-slate-100 p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                                <ShieldAlert className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Rol</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej. Auditor Líder"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-primary transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción de Alcance</label>
                                <textarea
                                    required
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Define las capacidades de este rol..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-primary transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-primary text-white rounded-2xl py-4 font-black uppercase tracking-[2px] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                Consolidar Nuevo Rol
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesView;
