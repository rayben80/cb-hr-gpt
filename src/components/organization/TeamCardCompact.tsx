import React, { memo, useCallback, useMemo, useState } from 'react';
import { Member, Part, Team } from '../../constants';
import { calculateTotalTeamMembers } from '../../utils/organizationUtils';
import { TeamCardCompactContent } from './TeamCardCompactContent';
import { TeamCardCompactHeader } from './TeamCardCompactHeader';

interface TeamCardCompactProps {
    team: Team;
    onEditTeam: (team: Team) => void;
    onDeleteTeam: (teamId: string) => void;
    onClick?: () => void;
    baseDate: string;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: Member) => void;
    onDeleteMember: (member: Member) => void;
    onDropMemberInPart: (memberId: string, teamId: string, partId: string) => void;
    onAddPart: (teamId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onMoveMember: (member: Member) => void;
    searchTerm: string;
}

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

const isActiveMember = (m: Member) => m.status === 'active' || m.status === 'intern';
const countActiveMembers = (team: Team) => {
    const directActive = (team.members || []).filter(isActiveMember).length;
    const partActive = team.parts.flatMap((p) => p.members).filter(isActiveMember).length;
    return directActive + partActive;
};
// Removed local countTotalMembers

export const TeamCardCompact = memo(
    ({
        team,
        onEditTeam,
        onDeleteTeam,
        onClick,
        baseDate,
        onAddMember,
        onEditMember,
        onDeleteMember,
        onDropMemberInPart,
        onAddPart,
        onEditPart,
        onDeletePart,
        onMoveMember,
        searchTerm,
    }: TeamCardCompactProps) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const toggleExpand = useCallback(
            (e: React.MouseEvent) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
                onClick?.();
            },
            [onClick]
        );

        const totalMembers = useMemo(() => calculateTotalTeamMembers(team), [team]);
        const activeMembers = useMemo(() => countActiveMembers(team), [team]);

        // Generate deterministic theme based on team ID
        const theme = useMemo(
            () =>
                TEAM_COLOR_THEMES[
                    team.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % TEAM_COLOR_THEMES.length
                ],
            [team.id]
        );

        const stop = (e: React.MouseEvent) => e.stopPropagation();
        const handleEdit = useCallback(
            (e: React.MouseEvent) => {
                stop(e);
                onEditTeam(team);
            },
            [onEditTeam, team]
        );
        const handleDelete = useCallback(
            (e: React.MouseEvent) => {
                stop(e);
                onDeleteTeam(team.id);
            },
            [onDeleteTeam, team.id]
        );
        const handleAddPart = useCallback(
            (e: React.MouseEvent) => {
                stop(e);
                onAddPart(team.id);
            },
            [onAddPart, team.id]
        );

        return (
            <div className="flex flex-col">
                <TeamCardCompactHeader
                    team={team}
                    isExpanded={isExpanded}
                    totalMembers={totalMembers}
                    activeMembers={activeMembers}
                    accentColor={theme.border}
                    badgeColor={theme.badge}
                    onToggleExpand={toggleExpand}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                {isExpanded && (
                    <TeamCardCompactContent
                        team={team}
                        baseDate={baseDate}
                        searchTerm={searchTerm}
                        onAddMember={onAddMember}
                        onEditMember={onEditMember}
                        onDeleteMember={onDeleteMember}
                        onDropMemberInPart={onDropMemberInPart}
                        onEditPart={onEditPart}
                        onDeletePart={onDeletePart}
                        onMoveMember={onMoveMember}
                        onAddPart={handleAddPart}
                        indicatorColor={theme.partIndicator}
                    />
                )}
            </div>
        );
    }
);

TeamCardCompact.displayName = 'TeamCardCompact';
