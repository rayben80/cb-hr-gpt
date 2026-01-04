import { Bell } from '@phosphor-icons/react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { CloseButton } from '../../components/common/index';
import { ProgressBar } from '../../components/feedback/Progress';
import { Evaluation, Member, Team } from '../../constants';
import { isNotificationProxyConfigured, sendEvaluationReminder } from '../../services/notificationService';

interface CampaignMonitoringModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluation: Evaluation;
    teams: Team[];
}

interface ParticipantStatus {
    name: string;
    team: string;
    status: 'completed' | 'in_progress' | 'not_started';
    progress: number;
}

const useParticipants = (evaluation: Evaluation, teams: Team[]) =>
    useMemo(() => {
        const allMembers: Member[] = teams
            .flatMap((t) => {
                if ('members' in t) return (t as any).members;
                if ('parts' in t) return t.parts.flatMap((p) => p.members);
                return [];
            })
            .filter((m) => m.status === 'active' || m.status === 'intern');

        return allMembers
            .map((m, idx) => {
                const seed = evaluation.id.toString().charCodeAt(0) + idx;
                const isCompleted = seed % 100 < evaluation.progress;
                let status: ParticipantStatus['status'] = 'not_started';
                let progress = 0;
                if (isCompleted) {
                    status = 'completed';
                    progress = 100;
                } else if (seed % 100 < evaluation.progress + 20) {
                    status = 'in_progress';
                    progress = (seed % 80) + 10;
                }
                return { name: m.name, team: m.role || 'Team Member', status, progress };
            })
            .slice(0, 15);
    }, [evaluation, teams]);

const useParticipantStats = (participants: ParticipantStatus[]) =>
    useMemo(
        () => ({
            total: participants.length,
            completed: participants.filter((p) => p.status === 'completed').length,
            inProgress: participants.filter((p) => p.status === 'in_progress').length,
            notStarted: participants.filter((p) => p.status === 'not_started').length,
        }),
        [participants]
    );

const StatCard = memo(
    ({ value, label, color = 'text-slate-900' }: { value: number; label: string; color?: string }) => (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{label}</div>
        </div>
    )
);
StatCard.displayName = 'StatCard';

const RemindResultBadge = memo(({ result }: { result: 'idle' | 'success' | 'error' | 'no_webhook' }) => {
    if (result === 'success')
        return <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">✓ 발송 완료!</span>;
    if (result === 'error')
        return <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">✗ 발송 실패</span>;
    if (result === 'no_webhook')
        return (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">⚠ Webhook 미설정</span>
        );
    return null;
});
RemindResultBadge.displayName = 'RemindResultBadge';

const StatusBadge = memo(({ status }: { status: ParticipantStatus['status'] }) => {
    const config = {
        completed: ['bg-green-100 text-green-700', '완료'],
        in_progress: ['bg-primary/10 text-primary', '진행 중'],
        not_started: ['bg-slate-100 text-slate-600', '미시작'],
    };
    const [className, label] = config[status];
    return <span className={`px-2 py-1 text-xs font-bold rounded-full ${className}`}>{label}</span>;
});
StatusBadge.displayName = 'StatusBadge';

const ParticipantRow = memo(({ p, idx }: { p: ParticipantStatus; idx: number }) => (
    <tr key={idx} className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="font-medium text-slate-900">{p.name}</div>
            <div className="text-xs text-slate-500">{p.team}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <StatusBadge status={p.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap w-1/3">
            <div className="flex items-center gap-3">
                <div className="w-full">
                    <ProgressBar progress={p.progress} />
                </div>
                <span className="text-xs font-medium text-slate-500 w-8 text-right">{p.progress}%</span>
            </div>
        </td>
    </tr>
));
ParticipantRow.displayName = 'ParticipantRow';

export const CampaignMonitoringModal: React.FC<CampaignMonitoringModalProps> = ({
    isOpen,
    onClose,
    evaluation,
    teams,
}) => {
    const [remindSending, setRemindSending] = useState(false);
    const [remindResult, setRemindResult] = useState<'idle' | 'success' | 'error' | 'no_webhook'>('idle');
    const participants = useParticipants(evaluation, teams);
    const stats = useParticipantStats(participants);

    const handleRemindAll = useCallback(async () => {
        if (!isNotificationProxyConfigured()) {
            setRemindResult('no_webhook');
            setTimeout(() => setRemindResult('idle'), 3000);
            return;
        }
        setRemindSending(true);
        setRemindResult('idle');
        const incompleteUsers = participants.filter((p) => p.status !== 'completed').map((p) => p.name);
        const success = await sendEvaluationReminder(evaluation.name, evaluation.endDate || '미정', incompleteUsers);
        setRemindSending(false);
        setRemindResult(success ? 'success' : 'error');
        setTimeout(() => setRemindResult('idle'), 3000);
    }, [participants, evaluation]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">평가 캠페인 모니터링</h2>
                        <p className="text-sm text-slate-500 mt-1">{evaluation.name}</p>
                    </div>
                    <CloseButton onClick={onClose} />
                </div>
                <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4">
                    <StatCard value={stats.total} label="총 대상자" />
                    <StatCard value={stats.completed} label="완료" color="text-green-600" />
                    <StatCard value={stats.inProgress} label="진행 중" color="text-primary" />
                    <StatCard value={stats.notStarted} label="미시작" color="text-red-500" />
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800">참여자 상세 현황</h3>
                        <div className="flex items-center gap-2">
                            <RemindResultBadge result={remindResult} />
                            <button
                                onClick={handleRemindAll}
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {participants.map((p, idx) => (
                                    <ParticipantRow key={idx} p={p} idx={idx} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};
