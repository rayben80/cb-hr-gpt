import React from 'react';
import { Member as MemberType, Team } from '../../constants';
import { DEFAULT_MEMBER_ROLE, normalizeMemberRole } from '../../utils/memberRoleUtils';
import {
    addMemberToTeams,
    findMemberLocation,
    moveMemberInTeams,
    removeMemberFromTeams,
    updateMemberInTeams,
    updateTeamLeadsInTeams,
} from './memberStateUtils';
import { SaveMemberOptions } from './useMemberOperations';

interface CalculateSaveParams {
    teams: Team[];
    memberData: MemberType;
    teamId: string;
    partId: string | null;
    isEditing: boolean;
    originalRecord: { teamId: string; partId: string | null; member: MemberType } | null;
    options?: SaveMemberOptions | undefined;
}

export const deleteResignedOptions = {
    successMessage: '멤버 기록이 영구적으로 삭제되었습니다.',
    errorMessage: '멤버 삭제 중 오류가 발생했습니다.',
};

export const createDeleteResignedTask =
    (
        teams: Team[],
        setTeams: React.Dispatch<React.SetStateAction<Team[]>>,
        memberToDelete: MemberType,
        targetTeamId?: string,
        targetPartId?: string
    ) =>
    async () => {
        const nextTeams = calculateUpdatedTeamsForDeleteResigned(
            teams,
            memberToDelete,
            targetTeamId ?? '',
            targetPartId ?? ''
        );
        setTeams(nextTeams);
        return 'success';
    };

export const calculateUpdatedTeamsForSave = ({
    teams,
    memberData,
    teamId,
    partId,
    isEditing,
    originalRecord,
    options,
}: CalculateSaveParams): Team[] => {
    const normalizedRole = normalizeMemberRole(memberData.role);
    const originalRole = normalizeMemberRole(originalRecord?.member.role ?? memberData.role);
    const storedRoleBeforeLead = originalRecord?.member.roleBeforeLead ?? memberData.roleBeforeLead;

    let role = normalizedRole;
    let roleBeforeLead = storedRoleBeforeLead;

    if (options?.setTeamLead) {
        if (originalRole !== '팀장') {
            roleBeforeLead = originalRole;
        } else if (!roleBeforeLead && normalizedRole !== '팀장') {
            roleBeforeLead = normalizedRole;
        }
        role = '팀장';
    }

    if (options?.clearTeamLead) {
        const restored = roleBeforeLead ? normalizeMemberRole(roleBeforeLead) : DEFAULT_MEMBER_ROLE;
        role = restored === '팀장' ? DEFAULT_MEMBER_ROLE : restored;
        roleBeforeLead = undefined;
    }

    const sanitizedMemberData = { ...memberData, role };
    if (roleBeforeLead) {
        sanitizedMemberData.roleBeforeLead = roleBeforeLead;
    } else if ('roleBeforeLead' in sanitizedMemberData) {
        delete sanitizedMemberData.roleBeforeLead;
    }

    const finalMemberData =
        memberData.role === role && memberData.roleBeforeLead === roleBeforeLead ? memberData : sanitizedMemberData;

    let updatedTeams: Team[] = teams;

    if (isEditing) {
        const oldLocation = findMemberLocation(teams, finalMemberData.id);

        // Check if location changed (team or part)
        const locationChanged = oldLocation.teamId && (oldLocation.teamId !== teamId || oldLocation.partId !== partId);

        if (locationChanged) {
            updatedTeams = moveMemberInTeams(
                teams,
                { teamId: oldLocation.teamId!, partId: oldLocation.partId },
                { teamId, partId },
                finalMemberData
            );
        } else {
            updatedTeams = updateMemberInTeams(teams, teamId, partId, finalMemberData);
        }
    } else {
        updatedTeams = addMemberToTeams(teams, teamId, partId, finalMemberData);
    }

    return updateTeamLeadsInTeams(updatedTeams, teamId, finalMemberData, originalRecord, options);
};

export const calculateUpdatedTeamsForDeleteResigned = (
    teams: Team[],
    memberToDelete: MemberType,
    targetTeamId?: string,
    targetPartId?: string | null
): Team[] => {
    const location = findMemberLocation(teams, memberToDelete.id);
    const finalTeamId = targetTeamId || location.teamId;
    const finalPartId = targetPartId !== undefined ? targetPartId : location.partId;

    if (finalTeamId) {
        const updatedTeams = removeMemberFromTeams(teams, finalTeamId, finalPartId, memberToDelete.id);

        // Clear lead if needed
        return updatedTeams.map((team) => {
            if (team.id === finalTeamId && team.lead === memberToDelete.name) {
                return { ...team, lead: '' };
            }
            return team;
        });
    }
    return teams;
};

export const getDeleteMemberConfirmationConfig = (memberName: string, onConfirm: () => Promise<void>) => ({
    title: '퇴사 처리 확인',
    message: `${memberName}님을 퇴사 처리하시겠습니까? 이 작업은 되돌릴 수 있지만, 조직도에서 즉시 제외됩니다.`,
    onConfirm,
    confirmButtonText: '퇴사 처리',
    confirmButtonColor: 'destructive' as const,
});

export const getDeleteResignedMemberConfirmationConfig = (memberName: string, onConfirm: () => Promise<void>) => ({
    title: '기록 영구 삭제',
    message: `${memberName}님의 퇴사 기록을 영구적으로 삭제하시겠습니까?\n\n[주의] 이 작업은 되돌릴 수 없으며, 연결된 모든 평가 데이터도 함께 삭제되거나 유실될 수 있습니다.`,
    onConfirm,
    confirmButtonText: '영구 삭제',
    confirmButtonColor: 'destructive' as const,
});

export const getReinstateMemberConfirmationConfig = (memberName: string, onConfirm: () => Promise<void>) => ({
    title: '복직 처리 확인',
    message: `${memberName}님을 복직 처리하시겠습니까? 멤버가 조직도에 다시 표시됩니다.`,
    onConfirm,
    confirmButtonText: '복직 처리',
    confirmButtonColor: 'primary' as const,
});
