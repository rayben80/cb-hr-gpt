import { Info } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { Checkbox } from '../../../components/common';
import { Part, Team } from '../../../constants';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

interface CampaignTargetSelectorProps {
    teams: Team[];
    selectedMembers: Set<string>;
    sortedSelectedMembers: string[];
    toggleMember: UseCampaignFormReturn['toggleMember'];
    toggleGroup: UseCampaignFormReturn['toggleGroup'];
    getGroupMembers: UseCampaignFormReturn['getGroupMembers'];
    getGroupSelectionState: UseCampaignFormReturn['getGroupSelectionState'];
}

export const CampaignTargetSelector: React.FC<CampaignTargetSelectorProps> = memo(
    ({
        teams,
        selectedMembers,
        sortedSelectedMembers,
        toggleMember,
        toggleGroup,
        getGroupMembers,
        getGroupSelectionState,
    }) => {
        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">평가 대상자(피평가자)를 선택해주세요.</h3>
                <div className="bg-primary/10 text-primary p-3 rounded-lg mb-4 text-sm">
                    <Info className="w-4 h-4 inline mr-1 mb-0.5" weight="regular" />
                    <strong>안내:</strong> 선택된 인원은 평가를 받는 <u>대상자</u>입니다. 동료(PEER) 평가는 동료만,
                    다면 평가는 상사/동료/본인 등 복수 관계로 다음 단계에서 평가자를 지정합니다.
                </div>
                <p className="text-sm text-slate-500 mb-4">재직/인턴 구성원만 표시됩니다.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
                    {/* Left: Team/Part/Member tree */}
                    <div className="border border-slate-200 rounded-lg overflow-y-auto p-4">
                        <div className="space-y-4">
                            {teams.map((team) => {
                                const teamState = getGroupSelectionState(team);
                                return (
                                    <div key={team.name}>
                                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50">
                                            <Checkbox {...teamState} onChange={() => toggleGroup(team)} />
                                            <span className="font-bold text-slate-800">{team.name}</span>
                                        </div>
                                        <div className="pl-6 mt-2 space-y-2">
                                            {team.parts.map((part: Part) => {
                                                const partState = getGroupSelectionState(part);
                                                const eligibleMembers = getGroupMembers(part);
                                                return (
                                                    <div key={part.title}>
                                                        <div className="flex items-center space-x-3 p-1">
                                                            <Checkbox
                                                                {...partState}
                                                                onChange={() => toggleGroup(part)}
                                                            />
                                                            <span className="font-semibold text-slate-700">
                                                                {part.title}
                                                            </span>
                                                        </div>
                                                        <div className="pl-8 mt-1 space-y-1">
                                                            {eligibleMembers.length === 0 ? (
                                                                <p className="text-xs text-slate-400">대상 없음</p>
                                                            ) : (
                                                                eligibleMembers.map((member) => (
                                                                    <div
                                                                        key={member.name}
                                                                        className="flex items-center space-x-3 p-1"
                                                                    >
                                                                        <Checkbox
                                                                            checked={selectedMembers.has(member.name)}
                                                                            onChange={() => toggleMember(member.name)}
                                                                            indeterminate={false}
                                                                        />
                                                                        <span className="text-sm text-slate-600">
                                                                            {member.name}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Selected members list */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 mb-3">선택된 대상자 ({selectedMembers.size}명)</h4>
                        <div className="overflow-y-auto h-[380px] text-sm text-slate-700 space-y-1">
                            {sortedSelectedMembers.map((name) => (
                                <div key={name} className="p-1.5 bg-white rounded">
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CampaignTargetSelector.displayName = 'CampaignTargetSelector';
