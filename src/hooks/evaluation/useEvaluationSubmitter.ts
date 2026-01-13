import { useCallback } from 'react';
import { useError } from '../../contexts/ErrorContext';
import type { EvaluationExecutionResult } from '../../features/evaluation/EvaluationExecution';
import { auth } from '../../firebase';
import { useEvaluationData } from './useEvaluationData';
import { useFirestoreEvaluation } from './useFirestoreEvaluation';

export const useEvaluationSubmitter = (
    evaluationData: ReturnType<typeof useEvaluationData>,
    setExecutingEvaluationId: (id: number | string | null) => void
) => {
    const { showError } = useError();
    const { submitEvaluation, fetchAssignmentById } = useFirestoreEvaluation();

    const handleSaveExecution = useCallback(
        async (result: EvaluationExecutionResult) => {
            const user = auth.currentUser;
            if (!user) {
                showError('로그인이 필요합니다.', '평가 제출 전에 로그인해주세요.');
                return;
            }

            try {
                // Adapter: Convert Legacy Execution Result to Firestore Result
                // result.evaluationId is mapped to Assignment ID in the User Adapter
                const assignmentId = String(result.evaluationId);

                const assignment = await fetchAssignmentById(assignmentId);
                if (!assignment) {
                    showError('제출 실패', '평가 대상 정보를 찾을 수 없습니다.');
                    return;
                }

                await submitEvaluation(assignmentId, {
                    campaignId: assignment.campaignId,
                    evaluatorId: assignment.evaluatorId || user.uid,
                    evaluateeId: assignment.evaluateeId,
                    relation: assignment.relation,
                    answers: result.answers,
                    totalScore: result.totalScore,
                    assignmentId: assignmentId,
                });

                // Optimistic Update (Optional, as list will refresh)
                evaluationData.updateEvaluation(result.evaluationId, {
                    status: '완료',
                    score: result.totalScore,
                    progress: 100,
                    answers: result.answers.map((a) => ({ ...a, grade: a.grade || undefined })),
                });

                setExecutingEvaluationId(null);
                // Success message is handled in submitEvaluation
            } catch (error) {
                console.error('Failed to save evaluation response:', error);
                // Error message is handled in submitEvaluation
            }
        },
        [evaluationData, setExecutingEvaluationId, showError, submitEvaluation, fetchAssignmentById]
    );

    return { handleSaveExecution };
};
