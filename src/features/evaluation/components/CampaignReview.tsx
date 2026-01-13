import React, { memo } from 'react';
import { EvaluationTemplate } from '../../../constants';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

interface CampaignReviewProps {
    formData: UseCampaignFormReturn['formData'];
    today: string;
    selectedMembersCount: number;
    templates: EvaluationTemplate[];
    raterProfileOptions: { value: string; label: string }[];
    cycleKey: string;
    raterGroups: { role: string; weight: number; required?: boolean }[];
    peerAvailability: {
        min: number;
        max: number;
        avg: number;
        leaderMissingCount: number;
    };
}

type ReviewRowData = {
    label: string;
    value: string;
    helper?: string | undefined;
    tone?: 'default' | 'warning' | undefined;
};

const ReviewRow = ({
    label,
    value,
    helper,
    tone = 'default',
}: {
    label: string;
    value: string;
    helper?: string | undefined;
    tone?: 'default' | 'warning' | undefined;
}) => (
    <div className={tone === 'warning' ? 'text-sm text-amber-600' : undefined}>
        <span className="font-semibold text-slate-600">{label}:</span> {value}
        {helper && tone === 'default' && <span className="text-slate-500"> {helper}</span>}
    </div>
);

const roleLabels: Record<string, string> = {
    SELF: '본인',
    LEADER: '상사',
    PEER: '동료',
    MEMBER: '팀원',
};

const peerScopeLabelMap: Record<string, string> = {
    team: '같은 팀',
    part: '같은 파트',
    all: '전체 조직',
};

const adjustmentModeLabelMap: Record<string, string> = {
    points: '점수 보정 (±점)',
    percent: '비율 보정 (±%)',
};

const hqRuleLabelMap: Record<string, string> = {
    after_leader_submit: '팀장 평가 완료 후 보정',
    after_leader_adjustment: '팀장 보정 입력 후 보정',
    anytime: '제한 없음',
};

const buildPeerRow = ({
    requiresPeer,
    peerScope,
    peerCount,
    peerAvailability,
}: {
    requiresPeer: boolean;
    peerScope: string;
    peerCount: number;
    peerAvailability: CampaignReviewProps['peerAvailability'];
}) => {
    if (!requiresPeer) return { value: '', helper: undefined };
    return {
        value: `${peerScopeLabelMap[peerScope] || peerScope} · ${peerCount}명`,
        helper: `(가용 최소 ${peerAvailability.min}명, 평균 ${peerAvailability.avg}명)`,
    };
};

const buildLeaderMissingRow = ({
    includesLeader,
    leaderMissingCount,
}: {
    includesLeader: boolean;
    leaderMissingCount: number;
}) => {
    if (!includesLeader || leaderMissingCount <= 0) return { value: '', tone: 'default' as const };
    return { value: `대상자 ${leaderMissingCount}명`, tone: 'warning' as const };
};

const resolveScheduleStart = (timing: CampaignReviewProps['formData']['timing'], today: string, startDate: string) =>
    timing === 'now' ? today : startDate;

const buildReviewRows = ({
    formData,
    today,
    selectedMembersCount,
    selectedTemplateName,
    raterProfileLabel,
    raterSummary,
    peerAvailability,
    cycleKey,
    requiresPeer,
    includesLeader,
}: {
    formData: CampaignReviewProps['formData'];
    today: string;
    selectedMembersCount: number;
    selectedTemplateName: string;
    raterProfileLabel: string;
    raterSummary: string;
    peerAvailability: CampaignReviewProps['peerAvailability'];
    cycleKey: string;
    requiresPeer: boolean;
    includesLeader: boolean;
}): ReviewRowData[] => {
    const adjustmentModeLabel = adjustmentModeLabelMap[formData.adjustmentMode] || formData.adjustmentMode;
    const adjustmentRangeSuffix = formData.adjustmentMode === 'percent' ? '%' : '점';
    const hqRuleLabel = hqRuleLabelMap[formData.hqAdjustmentRule] || '미지정';
    const peerRow = buildPeerRow({
        requiresPeer,
        peerScope: formData.peerScope,
        peerCount: formData.peerCount,
        peerAvailability,
    });
    const leaderRow = buildLeaderMissingRow({
        includesLeader,
        leaderMissingCount: peerAvailability.leaderMissingCount,
    });
    const hqRuleValue = formData.allowHqFinalOverride ? hqRuleLabel : '';
    const scheduleStart = resolveScheduleStart(formData.timing, today, formData.startDate);

    return [
        { label: '평가명', value: formData.name },
        { label: '평가 구분', value: formData.period },
        { label: '주기 키', value: cycleKey },
        { label: '평가 유형', value: formData.evaluationType },
        { label: '리포팅 분류', value: formData.reportingCategory || '미지정' },
        {
            label: '평가자 구성',
            value: raterProfileLabel,
            helper: raterSummary ? `(${raterSummary})` : undefined,
        },
        { label: '점수 척도', value: formData.ratingScale },
        { label: '동료 평가 설정', value: peerRow.value, helper: peerRow.helper },
        { label: '상사 미지정', value: leaderRow.value, tone: leaderRow.tone },
        { label: '집계 방식', value: formData.scoringRule },
        { label: '보정 방식', value: adjustmentModeLabel },
        { label: '보정 범위', value: `±${formData.adjustmentRange}${adjustmentRangeSuffix}` },
        {
            label: '재열람/재제출',
            value: `${formData.allowReview ? '재열람 ON' : '재열람 OFF'} · ${
                formData.allowResubmission ? '재제출 ON' : '재제출 OFF'
            }`,
        },
        {
            label: '본부장 최종 보정',
            value: formData.allowHqFinalOverride ? '허용' : '미허용',
        },
        { label: '본부장 보정 조건', value: hqRuleValue },
        {
            label: '시작 방식',
            value: formData.timing === 'now' ? '즉시 시작' : '예약 시작',
        },
        {
            label: '평가 일정',
            value: `${scheduleStart} ~ ${formData.endDate}`,
        },
        { label: '템플릿', value: selectedTemplateName },
        { label: '대상자', value: `총 ${selectedMembersCount}명` },
    ];
};

export const CampaignReview: React.FC<CampaignReviewProps> = memo(
    ({
        formData,
        today,
        selectedMembersCount,
        templates,
        raterProfileOptions,
        cycleKey,
        raterGroups,
        peerAvailability,
    }) => {
        const selectedTemplate = templates.find((template) => template.id === formData.templateId);
        const raterProfileLabel =
            raterProfileOptions.find((option) => option.value === formData.raterProfile)?.label || '미지정';
        const raterSummary = raterGroups
            .map((group) => `${roleLabels[group.role] || group.role}:${group.weight}%`)
            .join(' / ');
        const requiresPeer = raterGroups.some((group) => group.role === 'PEER');
        const includesLeader = raterGroups.some((group) => group.role === 'LEADER');
        const reviewRows = buildReviewRows({
            formData,
            today,
            selectedMembersCount,
            selectedTemplateName: selectedTemplate?.name || '',
            raterProfileLabel,
            raterSummary,
            peerAvailability,
            cycleKey,
            requiresPeer,
            includesLeader,
        });

        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">입력하신 정보를 확인해주세요.</h3>
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    {reviewRows
                        .filter((row) => row.value)
                        .map((row) => (
                            <ReviewRow
                                key={row.label}
                                label={row.label}
                                value={row.value}
                                helper={row.helper}
                                tone={row.tone}
                            />
                        ))}
                </div>
            </div>
        );
    }
);

CampaignReview.displayName = 'CampaignReview';
