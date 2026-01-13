import React, { memo } from 'react';
import { ViewMode } from '../../components/common';
import { BulkMoveModal } from '../../components/organization/BulkMoveModal';
import { OrganizationMainContent } from '../../components/organization/OrganizationMainContent';
import { OrganizationModals } from '../../components/organization/OrganizationModals';
import { OrganizationPageHeader } from '../../components/organization/OrganizationPageHeader';
import { OrganizationStatusOverlays } from '../../components/organization/OrganizationStatusOverlays';
import { OrgStatsSection } from '../../components/organization/OrgStatsSection';
import { OrgToolbar } from '../../components/organization/OrgToolbar';
import { Headquarter, Member, Team } from '../../constants';

import { HeadquarterHeader } from '../../components/organization/HeadquarterHeader';
import { useRole } from '../../contexts/RoleContext';

interface OrganizationViewsProps {
    networkState: { isOnline: boolean };
    saveOperation: any;
    deleteOperation: any;
    seedOperation: any;
    stats: { total: number; active: number; intern: number; onLeave: number; resigned: number };
    headquarters?: Headquarter[];
    statusFilter: any;
    handleStatusFilter: (filter: any) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    baseDate: string;
    setBaseDate: (date: string) => void;
    tabs: { id: string; label: string }[];
    activeTab: string;
    handleTabChange: (tabId: string) => void;
    sortOption: any;
    setSortOption: (option: any) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    openTeamModal: (mode: 'add' | 'edit', team: Team | null) => void;
    visibleActiveTeams: Team[];
    handleContainerDragOver: (e: React.DragEvent<any>) => void;
    handleContainerDrop: (e: React.DragEvent<any>) => void;
    isLoading: boolean;
    error: any;
    handleSeedDatabase: () => void;
    // Excel
    onImportExcel: (file: File) => void;
    onExportExcel: () => void;
    onDownloadTemplate: () => void;

    // ViewModel props
    hasAnyTeamsInView: boolean;
    groupedHeadquarters: { sections: { headquarter: Headquarter; teams: Team[] }[]; unassignedTeams: Team[] };
    collapsedHeadquarters: Set<string>;
    toggleHeadquarter: (id: string) => void;
    openHeadquarterModal: (hq: Headquarter) => void;
    openAddHeadquarterModal: () => void;
    getTeamGridClass: (count: number) => string;
    renderTeamCard: (team: Team) => React.ReactNode;
    renderTeamCardCompact: (team: Team) => React.ReactNode;
    showOnLeaveList: boolean;
    showResignedList: boolean;
    inactiveMembersToShow: { onLeave: Member[]; resigned: Member[] };
    handleReinstateMember: (member: Member) => void;
    handleDeleteMember: (member: Member) => void;
    handleDeleteResignedMember: (member: Member) => void;
    handleBulkMove: (targetTeamId: string, targetPartId: string | null) => void;
    handleBulkDelete: () => void;

    // Modal Props
    modalProps: any;

    // DnD Props
    dndContextProps: any;
    dragActiveId: string | null;
}

export const OrganizationViews = memo((props: OrganizationViewsProps) => {
    const { canManageHeadquarterLead } = useRole();

    const {
        networkState,
        saveOperation,
        deleteOperation,
        seedOperation,
        stats,
        statusFilter,
        handleStatusFilter,
        searchTerm,
        setSearchTerm,
        baseDate,
        setBaseDate,
        tabs,
        activeTab,
        handleTabChange,
        sortOption,
        setSortOption,
        viewMode,
        setViewMode,
        openTeamModal,
        visibleActiveTeams,
        handleContainerDragOver,
        handleContainerDrop,
        isLoading,
        error,
        handleSeedDatabase,

        hasAnyTeamsInView,
        groupedHeadquarters,
        collapsedHeadquarters,
        toggleHeadquarter,
        openHeadquarterModal,
        getTeamGridClass,
        renderTeamCard,
        renderTeamCardCompact,
        showOnLeaveList,
        showResignedList,
        inactiveMembersToShow,
        handleReinstateMember,
        handleDeleteMember,
        handleDeleteResignedMember,

        // Excel
        onImportExcel,
        onExportExcel,
        onDownloadTemplate,

        modalProps,
    } = props;

    const headerSubtitle = '조직도 및 인원 현황을 한눈에 확인하고 관리하세요.';

    return (
        <>
            <OrganizationStatusOverlays
                isOnline={networkState.isOnline}
                isSaveLoading={saveOperation.isLoading}
                isDeleteLoading={deleteOperation.isLoading}
                isSeedLoading={seedOperation.isLoading}
            />

            <OrganizationPageHeader subtitle={headerSubtitle} />

            <OrgStatsSection stats={stats} statusFilter={statusFilter} onStatusFilter={handleStatusFilter} />

            {/* Single Headquarter Header (Moved Up - Static, no collapse) */}
            {groupedHeadquarters.sections.length === 1 && activeTab === 'orgChart' && (
                <div className="mb-6">
                    <HeadquarterHeader
                        headquarter={groupedHeadquarters.sections[0].headquarter}
                        onEditHeadquarter={() => openHeadquarterModal(groupedHeadquarters.sections[0].headquarter)}
                        canManageHeadquarterLead={canManageHeadquarterLead}
                        disableCollapse={true}
                    />
                </div>
            )}

            <OrgToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                baseDate={baseDate}
                onBaseDateChange={setBaseDate}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                sortOption={sortOption}
                onSortChange={setSortOption}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onAddTeam={() => openTeamModal('add', null)}
                totalCount={stats.total}
                searchResultCount={visibleActiveTeams.reduce(
                    (sum, t) => sum + t.parts.reduce((s, p) => s + p.members.length, 0),
                    0
                )}
                onImportExcel={onImportExcel}
                onExportExcel={onExportExcel}
                onDownloadTemplate={onDownloadTemplate}
            />

            <OrganizationMainContent
                activeTab={activeTab}
                hasAnyTeamsInView={hasAnyTeamsInView}
                groupedHeadquarters={groupedHeadquarters}
                teams={props.modalProps.teams} // Passed from useOrganizationLogic -> modalProps.teams or logic.teams? modalProps has it.
                headquarters={props.modalProps.headquarters || props.headquarters || []} // props.headquarters is optional in interface but should be present. useOrganizationLogic returns it.
                collapsedHeadquarters={collapsedHeadquarters}
                toggleHeadquarter={toggleHeadquarter}
                openHeadquarterModal={openHeadquarterModal}
                viewMode={viewMode}
                getTeamGridClass={getTeamGridClass}
                renderTeamCard={renderTeamCard}
                renderTeamCardCompact={renderTeamCardCompact}
                searchTerm={searchTerm}
                openTeamModal={openTeamModal}
                showOnLeaveList={showOnLeaveList}
                showResignedList={showResignedList}
                inactiveMembersToShow={inactiveMembersToShow}
                handleReinstateMember={handleReinstateMember}
                handleDeleteMember={handleDeleteMember}
                handleDeleteResignedMember={handleDeleteResignedMember}
                baseDate={baseDate}
                isLoading={isLoading}
                error={error}
                handleSeedDatabase={handleSeedDatabase}
                handleContainerDragOver={handleContainerDragOver}
                handleContainerDrop={handleContainerDrop}
                hideSingleHeadquarterHeader={groupedHeadquarters.sections.length === 1}
                dndContextProps={props.dndContextProps}
                dragActiveId={props.dragActiveId}
            />

            <OrganizationModals {...modalProps} />

            <BulkMoveModal
                isOpen={props.modalProps.isBulkMoveModalOpen}
                onClose={props.modalProps.closeBulkMoveModal}
                onMove={props.handleBulkMove}
                teams={props.modalProps.teams}
            />
        </>
    );
});

OrganizationViews.displayName = 'OrganizationViews';
