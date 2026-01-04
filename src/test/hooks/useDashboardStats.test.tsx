import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDashboardStats } from '../../hooks/dashboard/useDashboardStats';

// Mock dependencies
vi.mock('../../hooks/evaluation/useEvaluationData', () => ({
    useEvaluationData: () => ({
        evaluations: [
            { id: 1, status: '완료', score: 85 },
            { id: 2, status: '진행중', score: 0 },
        ],
        normalizedEvaluations: [
            { id: 1, status: '완료', score: 85 },
            { id: 2, status: '진행중', score: 0 },
        ],
    }),
}));

vi.mock('../../hooks/organization/useOrganizationData', () => ({
    useOrganizationData: () => ({
        teams: [
            {
                id: 't1',
                name: 'Sales',
                members: [
                    { id: 'm1', name: '김철수', status: 'active', position: 'Manager' },
                    { id: 'm2', name: '이영희', status: 'active', position: 'Staff' },
                ],
                parts: [],
            },
        ],
    }),
}));

vi.mock('../../contexts/RoleContext', () => ({
    useRole: () => ({ role: 'SUPER_ADMIN' }),
}));

vi.mock('../../services/dashboardService', () => ({
    buildActiveMembersByTeam: vi.fn(() => new Map()),
    calculateDashboardStats: vi.fn(() => ({
        totalMembers: 18,
        completedEvaluations: 5,
        progressRate: 63,
        averageScore: 91,
        changes: {
            members: 2,
            evaluations: 3,
            progress: 4,
            score: 1,
        },
    })),
    calculateGradeDistribution: vi.fn(() => [
        { grade: 'S', count: 2, color: '#10b981' },
        { grade: 'A', count: 5, color: '#3b82f6' },
    ]),
    calculateTeamPerformance: vi.fn(() => [
        { department: 'Sales', teamId: 't1', score: 88, average: 85, memberCount: 2 },
    ]),
    calculateCapabilityRadar: vi.fn(() => [
        { label: '리더십', value: 85 },
        { label: '전문성', value: 90 },
    ]),
}));

vi.mock('../../services/insightsService', () => ({
    generateInsights: vi.fn(() => [{ type: 'positive', message: '평균 역량 점수가 90점 이상입니다.' }]),
    identifyPerformers: vi.fn(() => ({
        topPerformers: [{ name: 'Sales', score: 88 }],
        bottomPerformers: [],
        insights: [],
    })),
}));

describe('useDashboardStats', () => {
    it('should return dashboard stats', () => {
        const { result } = renderHook(() => useDashboardStats());

        expect(result.current.stats).toBeDefined();
        expect(result.current.stats).toHaveLength(4);
    });

    it('should return distribution data', () => {
        const { result } = renderHook(() => useDashboardStats());

        expect(result.current.distributionData).toBeDefined();
        expect(result.current.distributionData.length).toBeGreaterThan(0);
    });

    it('should return insights', () => {
        const { result } = renderHook(() => useDashboardStats());

        expect(result.current.insights).toBeDefined();
        expect(Array.isArray(result.current.insights)).toBe(true);
    });

    it('should return radar data', () => {
        const { result } = renderHook(() => useDashboardStats());

        expect(result.current.radarData).toBeDefined();
        expect(Array.isArray(result.current.radarData)).toBe(true);
    });
});
