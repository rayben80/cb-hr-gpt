/* eslint-disable max-nested-callbacks */
import { describe, expect, it } from 'vitest';
import {
    analyzeCapabilityChanges,
    analyzeGradeDistribution,
    analyzeProgressRate,
    CapabilityData,
    identifyPerformers,
    PerformanceData,
    scoreToGrade,
    TeamPerformance,
} from './insightsService';

describe('insightsEngine', () => {
    describe('analyzeGradeDistribution', () => {
        // mockData removed as it was unused in specific tests below

        it('should generate positive insight when top ratio is high', () => {
            const highTopData: PerformanceData[] = [
                { grade: 'S', count: 50 },
                { grade: 'A', count: 0 },
                { grade: 'B', count: 50 },
                { grade: 'C', count: 0 },
                { grade: 'D', count: 0 },
            ];
            const insights = analyzeGradeDistribution(highTopData, '5grade');
            expect(insights).toHaveLength(2); // Top ratio > 40% + S ratio > 15%
            expect(insights[0].type).toBe('positive');
        });

        it('should generate warning insight when bottom ratio is high', () => {
            const highBottomData: PerformanceData[] = [
                { grade: 'S', count: 0 },
                { grade: 'A', count: 0 },
                { grade: 'B', count: 50 },
                { grade: 'C', count: 20 },
                { grade: 'D', count: 30 },
            ];
            const insights = analyzeGradeDistribution(highBottomData, '5grade');
            expect(insights.some((i) => i.type === 'warning')).toBe(true);
        });
    });

    describe('analyzeCapabilityChanges', () => {
        it('should detect significant improvements', () => {
            const data: CapabilityData[] = [
                { label: 'Skill A', value: 90, previousValue: 80 }, // > 10% increase
            ];
            const insights = analyzeCapabilityChanges(data);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('positive');
            expect(insights[0].message).toContain('상승했습니다');
        });

        it('should detect significant decline', () => {
            const data: CapabilityData[] = [
                { label: 'Skill B', value: 70, previousValue: 80 }, // > 10% decrease
            ];
            const insights = analyzeCapabilityChanges(data);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('warning');
            expect(insights[0].message).toContain('하락세입니다');
        });
    });

    describe('identifyPerformers', () => {
        const mockPerformers: TeamPerformance[] = [
            { name: 'Team A', score: 95, average: 90 },
            { name: 'Team B', score: 85, average: 90 },
            { name: 'Team C', score: 70, average: 90 },
        ];

        it('should identify top performer', () => {
            const { topPerformers, insights } = identifyPerformers(mockPerformers);
            expect(topPerformers[0].name).toBe('Team A');
            expect(insights.length).toBeGreaterThan(0);
            expect(insights[0].type).toBe('positive');
        });

        it('should identify bottom performers requiring attention', () => {
            // Team C (70) < 95 * 0.95 (85.5) -> Should be bottom
            const { bottomPerformers, insights } = identifyPerformers(mockPerformers);
            expect(bottomPerformers).toContainEqual(expect.objectContaining({ name: 'Team C' }));
            // Should have warning insight if bottom performers exist
            expect(insights.some((i) => i.type === 'warning')).toBe(true);
        });
    });

    describe('analyzeProgressRate', () => {
        it('should return positive insight for near completion', () => {
            const insights = analyzeProgressRate(98, 100);
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('positive');
        });

        it('should return warning insight for low progress', () => {
            const insights = analyzeProgressRate(50, 100); // Gap 50 > 20
            expect(insights).toHaveLength(1);
            expect(insights[0].type).toBe('warning');
        });
    });

    describe('scoreToGrade', () => {
        it('should convert score to grade correctly for 5grade', () => {
            expect(scoreToGrade(96, '5grade')).toBe('S');
            expect(scoreToGrade(86, '5grade')).toBe('A');
            expect(scoreToGrade(75, '5grade')).toBe('B');
            expect(scoreToGrade(65, '5grade')).toBe('C');
            expect(scoreToGrade(40, '5grade')).toBe('D');
        });

        it('should convert score to grade correctly for 5point', () => {
            expect(scoreToGrade(100, '5point')).toBe('5');
            expect(scoreToGrade(80, '5point')).toBe('4');
            expect(scoreToGrade(20, '5point')).toBe('1');
        });
    });
});
