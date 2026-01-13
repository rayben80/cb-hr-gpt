import { Plus } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { Member, Part, Team } from '../../constants';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';
import { PartSection } from './PartSection';

interface TeamCardCompactContentProps {
    team: Team;
    baseDate: string;
    searchTerm: string;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: Member) => void;
    onDeleteMember: (member: Member) => void;
    onDropMemberInPart: (memberId: string, teamId: string, partId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onMoveMember: (member: Member) => void;
    onAddPart: (e: React.MouseEvent) => void;
    indicatorColor?: string;
}

export const TeamCardCompactContent = memo(
    ({
        team,
        baseDate,
        searchTerm,
        onAddMember,
        onEditMember,
        onDeleteMember,
        onDropMemberInPart,
        onEditPart,
        onDeletePart,
        onMoveMember,
        onAddPart,
        indicatorColor,
    }: TeamCardCompactContentProps) => {
        // Filter direct members (active/intern status)
        const directMembers = (team.members || []).filter((m) => m.status === 'active' || m.status === 'intern');

        return (
            <div className="mt-2 ml-4 pl-4 border-l-2 border-border space-y-2">
                {/* Direct team members section */}
                {directMembers.length > 0 && (
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${indicatorColor || 'bg-slate-400'}`} />
                            <span className="text-sm font-medium text-muted-foreground">
                                팀 직속 ({directMembers.length}명)
                            </span>
                        </div>
                        <div className="pl-4 space-y-1">
                            {directMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={getDisplayAvatarUrl(member.name, member.avatar, member.email)}
                                            alt={member.name}
                                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                        />
                                        <span className="text-sm text-foreground truncate">{member.name}</span>
                                        {member.role && (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {member.role}
                                            </span>
                                        )}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                        <button
                                            onClick={() => onEditMember(member)}
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onMoveMember(member)}
                                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                                        >
                                            📁
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Parts sections */}
                {team.parts.map((part) => (
                    <PartSection
                        key={part.id}
                        part={part}
                        teamId={team.id}
                        onAddMember={onAddMember}
                        onEditMember={onEditMember}
                        onDeleteMember={onDeleteMember}
                        onDropMemberInPart={onDropMemberInPart}
                        onEditPart={onEditPart}
                        onDeletePart={onDeletePart}
                        onMoveMember={onMoveMember}
                        searchTerm={searchTerm}
                        baseDate={baseDate}
                        indicatorColor={indicatorColor}
                    />
                ))}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onAddPart}
                        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary bg-muted/50 hover:bg-muted rounded-lg px-3 py-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" weight="bold" />
                        파트 추가
                    </button>
                </div>
            </div>
        );
    }
);

TeamCardCompactContent.displayName = 'TeamCardCompactContent';
