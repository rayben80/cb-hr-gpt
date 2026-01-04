import { Member as MemberType, Part, Team } from '../../constants';
import { normalizeMemberRole } from '../../utils/memberRoleUtils';

export const findMemberLocation = (
    teams: Team[],
    memberId: string
): { teamId: string | null; partId: string | null } => {
    for (const team of teams) {
        // Check direct team members first
        if (team.members?.some((m) => m.id === memberId)) {
            return { teamId: team.id, partId: null };
        }
        // Then check parts
        for (const part of team.parts) {
            if (part.members.some((m) => m.id === memberId)) {
                return { teamId: team.id, partId: part.id };
            }
        }
    }
    return { teamId: null, partId: null };
};

export const updateMemberInTeams = (
    teams: Team[],
    teamId: string,
    partId: string | null,
    memberData: MemberType
): Team[] => {
    return teams.map((team: Team) => {
        if (team.id !== teamId) return team;

        // If no partId, update in direct team members
        if (!partId) {
            const existingMembers = team.members || [];
            const memberIndex = existingMembers.findIndex((m) => m.id === memberData.id);
            if (memberIndex > -1) {
                const updatedMembers = [...existingMembers];
                updatedMembers[memberIndex] = memberData;
                return { ...team, members: updatedMembers };
            }
            // Member not found in direct members, add them
            return { ...team, members: [...existingMembers, memberData] };
        }

        return {
            ...team,
            parts: updatePartsForMemberUpdate(team.parts, partId, memberData),
        };
    });
};

const updatePartsForMemberUpdate = (parts: Part[], partId: string, memberData: MemberType): Part[] => {
    return parts.map((p: Part) => {
        if (p.id !== partId) return p;
        const memberIndex = p.members.findIndex((m: MemberType) => m.id === memberData.id);
        if (memberIndex > -1) {
            const updatedMembers = [...p.members];
            updatedMembers[memberIndex] = memberData;
            return { ...p, members: updatedMembers };
        } else {
            const newMember = { ...memberData };
            if (!newMember.id) {
                newMember.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            return { ...p, members: [...p.members, newMember] };
        }
    });
};

export const addMemberToTeams = (
    teams: Team[],
    teamId: string,
    partId: string | null,
    memberData: MemberType
): Team[] => {
    return teams.map((team: Team) => {
        if (team.id !== teamId) return team;

        // If no partId, add to direct team members
        if (!partId) {
            const newMember = { ...memberData };
            if (!newMember.id) {
                newMember.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            const existingMembers = team.members || [];
            const memberExists = existingMembers.some((m) => m.id === newMember.id);
            if (!memberExists) {
                return { ...team, members: [...existingMembers, newMember] };
            }
            return team;
        }

        return {
            ...team,
            parts: updatePartsForMemberAdd(team.parts, partId, memberData),
        };
    });
};

const updatePartsForMemberAdd = (parts: Part[], partId: string, memberData: MemberType): Part[] => {
    return parts.map((p: Part) => {
        if (p.id !== partId) return p;
        const newMember = { ...memberData };
        if (!newMember.id) {
            newMember.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        const memberExists = p.members.some((m: MemberType) => m.id === newMember.id);
        if (!memberExists) {
            return { ...p, members: [...p.members, newMember] };
        }
        return p;
    });
};

export const removeMemberFromTeams = (
    teams: Team[],
    teamId: string,
    partId: string | null,
    memberId: string
): Team[] => {
    return teams.map((team: Team) => {
        if (team.id === teamId) {
            // If no partId, remove from direct team members
            if (!partId) {
                return {
                    ...team,
                    members: (team.members || []).filter((m: MemberType) => m.id !== memberId),
                };
            }
            return {
                ...team,
                parts: team.parts.map((part: Part) => {
                    if (part.id === partId) {
                        return {
                            ...part,
                            members: part.members.filter((m: MemberType) => m.id !== memberId),
                        };
                    }
                    return part;
                }),
            };
        }
        return team;
    });
};

export const moveMemberInTeams = (
    teams: Team[],
    oldLocation: { teamId: string; partId: string | null },
    newLocation: { teamId: string; partId: string | null },
    memberData: MemberType
): Team[] => {
    // Get old and new team names for role update
    const oldTeam = teams.find((t) => t.id === oldLocation.teamId);
    const newTeam = teams.find((t) => t.id === newLocation.teamId);

    // Update member role if team changed and role contains old team name
    let updatedMemberData = memberData;
    if (oldTeam && newTeam && oldTeam.id !== newTeam.id) {
        updatedMemberData = updateMemberRoleForTeamChange(memberData, oldTeam.name, newTeam.name);
    }

    let updatedTeams = removeMemberFromTeams(teams, oldLocation.teamId, oldLocation.partId, memberData.id);
    updatedTeams = addMemberToTeams(updatedTeams, newLocation.teamId, newLocation.partId, updatedMemberData);
    return updatedTeams;
};

/**
 * Normalize role after team changes.
 */
const updateMemberRoleForTeamChange = (member: MemberType, _oldTeamName: string, _newTeamName: string): MemberType => {
    const normalizedRole = normalizeMemberRole(member.role);
    if (normalizedRole === member.role) return member;
    return { ...member, role: normalizedRole };
};

interface TeamLeadUpdateOptions {
    setTeamLead?: boolean;
    clearTeamLead?: boolean;
}

export const updateTeamLeadsInTeams = (
    teams: Team[],
    teamId: string,
    memberData: MemberType,
    originalRecord: { teamId: string; partId: string | null; member: MemberType } | null,
    options?: TeamLeadUpdateOptions
): Team[] => {
    return teams.map((team) => {
        const nextLead = calculateNextTeamLead(team, teamId, memberData, originalRecord, options);
        return nextLead === team.lead ? team : { ...team, lead: nextLead };
    });
};

function calculateNextTeamLead(
    team: Team,
    targetTeamId: string,
    memberData: MemberType,
    originalRecord: { teamId: string; partId: string | null; member: MemberType } | null,
    options?: TeamLeadUpdateOptions
): string {
    let nextLead = team.lead;
    const isTargetTeam = team.id === targetTeamId;

    nextLead = applyTargetTeamUpdates(nextLead, isTargetTeam, memberData, originalRecord, options);
    nextLead = applyOriginalTeamUpdates(nextLead, team.id, memberData, originalRecord, targetTeamId);

    return nextLead;
}

function applyTargetTeamUpdates(
    currentLead: string,
    isTargetTeam: boolean,
    memberData: MemberType,
    originalRecord: { teamId: string; partId: string | null; member: MemberType } | null,
    options?: TeamLeadUpdateOptions
): string {
    let nextLead = currentLead;

    if (options?.setTeamLead && isTargetTeam && memberData.status !== 'resigned' && memberData.name.trim()) {
        nextLead = memberData.name;
    }

    if (!options?.setTeamLead && options?.clearTeamLead && isTargetTeam && originalRecord) {
        if (nextLead === originalRecord.member.name || nextLead === memberData.name) {
            nextLead = '';
        }
    }
    return nextLead;
}

function applyOriginalTeamUpdates(
    currentLead: string,
    teamId: string,
    memberData: MemberType,
    originalRecord: { teamId: string; partId: string | null; member: MemberType } | null,
    targetTeamId: string
): string {
    let nextLead = currentLead;
    if (originalRecord && teamId === originalRecord.teamId) {
        const originalName = originalRecord.member.name;
        const isSameTeam = originalRecord.teamId === targetTeamId;

        if (!isSameTeam || memberData.status === 'resigned') {
            if (nextLead === originalName) {
                nextLead = '';
            }
        } else if (originalName !== memberData.name && nextLead === originalName) {
            nextLead = memberData.name;
        }
    }
    return nextLead;
}

export const findMemberRecord = (
    teams: Team[],
    memberId: string
): { teamId: string; partId: string | null; member: MemberType } | null => {
    for (const team of teams) {
        // Check direct team members first
        const directMember = team.members?.find((m) => m.id === memberId);
        if (directMember) {
            return { teamId: team.id, partId: null, member: directMember };
        }
        // Then check parts
        for (const part of team.parts) {
            const member = part.members.find((m) => m.id === memberId);
            if (member) {
                return { teamId: team.id, partId: part.id, member };
            }
        }
    }
    return null;
};
