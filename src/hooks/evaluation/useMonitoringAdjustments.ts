import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { Evaluation } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { applyScoreAdjustments } from '../../features/evaluation/utils/evaluationHelpers';
import { auth } from '../../firebase';
import type { EvaluateeSummary } from './monitoringTypes';
import { EvaluationAdjustment, useFirestoreEvaluation } from './useFirestoreEvaluation';

interface UseMonitoringAdjustmentsParams {
    evaluation: Evaluation;
    adjustmentsMap: Map<string, EvaluationAdjustment>;
    setAdjustments: Dispatch<SetStateAction<EvaluationAdjustment[]>>;
}

const getAdjustmentUnit = (mode: Evaluation['adjustmentMode']) => (mode === 'percent' ? '%' : '점');
const getAdjustmentRange = (range?: number) => (typeof range === 'number' ? Math.abs(range) : null);

const clampValue = (value: number, range: number | null) => {
    if (range === null) return value;
    return Math.min(range, Math.max(-range, value));
};

const buildEntry = (value: number, note: string) => {
    const userId = auth.currentUser?.uid || 'system';
    return {
        value,
        note: note || undefined,
        adjustedBy: userId,
        adjustedAt: new Date().toISOString(),
    };
};

const buildPayload = (
    role: 'manager' | 'hq',
    entry: { value: number; note?: string | undefined; adjustedBy: string; adjustedAt: string }
) => (role === 'manager' ? { managerAdjustment: entry } : { hqAdjustment: entry });

const upsertLocalAdjustment = (
    previous: EvaluationAdjustment[],
    evaluationId: string | number,
    targetId: string,
    payload: {
        managerAdjustment?: EvaluationAdjustment['managerAdjustment'];
        hqAdjustment?: EvaluationAdjustment['hqAdjustment'];
    }
) => {
    const docId = `${evaluationId}_${targetId}`;
    const existingIndex = previous.findIndex((item) => item.evaluateeId === targetId);
    if (existingIndex >= 0) {
        const next = [...previous];
        next[existingIndex] = { ...next[existingIndex], ...payload };
        return next;
    }
    return [
        ...previous,
        {
            id: docId,
            campaignId: String(evaluationId),
            evaluateeId: targetId,
            ...payload,
        },
    ];
};

const buildPreview = (
    target: EvaluateeSummary,
    role: 'manager' | 'hq',
    value: number,
    adjustmentsMap: Map<string, EvaluationAdjustment>,
    evaluation: Evaluation
) => {
    if (target.baseScore === null) return null;
    const current = adjustmentsMap.get(target.id);
    const previewAdjustment =
        role === 'manager'
            ? {
                  managerAdjustment: { value } as any,
                  hqAdjustment: current?.hqAdjustment,
              }
            : {
                  managerAdjustment: current?.managerAdjustment,
                  hqAdjustment: { value } as any,
              };
    const result = applyScoreAdjustments(
        target.baseScore,
        previewAdjustment,
        evaluation.adjustmentMode,
        evaluation.adjustmentRange,
        evaluation.ratingScale
    );
    return {
        baseScore: target.baseScore,
        adjustedScore: result.adjustedScore,
    };
};

export const useMonitoringAdjustments = ({
    evaluation,
    adjustmentsMap,
    setAdjustments,
}: UseMonitoringAdjustmentsParams) => {
    const { upsertEvaluationAdjustment } = useFirestoreEvaluation();
    const { showSuccess } = useError();
    const useMockData =
        import.meta.env.VITE_USE_MOCK_MONITORING === '1' ||
        import.meta.env.VITE_USE_MOCK_MONITORING === 'true' ||
        import.meta.env.VITE_E2E_MOCK_DATA === 'true';
    const [adjustmentTarget, setAdjustmentTarget] = useState<EvaluateeSummary | null>(null);
    const [adjustmentRole, setAdjustmentRole] = useState<'manager' | 'hq' | null>(null);
    const [adjustmentValue, setAdjustmentValue] = useState(0);
    const [adjustmentNote, setAdjustmentNote] = useState('');
    const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);

    const adjustmentMode = evaluation.adjustmentMode ?? 'points';
    const adjustmentUnit = getAdjustmentUnit(adjustmentMode);
    const adjustmentRange = getAdjustmentRange(evaluation.adjustmentRange);

    const openAdjustmentModal = useCallback(
        (summary: EvaluateeSummary, role: 'manager' | 'hq') => {
            const current = adjustmentsMap.get(summary.id);
            const currentEntry = role === 'manager' ? current?.managerAdjustment : current?.hqAdjustment;
            setAdjustmentTarget(summary);
            setAdjustmentRole(role);
            setAdjustmentValue(currentEntry?.value ?? 0);
            setAdjustmentNote(currentEntry?.note ?? '');
        },
        [adjustmentsMap]
    );

    const closeAdjustmentModal = useCallback(() => {
        setAdjustmentTarget(null);
        setAdjustmentRole(null);
        setAdjustmentNote('');
        setAdjustmentValue(0);
    }, []);

    const handleSaveAdjustment = useCallback(async () => {
        if (!adjustmentTarget || !adjustmentRole) return;
        setIsSavingAdjustment(true);
        const clampedValue = clampValue(Number(adjustmentValue), adjustmentRange);
        const noteValue = adjustmentNote.trim();
        const entry = buildEntry(clampedValue, noteValue);
        const payload = buildPayload(adjustmentRole, entry);
        if (useMockData) {
            setAdjustments((prev) => upsertLocalAdjustment(prev, evaluation.id, adjustmentTarget.id, payload));
            showSuccess('보정 저장 완료', '보정 값이 저장되었습니다.');
            closeAdjustmentModal();
            setIsSavingAdjustment(false);
            return;
        }
        const success = await upsertEvaluationAdjustment(String(evaluation.id), adjustmentTarget.id, payload);
        if (success) {
            setAdjustments((prev) => upsertLocalAdjustment(prev, evaluation.id, adjustmentTarget.id, payload));
            closeAdjustmentModal();
        }
        setIsSavingAdjustment(false);
    }, [
        adjustmentTarget,
        adjustmentRole,
        adjustmentValue,
        adjustmentNote,
        adjustmentRange,
        closeAdjustmentModal,
        evaluation.id,
        showSuccess,
        setAdjustments,
        upsertEvaluationAdjustment,
        useMockData,
    ]);

    const adjustmentPreview = useMemo(() => {
        if (!adjustmentTarget || !adjustmentRole) return null;
        return buildPreview(adjustmentTarget, adjustmentRole, Number(adjustmentValue), adjustmentsMap, evaluation);
    }, [adjustmentTarget, adjustmentRole, adjustmentValue, adjustmentsMap, evaluation]);

    return {
        adjustmentTarget,
        adjustmentRole,
        adjustmentValue,
        setAdjustmentValue,
        adjustmentNote,
        setAdjustmentNote,
        isSavingAdjustment,
        adjustmentUnit,
        adjustmentRange,
        openAdjustmentModal,
        closeAdjustmentModal,
        handleSaveAdjustment,
        adjustmentPreview,
    };
};
