import { useCallback, useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import {
    createCampaignRequest,
    fetchAllCampaignsRequest,
    fetchAssignmentByIdRequest,
    fetchCampaignAssignmentsRequest,
    fetchCampaignByIdRequest,
    fetchCampaignStatisticsRequest,
    fetchMyAssignmentsRequest,
    updateAssignmentStatusRequest,
} from './firestoreEvaluationCampaigns';
import {
    fetchAdjustmentByCampaignAndEvaluateeRequest,
    fetchAdjustmentsByCampaignRequest,
    fetchEvaluationResultRequest,
    fetchResultsByCampaignAndEvaluateeRequest,
    fetchResultsByCampaignRequest,
    submitEvaluationRequest,
    upsertEvaluationAdjustmentRequest,
} from './firestoreEvaluationResults';
import type {
    EvaluationAdjustmentEntry,
    EvaluationAssignment,
    EvaluationCampaign,
    EvaluationResult,
} from './firestoreEvaluationTypes';

export type {
    EvaluationAdjustment,
    EvaluationAdjustmentEntry,
    EvaluationAssignment,
    EvaluationCampaign,
    EvaluationResult,
} from './firestoreEvaluationTypes';

const useCampaignHandlers = ({
    setIsSubmitting,
    setIsLoading,
    showSuccess,
    showError,
}: {
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
}) => {
    const createCampaign = useCallback(
        async (
            campaignData: Omit<EvaluationCampaign, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalTargets'>,
            assignments: Omit<EvaluationAssignment, 'id' | 'campaignId' | 'status' | 'progress'>[]
        ) => {
            setIsSubmitting(true);
            try {
                const campaignId = await createCampaignRequest(campaignData, assignments);
                showSuccess('캠페인 생성 완료', '평가 캠페인이 성공적으로 생성되고 대상자가 할당되었습니다.');
                return campaignId;
            } catch (error) {
                console.error('Failed to create campaign:', error);
                showError('생성 실패', '캠페인 생성 중 오류가 발생했습니다.');
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        [setIsSubmitting, showSuccess, showError]
    );

    const fetchAllCampaigns = useCallback(async () => {
        setIsLoading(true);
        try {
            return await fetchAllCampaignsRequest();
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    const fetchCampaignStatistics = useCallback(async (campaignId: string) => {
        try {
            return await fetchCampaignStatisticsRequest(campaignId);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return { total: 0, submitted: 0, progress: 0 };
        }
    }, []);

    const fetchCampaignAssignments = useCallback(
        async (campaignId: string) => {
            setIsLoading(true);
            try {
                return await fetchCampaignAssignmentsRequest(campaignId);
            } catch (error) {
                console.error('Failed to fetch campaign assignments:', error);
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [setIsLoading]
    );

    const fetchCampaignById = useCallback(async (campaignId: string) => {
        try {
            return await fetchCampaignByIdRequest(campaignId);
        } catch (error) {
            console.error('Failed to fetch campaign:', error);
            return null;
        }
    }, []);

    return {
        createCampaign,
        fetchAllCampaigns,
        fetchCampaignStatistics,
        fetchCampaignAssignments,
        fetchCampaignById,
    };
};

const useAssignmentHandlers = ({
    setIsLoading,
    showSuccess,
    showError,
}: {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
}) => {
    const fetchMyAssignments = useCallback(
        async (userId: string) => {
            if (!userId) return [];
            setIsLoading(true);
            try {
                return await fetchMyAssignmentsRequest(userId);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [setIsLoading]
    );

    const fetchAssignmentById = useCallback(async (assignmentId: string) => {
        try {
            return await fetchAssignmentByIdRequest(assignmentId);
        } catch (error) {
            console.error('Failed to fetch assignment:', error);
            return null;
        }
    }, []);

    const updateAssignmentStatus = useCallback(
        async (
            assignmentId: string,
            status: EvaluationAssignment['status'],
            progress?: number,
            metadata?: Record<string, unknown>
        ) => {
            try {
                await updateAssignmentStatusRequest(assignmentId, status, progress, metadata);
                showSuccess('상태 업데이트 완료', '평가 상태가 변경되었습니다.');
                return true;
            } catch (error) {
                console.error('Failed to update assignment status:', error);
                showError('업데이트 실패', '평가 상태를 변경하지 못했습니다.');
                return false;
            }
        },
        [showError, showSuccess]
    );

    return { fetchMyAssignments, fetchAssignmentById, updateAssignmentStatus };
};

const useResultHandlers = ({
    setIsSubmitting,
    setIsLoading,
    showSuccess,
    showError,
}: {
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
}) => {
    const submitEvaluation = useCallback(
        async (assignmentId: string, resultData: Omit<EvaluationResult, 'id' | 'submittedAt'>) => {
            setIsSubmitting(true);
            try {
                const resultId = await submitEvaluationRequest(assignmentId, resultData);
                showSuccess('제출 완료', '평가가 성공적으로 제출되었습니다.');
                return resultId;
            } catch (error) {
                console.error('Failed to submit evaluation:', error);
                showError('제출 실패', '평가 제출 중 오류가 발생했습니다.');
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        [setIsSubmitting, showSuccess, showError]
    );

    const fetchEvaluationResult = useCallback(
        async (assignmentId: string) => {
            setIsLoading(true);
            try {
                return await fetchEvaluationResultRequest(assignmentId);
            } catch (error) {
                console.error('Failed to fetch result:', error);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [setIsLoading]
    );

    const fetchResultsByCampaignAndEvaluatee = useCallback(async (campaignId: string, evaluateeId: string) => {
        try {
            return await fetchResultsByCampaignAndEvaluateeRequest(campaignId, evaluateeId);
        } catch (error) {
            console.error('Failed to fetch results by campaign/evaluatee:', error);
            return [];
        }
    }, []);

    const fetchResultsByCampaign = useCallback(async (campaignId: string) => {
        try {
            return await fetchResultsByCampaignRequest(campaignId);
        } catch (error) {
            console.error('Failed to fetch results by campaign:', error);
            return [];
        }
    }, []);

    return { submitEvaluation, fetchEvaluationResult, fetchResultsByCampaignAndEvaluatee, fetchResultsByCampaign };
};

const useAdjustmentHandlers = ({
    showSuccess,
    showError,
}: {
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
}) => {
    const fetchAdjustmentsByCampaign = useCallback(async (campaignId: string) => {
        try {
            return await fetchAdjustmentsByCampaignRequest(campaignId);
        } catch (error) {
            console.error('Failed to fetch adjustments by campaign:', error);
            return [];
        }
    }, []);

    const fetchAdjustmentByCampaignAndEvaluatee = useCallback(async (campaignId: string, evaluateeId: string) => {
        try {
            return await fetchAdjustmentByCampaignAndEvaluateeRequest(campaignId, evaluateeId);
        } catch (error) {
            console.error('Failed to fetch adjustment:', error);
            return null;
        }
    }, []);

    const upsertEvaluationAdjustment = useCallback(
        async (
            campaignId: string,
            evaluateeId: string,
            payload: {
                managerAdjustment?: EvaluationAdjustmentEntry;
                hqAdjustment?: EvaluationAdjustmentEntry;
            }
        ) => {
            try {
                await upsertEvaluationAdjustmentRequest(campaignId, evaluateeId, payload);
                showSuccess('보정 저장 완료', '보정 값이 저장되었습니다.');
                return true;
            } catch (error) {
                console.error('Failed to upsert adjustment:', error);
                showError('보정 저장 실패', '보정 값을 저장하지 못했습니다.');
                return false;
            }
        },
        [showError, showSuccess]
    );

    return { fetchAdjustmentsByCampaign, fetchAdjustmentByCampaignAndEvaluatee, upsertEvaluationAdjustment };
};

export function useFirestoreEvaluation() {
    const { showSuccess, showError } = useError();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';

    const campaignHandlers = useCampaignHandlers({ setIsSubmitting, setIsLoading, showSuccess, showError });
    const assignmentHandlers = useAssignmentHandlers({ setIsLoading, showSuccess, showError });
    const resultHandlers = useResultHandlers({ setIsSubmitting, setIsLoading, showSuccess, showError });
    const adjustmentHandlers = useAdjustmentHandlers({ showSuccess, showError });

    // E2E Mock Bypasses
    if (isE2EMock) {
        return {
            ...campaignHandlers,
            ...assignmentHandlers,
            ...resultHandlers,
            ...adjustmentHandlers,
            // Override with mocks where necessary to prevent Firestore calls
            fetchMyAssignments: async () => [],
            fetchAssignmentById: async () => null,
            submitEvaluation: async () => 'mock-result-id',
            updateAssignmentStatus: async () => true,
            fetchAllCampaigns: async () => [],
            fetchCampaignById: async () => null,
            fetchCampaignStatistics: async () => ({ total: 0, submitted: 0, progress: 0 }),
            fetchCampaignAssignments: async () => [],
            createCampaign: async () => 'mock-campaign-id',
            fetchEvaluationResult: async () => null,
            fetchResultsByCampaignAndEvaluatee: async () => [],
            fetchResultsByCampaign: async () => [],
            fetchAdjustmentsByCampaign: async () => [],
            fetchAdjustmentByCampaignAndEvaluatee: async () => null,
            upsertEvaluationAdjustment: async () => true,
            isSubmitting: false,
            isLoading: false,
        };
    }

    return {
        ...campaignHandlers,
        ...assignmentHandlers,
        ...resultHandlers,
        ...adjustmentHandlers,
        isSubmitting,
        isLoading,
    };
}
