import { useCallback, useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import type { EvaluationResultData } from '../../features/evaluation/EvaluationResult';
import {
    aggregateEvaluationResponses,
    buildResultData,
    EvaluationResponse,
    applyScoreAdjustments,
    resolveTemplate,
} from '../../features/evaluation/utils/evaluationHelpers';
import { auth } from '../../firebase';
import { useEvaluationData } from './useEvaluationData';
import { useFirestoreEvaluation } from './useFirestoreEvaluation';

const resolveEvaluation = (evaluations: any[], evaluationId: string | number) =>
    evaluations.find((item) => String(item.id) === String(evaluationId));

const buildEvaluationWithCampaign = (evaluation: any, campaign: any) => ({
    ...evaluation,
    ratingScale: campaign?.ratingScale || evaluation.ratingScale,
    scoringRule: campaign?.scoringRule || evaluation.scoringRule,
});

const buildAggregatedResultData = async ({
    assignment,
    campaign,
    evaluationWithCampaign,
    templates,
    fetchResultsByCampaignAndEvaluatee,
    fetchAdjustmentByCampaignAndEvaluatee,
}: {
    assignment: any;
    campaign: any;
    evaluationWithCampaign: any;
    templates: any[];
    fetchResultsByCampaignAndEvaluatee: (campaignId: string, evaluateeId: string) => Promise<any[]>;
    fetchAdjustmentByCampaignAndEvaluatee: (campaignId: string, evaluateeId: string) => Promise<any>;
}) => {
    const results = await fetchResultsByCampaignAndEvaluatee(assignment.campaignId, assignment.evaluateeId);
    if (!results || results.length === 0) return null;

    const responses: EvaluationResponse[] = results.map((result) => ({
        answers: result.answers,
        totalScore: result.totalScore,
        completedAt: result.submittedAt,
        evaluatorName: 'Evaluator',
        evaluatorEmail: '',
        relation: result.relation,
    }));

    const aggregated = aggregateEvaluationResponses(responses, campaign?.raterGroups, campaign?.scoringRule);
    const adjustment = await fetchAdjustmentByCampaignAndEvaluatee(assignment.campaignId, assignment.evaluateeId);
    const { adjustedScore } = applyScoreAdjustments(
        aggregated.totalScore,
        adjustment,
        campaign?.adjustmentMode,
        campaign?.adjustmentRange,
        campaign?.ratingScale
    );
    const template = resolveTemplate(evaluationWithCampaign, templates);
    return buildResultData(evaluationWithCampaign, template, {
        ...aggregated,
        totalScore: adjustedScore,
    });
};

const buildSingleResultData = async ({
    evaluationId,
    assignment,
    campaign,
    evaluationWithCampaign,
    templates,
    fetchEvaluationResult,
    fetchAdjustmentByCampaignAndEvaluatee,
}: {
    evaluationId: string | number;
    assignment: any;
    campaign: any;
    evaluationWithCampaign: any;
    templates: any[];
    fetchEvaluationResult: (assignmentId: string) => Promise<any>;
    fetchAdjustmentByCampaignAndEvaluatee: (campaignId: string, evaluateeId: string) => Promise<any>;
}) => {
    const result = await fetchEvaluationResult(String(evaluationId));
    if (!result) return null;
    const adjustment =
        assignment?.campaignId && assignment.evaluateeId
            ? await fetchAdjustmentByCampaignAndEvaluatee(assignment.campaignId, assignment.evaluateeId)
            : null;
    const { adjustedScore } = applyScoreAdjustments(
        result.totalScore,
        adjustment,
        campaign?.adjustmentMode,
        campaign?.adjustmentRange,
        campaign?.ratingScale
    );
    const response: EvaluationResponse = {
        answers: result.answers,
        totalScore: adjustedScore,
        completedAt: result.submittedAt,
        evaluatorName: 'Evaluator',
        evaluatorEmail: '',
        relation: result.relation,
    };
    const template = resolveTemplate(evaluationWithCampaign, templates);
    return buildResultData(evaluationWithCampaign, template, response);
};

const resolveResultData = async ({
    evaluationId,
    normalizedEvaluations,
    templates,
    fetchAssignmentById,
    fetchCampaignById,
    fetchEvaluationResult,
    fetchResultsByCampaignAndEvaluatee,
    fetchAdjustmentByCampaignAndEvaluatee,
}: {
    evaluationId: string | number;
    normalizedEvaluations: ReturnType<typeof useEvaluationData>['normalizedEvaluations'];
    templates: ReturnType<typeof useEvaluationData>['templates'];
    fetchAssignmentById: (assignmentId: string) => Promise<any>;
    fetchCampaignById: (campaignId: string) => Promise<any>;
    fetchEvaluationResult: (assignmentId: string) => Promise<any>;
    fetchResultsByCampaignAndEvaluatee: (campaignId: string, evaluateeId: string) => Promise<any[]>;
    fetchAdjustmentByCampaignAndEvaluatee: (campaignId: string, evaluateeId: string) => Promise<any>;
}): Promise<{ data: EvaluationResultData | null; unavailable: boolean }> => {
    const evaluation = resolveEvaluation(normalizedEvaluations, evaluationId);
    if (!evaluation) {
        return { data: null, unavailable: true };
    }

    const assignment = await fetchAssignmentById(String(evaluationId));
    const campaign = assignment?.campaignId ? await fetchCampaignById(assignment.campaignId) : null;
    const evaluationWithCampaign = buildEvaluationWithCampaign(evaluation, campaign);

    if (campaign?.allowReview === false && assignment?.status !== 'REVIEW_OPEN') {
        return { data: null, unavailable: true };
    }

    const useAggregated =
        Boolean(campaign?.raterGroups && campaign.raterGroups.length > 0) &&
        Boolean(assignment?.evaluateeId);

    if (useAggregated && assignment?.campaignId) {
        const aggregatedResult = await buildAggregatedResultData({
            assignment,
            campaign,
            evaluationWithCampaign,
            templates,
            fetchResultsByCampaignAndEvaluatee,
            fetchAdjustmentByCampaignAndEvaluatee,
        });
        return { data: aggregatedResult, unavailable: !aggregatedResult };
    }

    const singleResult = await buildSingleResultData({
        evaluationId,
        assignment,
        campaign,
        evaluationWithCampaign,
        templates,
        fetchEvaluationResult,
        fetchAdjustmentByCampaignAndEvaluatee,
    });
    return { data: singleResult, unavailable: !singleResult };
};

export const useEvaluationResultLoader = () => {
    const { showError } = useError();
    const evaluationData = useEvaluationData();
    const {
        fetchAssignmentById,
        fetchCampaignById,
        fetchEvaluationResult,
        fetchResultsByCampaignAndEvaluatee,
        fetchAdjustmentByCampaignAndEvaluatee,
    } = useFirestoreEvaluation();

    const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | string | null>(null);
    const [resultUnavailable, setResultUnavailable] = useState(false);
    const [resultLoading, setResultLoading] = useState(false);
    const [resultData, setResultData] = useState<EvaluationResultData | null>(null);

    const handleViewResult = useCallback(
        async (evaluationId: string | number) => {
            setSelectedEvaluationId(evaluationId);
            setResultUnavailable(false);
            setResultLoading(true);
            setResultData(null);

            const user = auth.currentUser;
            if (!user) {
                showError('로그인이 필요합니다.', '결과를 확인하려면 다시 로그인해주세요.');
                setResultUnavailable(true);
                setResultLoading(false);
                return;
            }

            try {
                const { data, unavailable } = await resolveResultData({
                    evaluationId,
                    normalizedEvaluations: evaluationData.normalizedEvaluations,
                    templates: evaluationData.templates,
                    fetchAssignmentById,
                    fetchCampaignById,
                    fetchEvaluationResult,
                    fetchResultsByCampaignAndEvaluatee,
                    fetchAdjustmentByCampaignAndEvaluatee,
                });
                setResultUnavailable(unavailable);
                if (data) {
                    setResultData(data);
                }
            } catch (error) {
                console.error('Failed to load evaluation response:', error);
                showError('불러오기 실패', '평가 결과를 불러오는 중 오류가 발생했습니다.');
                setResultUnavailable(true);
            } finally {
                setResultLoading(false);
            }
        },
        [
            evaluationData.normalizedEvaluations,
            evaluationData.templates,
            fetchAssignmentById,
            fetchCampaignById,
            fetchEvaluationResult,
            fetchAdjustmentByCampaignAndEvaluatee,
            fetchResultsByCampaignAndEvaluatee,
            showError,
        ]
    );

    const handleBackToList = useCallback(() => {
        setSelectedEvaluationId(null);
        setResultUnavailable(false);
        setResultLoading(false);
        setResultData(null);
    }, []);

    return {
        selectedEvaluationId,
        resultUnavailable,
        resultLoading,
        resultData,
        handleViewResult,
        handleBackToList,
    };
};
