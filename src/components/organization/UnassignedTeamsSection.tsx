import { memo, ReactNode } from 'react';
import { Team } from '../../constants';
import { Card, ViewMode } from '../common';

interface UnassignedTeamsSectionProps {
    teams: Team[];
    viewMode: ViewMode;
    getTeamGridClass: (count: number) => string;
    renderTeamCard: (team: Team) => ReactNode;
    renderTeamCardCompact: (team: Team) => ReactNode;
}

export const UnassignedTeamsSection = memo(
    ({ teams, viewMode, getTeamGridClass, renderTeamCard, renderTeamCardCompact }: UnassignedTeamsSectionProps) => (
        <section className="space-y-6">
            <Card className="p-6 md:p-8 flex flex-col gap-2">
                <p className="text-sm font-medium text-amber-600">본부 미지정</p>
                <h2 className="text-lg font-semibold text-slate-900">본부에 속하지 않은 팀</h2>
                <p className="text-sm text-slate-500">팀 정보를 편집해 본부를 지정해 주세요.</p>
            </Card>
            <div className={viewMode === 'grid' ? getTeamGridClass(teams.length) : 'flex flex-col gap-3'}>
                {teams.map(viewMode === 'grid' ? renderTeamCard : renderTeamCardCompact)}
            </div>
        </section>
    )
);

UnassignedTeamsSection.displayName = 'UnassignedTeamsSection';
