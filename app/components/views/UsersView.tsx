'use client';

import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    Plus,
    Pencil,
    Shield,
    Building,
    Mail,
    Check,
    X,
    Power,
    Loader2,
    Search,
    UserPlus,
    ChevronRight,
    Lock
} from 'lucide-react';

interface Role {
    id: number;
    nombre: string;
}

interface Company {
    id: number;
    nombre: string;
}

interface User {
    id: string;
    nombre: string;
    email: string;
    rol_nombre: string;
    id_rol: number;
    id_empresa: number;
    empresa_nombre: string;
    activo: boolean;
}

const UsersView = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        id_rol: 0,
        id_empresa: 0,
        activo: true
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [uRes, rRes, cRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/roles'),
                fetch('/api/companies')
            ]);

            const [uData, rData, cData] = await Promise.all([
                uRes.json(),
                rRes.json(),
                cRes.json()
            ]);

            setUsers(uData);
            setRoles(rData);
            setCompanies(cData);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            id_rol: user.id_rol || 0,
            id_empresa: user.id_empresa || 0,
            activo: user.activo
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ nombre: '', email: '', id_rol: 0, id_empresa: 0, activo: true });
        setEditingUser(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser ? { ...formData, id: editingUser.id } : formData)
            });
            await res.json();
            fetchData();
            resetForm();
        } catch (err) {
            console.error('Failed to save user', err);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-500 font-medium">Configurando accesos de seguridad...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none"
                    />
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="w-full md:w-auto bg-primary text-white rounded-2xl px-8 py-3 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                    <UserPlus className="h-5 w-5" />
                    Registrar Usuario
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Users Table-ish List */}
                <div className="flex-1 space-y-3">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col md:flex-row items-center justify-between group">
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${user.activo ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                    <UsersIcon className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-slate-800 leading-tight flex items-center gap-3">
                                        {user.nombre}
                                        {!user.activo && <span className="bg-slate-200 text-slate-500 text-[10px] uppercase px-2 py-0.5 rounded-full">Inactivo</span>}
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold lowercase">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                            <Shield className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-tight">{user.rol_nombre || 'Sin Rol'}</span>
                                        </div>
                                        {user.empresa_nombre && (
                                            <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                                <Building className="h-3.5 w-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{user.empresa_nombre}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleEdit(user)}
                                className="mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 hover:bg-slate-100 p-3 rounded-2xl border border-slate-200 text-slate-600 self-end md:self-auto"
                            >
                                <Pencil className="h-5 w-5" />
                            </button>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="bg-slate-50 rounded-[2rem] p-16 border border-dashed border-slate-300 text-center">
                            <Lock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No se encontraron usuarios</p>
                        </div>
                    )}
                </div>

                {/* Form Panel */}
                {showForm && (
                    <div className="lg:w-[400px] animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl sticky top-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    {editingUser ? 'Editar' : 'Nuevo'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FormInput
                                    label="Nombre Completo"
                                    icon={<UsersIcon className="h-4 w-4" />}
                                    value={formData.nombre}
                                    onChange={v => setFormData({ ...formData, nombre: v })}
                                    placeholder="Ej. Juan Pérez"
                                />

                                <FormInput
                                    label="Correo Electrónico"
                                    icon={<Mail className="h-4 w-4" />}
                                    value={formData.email}
                                    onChange={v => setFormData({ ...formData, email: v })}
                                    placeholder="juan@miempresa.com"
                                    type="email"
                                />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asignar Rol</label>
                                    <select
                                        value={formData.id_rol}
                                        onChange={e => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value={0}>Seleccionar Rol...</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa / Cliente</label>
                                    <select
                                        value={formData.id_empresa}
                                        onChange={e => setFormData({ ...formData, id_empresa: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value={0}>Seleccionar Empresa...</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Acceso Habilitado</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${formData.activo ? 'bg-primary' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-[3px] text-xs shadow-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            {editingUser ? 'Guardar Cambios' : 'Finalizar Registro'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FormInput = ({ label, icon, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                {icon}
            </div>
            <input
                type={type}
                required
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold outline-none"
            />
        </div>
    </div>
);

export default UsersView;
