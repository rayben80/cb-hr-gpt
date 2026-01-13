import { Member, Team } from '../../constants';

export const isActiveMember = (member: Member) => member.status === 'active' || member.status === 'intern';

export const uniqueMembers = (members: Member[]) => {
    const map = new Map<string, Member>();
    members.forEach((member) => {
        const key = member.id || member.name;
        if (!map.has(key)) map.set(key, member);
    });
    return Array.from(map.values());
};

export const getTeamMembers = (team: Team): Member[] => {
    const base = team.members ? [...team.members] : [];
    const fromParts = team.parts.flatMap((part) => part.members);
    return uniqueMembers([...base, ...fromParts]).filter(isActiveMember);
};

export const getAllMembers = (teams: Team[]): Member[] => {
    const members = teams.flatMap((team) => getTeamMembers(team));
    return uniqueMembers(members);
};

export const resolveTeamForMember = (member: Member, teams: Team[]): Team | undefined => {
    if (member.teamId) {
        const byId = teams.find((team) => team.id === member.teamId);
        if (byId) return byId;
    }
    if (member.teamName) {
        const byName = teams.find((team) => team.name === member.teamName);
        if (byName) return byName;
    }
    return teams.find((team) => getTeamMembers(team).some((teamMember) => teamMember.id === member.id));
};

export const resolveLeaderId = (team: Team | undefined): string | undefined => {
    if (!team) return undefined;
    if (team.leadId) return team.leadId;
    if (team.lead) {
        const match = getTeamMembers(team).find((teamMember) => teamMember.name === team.lead);
        return match?.id;
    }
    return undefined;
};

export const resolvePeerPool = (
    member: Member,
    team: Team | undefined,
    peerScope: 'team' | 'part' | 'all',
    allMembers: Member[]
) => {
    if (peerScope === 'all') return allMembers;
    if (!team) return allMembers;
    if (peerScope === 'part' && member.partId) {
        const part = team.parts.find((p) => p.id === member.partId);
        if (part) return part.members.filter(isActiveMember);
    }
    return getTeamMembers(team);
};

export const pickPeers = (pool: Member[], count: number, offset: number) => {
    if (pool.length === 0 || count <= 0) return [];
    const sorted = [...pool].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const maxCount = Math.min(count, sorted.length);
    const startIndex = offset % sorted.length;
    return Array.from({ length: maxCount }, (_, index) => sorted[(startIndex + index) % sorted.length]);
};

export const computePeerAvailability = (
    targets: Member[],
    teams: Team[],
    peerScope: 'team' | 'part' | 'all',
    includeLeader: boolean
) => {
    if (targets.length === 0) {
        return { min: 0, max: 0, avg: 0, targetCount: 0, leaderMissingCount: 0 };
    }
    const allMembers = getAllMembers(teams);
    let min = Number.POSITIVE_INFINITY;
    let max = 0;
    let total = 0;
    let leaderMissingCount = 0;

    targets.forEach((member) => {
        const team = resolveTeamForMember(member, teams);
        const leaderId = includeLeader ? resolveLeaderId(team) : undefined;
        if (includeLeader && (!leaderId || leaderId === member.id)) {
            leaderMissingCount += 1;
        }
        const pool = resolvePeerPool(member, team, peerScope, allMembers);
        const filtered = pool.filter((peer) => peer.id !== member.id && (!leaderId || peer.id !== leaderId));
        const size = filtered.length;
        min = Math.min(min, size);
        max = Math.max(max, size);
        total += size;
    });

    return {
        min: min === Number.POSITIVE_INFINITY ? 0 : min,
        max,
        avg: Math.round(total / targets.length),
        targetCount: targets.length,
        leaderMissingCount,
    };
};
