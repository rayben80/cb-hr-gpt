import { Gear } from '@phosphor-icons/react';
import { memo, useMemo } from 'react';
import { Evaluation } from '../../constants';
import { Button } from '../common';

interface ScoreBarRowProps {
    label: string;
    score: number;
    weight: number;
    progress: number;
    color: { base: string; fill: string };
}

const ScoreBarRow = memo(({ label, score, weight, progress, color }: ScoreBarRowProps) => {
    const hasScore = score > 0;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const clampedWeight = Math.min(100, Math.max(0, weight));

    return (
        <div className="grid grid-cols-[120px_1fr_60px] items-center gap-3">
            <div>
                <div className="text-sm font-semibold text-slate-800">{label}</div>
                <div className="mt-1 text-xs text-slate-500">가중치 {Math.round(clampedWeight)}%</div>
            </div>
            <div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`absolute inset-y-0 left-0 ${color.base}`} style={{ width: `${clampedWeight}%` }} />
                    <div
                        className={`absolute inset-y-0 left-0 ${color.fill}`}
                        style={{ width: `${(clampedWeight * clampedProgress) / 100}%` }}
                    />
                </div>
                <div className="mt-1 text-[11px] text-slate-500">진행률 {Math.round(clampedProgress)}%</div>
            </div>
            <div className={`text-right text-sm font-semibold ${hasScore ? 'text-slate-900' : 'text-slate-400'}`}>
                {hasScore ? score : '-'}
            </div>
        </div>
    );
});

ScoreBarRow.displayName = 'ScoreBarRow';

interface EvaluationWeights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
    summaryYear?: number;
    showMonthlyPartialAverage?: boolean;
}

interface TotalScoreCardProps {
    totalScore: number;
    year: number;
    segments: Array<{
        label: string;
        weight: number;
        progress: number;
        baseClass: string;
        fillClass: string;
    }>;
}

const TotalScoreCard = memo(({ totalScore, year, segments }: TotalScoreCardProps) => {
    const hasTotalScore = totalScore > 0;
    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    const totalProgress =
        totalWeight > 0
            ? Math.round(
                  segments.reduce((sum, segment) => sum + segment.weight * Math.min(100, Math.max(0, segment.progress)), 0) /
                      totalWeight
              )
            : 0;
    const normalizedSegments = segments.map((segment) => ({
        ...segment,
        weightRatio: totalWeight > 0 ? (segment.weight / totalWeight) * 100 : 0,
        progress: Math.min(100, Math.max(0, segment.progress)),
    }));

    return (
        <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-slate-800">최종 점수</div>
                    <div className={`mt-1 text-3xl font-bold ${hasTotalScore ? 'text-slate-900' : 'text-slate-400'}`}>
                        {hasTotalScore ? totalScore : '-'}
                    </div>
                    {!hasTotalScore && <div className="text-xs text-slate-400">점수 계산 전</div>}
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    {year}년 종합
                </div>
            </div>
            <div className="mt-3">
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                    {normalizedSegments.map((segment) => (
                        <div key={segment.label} className="relative h-full" style={{ width: `${segment.weightRatio}%` }}>
                            <div className={`absolute inset-0 ${segment.baseClass}`} />
                            <div
                                className={`absolute inset-y-0 left-0 ${segment.fillClass}`}
                                style={{ width: `${segment.progress}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">합산 진행률 {totalProgress}%</div>
            </div>
        </div>
    );
});

TotalScoreCard.displayName = 'TotalScoreCard';

const findEvaluation = (evaluations: Evaluation[], period: string, year?: number) =>
    evaluations.find((evaluation) => {
        if (evaluation.type !== '본인평가' || evaluation.period !== period) return false;
        if (!year) return true;
        const base = evaluation.startDate || evaluation.endDate;
        if (!base) return false;
        const parsed = new Date(base);
        return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === year;
    });

const getPeerEvaluations = (evaluations: Evaluation[]) => evaluations.filter((evaluation) => evaluation.type === '다면평가');

const getAverageScore = (evaluations: Evaluation[]) => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((acc, cur) => acc + (cur.score ?? 0), 0);
    return Math.round(total / evaluations.length);
};

const getProgressValue = (evaluation?: Evaluation, fallbackScore = 0) => {
    if (typeof evaluation?.progress === 'number') return evaluation.progress;
    return fallbackScore > 0 ? 100 : 0;
};

const getAverageProgress = (evaluations: Evaluation[]) => {
    if (evaluations.length === 0) return 0;
    const values = evaluations.map((evaluation) =>
        typeof evaluation.progress === 'number' ? evaluation.progress : evaluation.status === '완료' ? 100 : 0
    );
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const resolveEvaluationDate = (evaluation: Evaluation) => {
    const base = evaluation.startDate || evaluation.endDate;
    if (!base) return null;
    const parsed = new Date(base);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMonthlyEvaluations = (evaluations: Evaluation[], year: number, half: 1 | 2) => {
    const startMonth = half === 1 ? 1 : 7;
    const endMonth = half === 1 ? 6 : 12;
    return evaluations.filter((evaluation) => {
        if (evaluation.type !== '본인평가' || evaluation.period !== '월별') return false;
        const date = resolveEvaluationDate(evaluation);
        if (!date) return false;
        const month = date.getMonth() + 1;
        return date.getFullYear() === year && month >= startMonth && month <= endMonth;
    });
};

const resolveHalfYearScore = (
    evaluations: Evaluation[],
    periodLabel: '상반기' | '하반기',
    year: number,
    half: 1 | 2,
    allowPartialAverage: boolean
) => {
    const direct = findEvaluation(evaluations, periodLabel, year);
    if (direct) {
        const score = direct.status === '완료' ? direct.score ?? 0 : 0;
        return {
            score,
            progress: getProgressValue(direct, score),
            usedMonthly: false,
            usedPartial: false,
        };
    }

    const monthlyEvaluations = getMonthlyEvaluations(evaluations, year, half);
    const completedMonthly = monthlyEvaluations.filter((evaluation) => evaluation.status === '완료');
    const hasFullCycle = completedMonthly.length >= 6;
    const canUsePartial = allowPartialAverage && completedMonthly.length > 0;
    const shouldUseAverage = hasFullCycle || canUsePartial;
    return {
        score: shouldUseAverage ? getAverageScore(completedMonthly) : 0,
        progress: getAverageProgress(monthlyEvaluations),
        usedMonthly: monthlyEvaluations.length > 0,
        usedPartial: canUsePartial && !hasFullCycle,
    };
};

const computeAnnualScores = (evaluations: Evaluation[], weights: EvaluationWeights, summaryYear: number) => {
    const allowPartialAverage = Boolean(weights.showMonthlyPartialAverage);
    const firstHalfResult = resolveHalfYearScore(evaluations, '상반기', summaryYear, 1, allowPartialAverage);
    const secondHalfResult = resolveHalfYearScore(evaluations, '하반기', summaryYear, 2, allowPartialAverage);
    const peerEvaluations = getPeerEvaluations(evaluations);
    const completedPeers = peerEvaluations.filter((evaluation) => evaluation.status === '완료');
    const peerAvg = getAverageScore(completedPeers);
    const firstHalfScore = firstHalfResult.score;
    const secondHalfScore = secondHalfResult.score;
    const weightedScore1 = firstHalfScore * (weights.firstHalf / 100);
    const weightedScore2 = secondHalfScore * (weights.secondHalf / 100);
    const weightedScore3 = peerAvg * (weights.peerReview / 100);
    const totalScore = Math.round(weightedScore1 + weightedScore2 + weightedScore3);
    const firstHalfProgress = firstHalfResult.progress;
    const secondHalfProgress = secondHalfResult.progress;
    const peerProgress = getAverageProgress(peerEvaluations);

    return {
        peerReviewAvgScore: peerAvg,
        firstHalfScore,
        secondHalfScore,
        totalScore,
        firstHalfProgress,
        secondHalfProgress,
        peerProgress,
        usedMonthlyFirstHalf: firstHalfResult.usedMonthly,
        usedMonthlySecondHalf: secondHalfResult.usedMonthly,
        usedPartialFirstHalf: firstHalfResult.usedPartial,
        usedPartialSecondHalf: secondHalfResult.usedPartial,
    };
};

interface AnnualScoreSummaryProps {
    evaluations: Evaluation[];
    weights: EvaluationWeights;
    onOpenSettings?: () => void;
    showSettingsButton?: boolean;
}

export const AnnualScoreSummary = memo(
    ({ evaluations, weights, onOpenSettings, showSettingsButton = true }: AnnualScoreSummaryProps) => {
        const currentYear = new Date().getFullYear();
        const summaryYear = useMemo(() => {
            const yearCandidates = evaluations
                .map((evaluation) => evaluation.endDate || evaluation.startDate)
                .filter((value): value is string => Boolean(value))
                .map((value) => new Date(value))
                .filter((date) => !Number.isNaN(date.getTime()))
                .map((date) => date.getFullYear());
            const derivedYear = yearCandidates.length > 0 ? Math.max(...yearCandidates) : currentYear;
            return weights.summaryYear ?? derivedYear;
        }, [evaluations, currentYear, weights.summaryYear]);
        const {
            peerReviewAvgScore,
            firstHalfScore,
            secondHalfScore,
            totalScore,
            firstHalfProgress,
            secondHalfProgress,
            peerProgress,
            usedMonthlyFirstHalf,
            usedMonthlySecondHalf,
            usedPartialFirstHalf,
            usedPartialSecondHalf,
        } = useMemo(() => computeAnnualScores(evaluations, weights, summaryYear), [evaluations, weights, summaryYear]);
        const totalSegments = useMemo(
            () => [
                {
                    label: '상반기',
                    weight: weights.firstHalf,
                    progress: firstHalfProgress,
                    baseClass: 'bg-primary/15',
                    fillClass: 'bg-primary',
                },
                {
                    label: '하반기',
                    weight: weights.secondHalf,
                    progress: secondHalfProgress,
                    baseClass: 'bg-secondary/60',
                    fillClass: 'bg-secondary',
                },
                {
                    label: '다면',
                    weight: weights.peerReview,
                    progress: peerProgress,
                    baseClass: 'bg-accent/60',
                    fillClass: 'bg-accent',
                },
            ],
            [firstHalfProgress, peerProgress, secondHalfProgress, weights.firstHalf, weights.peerReview, weights.secondHalf]
        );

        return (
            <div className="bg-card p-5 rounded-2xl shadow-sm border border-border mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">연간 종합 평가 요약</h2>
                    {showSettingsButton && onOpenSettings && (
                        <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-2">
                            <Gear className="w-4 h-4" weight="regular" />
                            기준 설정
                        </Button>
                    )}
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                    <div className="flex flex-col gap-4">
                        <ScoreBarRow
                            label={
                                usedMonthlyFirstHalf
                                    ? usedPartialFirstHalf
                                        ? '상반기 평가 (월별 진행 평균)'
                                        : '상반기 평가 (월별 평균)'
                                    : '상반기 평가'
                            }
                            score={firstHalfScore}
                            weight={weights.firstHalf}
                            progress={firstHalfProgress}
                            color={{ base: 'bg-primary/15', fill: 'bg-primary' }}
                        />
                        <ScoreBarRow
                            label={
                                usedMonthlySecondHalf
                                    ? usedPartialSecondHalf
                                        ? '하반기 평가 (월별 진행 평균)'
                                        : '하반기 평가 (월별 평균)'
                                    : '하반기 평가'
                            }
                            score={secondHalfScore}
                            weight={weights.secondHalf}
                            progress={secondHalfProgress}
                            color={{ base: 'bg-secondary/15', fill: 'bg-secondary' }}
                        />
                        <ScoreBarRow
                            label="다면 평가"
                            score={peerReviewAvgScore}
                            weight={weights.peerReview}
                            progress={peerProgress}
                            color={{ base: 'bg-emerald-100', fill: 'bg-emerald-500' }}
                        />
                    </div>
                    <TotalScoreCard totalScore={totalScore} year={summaryYear} segments={totalSegments} />
                </div>
            </div>
        );
    }
);

AnnualScoreSummary.displayName = 'AnnualScoreSummary';
