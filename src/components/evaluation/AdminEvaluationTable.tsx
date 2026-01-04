import { memo } from 'react';
import { Evaluation } from '../../constants';
import { LoadingSpinner } from '../feedback/Progress';
import { StatusCard } from '../feedback/Status';
import { AdminEvaluationToolbar } from './AdminEvaluationToolbar';
import { EvaluationTableBody } from './EvaluationTableBody';

interface AdminEvaluationTableProps {
    evaluations: Evaluation[];
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isLoading: boolean;
    error: string | null;
    onOpenMonitoring: (evaluation: Evaluation) => void;
}

export const AdminEvaluationTable = memo(
    ({
        evaluations,
        tabs,
        activeTab,
        onTabChange,
        searchTerm,
        onSearchChange,
        isLoading,
        error,
        onOpenMonitoring,
    }: AdminEvaluationTableProps) => (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <AdminEvaluationToolbar
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
            />

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <LoadingSpinner size="lg" color="blue" />
                        <p className="text-slate-500 mt-4">평가 목록을 불러오는 중...</p>
                    </div>
                </div>
            ) : error ? (
                <StatusCard
                    status="error"
                    title="데이터 로드 실패"
                    description={error}
                    className="max-w-2xl mx-auto my-8"
                />
            ) : (
                <EvaluationTableBody
                    evaluations={evaluations}
                    onOpenMonitoring={onOpenMonitoring}
                    activeTab={activeTab}
                    searchTerm={searchTerm}
                />
            )}
        </div>
    )
);

AdminEvaluationTable.displayName = 'AdminEvaluationTable';
