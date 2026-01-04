import { Briefcase, Clock, ShieldCheck, Users } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { StatCardProps } from '../../components/dashboard/StatCard';
import { TEAM_LEADER_TEAM_ID, TEAM_LEADER_TEAM_NAME, currentUser } from '../../constants';
import { useRole } from '../../contexts/RoleContext';
import {
    buildActiveMembersByTeam,
    calculateCapabilityRadar,
    calculateDashboardStats,
    calculateGradeDistribution,
    calculateTeamPerformance,
} from '../../services/dashboardService';
import { generateInsights, identifyPerformers } from '../../services/insightsService';
import { resolveTeamScope, TeamScope } from '../../utils/teamScope';
import { useEvaluationData } from '../evaluation/useEvaluationData';
import { useOrganizationData } from '../organization/useOrganizationData';

/**
 * Dashboard Stats Hook
 *
 * 대시보드에 필요한 모든 통계 및 차트 데이터를 계산합니다.
 * 조직 데이터와 평가 데이터를 기반으로 다음을 제공합니다:
 *
 * @returns {Object} Dashboard data object containing:
 * - `isTeamLeader` - 현재 사용자가 팀장인지 여부
 * - `stats` - StatCard 컴포넌트용 통계 배열 (총 인원, 완료 평가, 진행률, 평균 점수)
 * - `distributionData` - 등급 분포 차트 데이터
 * - `deptPerformanceData` - 팀별 성과 차트 데이터
 * - `radarData` - 역량 레이더 차트 데이터
 * - `insights` - 자동 생성된 인사이트 목록
 * - `topPerformers` - 상위 성과자 목록
 *
 * @example
 * const { stats, insights } = useDashboardStats();
 */
export const useDashboardStats = () => {
    const { role } = useRole();
    const isTeamLeader = role === 'TEAM_LEADER';
    const { teams } = useOrganizationData();
    const { evaluations } = useEvaluationData();

    const teamScope = useMemo<TeamScope>(() => {
        if (!isTeamLeader) return {};
        return resolveTeamScope(teams, currentUser.name, {
            teamId: TEAM_LEADER_TEAM_ID,
            teamName: TEAM_LEADER_TEAM_NAME,
        });
    }, [isTeamLeader, teams]);

    const teamName = teamScope.teamName;
    const activeMembersByTeam = useMemo(() => buildActiveMembersByTeam(teams), [teams]);

    const dashboardStats = useMemo(
        () => calculateDashboardStats(teams, evaluations, isTeamLeader, teamName, activeMembersByTeam),
        [teams, evaluations, isTeamLeader, teamName, activeMembersByTeam]
    );

    const stats: StatCardProps[] = useMemo(() => {
        const { totalMembers, completedEvaluations, progressRate, averageScore, changes } = dashboardStats;
        return [
            {
                icon: Users,
                title: isTeamLeader ? '총 팀원' : '총 인원',
                value: `${totalMembers}명`,
                change: `${changes.members}명`,
                changeType: 'positive',
                iconBgColor: 'bg-gradient-to-br from-primary to-primary/60',
            },
            {
                icon: ShieldCheck,
                title: '완료된 평가',
                value: `${completedEvaluations}건`,
                change: `${changes.evaluations}건`,
                changeType: 'positive',
                iconBgColor: 'bg-gradient-to-br from-emerald-500 to-teal-500',
            },
            {
                icon: Clock,
                title: '평가 진행률',
                value: `${progressRate}%`,
                change: `${changes.progress}%`,
                changeType: 'positive',
                iconBgColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
            },
            {
                icon: Briefcase,
                title: '평균 역량 점수',
                value: `${averageScore}점`,
                change: `${changes.score}점`,
                changeType: 'positive',
                iconBgColor: 'bg-gradient-to-br from-primary to-accent',
            },
        ];
    }, [dashboardStats, isTeamLeader]);

    const distributionData = useMemo(
        () => calculateGradeDistribution(teams, evaluations, isTeamLeader, teamName, activeMembersByTeam),
        [teams, evaluations, isTeamLeader, teamName, activeMembersByTeam]
    );

    const deptPerformanceData = useMemo(
        () => calculateTeamPerformance(teams, evaluations, isTeamLeader, teamName, activeMembersByTeam),
        [teams, evaluations, isTeamLeader, teamName, activeMembersByTeam]
    );

    const radarData = useMemo(
        () => calculateCapabilityRadar(teams, evaluations, isTeamLeader, teamName),
        [teams, evaluations, isTeamLeader, teamName]
    );

    const insights = useMemo(
        () =>
            generateInsights(
                distributionData.map((d) => ({ grade: d.grade, count: d.count })),
                radarData,
                deptPerformanceData.map((d) => ({ name: d.department, score: d.score, average: d.average })),
                dashboardStats.progressRate,
                '5grade'
            ),
        [distributionData, radarData, deptPerformanceData, dashboardStats.progressRate]
    );

    const { topPerformers } = useMemo(
        () =>
            identifyPerformers(
                deptPerformanceData.map((d) => ({ name: d.department, score: d.score, average: d.average }))
            ),
        [deptPerformanceData]
    );

    return {
        isTeamLeader,
        teamName,
        stats,
        distributionData,
        deptPerformanceData,
        radarData,
        insights,
        topPerformers,
    };
};
