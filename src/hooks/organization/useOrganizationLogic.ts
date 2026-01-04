/* eslint-disable max-lines-per-function */
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
import { Member, Team } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { useRole } from '../../contexts/RoleContext';
import * as excelUtils from '../../utils/excelUtils';
import { useBulkSelection } from './useBulkSelection';
import { processExcelImport } from './useExcelImport';
import { useOrganizationViewModels } from './useOrganizationViewModels';

// Helper hook for tabs - extracted but kept local or can be exported if needed
function useOrganizationTabs(
    filteredInactiveMembers: { onLeave: any[]; resigned: any[] },
    statusFilter: string,
    setStatusFilter: React.Dispatch<React.SetStateAction<'all' | 'active' | 'intern' | 'on_leave' | 'resigned'>>,
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

    const handleStatusFilterChange = (nextFilter: 'all' | 'active' | 'intern' | 'on_leave' | 'resigned') => {
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
    const [searchTerm, setSearchTerm] = useState('');
    const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('orgChart');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'intern' | 'on_leave' | 'resigned'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortOption, setSortOption] = useState<'name_asc' | 'members_desc'>('name_asc');

    const [networkState] = useNetworkStatus();
    const { showSuccess, showError } = useError();
    const { handleContainerDragOver, handleContainerDrop } = useAutoScroll();
    const {
        teams,
        setTeams,
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
        setTeams, // useOrganizationModals might still need it? Check later.
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        addHistoryEntry,
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
        handleUpdateTeam: teamParts.handleUpdateTeam,
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

    // Bulk Handlers
    // Bulk Handlers
    // Bulk Handlers
    const handleBulkDelete = async () => {
        const ids = Array.from(bulkSelection.selectedMemberIds);
        if (ids.length === 0) return;

        const promises: Promise<void>[] = [];

        ids.forEach((memberId) => {
            // Soft Delete Member
            promises.push(firestoreActions.updateMember(memberId, { status: 'resigned' }));

            // Check if member is a Leader and act accordingly
            // We search through `teams` to see if this member is a lead
            const teamLedByMember = teams.find(
                (t: Team) =>
                    t.leadId === memberId ||
                    (t.lead && t.members?.find((m: Member) => m.id === memberId && m.name === t.lead))
            );

            if (teamLedByMember) {
                // Remove leadership
                // Note: If using `lead` (name), we just clear it. `leadId` too.
                promises.push(firestoreActions.updateTeam(teamLedByMember.id, { lead: '', leadId: null as any })); // Assuming null/undefined clear
            }
        });

        await Promise.all(promises);
        showSuccess('일괄 퇴사 처리 완료', `${ids.length}명이 퇴사(비활성) 처리되었습니다.`);
        bulkSelection.clearSelection();
    };

    // Bulk Move Logic (To be called by Modal)
    // Bulk Move Logic (To be called by Modal)
    const handleBulkMove = async (targetTeamId: string, targetPartId: string | null) => {
        const ids = Array.from(bulkSelection.selectedMemberIds);
        if (ids.length === 0) return;

        const promises = ids.map((id) =>
            firestoreActions.updateMember(id, {
                teamId: targetTeamId,
                teamId: targetTeamId,
                partId: targetPartId || undefined,
            })
        );

        await Promise.all(promises);
        showSuccess('일괄 이동 완료', `${ids.length}명이 이동되었습니다.`);
        bulkSelection.clearSelection();
    };

    // Excel Handlers
    const handleImportExcel = async (file: File) => {
        await processExcelImport(file, teams, firestoreActions, showSuccess, showError);
    };

    const handleExportExcel = () => {
        try {
            excelUtils.exportMembersToExcel(teams);
            showSuccess('다운로드 시작', '엑셀 파일 다운로드가 시작되었습니다.');
        } catch (err) {
            console.error(err);
            showError('다운로드 실패', '엑셀 변환 중 오류가 발생했습니다.');
        }
    };

    const handleDownloadTemplate = () => {
        excelUtils.downloadExcelTemplate();
    };

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

    return {
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

        // Excel Actions
        onImportExcel: handleImportExcel,
        onExportExcel: handleExportExcel,
        onDownloadTemplate: handleDownloadTemplate,

        // Bulk
        bulkSelection,
        handleBulkDelete,
        handleBulkMove,
    };
}
