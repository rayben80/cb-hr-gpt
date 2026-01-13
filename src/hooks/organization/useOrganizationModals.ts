/* eslint-disable max-lines-per-function */
import { useCallback, useState } from 'react';
import { Headquarter, LeaderHistory, Member, Team } from '../../constants';
import { normalizeMemberRole } from '../../utils/memberRoleUtils';
import { FirestoreActions } from './firestoreActions';
import { findMemberRecord } from './memberStateUtils';

interface UseOrganizationModalsOptions {
    teams: Team[];
    headquarters: Headquarter[];
    updateHeadquarter: (updated: Headquarter) => void;
    addHeadquarter: (newHq: Headquarter) => void;
    addHistoryEntry: (entry: Omit<LeaderHistory, 'id' | 'timestamp'>) => void;
    firestoreActions: FirestoreActions;
}

interface UseOrganizationModalsReturn {
    // Member move modal
    isMoveModalOpen: boolean;
    memberToMove: Member | null;
    openMoveModal: (member: Member) => void;
    closeMoveModal: () => void;
    handleMoveMember: (memberId: string, targetTeamId: string, targetPartId: string) => void;
    moveMemberToTeamPart: (memberId: string, targetTeamId: string, targetPartId: string) => void;
    // Bulk move modal
    isBulkMoveModalOpen: boolean;
    openBulkMoveModal: () => void;
    closeBulkMoveModal: () => void;
    // Headquarter modal
    isHeadquarterModalOpen: boolean;
    headquarterToEdit: Headquarter | null;
    openHeadquarterModal: (hq: Headquarter) => void;
    openAddHeadquarterModal: () => void;
    closeHeadquarterModal: () => void;
    handleSaveHeadquarter: (payload: {
        id?: string;
        leader?: Headquarter['leader'];
        description?: string;
        name?: string;
    }) => void;
    handleDismissHeadquarterLeader: (headquarterId: string) => void;
    // Collapsed headquarters state
    collapsedHeadquarters: Set<string>;
    toggleHeadquarter: (hqId: string) => void;
}

export function useOrganizationModals({
    teams,
    headquarters,
    updateHeadquarter,
    addHeadquarter,
    addHistoryEntry,
    firestoreActions,
}: UseOrganizationModalsOptions): UseOrganizationModalsReturn {
    // Member move modal state
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [memberToMove, setMemberToMove] = useState<Member | null>(null);
    const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);

    // Headquarter modal state
    const [isHeadquarterModalOpen, setIsHeadquarterModalOpen] = useState(false);
    const [headquarterToEdit, setHeadquarterToEdit] = useState<Headquarter | null>(null);

    // Collapsed headquarters state
    const [collapsedHeadquarters, setCollapsedHeadquarters] = useState<Set<string>>(new Set());

    // Move member between teams/parts
    const moveMemberToTeamPart = useCallback(
        (memberId: string, targetTeamId: string, targetPartId: string) => {
            const memberRecord = findMemberRecord(teams, memberId);
            if (!memberRecord) {
                console.warn('Member not found for moving:', memberId);
                return;
            }

            const targetTeam = teams.find((team) => team.id === targetTeamId);
            if (!targetTeam) {
                console.warn('Target team not found for moving:', targetTeamId);
                return;
            }

            const resolvedPartId = targetPartId ? targetPartId : null;
            const targetPart = resolvedPartId
                ? targetTeam.parts.find((part) => part.id === resolvedPartId)
                : undefined;
            const shouldNormalizeRole = memberRecord.teamId !== targetTeamId;
            const nextRole = shouldNormalizeRole
                ? normalizeMemberRole(memberRecord.member.role)
                : memberRecord.member.role;

            void firestoreActions
                .updateMember(memberId, {
                    teamId: targetTeamId,
                    partId: resolvedPartId,
                    teamName: targetTeam.name,
                    partName: resolvedPartId ? targetPart?.title ?? null : null,
                    role: nextRole,
                })
                .catch((error) => {
                    console.error('Failed to move member:', error);
                });
        },
        [teams, firestoreActions]
    );

    // Member move modal handlers
    const openMoveModal = useCallback((member: Member) => {
        setMemberToMove(member);
        setIsMoveModalOpen(true);
    }, []);

    const closeMoveModal = useCallback(() => {
        setIsMoveModalOpen(false);
        setMemberToMove(null);
    }, []);

    const handleMoveMember = useCallback(
        (memberId: string, targetTeamId: string, targetPartId: string) => {
            moveMemberToTeamPart(memberId, targetTeamId, targetPartId);
            closeMoveModal();
        },
        [moveMemberToTeamPart, closeMoveModal]
    );

    // Bulk modal
    const openBulkMoveModal = useCallback(() => setIsBulkMoveModalOpen(true), []);
    const closeBulkMoveModal = useCallback(() => setIsBulkMoveModalOpen(false), []);

    // Headquarter collapse toggle
    const toggleHeadquarter = useCallback((hqId: string) => {
        setCollapsedHeadquarters((prev) => {
            const next = new Set(prev);
            if (next.has(hqId)) {
                next.delete(hqId);
            } else {
                next.add(hqId);
            }
            return next;
        });
    }, []);

    // Headquarter modal handlers
    const openHeadquarterModal = useCallback((hq: Headquarter) => {
        setHeadquarterToEdit(hq);
        setIsHeadquarterModalOpen(true);
    }, []);

    const openAddHeadquarterModal = useCallback(() => {
        setHeadquarterToEdit(null);
        setIsHeadquarterModalOpen(true);
    }, []);

    const closeHeadquarterModal = useCallback(() => {
        setIsHeadquarterModalOpen(false);
        setHeadquarterToEdit(null);
    }, []);

    const handleSaveHeadquarter = useCallback(
        (payload: { id?: string; leader?: Headquarter['leader']; description?: string; name?: string }) => {
            if (headquarterToEdit) {
                // Update existing HQ
                const target = headquarters.find((hq) => hq.id === payload.id);
                if (!target) return;

                // Create updated object properly handling leader removal
                // We must explicitly set leader to undefined if it's being removed
                // because updateHeadquarter performs a merge { ...hq, ...updated }
                const updated: Headquarter = {
                    ...target, // Start with everything
                    ...(payload.description !== undefined && { description: payload.description }),
                    ...(payload.name !== undefined && { name: payload.name }),
                    leader: payload.leader, // Explicitly assign, even if undefined (requires types.ts update)
                };

                updateHeadquarter(updated);

                // Track leader change history
                const oldLeaderName = target.leader?.name;
                const newLeaderName = payload.leader?.name;

                if (!oldLeaderName && newLeaderName) {
                    addHistoryEntry({
                        headquarterId: target.id,
                        leaderName: newLeaderName,
                        action: 'appointed',
                        reason: '신규 임명',
                    });
                } else if (oldLeaderName && newLeaderName && oldLeaderName !== newLeaderName) {
                    addHistoryEntry({
                        headquarterId: target.id,
                        leaderName: newLeaderName,
                        action: 'appointed',
                        reason: `본부장 교체 (전임: ${oldLeaderName})`,
                    });
                }
            } else {
                // Create New HQ
                const newHq: Headquarter = {
                    id: crypto.randomUUID(),
                    name: payload.name || '새 본부',
                    description: payload.description || '',
                    leader: payload.leader,
                };
                addHeadquarter(newHq);

                if (payload.leader) {
                    addHistoryEntry({
                        headquarterId: newHq.id,
                        leaderName: payload.leader.name,
                        action: 'appointed',
                        reason: '본부 생성 시 임명',
                    });
                }
            }
            closeHeadquarterModal();
        },
        [headquarters, updateHeadquarter, addHeadquarter, headquarterToEdit, closeHeadquarterModal, addHistoryEntry]
    );

    // Dismiss headquarter leader (set to vacancy)
    // Dismiss headquarter leader (set to vacancy)
    const handleDismissHeadquarterLeader = useCallback(
        (headquarterId: string) => {
            const target = headquarters.find((hq) => hq.id === headquarterId);
            if (!target) return;

            // Updated with explicit undefined for leader to ensure merge overrides it
            const updated: Headquarter = { ...target, leader: undefined };

            const oldLeaderName = target.leader?.name;
            updateHeadquarter(updated);

            if (oldLeaderName) {
                addHistoryEntry({
                    headquarterId: target.id,
                    leaderName: oldLeaderName,
                    action: 'dismissed',
                    reason: '본부장 해임',
                });
            }

            closeHeadquarterModal();
        },
        [headquarters, updateHeadquarter, closeHeadquarterModal, addHistoryEntry]
    );

    return {
        // Member move
        isMoveModalOpen,
        memberToMove,
        openMoveModal,
        closeMoveModal,
        handleMoveMember,
        moveMemberToTeamPart,
        isBulkMoveModalOpen,
        openBulkMoveModal,
        closeBulkMoveModal,
        // Headquarter
        isHeadquarterModalOpen,
        headquarterToEdit,
        openHeadquarterModal,
        openAddHeadquarterModal,
        closeHeadquarterModal,
        handleSaveHeadquarter,
        handleDismissHeadquarterLeader,
        // Collapsed
        collapsedHeadquarters,
        toggleHeadquarter,
    };
}
