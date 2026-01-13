import { ViewMode } from '@/components/common';
import { useMemo, useState } from 'react';
import {
    useAutoScroll,
    useLeaderHistory,
    useMemberManagement,
    useNetworkStatus,
    useOrganizationData,
    useOrganizationFilter,
    useOrganizationModals,
    useTeamPartManagement,
    useTeamRenderers,
} from '..';
import { useError } from '../../contexts/ErrorContext';
import { useRole } from '../../contexts/RoleContext';
import * as excelUtils from '../../utils/excelUtils';
import { useBulkSelection } from './useBulkSelection';
import { useMemberSort } from './useMemberSort';
import { useOrganizationViewModels } from './useOrganizationViewModels';
import {
    buildOrganizationLogicReturn,
    createBulkDeleteHandler,
    createBulkMoveHandler,
    createExportHandler,
    createImportHandler,
    createMoveMemberHandler,
    createReorderMemberHandler,
    createReorderMemberToEndHandler,
    StatusFilter,
} from './organizationLogicHelpers';

// Helper hook for tabs - extracted but kept local or can be exported if needed
function useOrganizationTabs(
    filteredInactiveMembers: { onLeave: any[]; resigned: any[] },
    statusFilter: string,
    setStatusFilter: React.Dispatch<React.SetStateAction<StatusFilter>>,
    setActiveTab: React.Dispatch<React.SetStateAction<string>>
) {
    const tabs = useMemo(
        () => [
            { id: 'orgChart', label: '조직도' },
            {
                id: 'inactive',
                label: `비활성 인원 (${filteredInactiveMembers.onLeave.length + filteredInactiveMembers.resigned.length})`,
            },
        ],
        [filteredInactiveMembers]
    );

    const handleStatusFilterChange = (nextFilter: StatusFilter) => {
        setStatusFilter((prev) => {
            const resolved = prev === nextFilter ? 'all' : nextFilter;
            if (resolved === 'on_leave' || resolved === 'resigned') setActiveTab('inactive');
            else setActiveTab('orgChart');
            return resolved;
        });
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'orgChart' && (statusFilter === 'on_leave' || statusFilter === 'resigned'))
            setStatusFilter('all');
        if (tabId === 'inactive' && (statusFilter === 'active' || statusFilter === 'intern')) setStatusFilter('all');
    };

    return { tabs, handleStatusFilterChange, handleTabChange };
}

export function useOrganizationLogic() {
    const { role } = useRole();
    const [searchTerm, setSearchTerm] = useState(''); const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('orgChart'); const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid'); const [sortOption, setSortOption] = useState<'name_asc' | 'members_desc'>('name_asc');
    const [networkState] = useNetworkStatus(); const { showSuccess, showError } = useError();
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
        firestoreActions, // Destructure new actions
    } = useOrganizationData();
    const memberMgmt = useMemberManagement(teams, firestoreActions);
    const { addHistoryEntry } = useLeaderHistory();
    const orgModals = useOrganizationModals({
        teams,
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        addHistoryEntry,
        firestoreActions,
    });
    const teamParts = useTeamPartManagement(teams, headquarters, firestoreActions);
    const { activeTeams, filteredInactiveMembers } = useOrganizationFilter(teams, searchTerm);
    const { renderTeamCard, renderTeamCardCompact } = useTeamRenderers({
        baseDate,
        searchTerm,
        statusFilter,
        handleAddMember: memberMgmt.handleAddMember,
        handleEditMember: memberMgmt.handleEditMember,
        handleDeleteMember: memberMgmt.handleDeleteMember,
        moveMemberToTeamPart: orgModals.moveMemberToTeamPart,
        openMoveModal: orgModals.openMoveModal,
        openPartModal: teamParts.openPartModal,
        handleDeletePart: teamParts.handleDeletePart,
        openTeamModal: teamParts.openTeamModal,
        handleDeleteTeam: teamParts.handleDeleteTeam,
        handleUpdateMember: memberMgmt.handleSaveMember,
        confirmationActions: teamParts.confirmationActions,
    });
    const { visibleActiveTeams, groupedHeadquarters, hasAnyTeamsInView, getTeamGridClass, inactiveMembersToShow } =
        useOrganizationViewModels({
            role: role as string,
            activeTeams,
            statusFilter,
            headquarters,
            sortOption,
            filteredInactiveMembers,
        });
    const { tabs, handleStatusFilterChange, handleTabChange } = useOrganizationTabs(
        filteredInactiveMembers,
        statusFilter,
        setStatusFilter,
        setActiveTab
    );
    const bulkSelection = useBulkSelection();
    const handleBulkDelete = createBulkDeleteHandler({ bulkSelection, teams, firestoreActions, showSuccess });
    const handleBulkMove = createBulkMoveHandler({ bulkSelection, teams, firestoreActions, showSuccess });
    const handleReorderMember = createReorderMemberHandler(teams, firestoreActions);
    const handleReorderMemberToEnd = createReorderMemberToEndHandler(teams, firestoreActions);
    const handleMoveMemberDrag = createMoveMemberHandler(teams, firestoreActions, showSuccess);

    const {
        sensors,
        handleDragStart,
        handleDragEnd,
        activeId: dragActiveId,
    } = useMemberSort({
        members: teams.flatMap((t) => [...(t.members || []), ...t.parts.flatMap((p) => p.members)]),
        onReorder: handleReorderMember,
        onReorderToEnd: handleReorderMemberToEnd,
        onMove: handleMoveMemberDrag,
    });
    const handleImportExcel = createImportHandler(teams, firestoreActions, showSuccess, showError); const handleExportExcel = createExportHandler(teams, showSuccess, showError);
    const handleDownloadTemplate = () => excelUtils.downloadExcelTemplate();
    if (import.meta.env.DEV) console.log('DEBUG: teamParts', teamParts);
    const modalProps = {
        ...orgModals,
        ...memberMgmt,
        ...teamParts,
        teams,
        teamPartConfirmation: teamParts.confirmation,
        teamPartConfirmationActions: teamParts.confirmationActions,
        memberConfirmation: memberMgmt.confirmation,
        memberConfirmationActions: memberMgmt.confirmationActions,
    };

    return buildOrganizationLogicReturn({
        sensors,
        handleDragStart,
        handleDragEnd,
        dragActiveId,
        networkState,
        saveOperation: memberMgmt.saveOperation,
        deleteOperation: memberMgmt.deleteOperation,
        seedOperation,
        stats,
        statusFilter,
        handleStatusFilter: handleStatusFilterChange,
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
        openTeamModal: teamParts.openTeamModal,
        visibleActiveTeams,
        handleContainerDragOver,
        handleContainerDrop,
        isLoading,
        error,
        handleSeedDatabase,
        hasAnyTeamsInView,
        groupedHeadquarters,
        headquarters,
        collapsedHeadquarters: orgModals.collapsedHeadquarters,
        toggleHeadquarter: orgModals.toggleHeadquarter,
        openHeadquarterModal: orgModals.openHeadquarterModal,
        openAddHeadquarterModal: orgModals.openAddHeadquarterModal,
        getTeamGridClass,
        renderTeamCard,
        renderTeamCardCompact,
        showOnLeaveList: statusFilter !== 'resigned',
        showResignedList: statusFilter !== 'on_leave',
        inactiveMembersToShow,
        handleReinstateMember: memberMgmt.handleReinstateMember,
        handleDeleteMember: memberMgmt.handleDeleteMember,
        handleDeleteResignedMember: memberMgmt.handleDeleteResignedMember,
        handleUpdateTeam: teamParts.handleUpdateTeam,
        modalProps,
        onImportExcel: handleImportExcel,
        onExportExcel: handleExportExcel,
        onDownloadTemplate: handleDownloadTemplate,
        bulkSelection,
        handleBulkDelete,
        handleBulkMove,
    });
}
