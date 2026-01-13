import React from 'react';
import { MonitoringSortKey, MonitoringStatusFilter } from '@/hooks/evaluation/monitoringTypes';

interface MonitoringSummaryFiltersProps {
    statusFilter: MonitoringStatusFilter;
    sortKey: MonitoringSortKey;
    lowScoreThreshold: number | '';
    onStatusFilterChange: (value: MonitoringStatusFilter) => void;
    onSortKeyChange: (value: MonitoringSortKey) => void;
    onLowScoreThresholdChange: (value: number | '') => void;
    onReset: () => void;
}

export const MonitoringSummaryFilters: React.FC<MonitoringSummaryFiltersProps> = ({
    statusFilter,
    sortKey,
    lowScoreThreshold,
    onStatusFilterChange,
    onSortKeyChange,
    onLowScoreThresholdChange,
    onReset,
}) => (
    <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">필터</span>
            <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as MonitoringStatusFilter)}
                className="border border-slate-200 rounded-md px-2 py-1 bg-white text-sm"
            >
                <option value="all">전체</option>
                <option value="complete">제출 완료</option>
                <option value="incomplete">미제출</option>
            </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">낮은 점수</span>
            <input
                type="number"
                min={0}
                value={lowScoreThreshold}
                onChange={(e) =>
                    onLowScoreThresholdChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="예: 70"
                className="border border-slate-200 rounded-md px-2 py-1 w-24 text-sm"
            />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 ml-auto">
            <span className="font-semibold text-slate-700">정렬</span>
            <select
                value={sortKey}
                onChange={(e) => onSortKeyChange(e.target.value as MonitoringSortKey)}
                className="border border-slate-200 rounded-md px-2 py-1 bg-white text-sm"
            >
                <option value="score_desc">점수 높은순</option>
                <option value="score_asc">점수 낮은순</option>
                <option value="submission_desc">제출률 높은순</option>
                <option value="name">이름순</option>
            </select>
        </div>
        <button onClick={onReset} className="text-sm text-slate-500 hover:text-primary transition-colors">
            초기화
        </button>
    </div>
);
