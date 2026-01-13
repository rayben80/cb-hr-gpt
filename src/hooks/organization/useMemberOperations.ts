import { Team } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { useAsyncOperation } from '../common/useAsyncOperation';
import { useConfirmation } from '../common/useConfirmation';
import { FirestoreActions } from './firestoreActions';
import { useMemberOperationHandlers } from './useMemberOperationHandlers';

export interface SaveMemberOptions {
    keepOpen?: boolean;
    onSuccess?: () => void;
    setTeamLead?: boolean;
    clearTeamLead?: boolean;
}

export const useMemberOperations = (
    teams: Team[],
    onOperationSuccess: (keepOpen: boolean) => void,
    firestoreActions: FirestoreActions
) => {
    const [confirmation, confirmationActions] = useConfirmation();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const { showError } = useError();

    const handlers = useMemberOperationHandlers({
        teams,
        onOperationSuccess,
        confirmationActions,
        saveOperationActions,
        deleteOperationActions,
        showError,
        firestoreActions,
    });

    return {
        saveOperation,
        deleteOperation,
        confirmation,
        confirmationActions,
        ...handlers,
    };
};
