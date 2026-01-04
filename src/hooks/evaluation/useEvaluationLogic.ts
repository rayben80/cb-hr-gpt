import { useCallback, useMemo, useState } from 'react';
import { Evaluation, evaluationResultData } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { useRole } from '../../contexts/RoleContext';
import { useEvaluationData } from './useEvaluationData';

export const useEvaluationLogic = () => {
    const { isAdmin } = useRole();
    const { showSuccess } = useError();
    const evaluationData = useEvaluationData();

    const [viewMode, setViewMode] = useState<'user' | 'admin'>('admin');
    const isAdminMode = viewMode === 'admin' && isAdmin;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [monitoringEvaluation, setMonitoringEvaluation] = useState<Evaluation | null>(null);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | string | null>(null);
    const [resultUnavailable, setResultUnavailable] = useState(false);
    const [executingEvaluationId, setExecutingEvaluationId] = useState<number | string | null>(null);

    const handleLaunchEvaluation = useCallback(
        (newEvaluationData: any) => {
            evaluationData.addEvaluation(newEvaluationData);
            setIsModalOpen(false);
        },
        [evaluationData]
    );

    const handleViewResult = useCallback((evaluationId: string | number) => {
        const hasResult = String(evaluationId) === String(evaluationResultData.evaluationId);
        setResultUnavailable(!hasResult);
        setSelectedEvaluationId(evaluationId);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedEvaluationId(null);
        setResultUnavailable(false);
    }, []);

    const handleSaveWeights = useCallback(
        (newWeights: any) => {
            evaluationData.setEvaluationWeights(newWeights);
            setIsSettingsModalOpen(false);
        },
        [evaluationData]
    );

    const handleRunEvaluation = useCallback(
        (evaluationId: string | number) => setExecutingEvaluationId(evaluationId),
        []
    );

    const handleSaveExecution = useCallback(
        (result: any) => {
            evaluationData.updateEvaluation(result.evaluationId, {
                status: '완료',
                score: result.totalScore,
                progress: 100,
                answers: result.answers,
            });
            setExecutingEvaluationId(null);
            showSuccess('평가가 완료되었습니다.', '결과가 성공적으로 저장되었습니다.');
        },
        [evaluationData, showSuccess]
    );

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
