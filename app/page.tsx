'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FilterX
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

  const filteredResources = useMemo(() => {
    if (!data) return null;

    let visibleModules = [...data.modules];
    let visibleReqs = [...data.requirements];
    let visibleRisks = [...data.risks];
    let visibleControls = [...data.controls];
    let visibleTests = [...data.tests];

    // Filtering logic
    if (selectedModuleId) {
      visibleReqs = visibleReqs.filter(r => r.id_modulo === selectedModuleId);
      const reqIds = visibleReqs.map(r => r.id);
      visibleRisks = visibleRisks.filter(ri => reqIds.includes(ri.id_requerimiento));
      const riskIds = visibleRisks.map(ri => ri.id);
      const linkedControlIds = data.links.filter(l => riskIds.includes(l.id_riesgo)).map(l => l.id_control);
      visibleControls = visibleControls.filter(c => linkedControlIds.includes(c.id));
    }

    if (selectedReqId) {
      visibleRisks = visibleRisks.filter(ri => ri.id_requerimiento === selectedReqId);
      const riskIds = visibleRisks.map(ri => ri.id);
      const linkedControlIds = data.links.filter(l => riskIds.includes(l.id_riesgo)).map(l => l.id_control);
      visibleControls = visibleControls.filter(c => linkedControlIds.includes(c.id));
      const req = data.requirements.find(r => r.id === selectedReqId);
      if (req) visibleModules = visibleModules.filter(m => m.id_modulo === req.id_modulo);
    }

    if (selectedRiskId) {
      const linkedControlIds = data.links.filter(l => l.id_riesgo === selectedRiskId).map(l => l.id_control);
      visibleControls = visibleControls.filter(c => linkedControlIds.includes(c.id));
      const risk = data.risks.find(ri => ri.id === selectedRiskId);
      if (risk) {
        visibleReqs = visibleReqs.filter(r => r.id === risk.id_requerimiento);
        const req = data.requirements.find(r => r.id === risk.id_requerimiento);
        if (req) visibleModules = visibleModules.filter(m => m.id_modulo === req.id_modulo);
      }
    }

    if (selectedControlId) {
      const linkedRiskIds = data.links.filter(l => l.id_control === selectedControlId).map(l => l.id_riesgo);
      visibleRisks = visibleRisks.filter(ri => linkedRiskIds.includes(ri.id));
      const reqIds = visibleRisks.map(ri => ri.id_requerimiento);
      visibleReqs = visibleReqs.filter(r => reqIds.includes(r.id));
      const modIds = visibleReqs.map(r => r.id_modulo);
      visibleModules = visibleModules.filter(m => modIds.includes(m.id_modulo));
    }

    // Filter Tests
    if (selectedModuleId || selectedReqId || selectedRiskId || selectedControlId) {
      const currentReqIds = visibleReqs.map(r => r.id);
      const currentControlIds = visibleControls.map(c => c.id);
      const linkedTestIdsFromReqs = data.testReqMaps.filter(m => currentReqIds.includes(m.requerimiento_id)).map(m => m.prueba_id);
      const linkedTestIdsFromControls = data.testControlMaps.filter(m => currentControlIds.includes(m.id_control)).map(m => m.id_prueba);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] mb-1">Visión de Auditoría</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[2px]">
            Navegación Vinculada de Procesos y Riesgos
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <FilterX className="h-4 w-4 transition-transform group-hover:rotate-12" />
          Limpiar Filtros
        </button>
      </div>

      {/* Audit Chain Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <AuditChainCard
          title="A: Módulos"
          items={filteredResources?.modules.map(m => ({ id: m.id_modulo!, nombre: m.nombre, codigo: m.codigo })) || []}
          selectedId={selectedModuleId}
          onSelect={(id) => { resetFilters(); setSelectedModuleId(id); }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="B: Requerimientos"
          items={filteredResources?.requirements.map(r => ({ id: r.id, nombre: r.nombre, codigo: r.codigo })) || []}
          selectedId={selectedReqId}
          onSelect={(id) => { resetFilters(); setSelectedReqId(id); }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="C: Riesgos"
          items={filteredResources?.risks.map(ri => ({ id: ri.id, nombre: ri.nombre, codigo: ri.codigo })) || []}
          selectedId={selectedRiskId}
          onSelect={(id) => { resetFilters(); setSelectedRiskId(id); }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
        <AuditChainCard
          title="D: Controles"
          items={filteredResources?.controls.map(c => ({ id: c.id, nombre: c.nombre, codigo: c.codigo })) || []}
          selectedId={selectedControlId}
          onSelect={(id) => { resetFilters(); setSelectedControlId(id); }}
          onDoubleClick={handleDoubleClick}
          isLoading={isLoading}
        />
      </div>

      {/* Tests List Section */}
      <AuditTestsList
        tests={filteredResources?.tests || []}
        isLoading={isLoading}
      />
    </div>
  );
}
