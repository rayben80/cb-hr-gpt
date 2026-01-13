import { useCallback } from 'react';
import { TeamCard } from '../../components/organization/TeamCard';
import { TeamCardCompact } from '../../components/organization/TeamCardCompact';
import { Member, Part, Team } from '../../constants';
import { ConfirmationActions } from '../common/useConfirmation';
import { SaveMemberOptions } from './useMemberOperations';

interface UseTeamRenderersOptions {
    baseDate: string;
    searchTerm: string;
    statusFilter: 'all' | 'active' | 'intern' | 'on_leave' | 'resigned';
    // Member handlers
    handleAddMember: (teamId: string, partId: string) => void;
    handleEditMember: (member: Member) => void;
    handleDeleteMember: (member: Member) => void;
    moveMemberToTeamPart: (memberId: string, targetTeamId: string, targetPartId: string) => void;
    openMoveModal: (member: Member) => void;
    // Part handlers
    openPartModal: (mode: 'add' | 'edit', context: { teamId: string; part?: Part }) => void;
    handleDeletePart: (teamId: string, partId: string) => void;
    // Team handlers
    openTeamModal: (mode: 'add' | 'edit', team: Team | null) => void;
    handleDeleteTeam: (teamId: string) => void;
    handleUpdateMember: (member: Member, isEditing: boolean, options?: SaveMemberOptions) => Promise<void>;
    confirmationActions: ConfirmationActions;
}

export function useTeamRenderers({
    baseDate,
    searchTerm,
    statusFilter,
    handleAddMember,
    handleEditMember,
    handleDeleteMember,
    moveMemberToTeamPart,
    openMoveModal,
    openPartModal,
    handleDeletePart,
    openTeamModal,
    handleDeleteTeam,
    handleUpdateMember,
    confirmationActions,
}: UseTeamRenderersOptions) {
    const renderTeamCard = useCallback(
        (team: Team) => (
            <TeamCard
                key={`team-${team.id}`}
                team={team}
                baseDate={baseDate}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onUpdateMember={handleUpdateMember}
                onAddPart={(teamId) => openPartModal('add', { teamId })}
                onEditPart={(teamId, part) => openPartModal('edit', { teamId, part })}
                onDeletePart={handleDeletePart}
                onEditTeam={(teamData) => openTeamModal('edit', teamData)}
                onDeleteTeam={(teamId) => handleDeleteTeam(teamId)}
                onMoveMember={openMoveModal}
                confirmationActions={confirmationActions}
                searchTerm={searchTerm}
                isFiltered={statusFilter === 'active' || statusFilter === 'intern'}
            />
        ),
        [
            baseDate,
            handleAddMember,
            handleEditMember,
            handleDeleteMember,
            openPartModal,
            handleDeletePart,
            openTeamModal,
            handleDeleteTeam,
            openMoveModal,
            searchTerm,
            statusFilter,
            handleUpdateMember,
            confirmationActions,
        ]
    );

    const renderTeamCardCompact = useCallback(
        (team: Team) => (
            <TeamCardCompact
                key={`team-compact-${team.id}`}
                team={team}
                baseDate={baseDate}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onDropMemberInPart={moveMemberToTeamPart}
                onAddPart={(teamId) => openPartModal('add', { teamId })}
                onEditPart={(teamId, part) => openPartModal('edit', { teamId, part })}
                onDeletePart={handleDeletePart}
                onEditTeam={(teamData) => openTeamModal('edit', teamData)}
                onDeleteTeam={(teamId) => handleDeleteTeam(teamId)}
                onMoveMember={openMoveModal}
                searchTerm={searchTerm}
            />
        ),
        [
            baseDate,
            handleAddMember,
            handleEditMember,
            handleDeleteMember,
            moveMemberToTeamPart,
            openPartModal,
            handleDeletePart,
            openTeamModal,
            handleDeleteTeam,
            openMoveModal,
            searchTerm,
        ]
    );

    return {
        renderTeamCard,
        renderTeamCardCompact,
    };
}
