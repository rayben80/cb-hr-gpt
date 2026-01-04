/* eslint-disable max-nested-callbacks */
import { describe, expect, it } from 'vitest';
import { Evaluation, Team } from '../constants';
import {
    calculateDashboardStats,
    calculateGradeDistribution,
    calculateTeamPerformance,
    calculateTopPerformers,
} from './dashboardService';

// Mock Data
const mockTeams: Team[] = [
    {
        id: 'team1',
        name: 'Sales팀',
        lead: 'Leader 1',
        parts: [
            {
                id: 'part1',
                title: 'Part 1',
                members: [
                    {
                        id: 'u1',
                        name: 'User 1',
                        role: 'USER',
                        avatar: '',
                        status: 'active',
                        email: 'u1@test.com',
                        hireDate: '2023-01-01',
                    },
                    {
                        id: 'u2',
                        name: 'User 2',
                        role: 'USER',
                        avatar: '',
                        status: 'active',
                        email: 'u2@test.com',
                        hireDate: '2023-01-01',
                    },
                ],
            },
        ],
    },
    {
        id: 'team2',
        name: 'Dev팀',
        lead: 'Leader 2',
        parts: [
            {
                id: 'part2',
                title: 'Part 2',
                members: [
                    {
                        id: 'u3',
                        name: 'User 3',
                        role: 'USER',
                        avatar: '',
                        status: 'active',
                        email: 'u3@test.com',
                        hireDate: '2023-01-01',
                    },
                ],
            },
        ],
    },
];

const mockEvaluations: Evaluation[] = [
    {
        id: 'e1',
        name: 'Eval 1',
        subject: 'User 1',
        status: '완료',
        score: 90,
        period: '2023 Q1',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        progress: 100,
        type: 'KPI',
        subjectId: 'u1',
        subjectSnapshot: {
            name: 'User 1',
            role: 'USER',
            teamId: 'team1',
            teamName: 'Sales팀',
        },
    },
    {
        id: 'e2',
        name: 'Eval 2',
        subject: 'User 2',
        status: '완료',
        score: 80,
        period: '2023 Q1',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        progress: 100,
        type: 'KPI',
        subjectId: 'u2',
        subjectSnapshot: {
            name: 'User 2',
            role: 'USER',
            teamId: 'team1',
            teamName: 'Sales팀',
        },
    },
    {
        id: 'e3',
        name: 'Eval 3',
        subject: 'User 3',
        status: '진행중',
        score: null,
        period: '2023 Q1',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        progress: 50,
        type: 'KPI',
        subjectId: 'u3',
        subjectSnapshot: {
            name: 'User 3',
            role: 'USER',
            teamId: 'team2',
            teamName: 'Dev팀',
        },
    },
];

describe('dashboardDataService', () => {
    describe('calculateDashboardStats', () => {
        it('should calculate total members correctly', () => {
            const stats = calculateDashboardStats(mockTeams, mockEvaluations);
            expect(stats.totalMembers).toBe(3);
        });

        it('should calculate completed evaluations correctly', () => {
            const stats = calculateDashboardStats(mockTeams, mockEvaluations);
            expect(stats.completedEvaluations).toBe(2);
        });

        it('should calculate progress rate correctly', () => {
            const stats = calculateDashboardStats(mockTeams, mockEvaluations);
            // Total evaluations (not '예정') = 3. Completed = 2. Rate = 67%
            expect(stats.progressRate).toBe(67);
        });

        it('should calculate average score correctly', () => {
            const stats = calculateDashboardStats(mockTeams, mockEvaluations);
            // Scores: 90, 80. Avg = 85
            expect(stats.averageScore).toBe(85);
        });

        it('should filter by team correctly', () => {
            const stats = calculateDashboardStats(mockTeams, mockEvaluations, true, 'Sales팀');
            expect(stats.totalMembers).toBe(2);
        });
    });

    describe('calculateTeamPerformance', () => {
        it('should calculate team scores for HQ view', () => {
            const performance = calculateTeamPerformance(mockTeams, mockEvaluations);
            expect(performance).toHaveLength(2);

            const salesTeam = performance.find((p) => p.department === 'Sales팀');
            expect(salesTeam).toBeDefined();
            // User 1: 90, User 2: 80. Avg = 85.
            expect(salesTeam?.score).toBe(85);
            expect(salesTeam?.memberCount).toBe(2);

            const devTeam = performance.find((p) => p.department === 'Dev팀');
            expect(devTeam).toBeDefined();
            // User 3 has no score, so it uses Mock score.
            expect(typeof devTeam?.score).toBe('number');
        });
    });

    describe('calculateGradeDistribution', () => {
        it('should calculate grade counts correctly', () => {
            const distribution = calculateGradeDistribution(mockTeams, mockEvaluations);
            const aGrade = distribution.find((d) => d.grade === 'A');
            const bGrade = distribution.find((d) => d.grade === 'B');

            // User 1 (90) -> S or A? Service says >=85 is A. >=95 is S.
            // User 2 (80) -> B.
            // User 3 (Mock ~82) -> B.

            expect(aGrade?.count).toBe(1);
            expect(bGrade?.count).toBe(2);
        });
    });

    describe('calculateTopPerformers', () => {
        it('should return top performers sorted by score', () => {
            const performers = calculateTopPerformers(mockTeams, mockEvaluations, 3);
            expect(performers.length).toBeLessThanOrEqual(3);
            expect(performers[0].score).toBeGreaterThanOrEqual(performers[1].score);
        });
    });
});
