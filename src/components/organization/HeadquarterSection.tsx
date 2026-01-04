import { CaretDown, DotsThree, MagnifyingGlass, PencilSimple } from '@phosphor-icons/react';
import { memo, ReactNode } from 'react';
import { Headquarter, Team } from '../../constants';
import { Avatar, Dropdown, DropdownItem, ViewMode } from '../common';

interface HeadquarterSectionProps {
    headquarter: Headquarter;
    teams: Team[];
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onEditHeadquarter: () => void;
    viewMode: ViewMode;
    getTeamGridClass: (count: number) => string;
    renderTeamCard: (team: Team) => ReactNode;
    renderTeamCardCompact: (team: Team) => ReactNode;
    canManageHeadquarterLead?: boolean; // Permission to edit HQ leader
}

export const HeadquarterSection = memo(
    ({
        headquarter,
        teams,
        isCollapsed,
        onToggleCollapse,
        onEditHeadquarter,
        viewMode,
        getTeamGridClass,
        renderTeamCard,
        renderTeamCardCompact,
        canManageHeadquarterLead = false,
    }: HeadquarterSectionProps) => (
        <section className="space-y-6">
            {/* Headquarter Header */}
            <div
                className="bg-card p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                    >
                        <CaretDown className="w-6 h-6" weight="bold" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">{headquarter.name}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {headquarter.leader ? (
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={headquarter.leader.avatar}
                                alt={`${headquarter.leader.name} avatar`}
                                fallback={headquarter.leader.name}
                                className="w-12 h-12 rounded-full shadow-sm"
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold text-foreground">
                                    본부장 {headquarter.leader.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{headquarter.leader.email}</p>
                                {headquarter.leader.phone && null /* Phone hidden per request */}
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

            {/* Teams Grid */}
            {!isCollapsed &&
                (teams.length > 0 ? (
                    <div className={viewMode === 'grid' ? getTeamGridClass(teams.length) : 'flex flex-col gap-3'}>
                        {teams.map(viewMode === 'grid' ? renderTeamCard : renderTeamCardCompact)}
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full mb-3">
                            <MagnifyingGlass className="w-6 h-6 text-slate-400 dark:text-slate-500" weight="regular" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">검색 결과가 없습니다.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">다른 키워드로 검색해보세요.</p>
                    </div>
                ))}
        </section>
    )
);

HeadquarterSection.displayName = 'HeadquarterSection';
