import { Team } from '../constants';

export const MEMBER_ROLE_OPTIONS = ['팀장', '파트장', '팀원'] as const;
export type AllowedMemberRole = (typeof MEMBER_ROLE_OPTIONS)[number];

export const DEFAULT_MEMBER_ROLE: AllowedMemberRole = '팀원';

export const isAllowedMemberRole = (value: string): value is AllowedMemberRole =>
    MEMBER_ROLE_OPTIONS.includes(value as AllowedMemberRole);

export const normalizeMemberRole = (value: string | null | undefined): AllowedMemberRole => {
    if (!value) return DEFAULT_MEMBER_ROLE;
    if (isAllowedMemberRole(value)) return value;
    if (value.includes('팀장')) return '팀장';
    if (value.includes('파트장')) return '파트장';
    return DEFAULT_MEMBER_ROLE;
};

export const normalizeTeamsMemberRoles = (teams: Team[]): { teams: Team[]; changed: boolean } => {
    let changed = false;
    const normalizedTeams = teams.map((team) => {
        let teamChanged = false;
        const normalizedMembers = (team.members || []).map((member) => {
            const role = normalizeMemberRole(member.role);
            if (role === member.role) return member;
            teamChanged = true;
            changed = true;
            return { ...member, role };
        });

        const normalizedParts = team.parts.map((part) => {
            let partChanged = false;
            const members = part.members.map((member) => {
                const role = normalizeMemberRole(member.role);
                if (role === member.role) return member;
                partChanged = true;
                changed = true;
                return { ...member, role };
            });
            if (!partChanged) return part;
            teamChanged = true;
            return { ...part, members };
        });

        if (!teamChanged) return team;
        return { ...team, members: normalizedMembers, parts: normalizedParts };
    });

    return { teams: normalizedTeams, changed };
};

export interface RoleNormalizationChange {
    memberId: string;
    name: string;
    fromRole: string;
    toRole: AllowedMemberRole;
    teamId: string;
    partId?: string | undefined;
}

export interface RoleNormalizationReport {
    totalMembers: number;
    changedMembers: number;
    byRole: Record<AllowedMemberRole, number>;
    changes: RoleNormalizationChange[];
}

export const buildRoleNormalizationReport = (teams: Team[]): RoleNormalizationReport => {
    const changes: RoleNormalizationChange[] = [];
    const byRole: Record<AllowedMemberRole, number> = {
        팀장: 0,
        파트장: 0,
        팀원: 0,
    };

    let totalMembers = 0;

    teams.forEach((team) => {
        (team.members || []).forEach((member) => {
            totalMembers += 1;
            const normalizedRole = normalizeMemberRole(member.role);
            byRole[normalizedRole] += 1;
            if (member.role !== normalizedRole) {
                changes.push({
                    memberId: member.id,
                    name: member.name,
                    fromRole: member.role,
                    toRole: normalizedRole,
                    teamId: team.id,
                });
            }
        });

        team.parts.forEach((part) => {
            part.members.forEach((member) => {
                totalMembers += 1;
                const normalizedRole = normalizeMemberRole(member.role);
                byRole[normalizedRole] += 1;
                if (member.role !== normalizedRole) {
                    changes.push({
                        memberId: member.id,
                        name: member.name,
                        fromRole: member.role,
                        toRole: normalizedRole,
                        teamId: team.id,
                        partId: part.id,
                    });
                }
            });
        });
    });

    return {
        totalMembers,
        changedMembers: changes.length,
        byRole,
        changes,
    };
};
