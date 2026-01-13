/// <reference types="vite/client" />
import { AdminEvaluationView } from '@/components/evaluation/AdminEvaluationView';
import { EvaluationPageHeader } from '@/components/evaluation/EvaluationPageHeader';
import { NoResultView } from '@/components/evaluation/NoResultView';
import { UserEvaluationView } from '@/components/evaluation/UserEvaluationView';
import { Button } from '@/components/common';
import { ConfirmationModal } from '@/components/feedback/ConfirmationModal';
import { StatusCard } from '@/components/feedback/Status';
import AnnualEvaluationSettingsModal from '@/features/evaluation/AnnualEvaluationSettingsModal';
import { CampaignMonitoringPage } from '@/features/evaluation/CampaignMonitoringPage';
import CreateCampaignModal from '@/features/evaluation/CreateCampaignModal';
import EvaluationExecution from '@/features/evaluation/EvaluationExecution';
import EvaluationResult from '@/features/evaluation/EvaluationResult';
import { useEvaluationLogic } from '@/hooks/evaluation/useEvaluationLogic';
import { memo } from 'react';

interface ResultContentProps {
    resultLoading: boolean;
    resultUnavailable: boolean;
    resultData: any;
    onBack: () => void;
}

const ResultContent = memo(({ resultLoading, resultUnavailable, resultData, onBack }: ResultContentProps) => {
    if (resultLoading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <StatusCard
                    status="loading"
                    title="평가 결과를 불러오는 중입니다."
                    description="잠시만 기다려주세요."
                    action={
                        <Button variant="outline" onClick={onBack}>
                            목록으로 돌아가기
                        </Button>
                    }
                />
            </div>
        );
    }

    if (resultUnavailable || !resultData) {
        return <NoResultView onBack={onBack} />;
    }

    return <EvaluationResult resultData={resultData} onBack={onBack} />;
});

ResultContent.displayName = 'ResultContent';

const EvaluationManagement = memo(() => {
    const {
        isAdmin,
        isAdminMode,
        viewMode,
        setViewMode,
        isModalOpen,
        setIsModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        monitoringEvaluation,
        setMonitoringEvaluation,
        showCancelConfirmation,
        setShowCancelConfirmation,
        selectedEvaluationId,
        resultUnavailable,
        resultLoading,
        resultData,
        handleLaunchEvaluation,
        handleViewResult,
        handleBackToList,
        handleSaveWeights,
        handleRunEvaluation,
        handleSaveExecution,
        handleCancelExecution,
        confirmCancelExecution,
        evaluationData,
        executionViewData,
    } = useEvaluationLogic();

    const {
        normalizedEvaluations, // Used by executionViewData inside hook now? No, hook returns executionViewData.
        filteredEvaluations,
        templates,
        teams,
        isLoading,
        error,
        activeTab,
        searchTerm,
        evaluationWeights,
        teamFilter,
        categoryFilter,
        periodStartFilter,
        periodEndFilter,
        userMyEvaluations,
        userCompletedEvaluations,
        setActiveTab,
        setSearchTerm,
        setTeamFilter,
        setCategoryFilter,
        setPeriodStartFilter,
        setPeriodEndFilter,
        resetFilters,
        tabs,
    } = evaluationData; const teamOptions = teams.map((team) => team.name);
    if (executionViewData?.targetEvaluation && executionViewData?.targetTemplate) {
        return <EvaluationExecution evaluation={executionViewData.targetEvaluation} template={executionViewData.targetTemplate} onSave={handleSaveExecution} onCancel={handleCancelExecution} />;
    }
    if (monitoringEvaluation) {
        return <CampaignMonitoringPage evaluation={monitoringEvaluation} teams={teams} onBack={() => setMonitoringEvaluation(null)} />;
    }
    if (selectedEvaluationId) {
        return <ResultContent resultLoading={resultLoading} resultUnavailable={resultUnavailable} resultData={resultData} onBack={handleBackToList} />;
    }

    return (
        <>
            <EvaluationPageHeader
                isAdminMode={isAdminMode}
                isAdmin={isAdmin}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onCreateNew={() => setIsModalOpen(true)}
            />
            {isAdminMode ? (
                <AdminEvaluationView
                    evaluations={filteredEvaluations}
                    normalizedEvaluations={normalizedEvaluations}
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    teamFilter={teamFilter}
                    categoryFilter={categoryFilter}
                    periodStartFilter={periodStartFilter}
                    periodEndFilter={periodEndFilter}
                    teamOptions={teamOptions}
                    onTeamFilterChange={setTeamFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    onPeriodStartChange={setPeriodStartFilter}
                    onPeriodEndChange={setPeriodEndFilter}
                    onResetFilters={resetFilters}
                    isLoading={isLoading}
                    error={error}
                    onOpenMonitoring={setMonitoringEvaluation}
                    weights={evaluationWeights}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
            ) : (
                <UserEvaluationView
                    userMyEvaluations={userMyEvaluations}
                    userCompletedEvaluations={userCompletedEvaluations}
                    evaluationWeights={evaluationWeights}
                    onRunEvaluation={handleRunEvaluation}
                    onViewResult={handleViewResult}
                />
            )}
            {isModalOpen && (
                <CreateCampaignModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onLaunch={handleLaunchEvaluation}
                    templates={templates}
                    teams={teams}
                />
            )}
            {isSettingsModalOpen && (
                <AnnualEvaluationSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    weights={evaluationWeights}
                    onSave={handleSaveWeights}
                />
            )}
            <ConfirmationModal
                isOpen={showCancelConfirmation}
                onClose={() => setShowCancelConfirmation(false)}
                onConfirm={confirmCancelExecution}
                title="평가 중단"
                message="평가를 중단하시겠습니까? 작성 중인 내용은 저장되지 않습니다."
                confirmButtonText="중단"
                confirmButtonColor="destructive"
            />
        </>
    );
});

EvaluationManagement.displayName = 'EvaluationManagement';
export default EvaluationManagement;
