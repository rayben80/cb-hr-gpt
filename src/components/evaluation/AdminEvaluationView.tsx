import { memo } from 'react';
import { Evaluation } from '../../constants';
import { AdminEvaluationTable } from './AdminEvaluationTable';
import { AnnualScoreSummary } from './AnnualScoreSummary';

interface AdminEvaluationViewProps {
    evaluations: Evaluation[];
    normalizedEvaluations: Evaluation[];
    tabs: any[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    teamFilter: string;
    categoryFilter: string;
    periodStartFilter: string;
    periodEndFilter: string;
    teamOptions: string[];
    onTeamFilterChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    onPeriodStartChange: (value: string) => void;
    onPeriodEndChange: (value: string) => void;
    onResetFilters: () => void;
    isLoading: boolean;
    error: string | null;
    onOpenMonitoring: (evaluation: Evaluation) => void;
    weights: any;
    onOpenSettings: () => void;
}

export const AdminEvaluationView = memo(
    ({
        evaluations,
        normalizedEvaluations,
        tabs,
        activeTab,
        onTabChange,
        searchTerm,
        onSearchChange,
        teamFilter,
        categoryFilter,
        periodStartFilter,
        periodEndFilter,
        teamOptions,
        onTeamFilterChange,
        onCategoryFilterChange,
        onPeriodStartChange,
        onPeriodEndChange,
        onResetFilters,
        isLoading,
        error,
        onOpenMonitoring,
        weights,
        onOpenSettings,
    }: AdminEvaluationViewProps) => (
        <>
            <AnnualScoreSummary evaluations={normalizedEvaluations} weights={weights} onOpenSettings={onOpenSettings} />
            <AdminEvaluationTable
                evaluations={evaluations}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                teamFilter={teamFilter}
                categoryFilter={categoryFilter}
                periodStartFilter={periodStartFilter}
                periodEndFilter={periodEndFilter}
                teamOptions={teamOptions}
                onTeamFilterChange={onTeamFilterChange}
                onCategoryFilterChange={onCategoryFilterChange}
                onPeriodStartChange={onPeriodStartChange}
                onPeriodEndChange={onPeriodEndChange}
                onResetFilters={onResetFilters}
                isLoading={isLoading}
                error={error}
                onOpenMonitoring={onOpenMonitoring}
            />
        </>
    )
);

AdminEvaluationView.displayName = 'AdminEvaluationView';
