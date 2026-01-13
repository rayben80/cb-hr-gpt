import { Bell } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { ProgressBar } from '@/components/feedback/Progress';
import { MonitoringStats, ParticipantStatus } from '@/hooks/evaluation/monitoringTypes';

type RemindResult = 'idle' | 'success' | 'error' | 'no_webhook';

interface MonitoringParticipantsSectionProps {
    participants: ParticipantStatus[];
    stats: MonitoringStats;
    remindSending: boolean;
    remindResult: RemindResult;
    onRemindAll: () => void;
    allowReview: boolean;
    allowResubmission: boolean;
    onOpenReview: (assignmentId: string) => void;
    onRequestResubmission: (assignmentId: string) => void;
}

const RemindResultBadge = memo(({ result }: { result: RemindResult }) => {
    if (result === 'success')
        return <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">발송 완료</span>;
    if (result === 'error')
        return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">발송 실패</span>;
    if (result === 'no_webhook')
        return (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">Webhook 미설정</span>
        );
    return null;
});
RemindResultBadge.displayName = 'RemindResultBadge';

const StatusBadge = memo(({ status }: { status: ParticipantStatus['status'] }) => {
    const config = {
        completed: ['bg-green-100 text-green-700', '완료'],
        in_progress: ['bg-primary/10 text-primary', '진행 중'],
        not_started: ['bg-slate-100 text-slate-600', '미시작'],
        review_open: ['bg-indigo-100 text-indigo-700', '재열람'],
        resubmit_requested: ['bg-amber-100 text-amber-700', '재제출 요청'],
    };
    const [className, label] = config[status];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${className}`}>{label}</span>;
});
StatusBadge.displayName = 'StatusBadge';

const ParticipantRow = memo(
    ({
        participant,
        allowReview,
        allowResubmission,
        onOpenReview,
        onRequestResubmission,
    }: {
        participant: ParticipantStatus;
        allowReview: boolean;
        allowResubmission: boolean;
        onOpenReview: (assignmentId: string) => void;
        onRequestResubmission: (assignmentId: string) => void;
    }) => {
        const canReview = allowReview && participant.status === 'completed';
        const canResubmit = allowResubmission && participant.status === 'completed';
        return (
    <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="font-medium text-slate-900">{participant.name}</div>
            <div className="text-xs text-slate-500">
                {participant.team} · 대상 {participant.evaluateeName}
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <StatusBadge status={participant.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap w-1/3">
            <div className="flex items-center gap-3">
                <div className="w-full">
                    <ProgressBar progress={participant.progress} />
                </div>
                <span className="text-xs font-medium text-slate-500 w-8 text-right">{participant.progress}%</span>
            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
            {allowReview || allowResubmission ? (
                <div className="flex items-center gap-2">
                    {allowReview && (
                        <button
                            type="button"
                            onClick={() => onOpenReview(participant.assignmentId)}
                            disabled={!canReview}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            재열람
                        </button>
                    )}
                    {allowResubmission && (
                        <button
                            type="button"
                            onClick={() => onRequestResubmission(participant.assignmentId)}
                            disabled={!canResubmit}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            재제출 요청
                        </button>
                    )}
                </div>
            ) : (
                <span className="text-xs text-slate-400">설정 없음</span>
            )}
        </td>
    </tr>
        );
    }
);
ParticipantRow.displayName = 'ParticipantRow';

export const MonitoringParticipantsSection: React.FC<MonitoringParticipantsSectionProps> = ({
    participants,
    stats,
    remindSending,
    remindResult,
    onRemindAll,
    allowReview,
    allowResubmission,
    onOpenReview,
    onRequestResubmission,
}) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">참여자 상세 현황</h3>
            <div className="flex items-center gap-2">
                <RemindResultBadge result={remindResult} />
                <button
                    onClick={onRemindAll}
                    disabled={(stats.notStarted === 0 && stats.inProgress === 0) || remindSending}
                    className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {remindSending ? (
                        <span>발송 중...</span>
                    ) : (
                        <>
                            <Bell className="w-4 h-4 mr-2" weight="regular" />
                            미완료자 전체 독촉
                        </>
                    )}
                </button>
            </div>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            이름 / 소속
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            진행률
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            요청
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {participants.map((participant) => (
                        <ParticipantRow
                            key={participant.assignmentId}
                            participant={participant}
                            allowReview={allowReview}
                            allowResubmission={allowResubmission}
                            onOpenReview={onOpenReview}
                            onRequestResubmission={onRequestResubmission}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


