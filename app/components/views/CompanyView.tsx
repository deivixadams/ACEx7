'use client';

import React, { useState, useEffect } from 'react';
import {
    Building,
    Plus,
    Pencil,
    Check,
    X,
    Trash2,
    Loader2,
    AlertCircle,
    Building2,
    Hash,
    Power
} from 'lucide-react';

interface Company {
    id: number;
    nombre: string;
    nit: string;
    activo: boolean;
}

const CompanyView = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        nit: '',
        activo: true
    });

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/companies');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setCompanies(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const resetForm = () => {
        setFormData({ nombre: '', nit: '', activo: true });
        setEditingCompany(null);
        setShowForm(false);
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setFormData({
            nombre: company.nombre,
            nit: company.nit,
            activo: company.activo
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCompany ? { ...formData, id: editingCompany.id } : formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (editingCompany) {
                setCompanies(prev => prev.map(c => c.id === data.id ? data : c));
            } else {
                setCompanies(prev => [...prev, data]);
            }
            resetForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (company: Company) => {
        try {
            const res = await fetch('/api/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...company, activo: !company.activo })
            });
            const data = await res.json();
            setCompanies(prev => prev.map(c => c.id === data.id ? data : c));
        } catch (err: any) {
            console.error('Failed to toggle status', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <p className="text-slate-500 font-medium">Cargando configuración organizacional...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Empresas</p>
                        <p className="text-3xl font-black text-slate-800">{companies.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-transform">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Power className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Activas</p>
                        <p className="text-3xl font-black text-slate-800">{companies.filter(c => c.activo).length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group" onClick={() => setShowForm(true)}>
                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-emerald-600 transition-colors">
                        <Plus className="h-6 w-6" />
                        <span className="font-extrabold uppercase tracking-widest text-sm">Registrar Empresa</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Companies List */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Listado de Organizaciones</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {companies.map(company => (
                            <div key={company.id} className={`bg-white rounded-3xl p-6 border transition-all flex items-center justify-between group ${editingCompany?.id === company.id ? 'border-emerald-500 shadow-md ring-4 ring-emerald-500/10' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${company.activo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Building className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 leading-tight">{company.nombre}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Hash className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">NIT: {company.nit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => toggleStatus(company)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${company.activo ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                        title={company.activo ? 'Desactivar' : 'Activar'}
                                    >
                                        <Power className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(company)}
                                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-all shadow-inner border border-slate-200"
                                        title="Editar"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {companies.length === 0 && (
                            <div className="bg-slate-50 rounded-3xl p-12 border border-dashed border-slate-300 text-center">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No hay empresas registradas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Side / Overlay */}
                {(showForm || editingCompany) && (
                    <div className="lg:w-96 animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl sticky top-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                                </h3>
                                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 underline uppercase tracking-[2px] ml-1">Nombre Legal</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej. Acme Bancorp Inc."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 underline uppercase tracking-[2px] ml-1">Número de Identificación (NIT)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nit}
                                        onChange={e => setFormData({ ...formData, nit: e.target.value })}
                                        placeholder="900123456-7"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between px-2 pt-2">
                                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Estado Activo</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${formData.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 transform ${formData.activo ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-slate-800 text-white rounded-2xl py-4 font-black uppercase tracking-[3px] text-xs shadow-lg shadow-slate-200 hover:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                {editingCompany ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                                {editingCompany ? 'Guardar Cambios' : 'Registrar Empresa'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyView;
