import { EvaluateeSummary, MonitoringSortKey } from '@/hooks/evaluation/monitoringTypes';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import React, { memo } from 'react';

const SUBMISSION_WARN_THRESHOLD = 0.7;
const SUBMISSION_CRITICAL_THRESHOLD = 0.4;

const formatAdjustment = (value: number | undefined, unit: string) => {
    if (typeof value !== 'number' || value === 0) return null;
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${unit}`;
};

const getProgressClass = (summary: EvaluateeSummary) => {
    const submissionRate = summary.assignmentCount > 0 ? summary.submittedCount / summary.assignmentCount : 1;
    if (summary.assignmentCount > 0 && submissionRate < SUBMISSION_CRITICAL_THRESHOLD) {
        return 'border-l-4 border-rose-500 bg-rose-50/40';
    }
    if (summary.assignmentCount > 0 && submissionRate < SUBMISSION_WARN_THRESHOLD) {
        return 'border-l-4 border-amber-400 bg-amber-50/40';
    }
    return '';
};

const getScoreLabels = (summary: EvaluateeSummary, adjustmentUnit: string) => {
    const managerLabel = formatAdjustment(summary.managerAdjustment, adjustmentUnit);
    const hqLabel = formatAdjustment(summary.hqAdjustment, adjustmentUnit);
    const baseScoreLabel = summary.baseScore !== null ? summary.baseScore.toFixed(1) : '-';
    const finalScoreLabel = summary.finalScore !== null ? summary.finalScore.toFixed(1) : '-';
    return { managerLabel, hqLabel, baseScoreLabel, finalScoreLabel };
};

const getHqRuleState = (
    summary: EvaluateeSummary,
    hqAdjustmentRule?: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime'
) => {
    const hasLeaderAssignment = summary.leaderAssignmentCount > 0;
    const leaderSubmitted = hasLeaderAssignment ? summary.leaderSubmitted : true;
    const leaderAdjusted = hasLeaderAssignment ? summary.hasManagerAdjustment : true;
    const hqRule = hqAdjustmentRule ?? 'after_leader_submit';
    const hqAllowedByRule =
        hqRule === 'anytime' ? true : hqRule === 'after_leader_adjustment' ? leaderAdjusted : leaderSubmitted;
    const hqDisabledReason =
        hqAllowedByRule || !hasLeaderAssignment
            ? ''
            : hqRule === 'after_leader_adjustment'
              ? '팀장 보정 후 가능'
              : '팀장 평가 완료 후 가능';

    return { hqAllowedByRule, hqDisabledReason };
};

interface MonitoringSummaryRowProps {
    summary: EvaluateeSummary;
    lowScoreThreshold: number | '';
    adjustmentUnit: string;
    canAdjustAsLeader: boolean;
    canAdjustAsHq: boolean;
    hqAdjustmentRule?: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime' | undefined;
    onOpenAdjustment: (summary: EvaluateeSummary, role: 'manager' | 'hq') => void;
    onOpenDetail: (summary: EvaluateeSummary) => void;
}

const MonitoringSummaryRow: React.FC<MonitoringSummaryRowProps> = memo(
    ({
        summary,
        lowScoreThreshold,
        adjustmentUnit,
        canAdjustAsLeader,
        canAdjustAsHq,
        hqAdjustmentRule,
        onOpenAdjustment,
        onOpenDetail,
    }) => {
        const missingCount = Math.max(0, summary.assignmentCount - summary.submittedCount);
        const progressClass = getProgressClass(summary);
        const { managerLabel, hqLabel, baseScoreLabel, finalScoreLabel } = getScoreLabels(summary, adjustmentUnit);
        const { hqAllowedByRule, hqDisabledReason } = getHqRuleState(summary, hqAdjustmentRule);
        const isLowScore =
            lowScoreThreshold !== '' && summary.finalScore !== null && summary.finalScore <= Number(lowScoreThreshold);

        return (
            <tr className={`hover:bg-slate-50 ${progressClass}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{summary.name}</div>
                    <div className="text-xs text-slate-500">{summary.team}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {summary.submittedCount}/{summary.assignmentCount}
                    {missingCount > 0 && (
                        <span className="ml-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            미제출 {missingCount}명
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">
                    <div className="flex flex-col gap-1">
                        <div>
                            {finalScoreLabel}
                            {isLowScore && <span className="ml-2 text-xs text-rose-600 font-semibold">낮은 점수</span>}
                        </div>
                        {(managerLabel || hqLabel) && (
                            <div className="text-xs text-slate-500 font-normal">
                                기본 {baseScoreLabel}
                                {managerLabel && ` · 팀장 ${managerLabel}`}
                                {hqLabel && ` · 본부장 ${hqLabel}`}
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        {canAdjustAsLeader && (
                            <button
                                type="button"
                                onClick={() => onOpenAdjustment(summary, 'manager')}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                            >
                                팀장 보정
                            </button>
                        )}
                        {canAdjustAsHq && (
                            <button
                                type="button"
                                onClick={() => onOpenAdjustment(summary, 'hq')}
                                disabled={!hqAllowedByRule}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={hqDisabledReason || undefined}
                            >
                                본부장 보정
                            </button>
                        )}
                        {!canAdjustAsLeader && !canAdjustAsHq && (
                            <span className="text-xs text-slate-400">권한 없음</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <button
                        type="button"
                        onClick={() => onOpenDetail(summary)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    >
                        상세 보기
                    </button>
                </td>
            </tr>
        );
    }
);
MonitoringSummaryRow.displayName = 'MonitoringSummaryRow';

interface MonitoringSummaryTableProps {
    summaries: EvaluateeSummary[];
    sortKey: MonitoringSortKey;
    lowScoreThreshold: number | '';
    resultsLoading: boolean;
    adjustmentUnit: string;
    canAdjustAsLeader: boolean;
    canAdjustAsHq: boolean;
    hqAdjustmentRule?: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime' | undefined;
    onSortByName: () => void;
    onSortBySubmission: () => void;
    onSortByScore: () => void;
    onOpenAdjustment: (summary: EvaluateeSummary, role: 'manager' | 'hq') => void;
    onOpenDetail: (summary: EvaluateeSummary) => void;
}

export const MonitoringSummaryTable: React.FC<MonitoringSummaryTableProps> = ({
    summaries,
    sortKey,
    lowScoreThreshold,
    resultsLoading,
    adjustmentUnit,
    canAdjustAsLeader,
    canAdjustAsHq,
    hqAdjustmentRule,
    onSortByName,
    onSortBySubmission,
    onSortByScore,
    onOpenAdjustment,
    onOpenDetail,
}) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={onSortByName}
                            className={`group inline-flex items-center gap-1 text-left rounded-full px-2 py-1 transition-colors ${
                                sortKey === 'name' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary'
                            }`}
                        >
                            대상자
                            {sortKey === 'name' && <CaretUp className="w-3 h-3 text-slate-500" weight="bold" />}
                        </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={onSortBySubmission}
                            className={`group inline-flex items-center gap-1 text-left rounded-full px-2 py-1 transition-colors ${
                                sortKey === 'submission_desc'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 hover:text-primary'
                            }`}
                        >
                            제출 현황
                            {sortKey === 'submission_desc' && (
                                <CaretDown className="w-3 h-3 text-slate-500" weight="bold" />
                            )}
                        </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <button
                            type="button"
                            onClick={onSortByScore}
                            className={`group inline-flex items-center gap-1 text-left rounded-full px-2 py-1 transition-colors ${
                                sortKey === 'score_desc' || sortKey === 'score_asc'
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 hover:text-primary'
                            }`}
                        >
                            집계 점수
                            {sortKey === 'score_desc' && <CaretDown className="w-3 h-3 text-slate-500" weight="bold" />}
                            {sortKey === 'score_asc' && <CaretUp className="w-3 h-3 text-slate-500" weight="bold" />}
                        </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        보정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        상세
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {resultsLoading ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500">
                            집계 데이터를 불러오는 중...
                        </td>
                    </tr>
                ) : summaries.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500">
                            집계할 대상자가 없습니다.
                        </td>
                    </tr>
                ) : (
                    summaries.map((summary) => (
                        <MonitoringSummaryRow
                            key={summary.id}
                            summary={summary}
                            lowScoreThreshold={lowScoreThreshold}
                            adjustmentUnit={adjustmentUnit}
                            canAdjustAsLeader={canAdjustAsLeader}
                            canAdjustAsHq={canAdjustAsHq}
                            hqAdjustmentRule={hqAdjustmentRule}
                            onOpenAdjustment={onOpenAdjustment}
                            onOpenDetail={onOpenDetail}
                        />
                    ))
                )}
            </tbody>
        </table>
    </div>
);
