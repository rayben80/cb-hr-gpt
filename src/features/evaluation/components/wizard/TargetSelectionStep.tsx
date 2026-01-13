/* eslint-disable max-lines-per-function */
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Member, Team } from '@/constants';
import { WizardTarget } from '@/hooks/evaluation/useCampaignWizard';
import { Buildings, User, Users } from '@phosphor-icons/react';
import { memo, useMemo } from 'react';

interface TargetSelectionStepProps {
    target: WizardTarget;
    onUpdate: (updates: Partial<WizardTarget>) => void;
    teams: Team[];
    members: Member[];
    currentUserEmail?: string;
}

export const TargetSelectionStep = memo(
    ({ target, onUpdate, teams, members, currentUserEmail }: TargetSelectionStepProps) => {
        const targetOptions = [
            { type: 'all' as const, label: '전체', icon: Users, description: '모든 구성원을 대상으로 평가합니다.' },
            { type: 'team' as const, label: '팀별', icon: Buildings, description: '선택한 팀의 구성원만 평가합니다.' },
            {
                type: 'individual' as const,
                label: '개인',
                icon: User,
                description: '특정 개인만 선택하여 평가합니다.',
            },
        ];

        const membersByTeam = useMemo(() => {
            const grouped: Record<string, Member[]> = {};

            for (const member of members) {
                // Filter out current user based on includeSelf
                if (!target.includeSelf && currentUserEmail && member.email === currentUserEmail) continue;

                const teamId = member.teamId || 'unassigned';
                if (!grouped[teamId]) grouped[teamId] = [];
                grouped[teamId].push(member);
            }
            return grouped;
        }, [members, currentUserEmail, target.includeSelf]);

        const selectedMemberCount = useMemo(() => {
            if (target.type === 'all') {
                return members.filter((m) => target.includeSelf || !currentUserEmail || m.email !== currentUserEmail)
                    .length;
            }
            if (target.type === 'team') {
                return target.teamIds.reduce((acc, teamId) => acc + (membersByTeam[teamId]?.length || 0), 0);
            }
            return target.memberIds.length;
        }, [target, members, membersByTeam, currentUserEmail]);

        return (
            <div className="space-y-6">
                {/* Target Type Selection */}
                <div className="grid grid-cols-3 gap-4">
                    {targetOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = target.type === option.type;
                        return (
                            <button
                                key={option.type}
                                onClick={() => onUpdate({ type: option.type, teamIds: [], memberIds: [] })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                                <div className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                    {option.label}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Team Selection */}
                {target.type === 'team' && teams.length > 0 && (
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 mb-3">팀 선택</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {teams.map((team) => {
                                    const isSelected = target.teamIds.includes(team.id);
                                    const memberCount = membersByTeam[team.id]?.length || 0;
                                    return (
                                        <Button
                                            key={team.id}
                                            variant={isSelected ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                const newTeamIds = isSelected
                                                    ? target.teamIds.filter((id) => id !== team.id)
                                                    : [...target.teamIds, team.id];
                                                onUpdate({ teamIds: newTeamIds });
                                            }}
                                            className="justify-start"
                                        >
                                            {team.name} ({memberCount}명)
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Include Self Toggle */}
                        {currentUserEmail && (
                            <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <Checkbox
                                    id="includeSelf"
                                    checked={target.includeSelf}
                                    onChange={(e) => onUpdate({ includeSelf: e.target.checked })}
                                />
                                <label
                                    htmlFor="includeSelf"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                                >
                                    평가 대상에 본인 포함
                                    <span className="block text-xs text-slate-500 mt-1 font-normal">
                                        체크하면 로그인한 계정({currentUserEmail})도 평가 대상자 목록에 포함됩니다.
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                )}

                {/* Individual Selection */}
                {target.type === 'individual' && members.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                        <h4 className="font-semibold text-slate-700 mb-3">구성원 선택</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {members.map((member) => {
                                const isSelected = target.memberIds.includes(member.id);
                                const team = teams.find((t) => t.id === member.teamId);
                                const isCurrentUser = currentUserEmail && member.email === currentUserEmail;
                                return (
                                    <Button
                                        key={member.id}
                                        variant={isSelected ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            const newMemberIds = isSelected
                                                ? target.memberIds.filter((id) => id !== member.id)
                                                : [...target.memberIds, member.id];
                                            onUpdate({ memberIds: newMemberIds });
                                        }}
                                        className={`justify-start text-left ${
                                            isCurrentUser ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : ''
                                        }`}
                                    >
                                        <div className="truncate w-full">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{member.name}</span>
                                                {isCurrentUser && (
                                                    <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1 rounded">
                                                        나
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs opacity-70 truncate">{team?.name || '미배정'}</div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-slate-600">
                        선택된 평가 대상: <span className="font-bold text-primary">{selectedMemberCount}명</span>
                    </p>
                </div>
            </div>
        );
    }
);
TargetSelectionStep.displayName = 'TargetSelectionStep';
