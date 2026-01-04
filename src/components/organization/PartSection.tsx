import React, { memo, useCallback, useMemo, useState } from 'react';
import { Member as MemberType, Part } from '../../constants';
import { usePartDragDrop } from '../../hooks/usePartDragDrop';
import { Member } from './Member';
import { PartEmptyState } from './PartEmptyState';
import { PartHeader } from './PartHeader';

interface PartSectionProps {
    part: Part & { originalMemberCount?: number };
    teamId: string;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: MemberType) => void;
    onDeleteMember: (member: MemberType) => void;
    onDropMemberInPart: (memberId: string, teamId: string, partId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onMoveMember: (member: MemberType) => void;
    onAssignTeamLead?: (member: MemberType) => void;
    onRemoveTeamLead?: (member: MemberType) => void;
    searchTerm: string;
    baseDate: string;
    indicatorColor?: string | undefined;
    teamLead?: string;
}

export const PartSection: React.FC<PartSectionProps> = memo(
    ({
        part,
        teamId,
        onAddMember,
        onEditMember,
        onDeleteMember,
        onDropMemberInPart,
        onEditPart,
        onDeletePart,
        onMoveMember,
        onAssignTeamLead,
        onRemoveTeamLead,
        searchTerm,
        baseDate,
        indicatorColor,
        teamLead,
    }) => {
        const [isOpen, setIsOpen] = useState(true);
        const { isDragOver, dragHandlers } = usePartDragDrop({
            onDropMember: useCallback(
                (memberId: string) => onDropMemberInPart(memberId, teamId, part.id),
                [onDropMemberInPart, teamId, part.id]
            ),
        });

        const memberCountText = useMemo(
            () => (searchTerm ? `${part.members.length} / ${part.originalMemberCount}` : part.members.length),
            [searchTerm, part.members.length, part.originalMemberCount]
        );
        const handleAddMember = useCallback(() => onAddMember(teamId, part.id), [onAddMember, teamId, part.id]);
        const handleEditPart = useCallback(() => onEditPart(teamId, part), [onEditPart, teamId, part]);
        const handleDeletePart = useCallback(() => onDeletePart(teamId, part.id), [onDeletePart, teamId, part.id]);
        const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

        return (
            <div className="transition-all">
                <PartHeader
                    title={part.title}
                    memberCountText={memberCountText}
                    isOpen={isOpen}
                    canDelete={part.members.length === 0}
                    onAddMember={handleAddMember}
                    onToggle={toggleOpen}
                    onEdit={handleEditPart}
                    onDelete={handleDeletePart}
                    indicatorColor={indicatorColor}
                />
                {isOpen && (
                    <div
                        className="pl-4 sm:pl-8 pr-2 sm:pr-3 pb-2 rounded-lg transition-all duration-300"
                        {...dragHandlers}
                    >
                        <div
                            className={`bg-background/40 dark:bg-slate-700/50 rounded-lg divide-y divide-border/50 border transition-all duration-300 ${isDragOver ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                        >
                            {isDragOver && (
                                <div className="text-center py-3 text-primary text-xs font-medium bg-primary/10">
                                    여기에 드롭하세요
                                </div>
                            )}
                            {part.members.map((member) => (
                                <Member
                                    key={member.id}
                                    member={member}
                                    onEdit={onEditMember}
                                    onDelete={onDeleteMember}
                                    onMove={onMoveMember}
                                    baseDate={baseDate}
                                    {...(onAssignTeamLead && { onAssignTeamLead })}
                                    {...(onRemoveTeamLead && { onRemoveTeamLead })}
                                    isTeamLead={teamLead === member.name}
                                />
                            ))}
                            {part.members.length === 0 && (
                                <PartEmptyState searchTerm={searchTerm} onAddMember={handleAddMember} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

PartSection.displayName = 'PartSection';
