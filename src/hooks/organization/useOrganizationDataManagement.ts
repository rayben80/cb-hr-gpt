import { useMemo } from 'react';
import {
    useLeaderHistory,
    useMemberManagement,
    useOrganizationModals,
    useTeamPartManagement,
    useTeamRenderers,
} from '..';

interface DataManagementProps {
    teams: any[];
    headquarters: any[];
    updateHeadquarter: any;
    addHeadquarter: any;
    firestoreActions: any;
    uiState: any;
}

export function useOrganizationDataManagement({
    teams,
    headquarters,
    updateHeadquarter,
    addHeadquarter,
    firestoreActions,
    uiState,
}: DataManagementProps) {
    const { addHistoryEntry } = useLeaderHistory();

    const orgModals = useOrganizationModals({
        teams,
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        addHistoryEntry,
        firestoreActions,
    });

    const memberMgmt = useMemberManagement(teams, firestoreActions);
    const teamParts = useTeamPartManagement(teams, headquarters, firestoreActions);

    const { renderTeamCard, renderTeamCardCompact } = useTeamRenderers({
        baseDate: uiState.baseDate,
        searchTerm: uiState.searchTerm,
        statusFilter: uiState.statusFilter,
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

    const modalProps = useMemo(
        () => ({
            ...orgModals,
            ...memberMgmt,
            ...teamParts,
            teams,
            teamPartConfirmation: teamParts.confirmation,
            teamPartConfirmationActions: teamParts.confirmationActions,
            memberConfirmation: memberMgmt.confirmation,
            memberConfirmationActions: memberMgmt.confirmationActions,
        }),
        [orgModals, memberMgmt, teamParts, teams]
    );

    return {
        orgModals,
        memberMgmt,
        teamParts,
        renderTeamCard,
        renderTeamCardCompact,
        modalProps,
    };
}
