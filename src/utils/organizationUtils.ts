import { Team } from '../constants/types';

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
