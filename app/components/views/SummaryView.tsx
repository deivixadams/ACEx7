'use client';

import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    FileCheck, ShieldAlert, ShieldCheck,
    Activity, Calendar, User, FileText
} from 'lucide-react';

interface SummaryViewProps {
    summary: {
        totalReqs: number;
        totalRisks: number;
        totalControls: number;
        riskTypes: Array<{ name: string; value: number }>;
        controlTypes: Array<{ name: string; value: number }>;
        testDistribution: Array<{ name: string; value: number }>;
        auditList: Array<{
            id: string;
            codigo: string;
            fecha_inicio: string;
            riesgo_general: string;
            objetivo: string;
            estado: string;
            auditor_lider: string;
        }>;
    };
    isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SummaryView: React.FC<SummaryViewProps> = ({ summary, isLoading }) => {
    if (isLoading || !summary) {
        return <div className="animate-pulse h-96 bg-slate-100 rounded-xl w-full" />;
    }

    // Helper for safe values
    const riskTypes = summary.riskTypes?.map(i => ({ ...i, value: Number(i.value) })) || [];
    const controlTypes = summary.controlTypes?.map(i => ({ ...i, value: Number(i.value) })) || [];
    const testDistribution = summary.testDistribution || [];

    return (
        <div className="space-y-6">

            {/* Top Metrics Cards (A, B, C) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Requerimientos</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2">{summary.totalReqs}</h3>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Riesgos</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2">{summary.totalRisks}</h3>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Controles</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-2">{summary.totalControls}</h3>
                    </div>
                    <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Charts Row Users Requested (D, E, F) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* D: Pie Chart - Test Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 text-center">Distribución de Pruebas</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={testDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {testDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* E: Bar Chart - Control Types */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 text-center">Controles por Tipo</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={controlTypes}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* F: Bar Chart - Risk Types (Horizontal for readability) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 lg:col-span-1">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 text-center">Riesgos por Tipo</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={riskTypes}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#6366f1"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


            {/* G: Audit List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                    <Activity className="h-5 w-5 text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Auditorías Realizadas</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Inicio</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Objetivo</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Riesgo General</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Auditor Líder</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {summary.auditList && summary.auditList.length > 0 ? (
                                summary.auditList.map((audit) => (
                                    <tr key={audit.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{audit.codigo}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-slate-400" />
                                                {audit.fecha_inicio ? new Date(audit.fecha_inicio).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{audit.objetivo || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                         ${audit.riesgo_general === 'ALTO' ? 'bg-red-100 text-red-700' :
                                                    audit.riesgo_general === 'MEDIO' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-600'}`}>
                                                {audit.riesgo_general || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-slate-400" />
                                                {audit.auditor_lider || 'Sin asignar'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                                                {audit.estado || 'Borrador'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron auditorías recientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div >
    );
};

export default SummaryView;
