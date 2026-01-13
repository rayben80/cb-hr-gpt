import { Member, Team } from '../constants/types';

/**
 * 팀의 총 멤버 수(직속 멤버 + 파트 멤버)를 계산합니다.
 */
export const calculateTotalTeamMembers = (team: Team): number => {
    const directMembersCount = team.members?.length || 0;
    const partMembersCount = team.parts.reduce((sum, part) => sum + part.members.length, 0);
    return directMembersCount + partMembersCount;
};

/**
 * 팀 멤버 필터링을 위한 통합 유틸리티 (향후 확장 가능)
 */
export const getFilteredMemberCount = (team: Team): number => {
    return calculateTotalTeamMembers(team);
};

const getMaxDefinedOrder = (members: Member[]): number => {
    return members.reduce((max, member) => (typeof member.order === 'number' ? Math.max(max, member.order) : max), -1);
};

export const sortMembersByOrder = (members: Member[]): Member[] => {
    const maxDefinedOrder = getMaxDefinedOrder(members);
    return members
        .map((member, index) => ({
            member,
            sortOrder: typeof member.order === 'number' ? member.order : maxDefinedOrder + 1 + index,
        }))
        .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            if (a.member.name !== b.member.name) return a.member.name.localeCompare(b.member.name);
            return a.member.id.localeCompare(b.member.id);
        })
        .map(({ member }) => member);
};

export const getNextMemberOrder = (members: Member[]): number => {
    const maxDefinedOrder = getMaxDefinedOrder(members);
    if (maxDefinedOrder < 0) return members.length;
    const missingCount = members.filter((member) => typeof member.order !== 'number').length;
    return maxDefinedOrder + 1 + missingCount;
};
