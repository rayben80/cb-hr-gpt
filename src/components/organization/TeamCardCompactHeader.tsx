import { Briefcase, CaretDown, CaretUp, PencilSimple, Trash, Users } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { Team } from '../../constants';

interface TeamCardCompactHeaderProps {
    team: Team;
    isExpanded: boolean;
    totalMembers: number;
    activeMembers: number;
    accentColor: string;
    badgeColor?: string;
    onToggleExpand: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const TeamCardCompactHeader = memo(
    ({
        team,
        isExpanded,
        totalMembers,
        activeMembers,
        accentColor,
        badgeColor,
        onToggleExpand,
        onEdit,
        onDelete,
    }: TeamCardCompactHeaderProps) => {
        return (
            <div
                className={`group flex items-center gap-4 card-premium border-l-4 ${accentColor} rounded-lg shadow-sm px-4 py-3 hover:shadow-primary-lg transition-all duration-200`}
            >
                {/* Clickable toggle area - separate from action buttons */}
                <button
                    type="button"
                    onClick={onToggleExpand}
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer bg-transparent border-none p-0 text-left"
                    aria-expanded={isExpanded}
                    aria-label={`${team.name} 팀 ${isExpanded ? '접기' : '펼치기'}`}
                >
                    <div className="flex-shrink-0 text-muted-foreground">
                        {isExpanded ? (
                            <CaretUp className="w-5 h-5" weight="regular" />
                        ) : (
                            <CaretDown className="w-5 h-5" weight="regular" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
                            {team.lead && <span className="text-xs text-muted-foreground">팀장: {team.lead}</span>}
                        </div>
                    </div>
                </button>
                <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeColor || 'bg-muted text-muted-foreground border-transparent'}`}
                >
                    <Users className="w-4 h-4 opacity-80" weight="regular" />
                    <span className="text-sm font-medium">{activeMembers}명</span>
                    {totalMembers !== activeMembers && <span className="text-xs opacity-80">({totalMembers})</span>}
                </div>
                <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeColor || 'bg-muted text-muted-foreground border-transparent'}`}
                >
                    <Briefcase className="w-4 h-4 opacity-80" weight="regular" />
                    <span className="text-sm font-medium">{team.parts.length}개 파트</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label="팀 수정"
                    >
                        <PencilSimple className="w-4 h-4" weight="regular" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="팀 삭제"
                    >
                        <Trash className="w-4 h-4" weight="regular" />
                    </button>
                </div>
            </div>
        );
    }
);

TeamCardCompactHeader.displayName = 'TeamCardCompactHeader';
