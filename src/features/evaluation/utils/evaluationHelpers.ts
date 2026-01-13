import { Evaluation, EvaluationTemplate } from '../../../constants';
import { scoreToGrade, ScoringType } from '../../../services/insightsService';
import { getAvatarUrl } from '../../../utils/avatarUtils';
import type { EvaluationResultData } from '../EvaluationResult';

export interface EvaluationResponse {
    answers: { itemId: number; score: number; grade?: string | undefined; comment: string }[];
    totalScore: number;
    completedAt?: string | undefined;
    evaluatorName?: string | null | undefined;
    evaluatorEmail?: string | null | undefined;
    relation?: 'SELF' | 'PEER' | 'LEADER' | 'MEMBER';
}

export interface AdjustmentPayload {
    managerAdjustment?: { value: number; note?: string | undefined } | undefined;
    hqAdjustment?: { value: number; note?: string | undefined } | undefined;
}

const resolveScoreMax = (ratingScale: Evaluation['ratingScale']) => {
    if (ratingScale === '5점') return 5;
    if (ratingScale === '7점') return 7;
    if (ratingScale === '10점') return 10;
    if (ratingScale === '100점') return 100;
    return null;
};

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const applyScoreAdjustments = (
    baseScore: number,
    adjustment: AdjustmentPayload | null | undefined,
    adjustmentMode: Evaluation['adjustmentMode'],
    adjustmentRange: Evaluation['adjustmentRange'],
    ratingScale: Evaluation['ratingScale']
) => {
    if (!adjustment || (!adjustment.managerAdjustment && !adjustment.hqAdjustment)) {
        return {
            adjustedScore: baseScore,
            appliedManager: 0,
            appliedHq: 0,
        };
    }

    const mode = adjustmentMode ?? 'points';
    const rangeLimit = typeof adjustmentRange === 'number' ? Math.abs(adjustmentRange) : null;
    const clampAdjustment = (value: number) =>
        rangeLimit === null ? value : clampValue(value, -rangeLimit, rangeLimit);
    const computeDelta = (value: number) => {
        const clamped = clampAdjustment(value);
        if (mode === 'percent') {
            return {
                clamped,
                delta: baseScore * (clamped / 100),
            };
        }
        return { clamped, delta: clamped };
    };

    const managerValue = adjustment.managerAdjustment?.value ?? 0;
    const hqValue = adjustment.hqAdjustment?.value ?? 0;
    const managerDelta = computeDelta(managerValue);
    const hqDelta = computeDelta(hqValue);

    let adjustedScore = baseScore + managerDelta.delta + hqDelta.delta;
    const maxScore = resolveScoreMax(ratingScale);
    if (maxScore !== null) {
        adjustedScore = clampValue(adjustedScore, 0, maxScore);
    }

    return {
        adjustedScore,
        appliedManager: managerDelta.clamped,
        appliedHq: hqDelta.clamped,
    };
};

export const aggregateEvaluationResponses = (
    responses: EvaluationResponse[],
    raterGroups:
        | {
              role: 'SELF' | 'PEER' | 'LEADER' | 'MEMBER';
              weight: number;
              required?: boolean;
          }[]
        | undefined,
    scoringRule: '가중합' | '단순평균' | '총점합산' | undefined
) => {
    if (responses.length === 0) {
        return {
            totalScore: 0,
            answers: [],
        };
    }

    const responsesByRole = new Map<string, EvaluationResponse[]>();
    responses.forEach((response) => {
        const key = response.relation || 'UNKNOWN';
        const bucket = responsesByRole.get(key) || [];
        bucket.push(response);
        responsesByRole.set(key, bucket);
    });

    const groupTotals = new Map<string, { average: number; count: number }>();
    const itemTotals = new Map<number, Map<string, { sum: number; count: number }>>();

    responses.forEach((response) => {
        const role = response.relation || 'UNKNOWN';
        response.answers.forEach((answer) => {
            const roleMap = itemTotals.get(answer.itemId) || new Map<string, { sum: number; count: number }>();
            const existing = roleMap.get(role) || { sum: 0, count: 0 };
            roleMap.set(role, { sum: existing.sum + answer.score, count: existing.count + 1 });
            itemTotals.set(answer.itemId, roleMap);
        });
    });

    if (scoringRule === '단순평균' || !raterGroups || raterGroups.length === 0) {
        const totalScore = responses.reduce((sum, response) => sum + response.totalScore, 0) / responses.length;
        const answers = Array.from(itemTotals.entries()).map(([itemId, roleMap]) => {
            let sum = 0;
            let count = 0;
            roleMap.forEach((stats) => {
                sum += stats.sum;
                count += stats.count;
            });
            return {
                itemId,
                score: count > 0 ? sum / count : 0,
                comment: '',
            };
        });
        return {
            totalScore,
            answers,
        };
    }

    raterGroups.forEach((group) => {
        const bucket = responsesByRole.get(group.role) || [];
        if (bucket.length === 0) return;
        const average = bucket.reduce((sum, response) => sum + response.totalScore, 0) / bucket.length;
        groupTotals.set(group.role, { average, count: bucket.length });
    });

    const availableGroups = raterGroups.filter((group) => groupTotals.has(group.role));
    const availableWeightSum = availableGroups.reduce((sum, group) => sum + group.weight, 0);
    if (availableWeightSum === 0) {
        const totalScore = responses.reduce((sum, response) => sum + response.totalScore, 0) / responses.length;
        const answers = Array.from(itemTotals.entries()).map(([itemId, roleMap]) => {
            let sum = 0;
            let count = 0;
            roleMap.forEach((stats) => {
                sum += stats.sum;
                count += stats.count;
            });
            return {
                itemId,
                score: count > 0 ? sum / count : 0,
                comment: '',
            };
        });
        return {
            totalScore,
            answers,
        };
    }

    const totalScore = availableGroups.reduce((sum, group) => {
        const groupAverage = groupTotals.get(group.role)?.average || 0;
        return sum + groupAverage * (group.weight / availableWeightSum);
    }, 0);

    const answers = Array.from(itemTotals.entries()).map(([itemId, roleMap]) => {
        const roleAverages = new Map<string, number>();
        roleMap.forEach((stats, role) => {
            roleAverages.set(role, stats.count > 0 ? stats.sum / stats.count : 0);
        });

        const weightedSum = availableGroups.reduce((sum, group) => {
            const value = roleAverages.get(group.role) ?? 0;
            return sum + value * (group.weight / availableWeightSum);
        }, 0);

        return {
            itemId,
            score: weightedSum,
            comment: '',
        };
    });

    return {
        totalScore,
        answers,
    };
};

export const resolveTemplate = (evaluation: Evaluation, templates: EvaluationTemplate[]) =>
    evaluation.templateSnapshot || templates.find((template) => template.type === evaluation.type);

export const summarizeByScore = (competencies: EvaluationResultData['competencies']) => {
    if (!competencies || competencies.length === 0) {
        return {
            strengths: [],
            improvements: [],
        };
    }

    const sorted = [...competencies].sort((a, b) => b.finalScore - a.finalScore);
    const top = sorted.slice(0, 2).filter((item) => item.finalScore > 0);
    const bottom = [...sorted]
        .reverse()
        .slice(0, 2)
        .filter((item) => item.finalScore > 0);

    const strengths = top.map((item) => `${item.name} 항목에서 강점이 두드러집니다.`);
    const improvements = bottom.map((item) => `${item.name} 항목은 개선 여지가 있습니다.`);

    return {
        strengths,
        improvements,
    };
};

export const buildFeedback = (
    items: EvaluationTemplate['items'] | undefined,
    answerMap: Map<number, { comment: string }>
): { from: string; comment: string }[] => {
    if (!items || items.length === 0) return [];
    return items
        .map((item) => {
            const answer = answerMap.get(item.id);
            const comment = answer?.comment?.trim() || '';
            if (!comment) return null;
            return { from: item.title || '피드백', comment };
        })
        .filter((entry): entry is { from: string; comment: string } => Boolean(entry));
};

export const buildAnswerDetails = (
    items: EvaluationTemplate['items'] | undefined,
    answers: EvaluationResponse['answers'],
    answerMap: Map<number, EvaluationResponse['answers'][number]>
) => {
    if (items && items.length > 0) {
        return items.map((item) => {
            const answer = answerMap.get(item.id);
            return {
                itemId: item.id,
                title: item.title || `항목 ${item.id}`,
                type: item.type,
                weight: item.weight,
                score: answer?.score ?? 0,
                grade: answer?.grade || undefined,
                comment: answer?.comment ?? '',
            };
        });
    }

    return answers.map((answer) => ({
        itemId: answer.itemId,
        title: `항목 ${answer.itemId}`,
        score: answer.score ?? 0,
        grade: answer.grade || undefined,
        comment: answer.comment ?? '',
    }));
};

export const buildWordCloudData = (comments: string[]): { text: string; value: number }[] => {
    const counts = new Map<string, number>();
    comments.forEach((comment) => {
        comment
            .split(/[\s,.;!?]+/)
            .map((token) => token.trim())
            .filter((token) => token.length > 1)
            .forEach((token) => {
                counts.set(token, (counts.get(token) || 0) + 1);
            });
    });

    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([text, count]) => ({
            text,
            value: Math.min(90, 40 + count * 15),
        }));
};

const resolveScoringType = (ratingScale: string | undefined, score: number) => {
    if (ratingScale === '5점') {
        return { scoringType: '5point' as ScoringType, normalizedScore: (score / 5) * 100 };
    }
    if (ratingScale === '7점') {
        return { scoringType: '100point' as ScoringType, normalizedScore: (score / 7) * 100 };
    }
    if (ratingScale === '10점') {
        return { scoringType: '10point' as ScoringType, normalizedScore: (score / 10) * 100 };
    }
    if (ratingScale === '100점') {
        return { scoringType: '100point' as ScoringType, normalizedScore: score };
    }
    return { scoringType: '100point' as ScoringType, normalizedScore: score };
};

export const buildResultData = (
    evaluation: Evaluation,
    template: EvaluationTemplate | undefined,
    response: EvaluationResponse
): EvaluationResultData => {
    const subjectName = evaluation.subjectSnapshot?.name || evaluation.subject;
    const subjectRole = evaluation.subjectSnapshot?.role || '평가 대상';
    const avatar = getAvatarUrl(subjectName);

    const period =
        evaluation.startDate && evaluation.endDate
            ? `${evaluation.startDate} ~ ${evaluation.endDate}`
            : evaluation.period;

    const answers = response.answers || [];
    const answerMap = new Map(answers.map((answer) => [answer.itemId, answer]));
    const items = template?.items || [];

    const competencies =
        items.length > 0
            ? items.map((item) => {
                  const answer = answerMap.get(item.id);
                  const score = answer?.score ?? 0;
                  return {
                      name: item.title || `항목 ${item.id}`,
                      selfScore: score,
                      peerScore: 0,
                      finalScore: score,
                  };
              })
            : [];

    const { strengths, improvements } = summarizeByScore(competencies);
    const feedback = buildFeedback(items, answerMap);
    const comments = feedback.map((entry) => entry.comment);
    const wordCloudData = buildWordCloudData(comments);
    const answerDetails = buildAnswerDetails(items, answers, answerMap);

    const finalScore = response.totalScore ?? 0;
    const { scoringType, normalizedScore } = resolveScoringType(evaluation.ratingScale, finalScore);
    const finalGrade = scoreToGrade(normalizedScore, scoringType);

    return {
        subject: { name: subjectName, role: subjectRole, avatar },
        evaluationName: evaluation.name,
        period,
        finalScore,
        finalGrade,
        summary: `총점 ${finalScore}점으로 평가가 완료되었습니다.`,
        competencies,
        strengths,
        areasForImprovement: improvements,
        peerFeedback: feedback,
        answerDetails,
        wordCloudData: wordCloudData.length > 0 ? wordCloudData : undefined,
    };
};
