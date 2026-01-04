/* eslint-disable complexity */
import { memo } from 'react';
import { Member, Team } from '../../constants';
import { ConfirmationModal } from '../feedback/ConfirmationModal';
import { HeadquarterActionModal } from './HeadquarterActionModal';
import { MemberActionModal } from './MemberActionModal';
import { MemberMoveModal } from './MemberMoveModal';
import { PartActionModal } from './PartActionModal';
import { TeamActionModal } from './TeamActionModal';

interface OrganizationModalsProps {
    // Headquarter Modal
    isHeadquarterModalOpen: boolean;
    closeHeadquarterModal: () => void;
    headquarterToEdit: any;
    handleSaveHeadquarter: (data: any) => Promise<void>;
    handleDismissHeadquarterLeader?: (headquarterId: string) => void;

    // Member Modal
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    handleSaveMember: (data: any) => Promise<void>;
    teams: Team[];
    editingMember: Member | null;
    modalContext: { teamId?: string; partId?: string } | undefined;

    // Part Modal
    partModalState: { isOpen: boolean; mode: 'add' | 'edit'; data: any };
    closePartModal: () => void;
    handleSavePart: (data: any) => Promise<void>;

    // Team Modal
    teamModalState: { isOpen: boolean; mode: 'add' | 'edit'; data: any };
    closeTeamModal: () => void;
    handleSaveTeam: (data: any) => Promise<void>;

    // Team/Part Confirmation Modal
    teamPartConfirmation: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmButtonText?: string;
    };
    teamPartConfirmationActions: { closeConfirmation: () => void };

    // Member Confirmation Modal
    memberConfirmation: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmButtonText?: string;
        confirmButtonColor?: string;
    };
    memberConfirmationActions: { closeConfirmation: () => void };

    // Member Move Modal
    isMoveModalOpen: boolean;
    closeMoveModal: () => void;
    handleMoveMember: (targetTeamId: string, targetPartId?: string) => Promise<void>;
    memberToMove: Member | null;
}

export const OrganizationModals = memo(
    ({
        isHeadquarterModalOpen,
        closeHeadquarterModal,
        headquarterToEdit,
        handleSaveHeadquarter,
        handleDismissHeadquarterLeader,
        isModalOpen,
        setIsModalOpen,
        handleSaveMember,
        teams,
        editingMember,
        modalContext,
        partModalState,
        closePartModal,
        handleSavePart,
        teamModalState,
        closeTeamModal,
        handleSaveTeam,
        teamPartConfirmation,
        teamPartConfirmationActions,
        memberConfirmation,
        memberConfirmationActions,
        isMoveModalOpen,
        closeMoveModal,
        handleMoveMember,
        memberToMove,
    }: OrganizationModalsProps) => {
        return (
            <>
                {(!partModalState || !teamModalState) && (
                    <div style={{ display: 'none' }}>
                        {(() => {
                            console.error('OrganizationModals: Missing modal state', {
                                partModalState,
                                teamModalState,
                            });
                            return null;
                        })()}
                    </div>
                )}
                <HeadquarterActionModal
                    isOpen={isHeadquarterModalOpen}
                    onClose={closeHeadquarterModal}
                    headquarter={headquarterToEdit}
                    onSave={handleSaveHeadquarter}
                    {...(handleDismissHeadquarterLeader && { onDismissLeader: handleDismissHeadquarterLeader })}
                />
                <MemberActionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveMember}
                    teams={teams}
                    memberData={editingMember}
                    context={
                        modalContext?.teamId ? { teamId: modalContext.teamId, partId: modalContext.partId || '' } : null
                    }
                />
                <PartActionModal
                    isOpen={partModalState?.isOpen || false}
                    onClose={closePartModal}
                    onSave={handleSavePart}
                    mode={partModalState?.mode || 'add'}
                    initialName={partModalState?.data?.part?.title || ''}
                />
                <TeamActionModal
                    isOpen={teamModalState?.isOpen || false}
                    onClose={closeTeamModal}
                    onSave={handleSaveTeam}
                    mode={teamModalState?.mode || 'add'}
                    initialData={teamModalState?.data}
                    existingTeams={teams}
                />
                <ConfirmationModal
                    isOpen={teamPartConfirmation.isOpen}
                    onClose={teamPartConfirmationActions.closeConfirmation}
                    onConfirm={teamPartConfirmation.onConfirm}
                    title={teamPartConfirmation.title}
                    message={teamPartConfirmation.message}
                    confirmButtonText={teamPartConfirmation.confirmButtonText || '확인'}
                    confirmButtonColor="destructive"
                />
                {/* Member Confirmation Modal (for resignation/reinstatement) */}
                <ConfirmationModal
                    isOpen={memberConfirmation.isOpen}
                    onClose={memberConfirmationActions.closeConfirmation}
                    onConfirm={memberConfirmation.onConfirm}
                    title={memberConfirmation.title}
                    message={memberConfirmation.message}
                    confirmButtonText={memberConfirmation.confirmButtonText || '확인'}
                    confirmButtonColor={
                        (memberConfirmation.confirmButtonColor as 'destructive' | 'outline') || 'destructive'
                    }
                />
                <MemberMoveModal
                    isOpen={isMoveModalOpen}
                    onClose={closeMoveModal}
                    onMove={handleMoveMember}
                    member={memberToMove}
                    teams={teams}
                />
            </>
        );
    }
);

OrganizationModals.displayName = 'OrganizationModals';
