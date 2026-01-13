import { useCallback } from 'react';
import { Part, Team } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { FirestoreActions } from './firestoreActions';

interface UsePartActionsProps {
    teams: Team[];
    partModalState: any;
    saveOperationActions: any;
    deleteOperationActions: any;
    closePartModal: () => void;
    confirmationActions: any;
    firestoreActions: FirestoreActions;
}

export const usePartActions = ({
    teams,
    partModalState,
    saveOperationActions,
    deleteOperationActions,
    closePartModal,
    confirmationActions,
    firestoreActions,
}: UsePartActionsProps) => {
    const { showError } = useError();

    const handleSavePart = useCallback(
        async (newData: { name: string }) => {
            const { mode, data } = partModalState;
            if (!data) return;

            const teamId = data.teamId;
            const team = teams.find((t) => t.id === teamId);
            if (!team) return;

            await saveOperationActions.execute(
                async () => {
                    let updatedParts = [...team.parts];

                    if (mode === 'add') {
                        const newPart: Part = {
                            id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            title: newData.name,
                            members: [], // Members are stored separately now, but keeping empty array for type compatibility
                        };
                        updatedParts.push(newPart);
                    } else if (data.part) {
                        updatedParts = updatedParts.map((p) =>
                            p.id === data.part.id ? { ...p, title: newData.name } : p
                        );
                    }

                    await firestoreActions.updateTeam(teamId, { parts: updatedParts });
                    return 'success';
                },
                {
                    successMessage:
                        mode === 'add' ? '파트가 성공적으로 추가되었습니다.' : '파트가 성공적으로 수정되었습니다.',
                    errorMessage: `파트 ${mode === 'add' ? '추가' : '수정'} 중 오류가 발생했습니다.`,
                    onSuccess: () => closePartModal(),
                }
            );
        },
        [partModalState, saveOperationActions, closePartModal, teams, firestoreActions]
    );

    const handleDeletePart = useCallback(
        (teamId: string, partId: string) => {
            const team = teams.find((t) => t.id === teamId);
            const part = team?.parts.find((p) => p.id === partId);

            // Check for members in this part
            // Since `team.parts` might not have up-to-date members if they are joined in `useOrganizationData`,
            // we rely on the `teams` passed prop which `useOrganizationData` returns as JOINED.
            // So `part.members` length check is valid.
            if (!part || (part.members && part.members.length > 0)) {
                if (part?.members && part.members.length > 0)
                    showError('파트 삭제 불가', '파트에 소속된 멤버가 있어 삭제할 수 없습니다.');
                return;
            }

            confirmationActions.showConfirmation({
                title: '파트 삭제 확인',
                message: `정말로 '${part.title}' 파트를 삭제하시겠습니까?`,
                onConfirm: async () => {
                    await deleteOperationActions.execute(
                        async () => {
                            const updatedParts = team!.parts.filter((p) => p.id !== partId);
                            await firestoreActions.updateTeam(teamId, { parts: updatedParts });
                            return 'success';
                        },
                        {
                            successMessage: '파트가 성공적으로 삭제되었습니다.',
                            errorMessage: '파트 삭제 중 오류가 발생했습니다.',
                        }
                    );
                },
                confirmButtonText: '삭제',
                confirmButtonColor: 'destructive',
            });
        },
        [teams, showError, confirmationActions, deleteOperationActions, firestoreActions]
    );

    return { handleSavePart, handleDeletePart };
};
