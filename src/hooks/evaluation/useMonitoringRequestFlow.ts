import { useCallback, useMemo, useState } from 'react';

interface UseMonitoringRequestFlowParams {
    allowReview: boolean;
    allowResubmission: boolean;
    onOpenReview: (assignmentId: string, reason?: string) => Promise<void> | void;
    onRequestResubmission: (assignmentId: string, reason?: string) => Promise<void> | void;
}

export const useMonitoringRequestFlow = ({
    allowReview,
    allowResubmission,
    onOpenReview,
    onRequestResubmission,
}: UseMonitoringRequestFlowParams) => {
    const [requestTargetId, setRequestTargetId] = useState<string | null>(null);
    const [requestType, setRequestType] = useState<'review' | 'resubmission' | null>(null);
    const [requestReason, setRequestReason] = useState('');

    const openReviewRequest = useCallback(
        (assignmentId: string) => {
            if (!allowReview) return;
            setRequestTargetId(assignmentId);
            setRequestType('review');
            setRequestReason('');
        },
        [allowReview]
    );

    const openResubmissionRequest = useCallback(
        (assignmentId: string) => {
            if (!allowResubmission) return;
            setRequestTargetId(assignmentId);
            setRequestType('resubmission');
            setRequestReason('');
        },
        [allowResubmission]
    );

    const closeRequestModal = useCallback(() => {
        setRequestTargetId(null);
        setRequestType(null);
        setRequestReason('');
    }, []);

    const submitRequest = useCallback(async () => {
        if (!requestTargetId || !requestType) return;
        const reason = requestReason.trim();
        if (requestType === 'review') {
            await onOpenReview(requestTargetId, reason);
        } else {
            await onRequestResubmission(requestTargetId, reason);
        }
        closeRequestModal();
    }, [requestTargetId, requestType, requestReason, onOpenReview, onRequestResubmission, closeRequestModal]);

    const modalTitle = useMemo(() => {
        if (requestType === 'review') return '재열람 요청';
        if (requestType === 'resubmission') return '재제출 요청';
        return '';
    }, [requestType]);

    return {
        isRequestOpen: Boolean(requestTargetId && requestType),
        requestType,
        requestReason,
        setRequestReason,
        openReviewRequest,
        openResubmissionRequest,
        closeRequestModal,
        submitRequest,
        modalTitle,
    };
};
