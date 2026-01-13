import { MagnifyingGlass } from '@phosphor-icons/react';
import { memo, ReactNode } from 'react';
import { Headquarter, Team } from '../../constants';
import { ViewMode } from '../common';
import { HeadquarterHeader } from './HeadquarterHeader';

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
    canManageHeadquarterLead?: boolean;
    hideHeader?: boolean;
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
        hideHeader = false,
    }: HeadquarterSectionProps) => (
        <section className="space-y-6">
            {/* Headquarter Header - conditionally rendered */}
            {!hideHeader && (
                <HeadquarterHeader
                    headquarter={headquarter}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={onToggleCollapse}
                    onEditHeadquarter={onEditHeadquarter}
                    canManageHeadquarterLead={canManageHeadquarterLead}
                />
            )}

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
