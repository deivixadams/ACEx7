'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FilterX,
  Building,
  Users,
  Lock,
  Library,
  Save
} from 'lucide-react';

// Views
import RisksView from './components/views/RisksView';
import RequirementsView from './components/views/RequirementsView';
import ControlsView from './components/views/ControlsView';
import TestsView from './components/views/TestsView';
import SummaryView from './components/views/SummaryView';
import CompanyView from './components/views/CompanyView';
import UsersView from './components/views/UsersView';
import RolesView from './components/views/RolesView';
import LoginView from './components/auth/LoginView';

interface AuditItem {
  id: string;
  nombre: string;
  codigo?: string;
  tipo?: string;
  descripcion_full?: string;
  impacto?: string;
  probabilidad?: string;
  nivel_riesgo?: string;
  id_requerimiento?: string;
}

interface ControlItem {
  id: string;
  nombre: string;
  codigo?: string;
  tipo_control?: string;
  naturaleza?: string;
  frecuencia?: string;
  descripcion?: string;
  evidencia_esperada?: string;
}

interface TestItem {
  id_prueba: string;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  id_tipo_prueba?: string;
}

interface RequirementItem {
  id_requerimiento: string;
  titulo: string;
  nombre?: string;
  codigo?: string;
  categoria?: string;
  base_normativa?: string;
  descripcion?: string;
  source_ref?: string;
  nivel_riesgo?: string;
}

interface AuditData {
  risks: AuditItem[];
  controls: ControlItem[];
  requirements: RequirementItem[];
  riskControls: { id_riesgo: string, id_control: string }[];
  testControlMaps: { id_prueba: string, id_control: string }[];
  testReqMaps: { prueba_id: string, requerimiento_id: string }[];
  tests: TestItem[];
  summary?: any;
}

type ViewType = 'requirements' | 'risks' | 'controls' | 'tests' | 'summary' | 'company' | 'users' | 'roles' | 'library' | 'backup';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view') as ViewType;
  const currentView = viewParam || 'summary';

  const [data, setData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);

  useEffect(() => {
    // Check for existing session
    const savedSession = sessionStorage.getItem('ace_current_user');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    sessionStorage.setItem('ace_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('ace_current_user');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/audit-chain');
        const json = await res.json();

        const normalizedData: AuditData = {
          risks: (json.risks || []).map((r: any) => ({
            ...r,
            id: r.id_riesgo,
            levelScore: (() => {
              const n = (r.nivel_riesgo || r.probabilidad || '').toUpperCase();
              if (n.includes('ALTO') || n.includes('HIGH') || n.includes('CRITIC') || n.includes('EXTREM')) return 1;
              if (n.includes('MEDIO') || n.includes('MEDIA') || n.includes('MEDIUM')) return 2;
              if (n.includes('BAJO') || n.includes('BAJA') || n.includes('LOW')) return 3;
              return 4;
            })()
          })).sort((a: any, b: any) => a.levelScore - b.levelScore),
          controls: (json.controls || []).map((c: any) => ({
            id: c.id_control,
            ...c
          })),
          requirements: json.requirements || [],
          riskControls: json.links || [],
          testControlMaps: json.testControlMaps || [],
          testReqMaps: json.testReqMaps || [],
          tests: json.tests || [],
          summary: json.summary
        };

        setData(normalizedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleRiskSelect = (id: string, isMulti: boolean) => {
    if (isMulti) {
      setSelectedRiskIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setSelectedRiskIds([id]);
    }
  };

  const resetSelection = () => {
    setSelectedRiskIds([]);
  };

  // Filter Logic for Risk View
  const { filteredControls, filteredTests } = useMemo(() => {
    if (!data) return { filteredControls: [], filteredTests: [] };
    if (selectedRiskIds.length === 0) return { filteredControls: [], filteredTests: [] };

    const linkedControlIds = new Set<string>();
    selectedRiskIds.forEach(riskId => {
      data.riskControls
        .filter(rc => rc.id_riesgo === riskId)
        .forEach(rc => linkedControlIds.add(rc.id_control));
    });

    const controls = data.controls.filter(c => linkedControlIds.has(c.id));

    const involvedTests = new Set<string>();

    data.testControlMaps
      .filter(tm => linkedControlIds.has(tm.id_control))
      .forEach(tm => involvedTests.add(tm.id_prueba));

    selectedRiskIds.forEach(riskId => {
      const risk = data.risks.find(r => r.id === riskId);
      if (risk && risk.id_requerimiento) {
        data.testReqMaps
          .filter(trm => trm.requerimiento_id === risk.id_requerimiento)
          .forEach(trm => involvedTests.add(trm.prueba_id));
      }
    });

    const tests = data.tests.filter(t => involvedTests.has(t.id_prueba));

    return { filteredControls: controls, filteredTests: tests };

  }, [data, selectedRiskIds]);

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20">
        <div className="max-w-[1700px] w-full mx-auto px-6 pt-8 space-y-6">

          {/* Header section (Contextual buttons based on view?) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="flex items-center gap-3">
                <span className="bg-slate-800 text-white px-3 py-1 rounded text-sm font-black uppercase tracking-widest">
                  {currentView === 'risks' ? 'Risk View' :
                    currentView === 'requirements' ? 'Reqs View' :
                      currentView === 'controls' ? 'Controls View' :
                        currentView === 'tests' ? 'Tests View' :
                          currentView === 'company' ? 'Gestión: Empresa' :
                            currentView === 'users' ? 'Gestión: Usuarios' :
                              currentView === 'roles' ? 'Gestión: Roles' :
                                currentView === 'library' ? 'Gestión: Biblioteca' :
                                  currentView === 'backup' ? 'Gestión: Respaldo' : 'Resumen'}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {currentView === 'risks' && (
                <button
                  onClick={resetSelection}
                  disabled={selectedRiskIds.length === 0}
                  className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm
                      ${selectedRiskIds.length > 0
                      ? 'bg-slate-700 hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed'}
                    `}
                >
                  <FilterX className="h-4 w-4" />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Views Rendering */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {currentView === 'summary' && (
              <SummaryView
                summary={data?.summary || null}
                isLoading={isLoading}
              />
            )}
            {currentView === 'risks' && (
              <RisksView
                data={data}
                isLoading={isLoading}
                selectedRiskIds={selectedRiskIds}
                onRiskSelect={handleRiskSelect}
                filteredControls={filteredControls}
                filteredTests={filteredTests}
              />
            )}
            {currentView === 'requirements' && (
              <RequirementsView
                requirements={data?.requirements || []}
                isLoading={isLoading}
              />
            )}
            {currentView === 'controls' && (
              <ControlsView
                controls={data?.controls || []}
                isLoading={isLoading}
              />
            )}
            {currentView === 'tests' && (
              <TestsView
                tests={data?.tests || []}
                isLoading={isLoading}
              />
            )}

            {/* Management Placeholders */}
            {currentView === 'company' && (
              <CompanyView />
            )}

            {currentView === 'users' && (
              <UsersView />
            )}

            {currentView === 'roles' && (
              <RolesView />
            )}

            {currentView === 'library' && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Library className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Biblioteca Normativa</h2>
                <p className="text-slate-500 max-w-md mx-auto">Repositorio centralizado de leyes, regulaciones y guías técnicas.</p>
                <div className="pt-4">
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest">Módulo en Desarrollo</span>
                </div>
              </div>
            )}

            {currentView === 'backup' && (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Save className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Respaldo de Datos</h2>
                <p className="text-slate-500 max-w-md mx-auto">Gestión de copias de seguridad y exportación de la base de datos de cumplimiento.</p>
                <div className="pt-4">
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-widest">Módulo en Desarrollo</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
