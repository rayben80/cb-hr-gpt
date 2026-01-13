import { Evaluation, Member, Team } from '../../constants';
import {
    aggregateEvaluationResponses,
    applyScoreAdjustments,
    EvaluationResponse,
} from '../../features/evaluation/utils/evaluationHelpers';
import { EvaluationAdjustment } from './useFirestoreEvaluation';
import {
    EvaluateeSummary,
    MonitoringSortKey,
    MonitoringStats,
    MonitoringStatusFilter,
    ParticipantStatus,
} from './monitoringTypes';

export const buildMembersMap = (teams: Team[]) => {
    const map = new Map<string, Member>();
    teams.forEach((team) => {
        if (team.members) team.members.forEach((member) => map.set(member.id, member));
        if (team.parts) team.parts.forEach((part) => part.members.forEach((member) => map.set(member.id, member)));
    });
    return map;
};

export const buildAdjustmentsMap = (adjustments: EvaluationAdjustment[]) => {
    const map = new Map<string, EvaluationAdjustment>();
    adjustments.forEach((adjustment) => {
        if (!adjustment.evaluateeId) return;
        map.set(adjustment.evaluateeId, adjustment);
    });
    return map;
};

export const buildParticipants = (assignments: any[], membersMap: Map<string, Member>): ParticipantStatus[] =>
    assignments.map((assignment) => {
        const evaluator = membersMap.get(assignment.evaluatorId);
        const evaluatee = membersMap.get(assignment.evaluateeId);
        return {
            assignmentId: assignment.id,
            name: evaluator?.name || 'Unknown',
            team: evaluator?.role || 'Team Member',
            evaluateeName: evaluatee?.name || 'Unknown',
            relation: assignment.relation,
            status:
                assignment.status === 'REVIEW_OPEN'
                    ? 'review_open'
                    : assignment.status === 'RESUBMIT_REQUESTED'
                      ? 'resubmit_requested'
                      : assignment.status === 'SUBMITTED'
                        ? 'completed'
                        : assignment.status === 'IN_PROGRESS'
                          ? 'in_progress'
                          : 'not_started',
            progress: assignment.progress,
        };
    });

const buildAssignmentCounts = (assignments: any[]) => {
    const countsMap = new Map<string, { assignmentCount: number; submittedCount: number }>();
    const leaderMap = new Map<string, { total: number; submitted: number }>();

    assignments.forEach((assignment) => {
        if (!assignment.evaluateeId) return;
        const isSubmitted = assignment.status === 'SUBMITTED' || assignment.status === 'REVIEW_OPEN';
        const current = countsMap.get(assignment.evaluateeId) || { assignmentCount: 0, submittedCount: 0 };
        countsMap.set(assignment.evaluateeId, {
            assignmentCount: current.assignmentCount + 1,
            submittedCount: current.submittedCount + (isSubmitted ? 1 : 0),
        });
        if (assignment.relation === 'LEADER') {
            const leaderCurrent = leaderMap.get(assignment.evaluateeId) || { total: 0, submitted: 0 };
            leaderMap.set(assignment.evaluateeId, {
                total: leaderCurrent.total + 1,
                submitted: leaderCurrent.submitted + (isSubmitted ? 1 : 0),
            });
        }
    });

    return { countsMap, leaderMap };
};

const buildResponsesByEvaluatee = (results: any[], countsMap: Map<string, { assignmentCount: number; submittedCount: number }>) => {
    const responsesByEvaluatee = new Map<string, EvaluationResponse[]>();
    results.forEach((result) => {
        if (!result.evaluateeId) return;
        const list = responsesByEvaluatee.get(result.evaluateeId) || [];
        list.push({
            answers: result.answers || [],
            totalScore: result.totalScore ?? 0,
            relation: result.relation,
        });
        responsesByEvaluatee.set(result.evaluateeId, list);
        if (!countsMap.has(result.evaluateeId)) {
            countsMap.set(result.evaluateeId, { assignmentCount: 0, submittedCount: 0 });
        }
    });
    return responsesByEvaluatee;
};

const getBaseScore = (responses: EvaluationResponse[], evaluation: Evaluation) => {
    if (responses.length === 0) return null;
    const aggregated = aggregateEvaluationResponses(responses, evaluation.raterGroups, evaluation.scoringRule);
    return aggregated ? aggregated.totalScore : null;
};

const getAdjustmentResult = (
    baseScore: number | null,
    adjustment: EvaluationAdjustment | undefined,
    evaluation: Evaluation
) => {
    if (baseScore === null) {
        return { adjustedScore: null, appliedManager: 0, appliedHq: 0 };
    }
    return applyScoreAdjustments(
        baseScore,
        adjustment,
        evaluation.adjustmentMode,
        evaluation.adjustmentRange,
        evaluation.ratingScale
    );
};

const getLeaderStats = (leaderMap: Map<string, { total: number; submitted: number }>, evaluateeId: string) => {
    const stats = leaderMap.get(evaluateeId) || { total: 0, submitted: 0 };
    return {
        leaderAssignmentCount: stats.total,
        leaderSubmitted: stats.total > 0 ? stats.submitted >= stats.total : false,
    };
};

const buildSummary = ({
    evaluateeId,
    counts,
    membersMap,
    responsesByEvaluatee,
    adjustmentsMap,
    evaluation,
    leaderMap,
}: {
    evaluateeId: string;
    counts: { assignmentCount: number; submittedCount: number };
    membersMap: Map<string, Member>;
    responsesByEvaluatee: Map<string, EvaluationResponse[]>;
    adjustmentsMap: Map<string, EvaluationAdjustment>;
    evaluation: Evaluation;
    leaderMap: Map<string, { total: number; submitted: number }>;
}): EvaluateeSummary => {
    const member = membersMap.get(evaluateeId);
    const responses = responsesByEvaluatee.get(evaluateeId) || [];
    const baseScore = getBaseScore(responses, evaluation);
    const adjustment = adjustmentsMap.get(evaluateeId);
    const adjustmentResult = getAdjustmentResult(baseScore, adjustment, evaluation);
    const assignmentCount = counts.assignmentCount > 0 ? counts.assignmentCount : responses.length;
    const submittedCount = counts.assignmentCount > 0 ? counts.submittedCount : responses.length;
    const leaderStats = getLeaderStats(leaderMap, evaluateeId);
    const hasManagerAdjustment = Boolean(adjustment?.managerAdjustment);

    return {
        id: evaluateeId,
        name: member?.name || 'Unknown',
        team: member?.role || 'Team Member',
        assignmentCount,
        submittedCount,
        leaderAssignmentCount: leaderStats.leaderAssignmentCount,
        leaderSubmitted: leaderStats.leaderSubmitted,
        hasManagerAdjustment,
        baseScore,
        finalScore: adjustmentResult.adjustedScore === null ? null : adjustmentResult.adjustedScore,
        managerAdjustment: adjustmentResult.appliedManager || undefined,
        hqAdjustment: adjustmentResult.appliedHq || undefined,
    };
};

export const buildEvaluateeSummaries = (
    assignments: any[],
    results: any[],
    membersMap: Map<string, Member>,
    adjustmentsMap: Map<string, EvaluationAdjustment>,
    evaluation: Evaluation
): EvaluateeSummary[] => {
    const { countsMap, leaderMap } = buildAssignmentCounts(assignments);
    const responsesByEvaluatee = buildResponsesByEvaluatee(results, countsMap);

    return Array.from(countsMap.entries())
        .map(([evaluateeId, counts]) =>
            buildSummary({
                evaluateeId,
                counts,
                membersMap,
                responsesByEvaluatee,
                adjustmentsMap,
                evaluation,
                leaderMap,
            })
        )
        .sort((a, b) => a.name.localeCompare(b.name));
};

export const buildStats = (participants: ParticipantStatus[]): MonitoringStats => ({
    total: participants.length,
    completed: participants.filter(
        (participant) => participant.status === 'completed' || participant.status === 'review_open'
    ).length,
    inProgress: participants.filter(
        (participant) => participant.status === 'in_progress' || participant.status === 'resubmit_requested'
    ).length,
    notStarted: participants.filter((participant) => participant.status === 'not_started').length,
});

export const filterSummaries = (
    summaries: EvaluateeSummary[],
    statusFilter: MonitoringStatusFilter,
    sortKey: MonitoringSortKey,
    lowScoreThreshold: number | ''
) => {
    let list = [...summaries];

    if (statusFilter === 'complete') {
        list = list.filter((summary) => summary.assignmentCount > 0 && summary.submittedCount >= summary.assignmentCount);
    }
    if (statusFilter === 'incomplete') {
        list = list.filter((summary) => summary.assignmentCount > 0 && summary.submittedCount < summary.assignmentCount);
    }

    if (lowScoreThreshold !== '') {
        list = list.filter((summary) => summary.finalScore !== null && summary.finalScore <= Number(lowScoreThreshold));
    }

    list.sort((a, b) => {
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        if (sortKey === 'submission_desc') {
            const aRate = a.assignmentCount > 0 ? a.submittedCount / a.assignmentCount : 0;
            const bRate = b.assignmentCount > 0 ? b.submittedCount / b.assignmentCount : 0;
            return bRate - aRate;
        }
        if (sortKey === 'score_asc') {
            const aScore = a.finalScore ?? Number.POSITIVE_INFINITY;
            const bScore = b.finalScore ?? Number.POSITIVE_INFINITY;
            return aScore - bScore;
        }
        const aScore = a.finalScore ?? Number.NEGATIVE_INFINITY;
        const bScore = b.finalScore ?? Number.NEGATIVE_INFINITY;
        return bScore - aScore;
    });

    return list;
};
