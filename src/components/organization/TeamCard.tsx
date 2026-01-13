/* eslint-disable max-lines-per-function */
/* eslint-disable max-nested-callbacks */
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Member as MemberType, Part, Team } from '../../constants';
import { ConfirmationActions } from '../../hooks/common/useConfirmation';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';
import { DEFAULT_MEMBER_ROLE, normalizeMemberRole } from '../../utils/memberRoleUtils';
import { calculateTotalTeamMembers } from '../../utils/organizationUtils';
import { Avatar, AvatarGroup, Badge, Card, Modal } from '../common';
import { Member } from './Member';
import { PartSection } from './PartSection';
import { TeamCardHeader } from './TeamCardHeader';

// --- Color Themes ---
const TEAM_COLOR_THEMES = [
    {
        border: 'border-l-cyan-600',
        badge: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200',
        partIndicator: 'bg-cyan-400',
    },
    {
        border: 'border-l-teal-500',
        badge: 'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200',
        partIndicator: 'bg-teal-400',
    },
    {
        border: 'border-l-amber-500',
        badge: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
        partIndicator: 'bg-amber-400',
    },
    {
        border: 'border-l-rose-500',
        badge: 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200',
        partIndicator: 'bg-rose-400',
    },
    {
        border: 'border-l-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
        partIndicator: 'bg-emerald-400',
    },
    {
        border: 'border-l-indigo-500',
        badge: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200',
        partIndicator: 'bg-indigo-400',
    },
    {
        border: 'border-l-violet-500',
        badge: 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200',
        partIndicator: 'bg-violet-400',
    },
];

// --- Sub-components ---
const MemberAvatarGroup = memo(
    ({ members, limit = 5, onViewAll }: { members: MemberType[]; limit?: number; onViewAll?: () => void }) => {
        if (!members.length) return <div className="text-xs text-muted-foreground">구성원 없음</div>;
        const hasMore = members.length > limit;
        return (
            <div className="flex items-center gap-2">
                <AvatarGroup limit={limit}>
                    {members.map((m) => (
                        <Avatar
                            key={m.id}
                            src={getDisplayAvatarUrl(m.name, m.avatar, m.email)}
                            fallback={m.name}
                            alt={m.name}
                            title={`${m.name} (${m.role})`}
                        />
                    ))}
                </AvatarGroup>
                {hasMore && onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-xs text-primary hover:text-primary/80 hover:underline whitespace-nowrap"
                    >
                        전체 보기
                    </button>
                )}
            </div>
        );
    }
);

const PartChipList = memo(({ parts, badgeStyle }: { parts: Part[]; badgeStyle: string }) => {
    if (!parts.length) return null;
    return (
        <div className="flex flex-wrap gap-1.5 mt-2">
            {parts.map((part) => (
                <Badge key={part.id} variant="outline" className={`border ${badgeStyle}`}>
                    {part.title}
                </Badge>
            ))}
        </div>
    );
});

import { SaveMemberOptions } from '../../hooks/organization/useMemberOperations';

interface TeamCardProps {
    team: Team;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: MemberType) => void;
    onDeleteMember: (member: MemberType) => void;
    onAddPart: (teamId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onEditTeam: (team: Team) => void;
    onDeleteTeam: (teamId: string) => void;

    onUpdateMember: (member: MemberType, isEditing: boolean, options?: SaveMemberOptions) => Promise<void>;
    onMoveMember: (member: MemberType) => void;
    confirmationActions: ConfirmationActions;
    searchTerm: string;
    isFiltered?: boolean;
    baseDate: string;
}

export const TeamCard: React.FC<TeamCardProps> = memo(
    ({
        team,
        onAddMember,
        onEditMember,
        onDeleteMember,
        onAddPart,
        onEditPart,
        onDeletePart,
        onEditTeam,
        onDeleteTeam,
        onUpdateMember,
        onMoveMember,
        confirmationActions,
        searchTerm,
        isFiltered = false,
        baseDate,
    }) => {
        const [isCollapsed, setIsCollapsed] = useState(false);

        const { memberCountText, isTeamEmpty, shouldRender, allMembers, directMembers, theme } = useMemo(() => {
            const directMembersList = team.members || [];
            const filtered = calculateTotalTeamMembers(team);
            const original = team.originalTotalMemberCount || 0;
            const isFiltering = Boolean(searchTerm) || isFiltered;

            // Generate deterministic theme based on team ID
            const themeIndex =
                team.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % TEAM_COLOR_THEMES.length;

            return {
                memberCountText: isFiltering ? `${filtered} / ${original}` : original.toString(),
                isTeamEmpty: original === 0,
                shouldRender: isFiltering ? filtered > 0 : true,
                allMembers: [...directMembersList, ...team.parts.flatMap((p) => p.members)],
                directMembers: directMembersList.filter((m) => m.status !== 'resigned' && m.status !== 'on_leave'),
                theme: TEAM_COLOR_THEMES[themeIndex],
            };
        }, [team, searchTerm, isFiltered]);

        // Fallback: If no explicit team lead is set, try to find a member with '팀장' in their role Or 'Lead'
        const derivedTeamLead = useMemo(() => {
            if (team.lead) return team.lead;
            const potentialLead = allMembers.find(
                (m) => m.role.includes('팀장') || m.role.toLowerCase().includes('team lead')
            );
            return potentialLead ? potentialLead.name : '';
        }, [team.lead, allMembers]);

        const handleEditTeam = useCallback(() => onEditTeam(team), [onEditTeam, team]);
        const handleDeleteTeam = useCallback(() => onDeleteTeam(team.id), [onDeleteTeam, team.id]);
        const handleAddPart = useCallback(() => onAddPart(team.id), [onAddPart, team.id]);
        const handleAddDirectMember = useCallback(() => onAddMember(team.id, ''), [onAddMember, team.id]);
        const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

        const handleAssignTeamLead = useCallback(
            (member: MemberType) => {
                confirmationActions.showConfirmation({
                    title: '팀장 임명',
                    message: `${member.name}님을 ${team.name}의 팀장으로 임명하시겠습니까?`,
                    confirmButtonText: '임명',
                    confirmButtonColor: 'primary',
                    onConfirm: async () => {
                        // Find partId if not present
                        let actualPartId = member.partId;
                        if (actualPartId === undefined || actualPartId === null) {
                            const part = team.parts.find((p) => p.members.some((m) => m.id === member.id));
                            actualPartId = part?.id ?? undefined;
                        }

                        // Update Member Role to "팀장"
                        const newRole = '팀장';
                        const nextRoleBeforeLead =
                            member.role === '팀장' ? member.roleBeforeLead : normalizeMemberRole(member.role);
                        await onUpdateMember(
                            {
                                ...member,
                                role: newRole,
                                roleBeforeLead: nextRoleBeforeLead,
                                teamId: team.id,
                                partId: actualPartId ?? '',
                            } as any,
                            true,
                            { keepOpen: false, setTeamLead: true }
                        );
                    },
                });
            },
            [team.id, team.name, team.parts, onUpdateMember, confirmationActions]
        );

        const handleRemoveTeamLead = useCallback(
            (member: MemberType) => {
                confirmationActions.showConfirmation({
                    title: '팀장 해임',
                    message: `${member.name}님의 팀장 직책을 해제하시겠습니까?`,
                    confirmButtonText: '해임',
                    confirmButtonColor: 'destructive',
                    onConfirm: async () => {
                        // Find partId if not present
                        let actualPartId = member.partId;
                        let targetPart = null;
                        if (actualPartId === undefined || actualPartId === null) {
                            targetPart = team.parts.find((p) => p.members.some((m) => m.id === member.id));
                            actualPartId = targetPart?.id ?? undefined;
                        } else {
                            targetPart = team.parts.find((p) => p.id === actualPartId);
                        }

                        // Restore Member Role to default
                        const restoredRole = member.roleBeforeLead
                            ? normalizeMemberRole(member.roleBeforeLead)
                            : DEFAULT_MEMBER_ROLE;
                        const newRole = restoredRole === '팀장' ? DEFAULT_MEMBER_ROLE : restoredRole;

                        await onUpdateMember(
                            {
                                ...member,
                                role: newRole,
                                roleBeforeLead: undefined,
                                teamId: team.id,
                                partId: actualPartId ?? '',
                            } as any,
                            true,
                            { keepOpen: false, clearTeamLead: true }
                        );
                    },
                });
            },
            [team.id, team.parts, onUpdateMember, confirmationActions]
        );

        const [showMemberList, setShowMemberList] = useState(false);
        const handleViewAllMembers = useCallback(() => setShowMemberList(true), []);

        // droppable for the Team Card itself (allows dropping directly onto the team)
        const { setNodeRef } = useDroppable({
            id: `team-${team.id}`,
            data: { type: 'team', id: team.id },
        });

        if (!shouldRender) return null;

        return (
            <>
                <Card
                    className={`border-l-4 ${theme.border} p-3 sm:p-4 rounded-xl space-y-2 flex flex-col h-full hover:shadow-primary-lg`}
                    hoverEffect
                    ref={setNodeRef}
                >
                    <TeamCardHeader
                        teamName={team.name}
                        memberCountText={memberCountText}
                        teamLead={derivedTeamLead}
                        isTeamEmpty={isTeamEmpty}
                        isCollapsed={isCollapsed}
                        onAddPart={handleAddPart}
                        onAddDirectMember={handleAddDirectMember}
                        onToggleCollapse={toggleCollapse}
                        onEditTeam={handleEditTeam}
                        onDeleteTeam={handleDeleteTeam}
                    />
                    <div className="px-2 pb-2">
                        <MemberAvatarGroup members={allMembers} onViewAll={handleViewAllMembers} />
                        <PartChipList parts={team.parts} badgeStyle={theme.badge} />
                    </div>
                    {!isCollapsed && (
                        <div className="space-y-1 sm:space-y-2 flex-grow">
                            {/* Direct team members section */}
                            {directMembers.length > 0 && (
                                <SortableContext
                                    items={directMembers.map((m) => m.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${theme.partIndicator}`} />
                                            <span className="text-xs font-medium text-slate-600">팀 직속</span>
                                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                {directMembers.length}명
                                            </Badge>
                                        </div>
                                        <div className="divide-y divide-border/50 border-t border-slate-200/50 mt-1">
                                            {directMembers.map((member) => (
                                                <Member
                                                    key={member.id}
                                                    member={member}
                                                    onEdit={onEditMember}
                                                    onDelete={onDeleteMember}
                                                    onMove={onMoveMember}
                                                    baseDate={baseDate}
                                                    isTeamLead={derivedTeamLead === member.name}
                                                    onAssignTeamLead={handleAssignTeamLead}
                                                    onRemoveTeamLead={handleRemoveTeamLead}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </SortableContext>
                            )}
                            {team.parts.map((part) => (
                                <PartSection
                                    key={part.id}
                                    part={part}
                                    teamId={team.id}
                                    onAddMember={onAddMember}
                                    onEditMember={onEditMember}
                                    onDeleteMember={onDeleteMember}
                                    onEditPart={onEditPart}
                                    onDeletePart={onDeletePart}
                                    onMoveMember={onMoveMember}
                                    onAssignTeamLead={handleAssignTeamLead}
                                    onRemoveTeamLead={handleRemoveTeamLead}
                                    searchTerm={searchTerm}
                                    baseDate={baseDate}
                                    indicatorColor={theme.partIndicator}
                                    {...(derivedTeamLead && { teamLead: derivedTeamLead })}
                                />
                            ))}
                        </div>
                    )}
                </Card>

                {/* Member List Modal */}
                <Modal
                    open={showMemberList}
                    onOpenChange={setShowMemberList}
                    title={`${team.name} 구성원 (${allMembers.length}명)`}
                >
                    <div className="max-h-[60vh] overflow-y-auto">
                        <div className="divide-y divide-border">
                            {allMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                                    onClick={() => {
                                        onEditMember(member);
                                        setShowMemberList(false);
                                    }}
                                >
                                    <Avatar
                                        src={getDisplayAvatarUrl(member.name, member.avatar, member.email)}
                                        fallback={member.name}
                                        alt={member.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{member.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                                    </div>
                                    {derivedTeamLead === member.name && (
                                        <Badge variant="secondary" className="text-xs">
                                            팀장
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            </>
        );
    }
);

TeamCard.displayName = 'TeamCard';
