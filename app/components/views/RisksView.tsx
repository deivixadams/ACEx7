'use client';

import React from 'react';
import RiskAnalysisTable from '../../components/RiskAnalysisTable';
import LinkedResources from '../../components/LinkedResources';

interface RisksViewProps {
    data: any;
    isLoading: boolean;
    selectedRiskIds: string[];
    onRiskSelect: (id: string, isMulti: boolean) => void;
    filteredControls: any[];
    filteredTests: any[];
}

const RisksView: React.FC<RisksViewProps> = ({
    data,
    isLoading,
    selectedRiskIds,
    onRiskSelect,
    filteredControls,
    filteredTests
}) => {
    return (
        <div className="space-y-6">
            {/* Top: Risk List */}
            <section className="space-y-2">
                <RiskAnalysisTable
                    risks={data?.risks || []}
                    selectedIds={selectedRiskIds}
                    onSelect={onRiskSelect}
                    isLoading={isLoading}
                />
            </section>

            {/* Bottom: Resources */}
            <section className="space-y-2 pt-4 border-t border-slate-200">
                <LinkedResources
                    controls={filteredControls}
                    tests={filteredTests}
                    isLoading={isLoading}
                />
            </section>
        </div>
    );
};

export default RisksView;
