import { EvaluateeSummary, MonitoringSortKey, MonitoringStatusFilter } from '@/hooks/evaluation/monitoringTypes';
import React from 'react';
import { MonitoringSummaryFilters } from './MonitoringSummaryFilters';
import { MonitoringSummaryTable } from './MonitoringSummaryTable';

interface MonitoringSummarySectionProps {
    summaries: EvaluateeSummary[];
    statusFilter: MonitoringStatusFilter;
    sortKey: MonitoringSortKey;
    lowScoreThreshold: number | '';
    resultsLoading: boolean;
    adjustmentUnit: string;
    canAdjustAsLeader: boolean;
    canAdjustAsHq: boolean;
    hqAdjustmentRule?: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime' | undefined;
    onStatusFilterChange: (value: MonitoringStatusFilter) => void;
    onSortKeyChange: (value: MonitoringSortKey) => void;
    onLowScoreThresholdChange: (value: number | '') => void;
    onResetFilters: () => void;
    onSortByName: () => void;
    onSortBySubmission: () => void;
    onSortByScore: () => void;
    onOpenAdjustment: (summary: EvaluateeSummary, role: 'manager' | 'hq') => void;
    onOpenDetail: (summary: EvaluateeSummary) => void;
}

export const MonitoringSummarySection: React.FC<MonitoringSummarySectionProps> = ({
    summaries,
    statusFilter,
    sortKey,
    lowScoreThreshold,
    resultsLoading,
    adjustmentUnit,
    canAdjustAsLeader,
    canAdjustAsHq,
    hqAdjustmentRule,
    onStatusFilterChange,
    onSortKeyChange,
    onLowScoreThresholdChange,
    onResetFilters,
    onSortByName,
    onSortBySubmission,
    onSortByScore,
    onOpenAdjustment,
    onOpenDetail,
}) => (
    <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">대상자별 집계 점수</h3>
        <MonitoringSummaryFilters
            statusFilter={statusFilter}
            sortKey={sortKey}
            lowScoreThreshold={lowScoreThreshold}
            onStatusFilterChange={onStatusFilterChange}
            onSortKeyChange={onSortKeyChange}
            onLowScoreThresholdChange={onLowScoreThresholdChange}
            onReset={onResetFilters}
        />
        <MonitoringSummaryTable
            summaries={summaries}
            sortKey={sortKey}
            lowScoreThreshold={lowScoreThreshold}
            resultsLoading={resultsLoading}
            adjustmentUnit={adjustmentUnit}
            canAdjustAsLeader={canAdjustAsLeader}
            canAdjustAsHq={canAdjustAsHq}
            hqAdjustmentRule={hqAdjustmentRule}
            onSortByName={onSortByName}
            onSortBySubmission={onSortBySubmission}
            onSortByScore={onSortByScore}
            onOpenAdjustment={onOpenAdjustment}
            onOpenDetail={onOpenDetail}
        />
    </div>
);
