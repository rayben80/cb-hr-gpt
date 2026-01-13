import { useCallback } from 'react';
import { Member as MemberType, Team } from '../../constants';

import { AsyncOperationActions } from '../common/useAsyncOperation';
import { ConfirmationActions } from '../common/useConfirmation';
import {
    deleteResignedOptions,
    getDeleteMemberConfirmationConfig,
    getDeleteResignedMemberConfirmationConfig,
    getReinstateMemberConfirmationConfig,
} from './memberOperationUtils';
import { findMemberLocation } from './memberStateUtils';
import { FirestoreActions } from './firestoreActions';
import { SaveMemberOptions } from './useMemberOperations';

/** Extended Member type with location info for resigned member operations */
interface MemberWithLocation extends MemberType {
    teamId?: string | null | undefined;
    partId?: string | null | undefined;
}

interface UseMemberOperationHandlersProps {
    teams: Team[];
    onOperationSuccess: (keepOpen: boolean) => void;
    confirmationActions: ConfirmationActions;
    saveOperationActions: AsyncOperationActions;
    deleteOperationActions: AsyncOperationActions;
    showError: (message: string) => void;
    firestoreActions: FirestoreActions;
}

const createSaveOptions = (
    isEditing: boolean,
    onOperationSuccess: (keepOpen: boolean) => void,
    options?: SaveMemberOptions
) => ({
    successMessage: isEditing ? '멤버 정보가 성공적으로 업데이트되었습니다.' : '새 멤버가 성공적으로 추가되었습니다.',
    errorMessage: `멤버 ${isEditing ? '수정' : '추가'} 중 오류가 발생했습니다.`,
    onSuccess: () => {
        onOperationSuccess(options?.keepOpen || false);
        options?.onSuccess?.();
    },
});

export const useMemberOperationHandlers = ({
    teams,
    onOperationSuccess,
    confirmationActions,
    saveOperationActions,
    deleteOperationActions,
    showError,
    firestoreActions,
}: UseMemberOperationHandlersProps) => {
    const handleSaveMember = useCallback(
        async (data: MemberType, isEditing: boolean, options?: SaveMemberOptions) => {
            const { teamId, partId, ...memberData } = data;

            const resolvedTeamId = teamId?.trim() || '';
            if (!resolvedTeamId) {
                showError('팀 정보가 필요합니다.');
                return;
            }
            const resolvedPartId = partId ? partId : null;
            const team = teams.find((t) => t.id === resolvedTeamId);
            const part = resolvedPartId ? team?.parts.find((p) => p.id === resolvedPartId) : undefined;

            await saveOperationActions.execute(
                async () => {
                    const memberPayload = {
                        ...memberData,
                        teamId: resolvedTeamId,
                        partId: resolvedPartId,
                        ...(team?.name ? { teamName: team.name } : {}),
                        partName: resolvedPartId ? part?.title ?? null : null,
                        // Ensure status is set for new members if not provided
                        status: memberData.status || 'active',
                    };

                    let resolvedMemberId = memberData.id;

                    // 1. Save/Update Member
                    if (isEditing && memberData.id) {
                        await firestoreActions.updateMember(memberData.id, memberPayload);
                    } else {
                        // For new member, id might be empty/temp, let Firestore generate it
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id, ...newMemberData } = memberPayload;
                        resolvedMemberId = await firestoreActions.addMember(newMemberData);
                    }

                    // 2. Handle Team Lead updates if requested
                    if (resolvedTeamId) {
                        if (options?.setTeamLead) {
                            await firestoreActions.updateTeam(resolvedTeamId, {
                                lead: memberData.name,
                                leadId: resolvedMemberId || null,
                            });
                        } else if (options?.clearTeamLead) {
                            // Check if this member IS the leader before clearing?
                            // Options imply explicit action.
                            await firestoreActions.updateTeam(resolvedTeamId, {
                                lead: '',
                                leadId: null,
                            });
                        }
                    }

                    return 'success';
                },
                createSaveOptions(isEditing, onOperationSuccess, options)
            );
        },
        [teams, saveOperationActions, firestoreActions, onOperationSuccess, showError]
    );

    const handleDeleteMember = useCallback(
        (memberToDelete: MemberType) => {
            const location = findMemberLocation(teams, memberToDelete.id);
            if (!location.teamId) {
                showError('오류: 멤버의 소속을 찾을 수 없어 퇴사 처리할 수 없습니다.');
                return;
            }

            confirmationActions.showConfirmation(
                getDeleteMemberConfirmationConfig(memberToDelete.name, async () => {
                    // Soft Delete: Update status to 'resigned'
                    await saveOperationActions.execute(
                        async () => {
                            await firestoreActions.updateMember(memberToDelete.id, {
                                status: 'resigned',
                            });
                            return 'success';
                        },
                        { successMessage: '멤버가 퇴사 처리되었습니다.' }
                    );
                })
            );
        },
        [teams, confirmationActions, showError, saveOperationActions, firestoreActions]
    );

    const handleDeleteResignedMember = useCallback(
        (memberToDelete: MemberWithLocation) => {
            confirmationActions.showConfirmation(
                getDeleteResignedMemberConfirmationConfig(memberToDelete.name, async () => {
                    await deleteOperationActions.execute(async () => {
                        await firestoreActions.deleteMember(memberToDelete.id);
                        return 'success';
                    }, deleteResignedOptions);
                })
            );
        },
        [confirmationActions, deleteOperationActions, firestoreActions]
    );

    const handleReinstateMember = useCallback(
        (memberToReinstate: MemberWithLocation) => {
            confirmationActions.showConfirmation(
                getReinstateMemberConfirmationConfig(memberToReinstate.name, async () => {
                    if (memberToReinstate.teamId) {
                        await saveOperationActions.execute(
                            async () => {
                                await firestoreActions.updateMember(memberToReinstate.id, {
                                    status: 'active',
                                });
                                return 'success';
                            },
                            { successMessage: '멤버가 복직되었습니다.' }
                        );
                    } else {
                        showError('멤버를 복직 처리할 수 없습니다. 소속 정보가 누락되었습니다.');
                    }
                })
            );
        },
        [confirmationActions, showError, saveOperationActions, firestoreActions]
    );

    return {
        handleSaveMember,
        handleDeleteMember,
        handleDeleteResignedMember,
        handleReinstateMember,
    };
};
