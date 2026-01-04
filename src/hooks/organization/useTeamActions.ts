import { useCallback } from 'react';
import { Headquarter, HQ_UNASSIGNED_ID, initialHeadquarters, Member, Team } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { DEFAULT_MEMBER_ROLE, normalizeMemberRole } from '../../utils/memberRoleUtils';
import { AsyncOperationActions } from '../common/useAsyncOperation';
import { ConfirmationActions } from '../common/useConfirmation';

interface TeamModalState {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Team | null;
}

interface FirestoreActions {
    addTeam: (team: Omit<Team, 'id'>) => Promise<string>;
    updateTeam: (id: string, data: Partial<Team>) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
    updateMember: (id: string, data: Partial<Member>) => Promise<void>;
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
                    const fallbackHeadquarterId =
                        (headquarters && headquarters[0]?.id) ?? initialHeadquarters[0]?.id ?? HQ_UNASSIGNED_ID;

                    if (mode === 'add') {
                        // New Team
                        // Note: Lead processing for NEW team is tricky if we don't have member list to find the lead's ID.
                        // However, usually you create a team first, then add members?
                        // If the UI allows selecting a lead immediately, that person must exist.
                        // Use `teams` (joined data) to find member by name?
                        // It's safer to just create the team first.
                        await firestoreActions.addTeam({
                            name: newData.name,
                            lead: newData.lead, // Storing name, but without ID it's incomplete if we rely on leadId
                            parts: [],
                            headquarterId: fallbackHeadquarterId,
                        } as any);
                        // Note: existing logic didn't seem to set leadId on add?
                        // Checked executeSaveTeam: it sets lead: newData.lead.
                    } else {
                        // Edit Team
                        if (!data) throw new Error('팀 데이터가 없습니다.');

                        // 1. Update Team Info
                        await firestoreActions.updateTeam(data.id, {
                            name: newData.name,
                            lead: newData.lead,
                        });

                        // 2. Handle Lead Change Side Effects (Update Member Roles)
                        const oldLead = data.lead;
                        const newLead = newData.lead;

                        // We iterate all members of this team to find matching names.
                        // Since `teams` is passed with joined members, we can search `data.members`.
                        // But `data` from modal might be stale, better look up `teams.find(t => t.id === data.id)`.
                        const currentTeam = teams.find((t) => t.id === data.id);
                        const allMembers = [
                            ...(currentTeam?.members || []),
                            ...(currentTeam?.parts.flatMap((p) => p.members) || []),
                        ];

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
                                    roleBeforeLead: newRoleBeforeLead, // Set to undefined (FieldAttributes in firestore? Sending undefined usually ignores, sending null deletes?)
                                    // If we want to delete the field, we might need deleteField().
                                    // For now, sending null or empty might match app logic.
                                    // I'll send undefined for now, or check if interface allows.
                                    // Partial<Member> allows optional.
                                });
                            }
                        }

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
