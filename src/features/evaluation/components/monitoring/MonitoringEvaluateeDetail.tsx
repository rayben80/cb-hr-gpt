import { ArrowLeft } from '@phosphor-icons/react';
import React, { memo, useMemo, useState } from 'react';
import { Evaluation, Member } from '@/constants';
import { EvaluateeSummary } from '@/hooks/evaluation/monitoringTypes';

type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEW_OPEN' | 'RESUBMIT_REQUESTED';
type RelationType = 'SELF' | 'LEADER' | 'PEER' | 'MEMBER';

interface MonitoringEvaluateeDetailProps {
    evaluation: Evaluation;
    summary: EvaluateeSummary;
    assignments: any[];
    results: any[];
    membersMap: Map<string, Member>;
    onBack: () => void;
}

interface EntryRow {
    assignmentId: string;
    evaluatorId: string;
    relation: RelationType;
    status: AssignmentStatus;
    progress: number;
    submittedAt: any;
    result: any;
}

const statusLabels: Record<AssignmentStatus, string> = {
    PENDING: '미시작',
    IN_PROGRESS: '진행 중',
    SUBMITTED: '제출 완료',
    REVIEW_OPEN: '재열람',
    RESUBMIT_REQUESTED: '재제출 요청',
};

const relationLabels: Record<RelationType, string> = {
    SELF: '본인',
    LEADER: '상사',
    PEER: '동료',
    MEMBER: '팀원',
};

const formatDate = (value: any) => {
    if (!value) return '-';
    if (typeof value === 'string') return value.slice(0, 10);
    if (value?.toDate) return value.toDate().toISOString().slice(0, 10);
    if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000).toISOString().slice(0, 10);
    return '-';
};

const buildEntries = (assignments: any[], results: any[], evaluateeId: string) => {
    const assignmentRows: EntryRow[] = assignments
        .filter((assignment) => assignment.evaluateeId === evaluateeId)
        .map((assignment) => ({
            assignmentId: assignment.id,
            evaluatorId: assignment.evaluatorId,
            relation: assignment.relation as RelationType,
            status: assignment.status as AssignmentStatus,
            progress: assignment.progress ?? 0,
            submittedAt: assignment.submittedAt,
            result: null,
        }));

    const assignmentMap = new Map(assignmentRows.map((row) => [row.assignmentId, row]));

    results
        .filter((result) => result.evaluateeId === evaluateeId)
        .forEach((result) => {
            const match = assignmentMap.get(result.assignmentId);
            if (match) {
                match.result = result;
                match.submittedAt = result.submittedAt ?? match.submittedAt;
                match.status = match.status === 'PENDING' ? 'SUBMITTED' : match.status;
                return;
            }
            assignmentRows.push({
                assignmentId: result.assignmentId,
                evaluatorId: result.evaluatorId,
                relation: (result.relation as RelationType) || 'PEER',
                status: 'SUBMITTED',
                progress: 100,
                submittedAt: result.submittedAt,
                result,
            });
        });

    return assignmentRows;
};

const DetailCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</div>
        <div className="text-lg font-bold text-slate-900 mt-2">{value}</div>
    </div>
);

const DetailHeader = ({
    summary,
    evaluation,
    onBack,
}: {
    summary: EvaluateeSummary;
    evaluation: Evaluation;
    onBack: () => void;
}) => (
    <div className="px-6 py-5 border-b border-slate-200">
        <button
            type="button"
            onClick={onBack}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-4"
        >
            <ArrowLeft className="w-4 h-4 mr-2" weight="regular" />
            평가 현황으로 돌아가기
        </button>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">{summary.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{summary.team}</p>
            </div>
            <div className="text-sm text-slate-500">
                {evaluation.startDate} ~ {evaluation.endDate}
            </div>
        </div>
    </div>
);

const SummaryCards = ({ summary }: { summary: EvaluateeSummary }) => {
    const baseScore = summary.baseScore !== null ? summary.baseScore.toFixed(1) : '-';
    const finalScore = summary.finalScore !== null ? summary.finalScore.toFixed(1) : '-';
    const managerAdjustment =
        summary.managerAdjustment && summary.managerAdjustment !== 0 ? summary.managerAdjustment : null;
    const hqAdjustment = summary.hqAdjustment && summary.hqAdjustment !== 0 ? summary.hqAdjustment : null;
    const adjustmentLabel = [managerAdjustment ? `팀장 ${managerAdjustment}` : null, hqAdjustment ? `본부장 ${hqAdjustment}` : null]
        .filter(Boolean)
        .join(' · ');

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DetailCard label="제출 현황" value={`${summary.submittedCount}/${summary.assignmentCount}`} />
            <DetailCard label="기본 점수" value={baseScore} />
            <DetailCard label="보정" value={adjustmentLabel || '없음'} />
            <DetailCard label="최종 점수" value={finalScore} />
        </div>
    );
};

const EntryAnswers = ({ answers }: { answers: any[] }) => {
    if (answers.length === 0) {
        return <div className="text-sm text-slate-500">답변 상세가 없습니다.</div>;
    }

    return (
        <div className="space-y-2">
            {answers.map((answer) => (
                <div
                    key={answer.itemId}
                    className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                    <div className="text-sm font-semibold text-slate-800">항목 {answer.itemId}</div>
                    <div className="text-xs text-slate-500">
                        점수: {answer.score} {answer.grade ? `(${answer.grade})` : ''}
                    </div>
                    {answer.comment && <div className="text-xs text-slate-600">{answer.comment}</div>}
                </div>
            ))}
        </div>
    );
};

const EntryRow = ({
    entry,
    evaluatorName,
    isExpanded,
    onToggle,
}: {
    entry: EntryRow;
    evaluatorName: string;
    isExpanded: boolean;
    onToggle: () => void;
}) => {
    const label = statusLabels[entry.status] || entry.status;
    const score = entry.result?.totalScore ?? '-';
    const submittedAt = formatDate(entry.submittedAt);
    const answers = entry.result?.answers || [];

    return (
        <>
            <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900 font-medium">{evaluatorName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                    {relationLabels[entry.relation] || entry.relation}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{label}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{score}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{submittedAt}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                    >
                        {isExpanded ? '닫기' : '답변 보기'}
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-slate-50/60">
                    <td colSpan={6} className="px-4 py-4 text-sm text-slate-600">
                        <EntryAnswers answers={answers} />
                    </td>
                </tr>
            )}
        </>
    );
};

const SubmissionTable = ({
    entries,
    membersMap,
    expandedId,
    onToggle,
}: {
    entries: EntryRow[];
    membersMap: Map<string, Member>;
    expandedId: string | null;
    onToggle: (id: string) => void;
}) => (
    <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">제출 상세</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            평가자
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            관계
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            상태
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            점수
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            제출일
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            상세
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {entries.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                                제출된 평가가 없습니다.
                            </td>
                        </tr>
                    ) : (
                        entries.map((entry) => {
                            const evaluatorName = membersMap.get(entry.evaluatorId)?.name || 'Unknown';
                            const isExpanded = expandedId === entry.assignmentId;
                            return (
                                <EntryRow
                                    key={entry.assignmentId}
                                    entry={entry}
                                    evaluatorName={evaluatorName}
                                    isExpanded={isExpanded}
                                    onToggle={() => onToggle(entry.assignmentId)}
                                />
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export const MonitoringEvaluateeDetail: React.FC<MonitoringEvaluateeDetailProps> = memo(
    ({ evaluation, summary, assignments, results, membersMap, onBack }) => {
        const [expandedId, setExpandedId] = useState<string | null>(null);
        const entries = useMemo(
            () => buildEntries(assignments, results, summary.id),
            [assignments, results, summary.id]
        );

        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <DetailHeader summary={summary} evaluation={evaluation} onBack={onBack} />
                <div className="p-6 space-y-6">
                    <SummaryCards summary={summary} />
                    <SubmissionTable
                        entries={entries}
                        membersMap={membersMap}
                        expandedId={expandedId}
                        onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                    />
                </div>
            </div>
        );
    }
);

MonitoringEvaluateeDetail.displayName = 'MonitoringEvaluateeDetail';
