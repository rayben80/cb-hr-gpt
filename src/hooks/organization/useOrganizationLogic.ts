import { useMemo } from 'react';
import {
    useAutoScroll,
    useNetworkStatus,
    useOrganizationData,
    useOrganizationDataManagement,
    useOrganizationHandlers,
    useOrganizationUIState,
    useOrganizationViewModels,
} from '..';
import { useError } from '../../contexts/ErrorContext';
import { useRole } from '../../contexts/RoleContext';
import { buildOrganizationLogicReturn } from './organizationLogicHelpers';
import { useBulkSelection } from './useBulkSelection';
import { useMemberSort } from './useMemberSort';

export function useOrganizationLogic() {
    const { role } = useRole();
    const { showSuccess, showError } = useError();
    const [networkState] = useNetworkStatus();
    const { handleContainerDragOver, handleContainerDrop } = useAutoScroll();

    const {
        teams,
        isLoading,
        error,
        stats,
        seedOperation,
        handleSeedDatabase,
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        firestoreActions,
    } = useOrganizationData();

    // 1. UI States, Filtering, and Sub-hooks
    const uiState = useOrganizationUIState(teams);
    const dataMgmt = useOrganizationDataManagement({
        teams,
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        firestoreActions,
        uiState,
    });

    const { visibleActiveTeams, groupedHeadquarters, hasAnyTeamsInView, getTeamGridClass, inactiveMembersToShow } =
        useOrganizationViewModels({
            role: role as string,
            activeTeams: uiState.activeTeams,
            statusFilter: uiState.statusFilter,
            headquarters,
            sortOption: uiState.sortOption,
            filteredInactiveMembers: uiState.filteredInactiveMembers,
        });

    // 2. Handlers & Selection
    const bulkSelection = useBulkSelection();
    const handlers = useOrganizationHandlers({
        teams,
        firestoreActions,
        showSuccess,
        showError,
        bulkSelection,
    });

    const { sensors, handleDragStart, handleDragEnd, activeId } = useMemberSort({
        members: teams.flatMap((t) => [...(t.members || []), ...t.parts.flatMap((p) => p.members)]),
        onReorder: handlers.handleReorderMember,
        onReorderToEnd: handlers.handleReorderMemberToEnd,
        onMove: handlers.handleMoveMemberDrag,
    });

    // 3. Final Orchestration
    return useMemo(
        () =>
            buildOrganizationLogicReturn({
                sensors,
                handleDragStart,
                handleDragEnd,
                dragActiveId: activeId,
                networkState,
                saveOperation: dataMgmt.memberMgmt.saveOperation,
                deleteOperation: dataMgmt.memberMgmt.deleteOperation,
                seedOperation,
                stats,
                statusFilter: uiState.statusFilter,
                handleStatusFilter: uiState.handleStatusFilterChange,
                searchTerm: uiState.searchTerm,
                setSearchTerm: uiState.setSearchTerm,
                baseDate: uiState.baseDate,
                setBaseDate: uiState.setBaseDate,
                tabs: uiState.tabs,
                activeTab: uiState.activeTab,
                handleTabChange: uiState.handleTabChange,
                sortOption: uiState.sortOption,
                setSortOption: uiState.setSortOption,
                viewMode: uiState.viewMode,
                setViewMode: uiState.setViewMode,
                openTeamModal: dataMgmt.teamParts.openTeamModal,
                visibleActiveTeams,
                handleContainerDragOver,
                handleContainerDrop,
                isLoading,
                error,
                handleSeedDatabase,
                hasAnyTeamsInView,
                groupedHeadquarters,
                headquarters,
                collapsedHeadquarters: dataMgmt.orgModals.collapsedHeadquarters,
                toggleHeadquarter: dataMgmt.orgModals.toggleHeadquarter,
                openHeadquarterModal: dataMgmt.orgModals.openHeadquarterModal,
                openAddHeadquarterModal: dataMgmt.orgModals.openAddHeadquarterModal,
                getTeamGridClass,
                renderTeamCard: dataMgmt.renderTeamCard,
                renderTeamCardCompact: dataMgmt.renderTeamCardCompact,
                showOnLeaveList: uiState.statusFilter !== 'resigned',
                showResignedList: uiState.statusFilter !== 'on_leave',
                inactiveMembersToShow,
                handleReinstateMember: dataMgmt.memberMgmt.handleReinstateMember,
                handleDeleteMember: dataMgmt.memberMgmt.handleDeleteMember,
                handleDeleteResignedMember: dataMgmt.memberMgmt.handleDeleteResignedMember,
                handleUpdateTeam: dataMgmt.teamParts.handleUpdateTeam,
                modalProps: dataMgmt.modalProps,
                onImportExcel: handlers.handleImportExcel,
                onExportExcel: handlers.handleExportExcel,
                onDownloadTemplate: handlers.handleDownloadTemplate,
                bulkSelection,
                handleBulkDelete: handlers.handleBulkDelete,
                handleBulkMove: handlers.handleBulkMove,
            }),
        [
            sensors,
            handleDragStart,
            handleDragEnd,
            activeId,
            networkState,
            dataMgmt,
            seedOperation,
            stats,
            uiState,
            visibleActiveTeams,
            handleContainerDragOver,
            handleContainerDrop,
            isLoading,
            error,
            handleSeedDatabase,
            hasAnyTeamsInView,
            groupedHeadquarters,
            headquarters,
            getTeamGridClass,
            inactiveMembersToShow,
            handlers,
            bulkSelection,
        ]
    );
}
