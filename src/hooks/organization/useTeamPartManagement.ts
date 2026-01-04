import { useCallback } from 'react';
import { Headquarter, initialHeadquarters, Part, Team } from '../../constants';
import { useAsyncOperation } from '../common/useAsyncOperation';
import { useConfirmation } from '../common/useConfirmation';
import { useModal } from '../common/useModal';
import { usePartActions } from './usePartActions';
import { useTeamActions } from './useTeamActions';

/**
 * 팀과 파트 관리 로직을 처리하는 커스텀 훅
 */
export const useTeamPartManagement = (
    teams: Team[],
    headquarters: Headquarter[] = initialHeadquarters,
    firestoreActions: any
) => {
    const [partModalState, partModalActions] = useModal<{ teamId: string; part?: Part }>();
    const [teamModalState, teamModalActions] = useModal<Team>();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const [confirmation, confirmationActions] = useConfirmation();

    const openPartModal = useCallback(
        (mode: 'add' | 'edit', data: { teamId: string; part?: Part }) => partModalActions.openModal(mode, data),
        [partModalActions]
    );
    const closePartModal = useCallback(() => partModalActions.closeModal(), [partModalActions]);
    const openTeamModal = useCallback(
        (mode: 'add' | 'edit', data: Team | null) => teamModalActions.openModal(mode, data || undefined),
        [teamModalActions]
    );
    const closeTeamModal = useCallback(() => teamModalActions.closeModal(), [teamModalActions]);

    const { handleSavePart, handleDeletePart } = usePartActions({
        teams,
        partModalState,
        saveOperationActions,
        deleteOperationActions,
        closePartModal,
        confirmationActions,
        firestoreActions,
    });
    const { handleSaveTeam, handleDeleteTeam, handleUpdateTeam } = useTeamActions({
        teams,
        headquarters,
        teamModalState,
        saveOperationActions,
        deleteOperationActions,
        closeTeamModal,
        confirmationActions,
        firestoreActions,
    });

    return {
        partModalState,
        teamModalState,
        openPartModal,
        closePartModal,
        handleSavePart,
        handleDeletePart,
        openTeamModal,
        closeTeamModal,
        handleSaveTeam,
        handleDeleteTeam,
        handleUpdateTeam,
        saveOperation,
        deleteOperation,
        confirmation,
        confirmationActions,
    };
};
