/**
 * Dashboard Data Service
 * 대시보드 데이터 계산 로직을 담당하는 서비스
 * 조직 데이터와 평가 데이터를 기반으로 통계, 팀 성과, 등급 분포 등을 계산합니다.
 */

import { Evaluation, Member, Team } from '../constants';
import { CapabilityRadarData, DashboardStats, DepartmentPerformance, Performer, ScoreDistribution } from '../types/dashboard';

export type ActiveMembersByTeam = Map<string, Member[]>;

// ============================================================
// 등급 색상 맵핑 (CSS 변수 기반)
// ============================================================

// 차트용 정적 색상 - Forcs 테마 기반
const GRADE_COLORS: Record<string, string> = {
    S: '#10b981', // emerald - Success
    A: '#1D8ACF', // Forcs Blue - Primary
    B: '#0FB899', // Teal - Gradient secondary
    C: '#f59e0b', // amber - Warning
    D: '#ef4444', // red - Destructive
};

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 팀에서 활성 구성원만 필터링
 */
function computeActiveMembers(team: Team): Member[] {
    const members: Member[] = [];
    (team.members || []).forEach((member) => {
        if (member.status === 'active' || member.status === 'intern') {
            members.push({
                ...member,
                teamName: member.teamName || team.name,
                partName: member.partName || '팀 직속',
            });
        }
    });
    team.parts.forEach((part) => {
        part.members.forEach((member) => {
            if (member.status === 'active' || member.status === 'intern') {
                members.push({ ...member, teamName: team.name, partName: part.title });
            }
        });
    });
    return members;
}

function getActiveMembers(team: Team, cache?: ActiveMembersByTeam): Member[] {
    if (!cache) return computeActiveMembers(team);
    const cached = cache.get(team.id);
    if (cached) return cached;
    const computed = computeActiveMembers(team);
    cache.set(team.id, computed);
    return computed;
}

export function buildActiveMembersByTeam(teams: Team[]): ActiveMembersByTeam {
    const cache: ActiveMembersByTeam = new Map();
    teams.forEach((team) => {
        cache.set(team.id, computeActiveMembers(team));
    });
    return cache;
}

/**
 * 모든 팀에서 활성 구성원 추출
 */
function getAllActiveMembers(teams: Team[], cache?: ActiveMembersByTeam): Member[] {
    return teams.flatMap((team) => getActiveMembers(team, cache));
}

/**
 * 점수를 등급으로 변환 (5등급제)
 */
function scoreToGrade(score: number): string {
    if (score >= 95) return 'S';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    return 'D';
}

/**
 * 결정론적 Mock 점수 생성 (랜덤이 아닌 해시 기반)
 * 동일 입력에 대해 항상 동일한 결과 반환
 */
function generateDeterministicScore(seed: string, baseScore: number = 80): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // 75~95 범위로 정규화
    const normalized = Math.abs(hash % 20);
    return baseScore + normalized - 5;
}

// ============================================================
// 대시보드 통계 계산
// ============================================================

/**
 * 대시보드 상단 통계 카드 데이터 계산
 */
export function calculateDashboardStats(
    teams: Team[],
    evaluations: Evaluation[],
    isTeamLeader: boolean = false,
    teamName?: string,
    activeMembersByTeam?: ActiveMembersByTeam
): DashboardStats {
    // 팀장 모드인 경우 해당 팀만 필터링
    const filteredTeams = isTeamLeader && teamName ? teams.filter((t) => t.name === teamName) : teams;

    // 1. 총 인원 계산
    const totalMembers = filteredTeams.reduce(
        (sum, team) => sum + getActiveMembers(team, activeMembersByTeam).length,
        0
    );

    // 2. 완료된 평가 수
    const completedEvaluations = evaluations.filter((e) => e.status === '완료').length;

    // 3. 진행률 계산
    const totalEvaluations = evaluations.filter((e) => e.status !== '예정').length;
    const progressRate = totalEvaluations > 0 ? Math.round((completedEvaluations / totalEvaluations) * 100) : 0;

    // 4. 평균 점수 계산
    const scoredEvaluations = evaluations.filter((e) => e.score !== null);
    const averageScore =
        scoredEvaluations.length > 0
            ? Math.round(scoredEvaluations.reduce((acc, e) => acc + (e.score || 0), 0) / scoredEvaluations.length)
            : 0;

    // 변화량은 데모용 Mock (추후 시계열 데이터 연동 시 실제 계산)
    return {
        totalMembers,
        completedEvaluations,
        progressRate,
        averageScore,
        changes: {
            members: 2, // 지난 분기 대비 변화 (데모)
            evaluations: 5,
            progress: 3,
            score: 2,
        },
    };
}

// ============================================================
// 팀별 성과 계산
// ============================================================

/**
 * 팀별 성과 현황 데이터 계산
 * 조직도의 실제 팀 목록을 기반으로 계산
 */
export function calculateTeamPerformance(
    teams: Team[],
    evaluations: Evaluation[],
    isTeamLeader: boolean = false,
    teamName?: string,
    activeMembersByTeam?: ActiveMembersByTeam
): DepartmentPerformance[] {
    // 팀장 모드: 팀 내 개인별 성과 표시
    if (isTeamLeader && teamName) {
        const team = teams.find((t) => t.name === teamName);
        if (!team) return [];

        const members = getActiveMembers(team, activeMembersByTeam);
        const teamAverage = calculateTeamAverage(members, evaluations);

        return members.slice(0, 5).map((member) => ({
            department: member.name,
            teamId: team.id,
            score: getMemberScore(member, evaluations),
            average: teamAverage,
            memberCount: 1,
        }));
    }

    // 본부장 모드: 팀별 성과 표시
    const allScores: number[] = [];
    const teamPerformances: DepartmentPerformance[] = [];

    teams.forEach((team) => {
        const members = getActiveMembers(team, activeMembersByTeam);
        const scoreSum = members.reduce((acc, m) => acc + getMemberScore(m, evaluations), 0);
        const teamScore = members.length > 0 ? Math.round((scoreSum / members.length) * 10) / 10 : 0;

        allScores.push(teamScore);
        teamPerformances.push({
            department: team.name,
            teamId: team.id,
            score: teamScore,
            average: 0, // 아래에서 계산
            memberCount: members.length,
        });
    });

    // 전체 평균 계산
    const overallAverage =
        allScores.length > 0 ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 : 0;

    // 평균 값 업데이트
    return teamPerformances.map((tp) => ({
        ...tp,
        average: overallAverage,
    }));
}

/**
 * 개인 점수 가져오기 (평가 데이터 또는 결정론적 Mock)
 */
function getMemberScore(member: Member, evaluations: Evaluation[]): number {
    // 해당 구성원의 평가 찾기
    const memberEval =
        evaluations.find((e) => e.subjectId === member.id && e.status === '완료' && e.score !== null) ||
        evaluations.find((e) => e.subject === member.name && e.status === '완료' && e.score !== null);

    if (memberEval && memberEval.score !== null) {
        return memberEval.score;
    }

    // 평가 데이터가 없으면 결정론적 Mock 점수 생성
    return generateDeterministicScore(member.id + member.name, 82);
}

/**
 * 팀 평균 점수 계산
 */
function calculateTeamAverage(members: Member[], evaluations: Evaluation[]): number {
    if (members.length === 0) return 0;
    const scores = members.map((m) => getMemberScore(m, evaluations));
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

// ============================================================
// 등급 분포 계산
// ============================================================

/**
 * 평가 등급 분포 계산
 */
export function calculateGradeDistribution(
    teams: Team[],
    evaluations: Evaluation[],
    isTeamLeader: boolean = false,
    teamName?: string,
    activeMembersByTeam?: ActiveMembersByTeam
): ScoreDistribution[] {
    const gradeCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };

    // 팀장 모드인 경우 해당 팀만 필터링
    const filteredTeams = isTeamLeader && teamName ? teams.filter((t) => t.name === teamName) : teams;

    const members = filteredTeams.flatMap((t) => getActiveMembers(t, activeMembersByTeam));

    members.forEach((member) => {
        const score = getMemberScore(member, evaluations);
        const grade = scoreToGrade(score);
        gradeCounts[grade]++;
    });

    return Object.entries(gradeCounts).map(([grade, count]) => ({
        grade,
        count,
        color: GRADE_COLORS[grade] || '#94a3b8',
    }));
}

// ============================================================
// 역량 레이더 데이터
// ============================================================

/**
 * 역량 레이더 차트 데이터 계산
 * 현재는 결정론적 Mock 데이터 반환 (추후 실제 역량 평가 데이터 연동)
 */
export function calculateCapabilityRadar(
    _teams: Team[],
    _evaluations: Evaluation[],
    isTeamLeader: boolean = false,
    teamName?: string
): CapabilityRadarData[] {
    // 팀장 모드: 팀 역량
    if (isTeamLeader && teamName) {
        const seed = teamName;
        return [
            {
                label: '영업 역량',
                value: generateDeterministicScore(seed + '영업', 90),
                previousValue: generateDeterministicScore(seed + '영업_prev', 85),
            },
            {
                label: '고객 관리',
                value: generateDeterministicScore(seed + '고객', 88),
                previousValue: generateDeterministicScore(seed + '고객_prev', 85),
            },
            {
                label: '협업/소통',
                value: generateDeterministicScore(seed + '협업', 82),
                previousValue: generateDeterministicScore(seed + '협업_prev', 80),
            },
            {
                label: '문제 해결',
                value: generateDeterministicScore(seed + '문제', 78),
                previousValue: generateDeterministicScore(seed + '문제_prev', 82),
            },
            {
                label: '책임감',
                value: generateDeterministicScore(seed + '책임', 90),
                previousValue: generateDeterministicScore(seed + '책임_prev', 88),
            },
        ];
    }

    // 본부장 모드: 본부 역량
    return [
        { label: '직무 전문성', value: 92, previousValue: 85 },
        { label: '리더십', value: 75, previousValue: 80 },
        { label: '협업/소통', value: 88, previousValue: 78 },
        { label: '문제 해결', value: 82, previousValue: 80 },
        { label: '책임감', value: 95, previousValue: 92 },
    ];
}

// ============================================================
// Top Performers 계산
// ============================================================

/**
 * 상위 성과자 목록 계산
 */
export function calculateTopPerformers(
    teams: Team[],
    evaluations: Evaluation[],
    limit: number = 3,
    activeMembersByTeam?: ActiveMembersByTeam
): Performer[] {
    const allMembers = getAllActiveMembers(teams, activeMembersByTeam);

    const performerScores = allMembers.map((member) => ({
        id: member.id,
        name: member.name,
        score: getMemberScore(member, evaluations),
        avatar: member.avatar,
        team: member.teamName || '',
        trend: 'up' as const, // 데모용 (추후 시계열 데이터로 계산)
    }));

    // 점수 내림차순 정렬
    performerScores.sort((a, b) => b.score - a.score);

    return performerScores.slice(0, limit);
}
