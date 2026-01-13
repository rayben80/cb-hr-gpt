import type { Dispatch, SetStateAction } from 'react';
import type {
    useAutoScroll,
    useMemberManagement,
    useNetworkStatus,
    useOrganizationData,
    useOrganizationModals,
    useOrganizationViewModels,
    useTeamPartManagement,
    useTeamRenderers,
} from '..';
import type { useBulkSelection } from './useBulkSelection';
import type { useMemberSort } from './useMemberSort';
import type { ViewMode } from '../../components/common';
import { Member, Team } from '../../constants';
import * as excelUtils from '../../utils/excelUtils';
import { getNextMemberOrder, sortMembersByOrder } from '../../utils/organizationUtils';
import { processExcelImport } from './useExcelImport';

export type StatusFilter = 'all' | 'active' | 'intern' | 'on_leave' | 'resigned';
type FirestoreActions = ReturnType<typeof useOrganizationData>['firestoreActions'];
type ErrorNotifier = (title: string, message: string) => void;

interface BulkHandlerParams {
    bulkSelection: ReturnType<typeof useBulkSelection>;
    teams: Team[];
    firestoreActions: FirestoreActions;
    showSuccess: ErrorNotifier;
}

export const createBulkDeleteHandler =
    ({ bulkSelection, teams, firestoreActions, showSuccess }: BulkHandlerParams) =>
    async () => {
        const ids = Array.from(bulkSelection.selectedMemberIds);
        if (ids.length === 0) return;

        const promises: Promise<void>[] = [];

        ids.forEach((memberId) => {
            promises.push(firestoreActions.updateMember(memberId, { status: 'resigned' }));

            const teamLedByMember = teams.find(
                (t: Team) =>
                    t.leadId === memberId ||
                    (t.lead && t.members?.find((m: Member) => m.id === memberId && m.name === t.lead))
            );

            if (teamLedByMember) {
                promises.push(firestoreActions.updateTeam(teamLedByMember.id, { lead: '', leadId: null }));
            }
        });

        await Promise.all(promises);
        showSuccess('일괄 퇴사 처리 완료', `${ids.length}명이 퇴사(비활성) 처리되었습니다.`);
        bulkSelection.clearSelection();
    };

export const createBulkMoveHandler =
    ({ bulkSelection, teams, firestoreActions, showSuccess }: BulkHandlerParams) =>
    async (targetTeamId: string, targetPartId: string | null) => {
        const ids = Array.from(bulkSelection.selectedMemberIds);
        if (ids.length === 0) return;

        const targetTeam = teams.find((team) => team.id === targetTeamId);
        const resolvedPartId = targetPartId ? targetPartId : null;
        const targetPart = resolvedPartId ? targetTeam?.parts.find((part) => part.id === resolvedPartId) : undefined;
        const teamName = targetTeam?.name;
        const partName = resolvedPartId ? (targetPart?.title ?? null) : null;

        const promises = ids.map((id) =>
            firestoreActions.updateMember(id, {
                teamId: targetTeamId,
                partId: resolvedPartId,
                ...(teamName ? { teamName } : {}),
                partName,
            })
        );

        await Promise.all(promises);
        showSuccess('일괄 이동 완료', `${ids.length}명이 이동되었습니다.`);
        bulkSelection.clearSelection();
    };

export const createReorderMemberHandler = (teams: Team[], firestoreActions: FirestoreActions) => async (activeId: string, overId: string) => {
    console.log('Reorder requested:', activeId, overId);

    const activeMember = teams
        .flatMap((t) => [...(t.members || []), ...t.parts.flatMap((p) => p.members)])
        .find((m) => m.id === activeId);
    const overMember = teams
        .flatMap((t) => [...(t.members || []), ...t.parts.flatMap((p) => p.members)])
        .find((m) => m.id === overId);

    if (!activeMember || !overMember) return;

    let siblings: Member[] = [];
    if (activeMember.partId) {
        const part = teams.flatMap((t) => t.parts).find((p) => p.id === activeMember.partId);
        siblings = part?.members || [];
    } else if (activeMember.teamId) {
        const team = teams.find((t) => t.id === activeMember.teamId);
        siblings = team?.members || [];
    }

    siblings = sortMembersByOrder(siblings);

    const oldIndex = siblings.findIndex((m) => m.id === activeId);
    const newIndex = siblings.findIndex((m) => m.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const newSiblings = [...siblings];
    const [movedItem] = newSiblings.splice(oldIndex, 1);
    newSiblings.splice(newIndex, 0, movedItem);

    const promises = newSiblings.map((member, index) =>
        member.order !== index ? firestoreActions.updateMemberOrder(member.id, index) : Promise.resolve()
    );

    await Promise.all(promises);
};

export const createReorderMemberToEndHandler = (teams: Team[], firestoreActions: FirestoreActions) => async (activeId: string) => {
    const activeMember = teams
        .flatMap((t) => [...(t.members || []), ...t.parts.flatMap((p) => p.members)])
        .find((m) => m.id === activeId);

    if (!activeMember) return;

    let siblings: Member[] = [];
    if (activeMember.partId) {
        const part = teams.flatMap((t) => t.parts).find((p) => p.id === activeMember.partId);
        siblings = part?.members || [];
    } else if (activeMember.teamId) {
        const team = teams.find((t) => t.id === activeMember.teamId);
        siblings = team?.members || [];
    }

    siblings = sortMembersByOrder(siblings);

    const oldIndex = siblings.findIndex((m) => m.id === activeId);
    if (oldIndex === -1 || oldIndex === siblings.length - 1) return;

    const newSiblings = [...siblings];
    const [movedItem] = newSiblings.splice(oldIndex, 1);
    newSiblings.push(movedItem);

    const promises = newSiblings.map((member, index) =>
        member.order !== index ? firestoreActions.updateMemberOrder(member.id, index) : Promise.resolve()
    );

    await Promise.all(promises);
};

export const createMoveMemberHandler =
    (teams: Team[], firestoreActions: FirestoreActions, showSuccess: ErrorNotifier) =>
    async (memberId: string, targetTeamId: string, targetPartId: string | null) => {
        const targetTeam = teams.find((team) => team.id === targetTeamId);
        const targetPart = targetPartId ? targetTeam?.parts.find((part) => part.id === targetPartId) : undefined;
        const teamName = targetTeam?.name;
        const partName = targetPart?.title ?? null;
        const nextOrder = getNextMemberOrder(targetPartId ? targetPart?.members || [] : targetTeam?.members || []);

        await firestoreActions.updateMember(memberId, {
            teamId: targetTeamId,
            partId: targetPartId,
            ...(teamName ? { teamName } : {}),
            partName,
            order: nextOrder,
        });
        showSuccess('멤버 이동 완료', '성공적으로 이동되었습니다.');
    };

export const createImportHandler =
    (teams: Team[], firestoreActions: FirestoreActions, showSuccess: ErrorNotifier, showError: ErrorNotifier) =>
    async (file: File) => {
        await processExcelImport(file, teams, firestoreActions, showSuccess, showError);
    };

export const createExportHandler = (teams: Team[], showSuccess: ErrorNotifier, showError: ErrorNotifier) => () => {
    try {
        excelUtils.exportMembersToExcel(teams);
        showSuccess('다운로드 시작', '엑셀 파일 다운로드가 시작되었습니다.');
    } catch (err) {
        console.error(err);
        showError('다운로드 실패', '엑셀 변환 중 오류가 발생했습니다.');
    }
};

export interface OrganizationLogicReturnArgs {
    sensors: ReturnType<typeof useMemberSort>['sensors'];
    handleDragStart: ReturnType<typeof useMemberSort>['handleDragStart'];
    handleDragEnd: ReturnType<typeof useMemberSort>['handleDragEnd'];
    dragActiveId: ReturnType<typeof useMemberSort>['activeId'];
    networkState: ReturnType<typeof useNetworkStatus>[0];
    saveOperation: ReturnType<typeof useMemberManagement>['saveOperation'];
    deleteOperation: ReturnType<typeof useMemberManagement>['deleteOperation'];
    seedOperation: ReturnType<typeof useOrganizationData>['seedOperation'];
    stats: ReturnType<typeof useOrganizationData>['stats'];
    statusFilter: StatusFilter;
    handleStatusFilter: (nextFilter: StatusFilter) => void;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    baseDate: string;
    setBaseDate: Dispatch<SetStateAction<string>>;
    tabs: { id: string; label: string }[];
    activeTab: string;
    handleTabChange: (tabId: string) => void;
    sortOption: 'name_asc' | 'members_desc';
    setSortOption: Dispatch<SetStateAction<'name_asc' | 'members_desc'>>;
    viewMode: ViewMode;
    setViewMode: Dispatch<SetStateAction<ViewMode>>;
    openTeamModal: ReturnType<typeof useTeamPartManagement>['openTeamModal'];
    visibleActiveTeams: ReturnType<typeof useOrganizationViewModels>['visibleActiveTeams'];
    handleContainerDragOver: ReturnType<typeof useAutoScroll>['handleContainerDragOver'];
    handleContainerDrop: ReturnType<typeof useAutoScroll>['handleContainerDrop'];
    isLoading: boolean;
    error: string | null;
    handleSeedDatabase: ReturnType<typeof useOrganizationData>['handleSeedDatabase'];
    hasAnyTeamsInView: ReturnType<typeof useOrganizationViewModels>['hasAnyTeamsInView'];
    groupedHeadquarters: ReturnType<typeof useOrganizationViewModels>['groupedHeadquarters'];
    headquarters: ReturnType<typeof useOrganizationData>['headquarters'];
    collapsedHeadquarters: ReturnType<typeof useOrganizationModals>['collapsedHeadquarters'];
    toggleHeadquarter: ReturnType<typeof useOrganizationModals>['toggleHeadquarter'];
    openHeadquarterModal: ReturnType<typeof useOrganizationModals>['openHeadquarterModal'];
    openAddHeadquarterModal: ReturnType<typeof useOrganizationModals>['openAddHeadquarterModal'];
    getTeamGridClass: ReturnType<typeof useOrganizationViewModels>['getTeamGridClass'];
    renderTeamCard: ReturnType<typeof useTeamRenderers>['renderTeamCard'];
    renderTeamCardCompact: ReturnType<typeof useTeamRenderers>['renderTeamCardCompact'];
    showOnLeaveList: boolean;
    showResignedList: boolean;
    inactiveMembersToShow: ReturnType<typeof useOrganizationViewModels>['inactiveMembersToShow'];
    handleReinstateMember: ReturnType<typeof useMemberManagement>['handleReinstateMember'];
    handleDeleteMember: ReturnType<typeof useMemberManagement>['handleDeleteMember'];
    handleDeleteResignedMember: ReturnType<typeof useMemberManagement>['handleDeleteResignedMember'];
    handleUpdateTeam: ReturnType<typeof useTeamPartManagement>['handleUpdateTeam'];
    modalProps: Record<string, unknown>;
    onImportExcel: (file: File) => Promise<void>;
    onExportExcel: () => void;
    onDownloadTemplate: () => void;
    bulkSelection: ReturnType<typeof useBulkSelection>;
    handleBulkDelete: () => Promise<void>;
    handleBulkMove: (targetTeamId: string, targetPartId: string | null) => Promise<void>;
}

export const buildOrganizationLogicReturn = ({
    sensors,
    handleDragStart,
    handleDragEnd,
    dragActiveId,
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
    headquarters,
    collapsedHeadquarters,
    toggleHeadquarter,
    openHeadquarterModal,
    openAddHeadquarterModal,
    getTeamGridClass,
    renderTeamCard,
    renderTeamCardCompact,
    showOnLeaveList,
    showResignedList,
    inactiveMembersToShow,
    handleReinstateMember,
    handleDeleteMember,
    handleDeleteResignedMember,
    handleUpdateTeam,
    modalProps,
    onImportExcel,
    onExportExcel,
    onDownloadTemplate,
    bulkSelection,
    handleBulkDelete,
    handleBulkMove,
}: OrganizationLogicReturnArgs) => ({
    dndContextProps: {
        sensors,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
    },
    dragActiveId,
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
    headquarters,
    collapsedHeadquarters,
    toggleHeadquarter,
    openHeadquarterModal,
    openAddHeadquarterModal,
    getTeamGridClass,
    renderTeamCard,
    renderTeamCardCompact,
    showOnLeaveList,
    showResignedList,
    inactiveMembersToShow,
    handleReinstateMember,
    handleDeleteMember,
    handleDeleteResignedMember,
    handleUpdateTeam,
    modalProps,
    onImportExcel,
    onExportExcel,
    onDownloadTemplate,
    bulkSelection,
    handleBulkDelete,
    handleBulkMove,
});
