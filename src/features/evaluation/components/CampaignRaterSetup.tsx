import { Info, Warning } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { InputField } from '../../../components/common';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

export interface PeerAvailabilitySummary {
    min: number;
    max: number;
    avg: number;
    targetCount: number;
    leaderMissingCount: number;
}

interface CampaignRaterSetupProps {
    formData: UseCampaignFormReturn['formData'];
    peerAvailability: PeerAvailabilitySummary;
    updateField: UseCampaignFormReturn['updateField'];
    raterGroups: { role: string; weight: number; required?: boolean }[];
}

const PEER_SCOPE_OPTIONS = [
    { value: 'team', label: '같은 팀' },
    { value: 'part', label: '같은 파트' },
    { value: 'all', label: '전체 조직' },
];

const roleLabelMap: Record<string, string> = {
    SELF: '본인',
    LEADER: '상사',
    PEER: '동료',
    MEMBER: '팀원',
};

export const CampaignRaterSetup: React.FC<CampaignRaterSetupProps> = memo(
    ({ formData, peerAvailability, updateField, raterGroups }) => {
        const requiresPeer = raterGroups.some((group) => group.role === 'PEER');
        const includesLeader = raterGroups.some((group) => group.role === 'LEADER');
        const raterSummary = raterGroups
            .map((group) => `${roleLabelMap[group.role] || group.role} ${group.weight}%`)
            .join(' / ');

        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">평가자 지정</h3>
                <div className="bg-primary/10 text-primary p-3 rounded-lg mb-4 text-sm">
                    <Info className="w-4 h-4 inline mr-1 mb-0.5" weight="regular" />
                    <strong>안내:</strong> 평가자 구성은 <u>{raterSummary}</u> 기준으로 자동 배정됩니다.
                </div>

                {!requiresPeer ? (
                    <div className="space-y-3">
                        <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4">
                            동료(PEER) 평가가 포함되지 않아 추가 지정이 필요하지 않습니다.
                        </div>
                        {includesLeader && peerAvailability.leaderMissingCount > 0 && (
                            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <Warning className="w-4 h-4 mt-0.5" weight="regular" />
                                <span>
                                    {peerAvailability.leaderMissingCount}명의 대상자는 상사 정보가 없어 상사 평가가 자동 배정되지
                                    않습니다.
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">동료 평가 범위</Label>
                            <Select
                                value={formData.peerScope}
                                onValueChange={(value) =>
                                    updateField('peerScope', value as CampaignRaterSetupProps['formData']['peerScope'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="평가자 범위를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PEER_SCOPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <InputField
                            label="동료 평가자 수"
                            id="peerCount"
                            name="peerCount"
                            type="number"
                            value={String(formData.peerCount)}
                            onChange={(e) => updateField('peerCount', Number(e.target.value))}
                            placeholder="예: 3"
                            min={1}
                        />

                        <div className="text-sm text-slate-500">
                            가용 동료 수 (대상자 기준): 최소 {peerAvailability.min}명 · 평균 {peerAvailability.avg}명 · 최대{' '}
                            {peerAvailability.max}명
                        </div>

                        {formData.peerCount > peerAvailability.min && (
                            <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                                <Warning className="w-4 h-4 mt-0.5" weight="regular" />
                                <span>
                                    일부 대상자는 동료 평가자가 부족합니다. 동료 평가자 수를 줄이거나 평가 범위를 넓혀주세요.
                                </span>
                            </div>
                        )}

                        {peerAvailability.leaderMissingCount > 0 && (
                            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <Warning className="w-4 h-4 mt-0.5" weight="regular" />
                                <span>
                                    {peerAvailability.leaderMissingCount}명의 대상자는 상사 정보가 없어 상사 평가가 자동 배정되지
                                    않습니다.
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

CampaignRaterSetup.displayName = 'CampaignRaterSetup';
