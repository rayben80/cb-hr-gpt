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
                isLoading={isLoading}
                error={error}
                onOpenMonitoring={onOpenMonitoring}
            />
        </>
    )
);

AdminEvaluationView.displayName = 'AdminEvaluationView';
