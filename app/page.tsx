'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FilterX,
  LayoutGrid,
  SearchX
} from 'lucide-react';
import AuditChainCard from './components/AuditChainCard';
import AuditTestsList from './components/AuditTestsList';

interface AuditItem {
  id: string;
  id_modulo?: string;
  id_requerimiento?: string;
  id_riesgo?: string;
  id_control?: string;
  nombre: string;
  codigo?: string;
}

interface AuditData {
  modules: AuditItem[];
  requirements: AuditItem[];
  risks: AuditItem[];
  controls: AuditItem[];
  links: { id_riesgo: string; id_control: string }[];
  tests: any[];
  testReqMaps: { prueba_id: string; requerimiento_id: string }[];
  testControlMaps: { id_prueba: string; id_control: string }[];
}

export default function Dashboard() {
  const [data, setData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>();
  const [selectedReqId, setSelectedReqId] = useState<string | undefined>();
  const [selectedRiskId, setSelectedRiskId] = useState<string | undefined>();
  const [selectedControlId, setSelectedControlId] = useState<string | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/audit-chain');
        const json = await res.json();

        const normalizedData: AuditData = {
          modules: json.modules || [],
          requirements: (json.requirements || []).map((r: any) => ({ ...r, id: r.id_requerimiento })),
          risks: (json.risks || []).map((r: any) => ({ ...r, id: r.id_riesgo })),
          controls: (json.controls || []).map((c: any) => ({ ...c, id: c.id_control })),
          links: json.links || [],
          tests: json.tests || [],
          testReqMaps: json.testReqMaps || [],
          testControlMaps: json.testControlMaps || []
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

  const resetFilters = () => {
    setSelectedModuleId(undefined);
    setSelectedReqId(undefined);
    setSelectedRiskId(undefined);
    setSelectedControlId(undefined);
  };

  // Forward-Only Filtering Logic
  const filteredResources = useMemo(() => {
    if (!data) return null;

    let visibleModules = [...data.modules];
    let visibleReqs = [...data.requirements];
    if (selectedModuleId) {
      visibleReqs = visibleReqs.filter(r => r.id_modulo === selectedModuleId);
    }

    let visibleRisks = [...data.risks];
    const currentReqIds = visibleReqs.map(r => r.id);
    visibleRisks = visibleRisks.filter(ri => currentReqIds.includes(ri.id_requerimiento));

    if (selectedReqId) {
      visibleRisks = visibleRisks.filter(ri => ri.id_requerimiento === selectedReqId);
    }

    let visibleControls = [...data.controls];
    const currentRiskIds = visibleRisks.map(ri => ri.id);
    const linkedControlIdsForVisibleRisks = data.links
      .filter(l => currentRiskIds.includes(l.id_riesgo))
      .map(l => l.id_control);

    visibleControls = visibleControls.filter(c => linkedControlIdsForVisibleRisks.includes(c.id));

    if (selectedRiskId) {
      const linkedControlIdsForSelectedRisk = data.links
        .filter(l => l.id_riesgo === selectedRiskId)
        .map(l => l.id_control);
      visibleControls = visibleControls.filter(c => linkedControlIdsForSelectedRisk.includes(c.id));
    }

    let visibleTests = [...data.tests];
    if (selectedModuleId || selectedReqId || selectedRiskId || selectedControlId) {
      const finalReqIds = visibleReqs.map(r => r.id);
      const finalControlIds = visibleControls.filter(c => {
        if (!selectedControlId) return true;
        return c.id === selectedControlId;
      }).map(c => c.id);

      const linkedTestIdsFromReqs = data.testReqMaps
        .filter(m => finalReqIds.includes(m.requerimiento_id))
        .map(m => m.prueba_id);

      const linkedTestIdsFromControls = data.testControlMaps
        .filter(m => finalControlIds.includes(m.id_control))
        .map(m => m.id_prueba);

      const allLinkedTestIds = new Set([...linkedTestIdsFromReqs, ...linkedTestIdsFromControls]);
      visibleTests = data.tests.filter(t => allLinkedTestIds.has(t.id_prueba));
    }

    return {
      modules: visibleModules,
      requirements: visibleReqs,
      risks: visibleRisks,
      controls: visibleControls,
      tests: visibleTests
    };
  }, [data, selectedModuleId, selectedReqId, selectedRiskId, selectedControlId]);

  const handleDoubleClick = (id: string | undefined) => {
    alert(`Navegando al detalle de: ${id}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-[#1B2559] dark:text-white mb-2 uppercase">Visión de Auditoría</h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-primary/5 rounded-full border border-primary/20 flex items-center gap-2">
              <LayoutGrid className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">
                Drill-down (A → D)
              </span>
            </div>
            <p className="text-[#A3AED0] text-[11px] font-bold uppercase tracking-[2px]">
              Consolidado de Trazabilidad Normativa
            </p>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-white text-[13px] font-black uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(67,24,255,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all group"
        >
          <FilterX className="h-5 w-5 transition-transform group-hover:rotate-12" />
          Limpiar Filtros
        </button>
      </div>

      {/* Audit Chain Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <AuditChainCard
          title="A: Módulos"
          items={filteredResources?.modules.map(m => ({ id: m.id_modulo!, nombre: m.nombre, codigo: m.codigo })) || []}
          selectedId={selectedModuleId}
          onSelect={(id) => {
            if (selectedModuleId === id) {
              setSelectedModuleId(undefined);
            } else {
              setSelectedModuleId(id);
            }
            setSelectedReqId(undefined);
            setSelectedRiskId(undefined);
            setSelectedControlId(undefined);
          }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="B: Requerimientos"
          items={filteredResources?.requirements.map(r => ({ id: r.id, nombre: r.nombre, codigo: r.codigo })) || []}
          selectedId={selectedReqId}
          onSelect={(id) => {
            if (selectedReqId === id) {
              setSelectedReqId(undefined);
            } else {
              setSelectedReqId(id);
            }
            setSelectedRiskId(undefined);
            setSelectedControlId(undefined);
          }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="C: Riesgos"
          items={filteredResources?.risks.map(ri => ({ id: ri.id, nombre: ri.nombre, codigo: ri.codigo })) || []}
          selectedId={selectedRiskId}
          onSelect={(id) => {
            if (selectedRiskId === id) {
              setSelectedRiskId(undefined);
            } else {
              setSelectedRiskId(id);
            }
            setSelectedControlId(undefined);
          }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="D: Controles"
          items={filteredResources?.controls.map(c => ({ id: c.id, nombre: c.nombre, codigo: c.codigo })) || []}
          selectedId={selectedControlId}
          onSelect={(id) => {
            if (selectedControlId === id) {
              setSelectedControlId(undefined);
            } else {
              setSelectedControlId(id);
            }
          }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
      </div>

      {/* Empty State Illustration if no tests and filters active */}
      {filteredResources && filteredResources.tests.length === 0 && (selectedModuleId || selectedReqId) && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <SearchX className="h-10 w-10 text-muted-foreground opacity-30" />
          </div>
          <h2 className="text-xl font-black text-[#1B2559] dark:text-white uppercase tracking-tight mb-2">No se encontraron pruebas</h2>
          <p className="text-[#A3AED0] text-sm font-bold uppercase tracking-widest italic">Ajusta los filtros para ver otros resultados</p>
        </div>
      )}

      {/* Tests List Section */}
      <AuditTestsList
        tests={filteredResources?.tests || []}
        isLoading={isLoading}
      />
    </div>
  );
}
