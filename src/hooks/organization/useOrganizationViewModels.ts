import { useCallback, useMemo } from 'react';
import { Headquarter, HQ_UNASSIGNED_ID, Member, Part, Team, TEAM_LEADER_TEAM_ID, currentUser } from '../../constants';
import { resolveTeamScope, TeamScope } from '../../utils/teamScope';

interface UseOrganizationViewModelsProps {
    role: string | null;
    activeTeams: Team[];
    statusFilter: string;
    headquarters: Headquarter[];
    sortOption: string;
    filteredInactiveMembers: {
        onLeave: Member[];
        resigned: Member[];
    };
}

const filterTeamByStatus = (team: Team, statusFilter: string): Team | null => {
    const directMembers = (team.members || []).filter((member: Member) => member.status === statusFilter);
    const partMembers = team.parts.flatMap((p) => p.members);
    const hasMatchingMembers =
        directMembers.length > 0 || partMembers.some((member: Member) => member.status === statusFilter);
    if (!hasMatchingMembers) return null;

    const filteredParts = team.parts
        .map((part: Part) => ({
            ...part,
            members: part.members.filter((member: Member) => member.status === statusFilter),
        }))
        .filter((part: Part) => part.members.length > 0);

    return { ...team, members: directMembers, parts: filteredParts };
};

const getTeamMemberCount = (team: Team): number => {
    const directCount = (team.members || []).length;
    const partCount = team.parts.reduce((sum: number, p: Part) => sum + p.members.length, 0);
    return directCount + partCount;
};

export const useOrganizationViewModels = ({
    role,
    activeTeams,
    statusFilter,
    headquarters,
    sortOption,
    filteredInactiveMembers,
}: UseOrganizationViewModelsProps) => {
    const defaultHeadquarterId = headquarters[0]?.id ?? HQ_UNASSIGNED_ID;
    const teamScope = useMemo<TeamScope>(() => {
        if (role !== 'TEAM_LEADER') return {};
        return resolveTeamScope(activeTeams, currentUser.name, { teamId: TEAM_LEADER_TEAM_ID });
    }, [role, activeTeams]);

    const visibleActiveTeams = useMemo(() => {
        let filteredTeams = activeTeams;

        // TEAM_LEADER Filtering
        if (role === 'TEAM_LEADER') {
            if (!teamScope.teamId) return [];
            filteredTeams = activeTeams.filter((t: Team) => t.id === teamScope.teamId);
        }

        if (statusFilter !== 'active' && statusFilter !== 'intern') {
            return filteredTeams;
        }

        return filteredTeams
            .map((team) => filterTeamByStatus(team, statusFilter))
            .filter(
                (team): team is Team =>
                    team !== null && ((team.members && team.members.length > 0) || team.parts.length > 0)
            );
    }, [activeTeams, statusFilter, role, teamScope.teamId]);

    const sortedActiveTeams = useMemo(() => {
        const teams = [...visibleActiveTeams];
        return teams.sort((a, b) => {
            if (sortOption === 'members_desc') {
                const countA = getTeamMemberCount(a);
                const countB = getTeamMemberCount(b);
                if (countA !== countB) return countB - countA;
            }
            return a.name.localeCompare(b.name, 'ko');
        });
    }, [visibleActiveTeams, sortOption]);

    const groupedHeadquarters = useMemo(() => {
        const assignedTeamIds = new Set<string>();

        const sections = headquarters.map((hq) => {
            const teamsInHeadquarter = sortedActiveTeams.filter((team) => {
                const teamHeadquarterId = team.headquarterId ?? defaultHeadquarterId;
                const belongsToHeadquarter = teamHeadquarterId === hq.id;
                if (belongsToHeadquarter) {
                    assignedTeamIds.add(team.id);
                }
                return belongsToHeadquarter;
            });
            return { headquarter: hq, teams: teamsInHeadquarter };
        });

        const unassignedTeams = sortedActiveTeams.filter((team) => !assignedTeamIds.has(team.id));
        return { sections, unassignedTeams };
    }, [headquarters, sortedActiveTeams, defaultHeadquarterId]);

    const hasAnyTeamsInView = useMemo(
        () =>
            groupedHeadquarters.sections.some((section) => section.teams.length > 0) ||
            groupedHeadquarters.unassignedTeams.length > 0,
        [groupedHeadquarters]
    );

    const getTeamGridClass = useCallback((count: number) => {
        const base = 'grid gap-4 sm:gap-6 lg:gap-8 items-start';
        if (count <= 1) return `${base} grid-cols-1`;
        if (count === 2) return `${base} grid-cols-1 md:grid-cols-2`;
        if (count === 3) return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
        // 4개 이상일 때도 grid로 처리하여 줄바꿈 가능하도록
        return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
    }, []);

    const inactiveMembersToShow = useMemo(() => {
        if (statusFilter === 'on_leave') {
            return {
                onLeave: filteredInactiveMembers.onLeave,
                resigned: [] as typeof filteredInactiveMembers.resigned,
            };
        }
        if (statusFilter === 'resigned') {
            return {
                onLeave: [] as typeof filteredInactiveMembers.onLeave,
                resigned: filteredInactiveMembers.resigned,
            };
        }
        return filteredInactiveMembers;
    }, [filteredInactiveMembers, statusFilter]);

    return {
        visibleActiveTeams,
        sortedActiveTeams,
        groupedHeadquarters,
        hasAnyTeamsInView,
        getTeamGridClass,
        inactiveMembersToShow,
        defaultHeadquarterId,
    };
};
