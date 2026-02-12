'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';

interface LoginViewProps {
    onLoginSuccess: (userData: any) => void;
}

const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecognized, setIsRecognized] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('ace_remembered_user');
        if (saved) {
            const data = JSON.parse(saved);
            setEmail(data.email);
            setRememberMe(true);
            setIsRecognized(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            if (rememberMe) {
                localStorage.setItem('ace_remembered_user', JSON.stringify({ email }));
            } else {
                localStorage.removeItem('ace_remembered_user');
            }

            onLoginSuccess(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-[1200px] h-[700px] bg-white rounded-[4rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 animate-in fade-in zoom-in-95 duration-700">
                {/* Brand Side */}
                <div className="md:w-5/12 bg-slate-900 p-16 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10 space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <ShieldCheck className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter">ACE-X7</h1>
                                <p className="text-[10px] font-black uppercase tracking-[4px] text-primary">Audit Platform</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-5xl font-black leading-tight tracking-tighter">
                                Auditoría de <br />
                                <span className="text-primary italic">Misión Crítica</span>
                            </h2>
                            <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                                Bienvenida al motor de cumplimiento más avanzado de la región. Acceso restringido para personal autorizado.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                            <div className="w-8 h-[2px] bg-slate-800" />
                            <span>V 7.4.0 Global</span>
                        </div>
                    </div>

                    <ShieldCheck className="absolute -right-20 -bottom-20 h-96 w-96 text-white/5 -rotate-12" />
                </div>

                {/* Login Side */}
                <div className="flex-1 p-12 md:p-24 flex flex-col justify-center relative">
                    <div className="max-w-md w-full mx-auto space-y-10">
                        <div className="space-y-4">
                            {isRecognized ? (
                                <div className="animate-in slide-in-from-left-4 duration-500">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">¡Hola de nuevo!</h3>
                                    <p className="text-slate-500 font-bold">Confirma tus credenciales para continuar.</p>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-left-4 duration-500">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Acceso Identitario</h3>
                                    <p className="text-slate-500 font-bold text-sm">Ingresa tus credenciales corporativas.</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nombre@empresa.com"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-5 py-4 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 outline-none focus:border-primary shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña de Seguridad</label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 outline-none focus:border-primary shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${rememberMe ? 'bg-primary' : 'bg-slate-200'}`} />
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${rememberMe ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Grabar Credenciales</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-slate-900 text-white rounded-[1.5rem] py-5 font-black uppercase tracking-[4px] text-xs shadow-2xl shadow-slate-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-b-4 border-slate-950"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        {isRecognized ? 'Validar y Entrar' : 'Autenticar Acceso'}
                                        <ChevronRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
