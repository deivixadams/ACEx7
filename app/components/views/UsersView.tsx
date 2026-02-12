'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
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
    Trash2,
    Phone,
    MapPin,
    Briefcase,
    MoreVertical,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

interface Role {
    id: number;
    nombre: string;
}

interface Company {
    id: number;
    nombre: string;
}

interface UserData {
    id: string;
    nombre: string;
    email: string;
    rol_nombre: string;
    id_rol: number;
    id_empresa: string;
    empresa_nombre: string;
    puesto: string;
    telefono: string;
    direccion: string;
    activo: boolean;
}

const UsersView = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form & UI state
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        id_rol: 0,
        id_empresa: '0',
        puesto: '',
        telefono: '',
        direccion: '',
        password: '',
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

    const handleEdit = (user: UserData) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            id_rol: user.id_rol || 0,
            id_empresa: String(user.id_empresa) || '0',
            puesto: user.puesto || '',
            telefono: user.telefono || '',
            direccion: user.direccion || '',
            password: '', // Never fill password
            activo: user.activo
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            nombre: '', email: '', id_rol: 0, id_empresa: '0',
            puesto: '', telefono: '', direccion: '', password: '', activo: true
        });
        setEditingUser(null);
        setShowForm(false);
        setShowPassword(false);
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

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            fetchData();
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.puesto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-[4px] text-xs">Sincronizando Usuarios Élite</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <Shield className="h-6 w-6" />
                        </div>
                        Directorio Corporativo
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 max-w-xl">Gestión centralizada de identidades, perfiles y permisos de acceso para la red ACE-X7.</p>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar ejecutivos..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-12 pr-4 py-3.5 focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-slate-900 text-white rounded-[1.25rem] px-8 py-3.5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span className="hidden md:inline">Registrar Perfil</span>
                    </button>
                </div>
            </div>

            {/* Grid of Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all group relative">
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                            <button
                                onClick={() => handleEdit(user)}
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all border border-slate-100"
                            >
                                <Pencil className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all shadow-inner ${user.activo ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-slate-100 text-slate-300'}`}>
                                <User className="h-10 w-10 font-black" />
                            </div>
                            <div className="space-y-1 mt-1 pr-10">
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none truncate w-full" title={user.nombre}>
                                    {user.nombre}
                                </h4>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    {user.puesto || 'Cargo no definido'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Mail className="h-4 w-4 text-primary/50" />
                                <span className="text-sm font-semibold truncate lowercase">{user.email}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-slate-500 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{user.rol_nombre || 'Audit'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                                    <Building className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{user.empresa_nombre || 'Global'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-slate-400">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">{user.telefono || '--'}</span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold truncate tracking-tight">{user.direccion || '--'}</span>
                            </div>
                        </div>

                        {/* Status Label */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.activo ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user.activo ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {user.activo ? 'Acceso Vitalicio' : 'Restringido'}
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase underline decoration-slate-200 decoration-2 underline-offset-4">Perfil Verificado</span>
                        </div>

                        {/* Delete Confirm Overlay */}
                        {showDeleteConfirm === user.id && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200 z-20">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center">
                                    <Trash2 className="h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-xl font-black text-slate-800 uppercase tracking-tighter">¿Eliminar Ejecutivo?</h5>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed px-4">Esta acción revocará permanentemente todos los accesos y registros del usuario.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-3 text-xs font-black uppercase tracking-widest">Abortar</button>
                                    <button onClick={() => handleDelete(user.id)} className="flex-1 bg-red-600 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700">Eliminar</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row border border-white/20 animate-in zoom-in-95 duration-500">
                        {/* Side Banner - Lightened */}
                        <div className="hidden lg:flex w-1/4 bg-slate-800 p-12 text-white flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-primary border border-primary/20">
                                    <Lock className="h-8 w-8" />
                                </div>
                                <h3 className="text-3xl font-black leading-tight tracking-tight">
                                    {editingUser ? 'Actualizar Privilegios' : 'Alta de Nuevo Ejecutivo'}
                                </h3>
                                <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                                    "La seguridad de ACE-X7 comienza con la integridad de sus identidades digitales."
                                </p>
                            </div>
                            <div className="relative z-10 pt-12">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-primary">
                                        <Check className="h-5 w-5 bg-primary/10 rounded-full p-1 border border-primary/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Hashing de Clase Mundial</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <Check className="h-5 w-5 bg-emerald-500/10 rounded-full p-1 border border-emerald-500/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Identidad Verificada</span>
                                    </div>
                                </div>
                            </div>
                            <Shield className="absolute -left-20 -bottom-20 h-64 w-64 text-white/5 -rotate-12" />
                        </div>

                        {/* Form Body - More spaced */}
                        <div className="flex-1 p-8 lg:p-14 overflow-y-auto scrollbar-hide">
                            <button onClick={resetForm} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl text-slate-400 group transition-all">
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                            </button>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <FormInput
                                        label="Nombre Profesional"
                                        icon={<User className="h-4 w-4" />}
                                        value={formData.nombre}
                                        onChange={(v: string) => setFormData({ ...formData, nombre: v })}
                                        placeholder="Ej. Alexander Pierce"
                                    />
                                    <FormInput
                                        label="Business Email (Username) *"
                                        icon={<Mail className="h-4 w-4" />}
                                        value={formData.email}
                                        onChange={(v: string) => setFormData({ ...formData, email: v })}
                                        placeholder="a.pierce@corporate.com"
                                        type="email"
                                        required={true}
                                    />
                                    <FormInput
                                        label="Posición / Cargo"
                                        icon={<Briefcase className="h-4 w-4" />}
                                        value={formData.puesto}
                                        onChange={(v: string) => setFormData({ ...formData, puesto: v })}
                                        placeholder="Director de Auditoría"
                                    />
                                    <FormInput
                                        label="Línea Telefónica Directa"
                                        icon={<Phone className="h-4 w-4" />}
                                        value={formData.telefono}
                                        onChange={(v: string) => setFormData({ ...formData, telefono: v })}
                                        placeholder="+57 321 000 0000"
                                    />
                                </div>

                                <FormInput
                                    label="Dirección de Instalaciones"
                                    icon={<MapPin className="h-4 w-4" />}
                                    value={formData.direccion}
                                    onChange={(v: string) => setFormData({ ...formData, direccion: v })}
                                    placeholder="Avenida Principal #12-34, Bogota"
                                    required={false}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jerarquía de Seguridad *</label>
                                        <select
                                            value={formData.id_rol}
                                            onChange={e => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={0}>Seleccionar Rol...</option>
                                            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entidad de Cumplimiento</label>
                                        <select
                                            value={formData.id_empresa}
                                            onChange={e => setFormData({ ...formData, id_empresa: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="0">Seleccionar Empresa...</option>
                                            {companies.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 bg-slate-50 p-10 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seguridad de Acceso *</span>
                                            <p className="text-xs font-bold text-slate-600">Configurar contraseña cifrada con hashing PBKDF2</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                            className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${formData.activo ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-500 border border-slate-50 transform ${formData.activo ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="relative pt-4 z-10">
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-slate-400 hover:text-primary cursor-pointer mt-2" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editingUser ? "Dejar en blanco para conservar actual" : "Establecer contraseña maestra"}
                                            className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-primary transition-all pr-14"
                                        />
                                    </div>
                                    <div className="absolute right-0 top-0 h-full w-1/4 bg-white/5 z-0" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-slate-900 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[4px] text-xs shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-t border-white/10"
                                >
                                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingUser ? 'Finalizar Perfeccionamiento' : 'Empoderar Ejecutivo')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FormInput = ({ label, icon, value, onChange, placeholder, type = "text", required = false }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                {icon}
            </div>
            <input
                type={type}
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-700 outline-none shadow-inner"
            />
        </div>
    </div>
);

export default UsersView;
