'use client';

import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import {
    FileCheck, ShieldAlert, ShieldCheck,
    Activity, Calendar, User, FileText, ChevronRight, TrendingUp
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
            avatar_url?: string;
        }>;
        findingsHistory?: Array<{
            year: number;
            month: number;
            count: number;
        }>;
    };
    isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-100/50 overflow-hidden ring-1 ring-slate-900/5">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                </div>
                <div className="p-3 space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2 w-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs font-bold text-slate-500">{entry.name}:</span>
                            </div>
                            <span className="text-xs font-black text-slate-800">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const ComparativeFindingsChart = ({ history }: { history: any[] }) => {
    if (!history || history.length === 0) return null;

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const years = [...new Set(history.map(h => h.year))].sort();

    const chartData = months.map((m, i) => {
        const monthNum = i + 1;
        const entry: any = { name: m };
        years.forEach(y => {
            const found = history.find(h => h.year === y && h.month === monthNum);
            entry[y] = found ? found.count : 0;
        });
        return entry;
    });

    const colors = [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
    ];

    return (
        <div className="h-[450px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                    {years.map((year, index) => (
                        <Line
                            key={year}
                            type="monotone"
                            dataKey={year}
                            name={`Auditorías ${year}`}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: colors[index % colors.length] }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    ))}
                    <Brush
                        dataKey="name"
                        height={30}
                        stroke="#e2e8f0"
                        fill="#f8fafc"
                        gap={1}
                        travellerWidth={10}
                    >
                        <LineChart data={chartData}>
                            <Line type="monotone" dataKey={years[years.length - 1]} stroke="#94a3b8" strokeWidth={1} dot={false} />
                        </LineChart>
                    </Brush>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

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
        <div className="space-y-8 animate-in fade-in duration-700 pt-2">

            {/* Top Metrics Cards (Vibrant Style) */}

            {/* Top Metrics Cards (Vibrant Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Total Requerimientos */}
                <VibrantMetricCard
                    title="Total Requerimientos"
                    value={summary.totalReqs}
                    color="bg-blue-600"
                    icon={<FileText className="h-6 w-6" />}
                    trend="+12.5% vs last month"
                    sparkData={[10, 15, 8, 22, 18, 25, 30]}
                />

                {/* Total Riesgos */}
                <VibrantMetricCard
                    title="Total Riesgos"
                    value={summary.totalRisks}
                    color="bg-cyan-600"
                    icon={<ShieldAlert className="h-6 w-6" />}
                    trend="+8.2% vs last week"
                    sparkData={[20, 25, 40, 30, 45, 50, 40]}
                />

                {/* Total Controles */}
                <VibrantMetricCard
                    title="Total Controles"
                    value={summary.totalControls}
                    color="bg-emerald-600"
                    icon={<ShieldCheck className="h-6 w-6" />}
                    trend="-2.1% vs yesterday"
                    sparkData={[60, 55, 50, 58, 62, 59, 72]}
                />

                {/* Accuracy / Dynamic Metric */}
                <VibrantMetricCard
                    title="Nivel de Cobertura"
                    value="94%"
                    color="bg-indigo-600"
                    icon={<Activity className="h-6 w-6" />}
                    trend="+0.3% vs last month"
                    sparkData={[80, 82, 85, 88, 90, 92, 94]}
                />
            </div>

            {/* Charts Row Users Requested (D, E, F) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* D: Pie Chart - Test Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 group hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6 text-center">Distribución de Pruebas</h4>
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
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 group hover:shadow-2xl transition-all duration-300">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6 text-center">Controles por Tipo</h4>
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
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 group hover:shadow-2xl transition-all duration-300 col-span-1 lg:col-span-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-6 text-center">Riesgos por Tipo</h4>
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


            {/* G: Audit List Section */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight">Auditorías <span className="text-primary italic">Realizadas</span></h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control de ejecución en tiempo real</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Auditoría / Objetivo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Auditor Líder</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Nivel Riesgo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-center">Estado</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Fecha Inicio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {summary.auditList && summary.auditList.length > 0 ? (
                                summary.auditList.map((audit) => (
                                    <tr key={audit.id} className="group/row hover:bg-slate-50/80 transition-colors">
                                        {/* Audit Code & Objective */}
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800 group-hover/row:text-primary transition-colors">{audit.codigo}</span>
                                                <span className="text-xs font-medium text-slate-400 line-clamp-1 max-w-xs">{audit.objetivo || 'Sin objetivo definido'}</span>
                                            </div>
                                        </td>

                                        {/* Auditor Info with Avatar */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden group-hover/row:scale-110 transition-transform">
                                                    {audit.avatar_url ? (
                                                        <img src={audit.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{audit.auditor_lider || 'Sin asignar'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auditor Principal</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Risk Level */}
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex justify-center">
                                                <span className={`text-[11px] font-black tracking-widest px-3 py-1 rounded-lg
                                                    ${audit.riesgo_general === 'ALTO' ? 'text-red-500 bg-red-50' :
                                                        audit.riesgo_general === 'MEDIO' ? 'text-amber-500 bg-amber-50' :
                                                            'text-emerald-500 bg-emerald-50'}`}>
                                                    {audit.riesgo_general || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status Badge (Premium Style) */}
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm
                                                    ${audit.estado === 'Cerrada'
                                                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                                                        : 'bg-orange-500 text-white shadow-orange-200'}`}>
                                                    {audit.estado || 'En curso'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-700">
                                                    {audit.fecha_inicio ? new Date(audit.fecha_inicio).toLocaleDateString() : '-'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Calendario</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay auditorías activas</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* H: Comparative Findings Section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 group hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Análisis Comparativo de <span className="text-primary italic">Hallazgos</span></h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Evolución histórica de métricas de cumplimiento (Últimos 3 años)</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">Vista Anual</span>
                    </div>
                </div>

                <ComparativeFindingsChart history={summary.findingsHistory || []} />

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 italic">Nota: Los puntos representan la densidad de hallazgos identificados por mes.</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Tendencia Alta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Tendencia Estable</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const VibrantMetricCard = ({ title, value, color, icon, trend, sparkData }: any) => {
    const data = sparkData.map((v: number, i: number) => ({ name: i, value: v }));

    return (
        <div className={`${color} p-6 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col justify-between h-44 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
            {/* Background pattern decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                {React.cloneElement(icon, { size: 120, className: "text-white" })}
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-white/70 text-xs font-black uppercase tracking-[2px]">{title}</p>
                    <div className="text-white/20">
                        {icon}
                    </div>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter">{value}</h3>
            </div>

            <div className="relative z-10 mt-4 flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="text-white/90 text-[10px] font-bold flex items-center gap-1">
                        {trend.includes('+') ? (
                            <Activity className="h-3 w-3 text-emerald-300" />
                        ) : (
                            <Activity className="h-3 w-3 text-red-300 rotate-180" />
                        )}
                        {trend}
                    </span>
                </div>

                {/* Sparkline */}
                <div className="h-12 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth={3}
                                dot={false}
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SummaryView;
