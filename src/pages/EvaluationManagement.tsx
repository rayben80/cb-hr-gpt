/// <reference types="vite/client" />
import { AdminEvaluationView } from '@/components/evaluation/AdminEvaluationView';
import { EvaluationPageHeader } from '@/components/evaluation/EvaluationPageHeader';
import { NoResultView } from '@/components/evaluation/NoResultView';
import { UserEvaluationView } from '@/components/evaluation/UserEvaluationView';
import { ConfirmationModal } from '@/components/feedback/ConfirmationModal';
import { evaluationResultData } from '@/constants';
import AnnualEvaluationSettingsModal from '@/features/evaluation/AnnualEvaluationSettingsModal';
import { CampaignMonitoringModal } from '@/features/evaluation/CampaignMonitoringModal';
import CreateCampaignModal from '@/features/evaluation/CreateCampaignModal';
import EvaluationExecution from '@/features/evaluation/EvaluationExecution';
import EvaluationResult from '@/features/evaluation/EvaluationResult';
import { useEvaluationLogic } from '@/hooks/evaluation/useEvaluationLogic';
import { memo } from 'react';

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
        userMyEvaluations,
        userCompletedEvaluations,
        setActiveTab,
        setSearchTerm,
        tabs,
    } = evaluationData;

    // executionViewData is now returned from the hook

    if (executionViewData?.targetEvaluation && executionViewData?.targetTemplate) {
        return (
            <EvaluationExecution
                evaluation={executionViewData.targetEvaluation}
                template={executionViewData.targetTemplate}
                onSave={handleSaveExecution}
                onCancel={handleCancelExecution}
            />
        );
    }

    if (selectedEvaluationId)
        return resultUnavailable ? (
            <NoResultView onBack={handleBackToList} />
        ) : (
            <EvaluationResult resultData={evaluationResultData} onBack={handleBackToList} />
        );

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
            {monitoringEvaluation && (
                <CampaignMonitoringModal
                    isOpen={!!monitoringEvaluation}
                    onClose={() => setMonitoringEvaluation(null)}
                    evaluation={monitoringEvaluation}
                    teams={teams}
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
