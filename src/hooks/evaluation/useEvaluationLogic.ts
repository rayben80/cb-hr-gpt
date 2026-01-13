import { useCallback, useMemo, useState } from 'react';
import { Evaluation } from '../../constants';
import { useRole } from '../../contexts/RoleContext';
import { useEvaluationData } from './useEvaluationData';
import { useEvaluationResultLoader } from './useEvaluationResultLoader';
import { useEvaluationSubmitter } from './useEvaluationSubmitter';
import { useFirestoreEvaluation } from './useFirestoreEvaluation';

export const useEvaluationLogic = () => {
    const { isAdmin } = useRole();

    const evaluationData = useEvaluationData();

    const [viewMode, setViewMode] = useState<'user' | 'admin'>('admin');
    const isAdminMode = viewMode === 'admin' && isAdmin;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [monitoringEvaluation, setMonitoringEvaluation] = useState<Evaluation | null>(null);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [executingEvaluationId, setExecutingEvaluationId] = useState<number | string | null>(null);
    // Let's replace the whole section to use the hook correctly.
    const { selectedEvaluationId, resultUnavailable, resultLoading, resultData, handleViewResult, handleBackToList } =
        useEvaluationResultLoader(); // Imported at top level

    const handleSaveWeights = useCallback(
        (newWeights: any) => {
            evaluationData.setEvaluationWeights(newWeights);
            setIsSettingsModalOpen(false);
        },
        [evaluationData]
    );

    const { createCampaign } = useFirestoreEvaluation();

    const handleLaunchEvaluation = useCallback(
        async (data: { campaign: any; assignments: any[] }) => {
            try {
                await createCampaign(data.campaign, data.assignments);
                setIsModalOpen(false);
                await evaluationData.refreshEvaluations();
            } catch (error) {
                console.error('Campaign creation failed', error);
                // Error handling is done inside useFirestoreEvaluation
            }
        },
        [createCampaign, evaluationData]
    );

    const handleRunEvaluation = useCallback(
        (evaluationId: string | number) => setExecutingEvaluationId(evaluationId),
        []
    );

    // Use the submitter hook to handle saving
    const { handleSaveExecution } = useEvaluationSubmitter(evaluationData, setExecutingEvaluationId);

    const handleCancelExecution = useCallback(() => setShowCancelConfirmation(true), []);
    const confirmCancelExecution = useCallback(() => {
        setExecutingEvaluationId(null);
        setShowCancelConfirmation(false);
    }, []);

    const executionViewData = useMemo(() => {
        if (!executingEvaluationId) return null;
        const targetEvaluation = evaluationData.normalizedEvaluations.find((e) => e.id === executingEvaluationId);
        const targetTemplate =
            targetEvaluation?.templateSnapshot ||
            evaluationData.templates.find((t) => t.type === targetEvaluation?.type) ||
            evaluationData.templates[0];
        return { targetEvaluation, targetTemplate };
    }, [executingEvaluationId, evaluationData.normalizedEvaluations, evaluationData.templates]);

    return {
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
        executingEvaluationId,
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
    };
};

// Helper functions moved to src/features/evaluation/utils/evaluationHelpers.ts
