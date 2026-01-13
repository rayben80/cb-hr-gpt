import { useCallback } from 'react';
import { Headquarter, HQ_UNASSIGNED_ID, initialHeadquarters, Team } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { DEFAULT_MEMBER_ROLE, normalizeMemberRole } from '../../utils/memberRoleUtils';
import { AsyncOperationActions } from '../common/useAsyncOperation';
import { ConfirmationActions } from '../common/useConfirmation';
import { FirestoreActions } from './firestoreActions';

interface TeamModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Team | null;
}

interface UseTeamActionsProps {
    teams: Team[];
    headquarters: Headquarter[];
    teamModalState: TeamModalState;
    saveOperationActions: AsyncOperationActions;
    deleteOperationActions: AsyncOperationActions;
    closeTeamModal: () => void;
    confirmationActions: ConfirmationActions;
    firestoreActions: FirestoreActions;
}

// Extracted Helper: Add Team Logic
const executeAddTeam = async (
    newData: { name: string; lead: string },
    headquarters: Headquarter[],
    firestoreActions: FirestoreActions
) => {
    const fallbackHeadquarterId =
        (headquarters && headquarters[0]?.id) ?? initialHeadquarters[0]?.id ?? HQ_UNASSIGNED_ID;

    await firestoreActions.addTeam({
        name: newData.name,
        lead: newData.lead,
        parts: [],
        headquarterId: fallbackHeadquarterId,
    } as any);
};

// Extracted Helper: Edit Team Logic
const executeEditTeam = async (
    data: Team,
    newData: { name: string; lead: string },
    teams: Team[],
    firestoreActions: FirestoreActions
) => {
    const currentTeam = teams.find((t) => t.id === data.id);
    const allMembers = [...(currentTeam?.members || []), ...(currentTeam?.parts.flatMap((p) => p.members) || [])];
    const resolvedLeadId = newData.lead
        ? (allMembers.find((m) => m.name === newData.lead)?.id ??
          (newData.lead === data.lead ? (currentTeam?.leadId ?? null) : null))
        : null;

    // 1. Update Team Info
    await firestoreActions.updateTeam(data.id, {
        name: newData.name,
        lead: newData.lead,
        leadId: resolvedLeadId,
    });

    // 2. Handle Lead Change Side Effects
    await handleLeadChangeSideEffects(data.lead, newData.lead, allMembers, firestoreActions);
};

export const useTeamActions = ({
    teams,
    headquarters,
    teamModalState,
    saveOperationActions,
    deleteOperationActions,
    closeTeamModal,
    confirmationActions,
    firestoreActions,
}: UseTeamActionsProps) => {
    const { showError } = useError();

    const hasTeamMembers = (team: Team) =>
        (team.members?.length ?? 0) > 0 || team.parts.some((part) => part.members && part.members.length > 0);

    const handleSaveTeam = useCallback(
        async (newData: { name: string; lead: string }) => {
            const { mode, data } = teamModalState;
            await saveOperationActions.execute(
                async () => {
                    if (mode === 'add') {
                        await executeAddTeam(newData, headquarters, firestoreActions);
                    } else {
                        if (!data) throw new Error('팀 데이터가 없습니다.');
                        await executeEditTeam(data, newData, teams, firestoreActions);
                    }
                    return 'success';
                },
                {
                    successMessage:
                        mode === 'add' ? '팀이 성공적으로 추가되었습니다.' : '팀이 성공적으로 수정되었습니다.',
                    errorMessage: `팀 ${mode === 'add' ? '추가' : '수정'} 중 오류가 발생했습니다.`,
                    onSuccess: () => closeTeamModal(),
                }
            );
        },
        [teamModalState, saveOperationActions, closeTeamModal, teams, headquarters, firestoreActions]
    );

    const handleDeleteTeam = useCallback(
        (teamId: string) => {
            const team = teams.find((t) => t.id === teamId);
            if (!team) return;
            const hasMembers = hasTeamMembers(team);
            if (hasMembers) {
                showError('팀 삭제 불가', '팀에 멤버가 있어 삭제할 수 없습니다.');
                return;
            }
            confirmationActions.showConfirmation({
                title: '팀 삭제 확인',
                message: `정말로 '${team.name}' 팀을 삭제하시겠습니까?`,
                onConfirm: async () => {
                    await deleteOperationActions.execute(
                        async () => {
                            await firestoreActions.deleteTeam(teamId);
                            return 'success';
                        },
                        {
                            successMessage: '팀이 성공적으로 삭제되었습니다.',
                            errorMessage: '팀 삭제 중 오류가 발생했습니다.',
                        }
                    );
                },
                confirmButtonText: '삭제',
                confirmButtonColor: 'destructive',
            });
        },
        [teams, showError, confirmationActions, deleteOperationActions, firestoreActions]
    );

    const handleUpdateTeam = useCallback(
        async (teamId: string, updates: Partial<Team>) => {
            const team = teams.find((t) => t.id === teamId);
            if (!team) return;

            await saveOperationActions.execute(
                async () => {
                    await firestoreActions.updateTeam(teamId, updates);
                    return 'success';
                },
                {
                    successMessage: '팀 정보가 업데이트되었습니다.',
                    errorMessage: '팀 정보 업데이트 중 오류가 발생했습니다.',
                }
            );
        },
        [teams, saveOperationActions, firestoreActions]
    );

    return { handleSaveTeam, handleDeleteTeam, handleUpdateTeam };
};

// Helper function to handle side effects when a team lead changes
const handleLeadChangeSideEffects = async (
    oldLead: string | undefined,
    newLead: string | undefined,
    allMembers: any[],
    firestoreActions: FirestoreActions
) => {
    // 1. Handle Old Lead (remove role)
    if (oldLead && oldLead !== newLead) {
        const oldLeadMember = allMembers.find((m) => m.name === oldLead);
        if (oldLeadMember) {
            let newRole = DEFAULT_MEMBER_ROLE;
            const newRoleBeforeLead = undefined;

            if (oldLeadMember.roleBeforeLead) {
                const restored = normalizeMemberRole(oldLeadMember.roleBeforeLead);
                newRole = restored === '팀장' ? DEFAULT_MEMBER_ROLE : restored;
            }

            await firestoreActions.updateMember(oldLeadMember.id, {
                role: newRole,
                roleBeforeLead: newRoleBeforeLead,
            });
        }
    }

    // 2. Handle New Lead (assign role)
    if (newLead && newLead !== oldLead) {
        const newLeadMember = allMembers.find((m) => m.name === newLead);
        if (newLeadMember) {
            const expectedRole = '팀장';
            if (normalizeMemberRole(newLeadMember.role) !== expectedRole) {
                await firestoreActions.updateMember(newLeadMember.id, {
                    role: expectedRole,
                    roleBeforeLead: newLeadMember.roleBeforeLead || newLeadMember.role,
                });
            }
        }
    }
};
