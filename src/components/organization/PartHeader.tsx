import { CaretDown, DotsThree, PencilSimple, Trash, UserPlus } from '@phosphor-icons/react';
import { memo } from 'react';
import { Dropdown, DropdownItem } from '../common';

interface PartHeaderProps {
    title: string;
    memberCountText: string | number;
    isOpen: boolean;
    canDelete: boolean;
    onAddMember: () => void;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    indicatorColor?: string | undefined;
}

export const PartHeader = memo(
    ({
        title,
        memberCountText,
        isOpen,
        canDelete,
        onAddMember,
        onToggle,
        onEdit,
        onDelete,
        indicatorColor,
    }: PartHeaderProps) => (
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <button
                type="button"
                className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 text-left"
                onClick={onToggle}
                aria-label={isOpen ? '파트 접기' : '파트 펼치기'}
                aria-expanded={isOpen}
            >
                <span
                    data-testid="part-toggle-icon"
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                >
                    <CaretDown className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
                </span>
                <span className={`w-1 h-5 rounded-full ${indicatorColor || 'bg-slate-300 dark:bg-slate-600'}`} />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base truncate">
                    {title} ({memberCountText}명)
                </h3>
            </button>
            <div className="flex items-center flex-shrink-0">
                <Dropdown
                    trigger={
                        <button
                            className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors touch-manipulation"
                            aria-label="파트 옵션"
                        >
                            <DotsThree className="w-5 h-5 sm:w-6 sm:h-6" weight="bold" />
                        </button>
                    }
                >
                    <DropdownItem onClick={onAddMember}>
                        <UserPlus className="w-4 h-4 mr-2" weight="regular" /> 멤버 추가
                    </DropdownItem>
                    <DropdownItem onClick={onEdit}>
                        <PencilSimple className="w-4 h-4 mr-2" weight="regular" /> 파트명 변경
                    </DropdownItem>
                    <DropdownItem
                        onClick={onDelete}
                        className={canDelete ? 'hover:!bg-destructive/10 hover:!text-destructive' : ''}
                        disabled={!canDelete}
                        disabledTooltip="멤버가 있는 파트는 삭제할 수 없습니다."
                    >
                        <Trash className="w-4 h-4 mr-2" weight="regular" /> 파트 삭제
                    </DropdownItem>
                </Dropdown>
            </div>
        </div>
    )
);

PartHeader.displayName = 'PartHeader';
