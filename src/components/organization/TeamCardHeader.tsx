import { CaretDown, DotsThree, PencilSimple, Plus, Trash, UserPlus } from '@phosphor-icons/react';
import { memo } from 'react';
import { Dropdown, DropdownItem } from '../common';

interface TeamCardHeaderProps {
    teamName: string;
    memberCountText: string;
    teamLead: string;
    isTeamEmpty: boolean;
    isCollapsed: boolean;
    onAddPart: () => void;
    onAddDirectMember: () => void;
    onToggleCollapse: () => void;
    onEditTeam: () => void;
    onDeleteTeam: () => void;
}

export const TeamCardHeader = memo(
    ({
        teamName,
        memberCountText,
        teamLead,
        isTeamEmpty,
        isCollapsed,
        onAddPart,
        onAddDirectMember,
        onToggleCollapse,
        onEditTeam,
        onDeleteTeam,
    }: TeamCardHeaderProps) => (
        <div
            className="flex items-start sm:items-center justify-between px-1 sm:px-2 py-1 gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            onClick={onToggleCollapse}
        >
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <div
                    className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                >
                    <CaretDown className="w-5 h-5" weight="bold" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                        {teamName} ({memberCountText}명)
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                        팀장: {teamLead || '미지정'}
                    </p>
                </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Dropdown
                    trigger={
                        <button
                            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors touch-manipulation"
                            aria-label="팀 옵션"
                        >
                            <DotsThree className="w-6 h-6" weight="bold" />
                        </button>
                    }
                >
                    <DropdownItem onClick={onAddDirectMember}>
                        <UserPlus className="w-4 h-4 mr-2" weight="regular" /> 멤버 추가
                    </DropdownItem>
                    <DropdownItem onClick={onAddPart}>
                        <Plus className="w-4 h-4 mr-2" weight="regular" /> 파트 추가
                    </DropdownItem>
                    <DropdownItem onClick={onEditTeam}>
                        <PencilSimple className="w-4 h-4 mr-2" weight="regular" /> 팀 정보 수정
                    </DropdownItem>
                    <DropdownItem
                        onClick={onDeleteTeam}
                        className={isTeamEmpty ? 'hover:!bg-destructive/10 hover:!text-destructive' : ''}
                        disabled={!isTeamEmpty}
                        disabledTooltip="멤버가 있는 팀은 삭제할 수 없습니다."
                    >
                        <Trash className="w-4 h-4 mr-2" weight="regular" /> 팀 삭제
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    )
);

TeamCardHeader.displayName = 'TeamCardHeader';
