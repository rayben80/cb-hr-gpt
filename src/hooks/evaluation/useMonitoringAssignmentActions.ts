import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { Evaluation } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { auth } from '../../firebase';
import { useFirestoreEvaluation } from './useFirestoreEvaluation';

interface UseMonitoringAssignmentActionsParams {
    evaluation: Evaluation;
    setAssignments: Dispatch<SetStateAction<any[]>>;
}

export const useMonitoringAssignmentActions = ({
    evaluation,
    setAssignments,
}: UseMonitoringAssignmentActionsParams) => {
    const { updateAssignmentStatus } = useFirestoreEvaluation();
    const { showSuccess } = useError();
    const allowReview = evaluation.allowReview === true;
    const allowResubmission = evaluation.allowResubmission === true;
    const useMockData =
        import.meta.env.VITE_USE_MOCK_MONITORING === '1' ||
        import.meta.env.VITE_USE_MOCK_MONITORING === 'true';

    const updateLocalAssignment = useCallback(
        (assignmentId: string, status: string, progress: number) => {
            setAssignments((prev) =>
                prev.map((assignment) =>
                    assignment.id === assignmentId ? { ...assignment, status, progress } : assignment
                )
            );
        },
        [setAssignments]
    );

    const handleOpenReview = useCallback(
        async (assignmentId: string, reason?: string) => {
            if (!allowReview) return;
            if (useMockData) {
                updateLocalAssignment(assignmentId, 'REVIEW_OPEN', 100);
                showSuccess('상태 업데이트 완료', '재열람 요청이 저장되었습니다.');
                return;
            }
            const userId = auth.currentUser?.uid || 'system';
            const success = await updateAssignmentStatus(assignmentId, 'REVIEW_OPEN', 100, {
                reviewRequestedBy: userId,
                reviewRequestedAt: new Date().toISOString(),
                reviewReason: reason || undefined,
            });
            if (success) updateLocalAssignment(assignmentId, 'REVIEW_OPEN', 100);
        },
        [allowReview, showSuccess, updateAssignmentStatus, updateLocalAssignment, useMockData]
    );

    const handleRequestResubmission = useCallback(
        async (assignmentId: string, reason?: string) => {
            if (!allowResubmission) return;
            if (useMockData) {
                updateLocalAssignment(assignmentId, 'RESUBMIT_REQUESTED', 0);
                showSuccess('상태 업데이트 완료', '재제출 요청이 저장되었습니다.');
                return;
            }
            const userId = auth.currentUser?.uid || 'system';
            const success = await updateAssignmentStatus(assignmentId, 'RESUBMIT_REQUESTED', 0, {
                resubmissionRequestedBy: userId,
                resubmissionRequestedAt: new Date().toISOString(),
                resubmissionReason: reason || undefined,
            });
            if (success) updateLocalAssignment(assignmentId, 'RESUBMIT_REQUESTED', 0);
        },
        [allowResubmission, showSuccess, updateAssignmentStatus, updateLocalAssignment, useMockData]
    );

    return useMemo(
        () => ({
            allowReview,
            allowResubmission,
            handleOpenReview,
            handleRequestResubmission,
        }),
        [allowReview, allowResubmission, handleOpenReview, handleRequestResubmission]
    );
};
