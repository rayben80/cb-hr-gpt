import { Team } from '../constants';

export interface TeamScope {
    teamId?: string;
    teamName?: string;
}

export const findTeamForUser = (teams: Team[], userName: string): Team | undefined => {
    const trimmedName = userName.trim();
    if (!trimmedName) return undefined;

    const leadTeam = teams.find((team) => team.lead === trimmedName);
    if (leadTeam) return leadTeam;

    const memberTeamIndex = new Map<string, Team>();
    teams.forEach((team) => {
        (team.members || []).forEach((member) => {
            if (!memberTeamIndex.has(member.name)) {
                memberTeamIndex.set(member.name, team);
            }
        });
        team.parts.forEach((part) => {
            part.members.forEach((member) => {
                if (!memberTeamIndex.has(member.name)) {
                    memberTeamIndex.set(member.name, team);
                }
            });
        });
    });

    return memberTeamIndex.get(trimmedName);
};

export const resolveTeamScope = (teams: Team[], userName: string, fallback: TeamScope = {}): TeamScope => {
    const team = findTeamForUser(teams, userName);
    if (team) return { teamId: team.id, teamName: team.name };
    if (teams.length === 0) return fallback;
    return {};
};
