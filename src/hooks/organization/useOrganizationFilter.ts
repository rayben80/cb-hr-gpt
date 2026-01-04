import { useMemo } from 'react';
import { Member as MemberType, Part, Team } from '../../constants';

/**
 * 조직도 데이터 필터링 및 가공을 처리하는 커스텀 훅
 */
export const useOrganizationFilter = (teams: Team[], searchTerm: string) => {
    // 활성/비활성 멤버 분리 및 필터링
    const { activeTeams, onLeaveMembers, resignedMembers } = useMemo(() => {
        return filterAndProcessTeams(teams, searchTerm);
    }, [teams, searchTerm]);

    // 비활성 멤버 필터링
    const filteredInactiveMembers = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return {
            onLeave: onLeaveMembers.filter((m) => m.name.toLowerCase().includes(lowercasedFilter)),
            resigned: resignedMembers.filter((m) => m.name.toLowerCase().includes(lowercasedFilter)),
        };
    }, [onLeaveMembers, resignedMembers, searchTerm]);

    return {
        activeTeams,
        onLeaveMembers,
        resignedMembers,
        filteredInactiveMembers,
    };
};

const filterAndProcessTeams = (teams: Team[], searchTerm: string) => {
    if (import.meta.env.DEV) {
        console.log('Filtering teams:', teams);
    }
    const onLeave: MemberType[] = [];
    const resigned: MemberType[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    const activeTeamsData = teams.map((team: Team) => {
        // Count active/intern members from parts
        const partMemberCount = team.parts.reduce(
            (sum: number, part: Part) =>
                sum + part.members.filter((m: MemberType) => m.status === 'active' || m.status === 'intern').length,
            0
        );

        // Count active/intern direct team members
        const directMemberCount = (team.members || []).filter(
            (m: MemberType) => m.status === 'active' || m.status === 'intern'
        ).length;

        const originalTotalMemberCount = partMemberCount + directMemberCount;

        // Process direct team members for on_leave/resigned
        const activeDirectMembers: MemberType[] = [];
        (team.members || []).forEach((member: MemberType) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { partId: _partId, ...memberWithoutPartId } = member;
            if (member.status === 'on_leave') {
                onLeave.push({
                    ...memberWithoutPartId,
                    teamName: team.name,
                    partName: '팀 직속',
                    teamId: team.id,
                });
            } else if (member.status === 'resigned') {
                resigned.push({
                    ...memberWithoutPartId,
                    teamName: team.name,
                    partName: '팀 직속',
                    teamId: team.id,
                });
            } else {
                activeDirectMembers.push(member);
            }
        });

        // Filter direct members by search term
        const filteredDirectMembers = lowerSearchTerm
            ? activeDirectMembers.filter((m) => m.name.toLowerCase().includes(lowerSearchTerm))
            : activeDirectMembers;

        const filteredParts = team.parts
            .map((part: Part) => processPart(part, team, lowerSearchTerm, onLeave, resigned))
            .filter((part: Part) => !lowerSearchTerm || part.members.length > 0);

        return {
            ...team,
            originalTotalMemberCount,
            members: filteredDirectMembers,
            parts: filteredParts,
        };
    });

    if (import.meta.env.DEV) {
        console.log('Filtered active teams:', activeTeamsData);
    }
    return {
        activeTeams: activeTeamsData,
        onLeaveMembers: onLeave,
        resignedMembers: resigned,
    };
};

const processPart = (
    part: Part,
    team: Team,
    lowerSearchTerm: string,
    onLeave: MemberType[],
    resigned: MemberType[]
): Part => {
    const activeAndInternMembers: MemberType[] = [];
    const originalMembers = part.members;
    const originalMemberCount = originalMembers.filter(
        (m: MemberType) => m.status === 'active' || m.status === 'intern'
    ).length;

    originalMembers.forEach((member: MemberType) => {
        if (member.status === 'on_leave') {
            onLeave.push({
                ...member,
                teamName: team.name,
                partName: part.title,
                teamId: team.id,
                partId: part.id,
            });
        } else if (member.status === 'resigned') {
            resigned.push({
                ...member,
                teamName: team.name,
                partName: part.title,
                teamId: team.id,
                partId: part.id,
            });
        } else {
            // active or intern
            activeAndInternMembers.push(member);
        }
    });

    // 검색어로 필터링
    const filteredMembers = lowerSearchTerm
        ? activeAndInternMembers.filter((m) => m.name.toLowerCase().includes(lowerSearchTerm))
        : activeAndInternMembers;

    return {
        ...part,
        originalMemberCount,
        members: filteredMembers,
    };
};
