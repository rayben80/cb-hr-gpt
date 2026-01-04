import { memo } from 'react';
import { Headquarter, Member, Team } from '../../constants';
import { useRole } from '../../contexts/RoleContext';
import { ViewMode } from '../common';
import { HeadquarterSection } from './HeadquarterSection';
import { InactiveMemberList } from './InactiveMemberList';
import { OrgEmptyState } from './OrgEmptyState';
import { UnassignedTeamsSection } from './UnassignedTeamsSection';

export interface OrganizationContentProps {
    activeTab: string;
    // OrgChart Props
    hasAnyTeamsInView: boolean;
    groupedHeadquarters: { sections: { headquarter: Headquarter; teams: Team[] }[]; unassignedTeams: Team[] };
    collapsedHeadquarters: Set<string>;
    toggleHeadquarter: (id: string) => void;
    openHeadquarterModal: (hq: Headquarter) => void;
    viewMode: ViewMode;
    getTeamGridClass: (count: number) => string;
    renderTeamCard: (team: Team) => React.ReactNode;
    renderTeamCardCompact: (team: Team) => React.ReactNode;
    searchTerm: string;
    openTeamModal: (mode: 'add', data: any) => void;

    // Inactive Props
    showOnLeaveList: boolean;
    showResignedList: boolean;
    inactiveMembersToShow: { onLeave: Member[]; resigned: Member[] };
    handleReinstateMember: (member: Member) => void;
    handleDeleteMember: (member: Member) => void;
    handleDeleteResignedMember: (member: Member) => void;
    baseDate: string;
}

export const OrganizationContent = memo(
    ({
        activeTab,
        hasAnyTeamsInView,
        groupedHeadquarters,
        collapsedHeadquarters,
        toggleHeadquarter,
        openHeadquarterModal,
        viewMode,
        getTeamGridClass,
        renderTeamCard,
        renderTeamCardCompact,
        searchTerm,
        openTeamModal,
        showOnLeaveList,
        showResignedList,
        inactiveMembersToShow,
        handleReinstateMember,
        handleDeleteMember,
        handleDeleteResignedMember,
        baseDate,
    }: OrganizationContentProps) => {
        const { canManageHeadquarterLead } = useRole();

        if (activeTab === 'orgChart') {
            return hasAnyTeamsInView ? (
                <div className="space-y-10">
                    {groupedHeadquarters.sections.map((section) => (
                        <HeadquarterSection
                            key={section.headquarter.id}
                            headquarter={section.headquarter}
                            teams={section.teams}
                            isCollapsed={collapsedHeadquarters.has(section.headquarter.id)}
                            onToggleCollapse={() => toggleHeadquarter(section.headquarter.id)}
                            onEditHeadquarter={() => openHeadquarterModal(section.headquarter)}
                            viewMode={viewMode}
                            getTeamGridClass={getTeamGridClass}
                            renderTeamCard={renderTeamCard}
                            renderTeamCardCompact={renderTeamCardCompact}
                            canManageHeadquarterLead={canManageHeadquarterLead}
                        />
                    ))}
                    {groupedHeadquarters.unassignedTeams.length > 0 && (
                        <UnassignedTeamsSection
                            teams={groupedHeadquarters.unassignedTeams}
                            viewMode={viewMode}
                            getTeamGridClass={getTeamGridClass}
                            renderTeamCard={renderTeamCard}
                            renderTeamCardCompact={renderTeamCardCompact}
                        />
                    )}
                </div>
            ) : (
                <OrgEmptyState searchTerm={searchTerm} onAddTeam={() => openTeamModal('add', null)} />
            );
        }

        if (activeTab === 'inactive') {
            return (
                <div className="grid gap-4 sm:gap-6 lg:gap-8 items-start">
                    {showOnLeaveList && (
                        <InactiveMemberList
                            title="휴직중인 인원"
                            type="on_leave"
                            members={inactiveMembersToShow.onLeave}
                            onReinstate={handleReinstateMember}
                            onDelete={handleDeleteMember}
                            baseDate={baseDate}
                        />
                    )}
                    {showResignedList && (
                        <InactiveMemberList
                            title="퇴사한 인원"
                            type="resigned"
                            members={inactiveMembersToShow.resigned}
                            onDelete={handleDeleteResignedMember}
                            onReinstate={handleReinstateMember}
                            baseDate={baseDate}
                        />
                    )}
                </div>
            );
        }

        return null;
    }
);

OrganizationContent.displayName = 'OrganizationContent';
