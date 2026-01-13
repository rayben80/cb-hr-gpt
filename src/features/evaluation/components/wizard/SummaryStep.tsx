import { EvaluationTemplate, Member, Team } from '@/constants';
import { CampaignDraft } from '@/hooks/evaluation/useCampaignWizard';
import { Calendar, CheckCircle, Target, Users } from '@phosphor-icons/react';
import { memo, useMemo } from 'react';

interface SummaryStepProps {
    template: EvaluationTemplate | null | undefined;
    draft: CampaignDraft | null;
    teams: Team[];
    members: Member[];
}

export const SummaryStep = memo(({ template, draft, teams, members }: SummaryStepProps) => {
    const targetSummary = useMemo(() => {
        if (!draft) return { label: '', count: 0 };
        const { target } = draft;
        if (target.type === 'all') {
            return { label: '전체 구성원', count: members.length };
        }
        if (target.type === 'team') {
            const selectedTeams = teams.filter((t) => target.teamIds.includes(t.id));
            const count = members.filter((m) => target.teamIds.includes(m.teamId || '')).length;
            return { label: selectedTeams.map((t) => t.name).join(', '), count };
        }
        const selectedMembers = members.filter((m) => target.memberIds.includes(m.id));
        return { label: selectedMembers.map((m) => m.name).join(', '), count: selectedMembers.length };
    }, [draft, teams, members]);

    if (!template || !draft) {
        return <div className="text-center text-slate-400 py-12">데이터를 불러올 수 없습니다.</div>;
    }

    const summaryItems = [
        {
            icon: Target,
            label: '템플릿',
            value: template.name,
            subValue: `${template.type} · ${template.category}`,
        },
        {
            icon: Users,
            label: '평가 대상',
            value: targetSummary.label,
            subValue: `${targetSummary.count}명`,
        },
        {
            icon: Calendar,
            label: '평가 기간',
            value: draft.period.name,
            subValue: `${new Date(draft.period.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(draft.period.endDate).toLocaleDateString('ko-KR')}`,
        },
    ];

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" weight="fill" />
                <h3 className="text-xl font-bold text-slate-800">평가 캠페인 생성 준비 완료!</h3>
                <p className="text-slate-500 mt-1">아래 내용을 확인하고 평가를 시작하세요.</p>
            </div>

            <div className="space-y-4">
                {summaryItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-4"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-500">{item.label}</p>
                                <p className="font-semibold text-slate-800 truncate">{item.value}</p>
                                <p className="text-sm text-slate-400">{item.subValue}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {draft.period.isRecurring && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                    <strong>반복 평가:</strong>{' '}
                    {
                        { monthly: '매월', quarterly: '분기마다', yearly: '매년' }[
                            draft.period.recurringType || 'monthly'
                        ]
                    }{' '}
                    자동으로 새 평가 캠페인이 생성됩니다.
                </div>
            )}
        </div>
    );
});
SummaryStep.displayName = 'SummaryStep';
