import { CaretDown, DotsThree, PencilSimple } from '@phosphor-icons/react';
import { memo } from 'react';
import { Headquarter } from '../../constants';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';
import { Avatar, Dropdown, DropdownItem } from '../common';

interface HeadquarterHeaderProps {
    headquarter: Headquarter;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onEditHeadquarter: () => void;
    canManageHeadquarterLead?: boolean;
    /** When true, hides the chevron and disables click-to-collapse */
    disableCollapse?: boolean;
}

export const HeadquarterHeader = memo(
    ({
        headquarter,
        isCollapsed = false,
        onToggleCollapse,
        onEditHeadquarter,
        canManageHeadquarterLead = false,
        disableCollapse = false,
    }: HeadquarterHeaderProps) => {
        const isClickable = !disableCollapse && onToggleCollapse;

        return (
            <div
                className={`bg-card p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-colors ${
                    isClickable ? 'cursor-pointer hover:bg-muted/50' : ''
                }`}
                onClick={isClickable ? onToggleCollapse : undefined}
            >
                <div className="flex items-center gap-4 flex-1">
                    {/* Chevron - only show if collapse is enabled */}
                    {!disableCollapse && (
                        <div
                            className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                        >
                            <CaretDown className="w-6 h-6" weight="bold" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{headquarter.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {headquarter.leader ? (
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={getDisplayAvatarUrl(
                                    headquarter.leader.name,
                                    headquarter.leader.avatar,
                                    headquarter.leader.email
                                )}
                                alt={`${headquarter.leader.name} avatar`}
                                fallback={headquarter.leader.name}
                                className="w-12 h-12 rounded-full shadow-sm"
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-foreground">
                                    본부장 {headquarter.leader.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{headquarter.leader.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground text-lg">?</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-amber-600">본부장 공석</p>
                                <button onClick={onEditHeadquarter} className="text-xs text-primary hover:underline">
                                    본부장 임명하기
                                </button>
                            </div>
                        </div>
                    )}
                    {canManageHeadquarterLead && (
                        <Dropdown
                            trigger={
                                <button
                                    className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors touch-manipulation"
                                    aria-label="본부 옵션"
                                >
                                    <DotsThree className="w-6 h-6" weight="bold" />
                                </button>
                            }
                        >
                            <DropdownItem onClick={onEditHeadquarter}>
                                <PencilSimple className="w-4 h-4 mr-2" weight="regular" /> 본부 및 본부장 정보 수정
                            </DropdownItem>
                        </Dropdown>
                    )}
                </div>
            </div>
        );
    }
);

HeadquarterHeader.displayName = 'HeadquarterHeader';
