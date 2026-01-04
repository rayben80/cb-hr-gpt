/**
 * Rule-Based Insights Engine
 * Generates dynamic insights based on performance data using predefined rules
 * Supports multiple scoring types: 5grade, 5point, 10point, 100point, 3level, likert5
 */

export type ScoringType = '5grade' | '5point' | '10point' | '100point' | '3level' | 'likert5';

export interface PerformanceData {
    grade: string;
    count: number;
}

export interface CapabilityData {
    label: string;
    value: number;
    previousValue?: number;
}

export interface TeamPerformance {
    name: string;
    score: number;
    average: number;
}

export interface InsightResult {
    type: 'positive' | 'warning' | 'neutral';
    message: string;
    metric?: string;
    value?: number;
}

/**
 * Scoring Type Configurations
 * Defines top/bottom thresholds for each scoring method
 */
const SCORING_CONFIG: Record<ScoringType, {
    topGrades: string[];
    bottomGrades: string[];
    topLabel: string;
    bottomLabel: string;
}> = {
    '5grade': {
        topGrades: ['S', 'A'],
        bottomGrades: ['C', 'D'],
        topLabel: 'S+A등급',
        bottomLabel: 'C+D등급'
    },
    '5point': {
        topGrades: ['5', '4'],
        bottomGrades: ['2', '1'],
        topLabel: '4~5점',
        bottomLabel: '1~2점'
    },
    '10point': {
        topGrades: ['10', '9', '8'],
        bottomGrades: ['4', '3', '2', '1'],
        topLabel: '8~10점',
        bottomLabel: '1~4점'
    },
    '100point': {
        topGrades: ['90-100', '80-89'],
        bottomGrades: ['50-59', '0-49'],
        topLabel: '80점 이상',
        bottomLabel: '60점 미만'
    },
    '3level': {
        topGrades: ['상'],
        bottomGrades: ['하'],
        topLabel: '상',
        bottomLabel: '하'
    },
    'likert5': {
        topGrades: ['매우만족', '만족', '5', '4'],
        bottomGrades: ['불만족', '매우불만족', '2', '1'],
        topLabel: '만족 이상',
        bottomLabel: '불만족 이하'
    }
};

/**
 * 1. 등급 분포 분석 (Distribution Analysis) - Multi Scoring Type Support
 */
export function analyzeGradeDistribution(
    data: PerformanceData[],
    scoringType: ScoringType = '5grade'
): InsightResult[] {
    const insights: InsightResult[] = [];
    const total = data.reduce((sum, d) => sum + d.count, 0);

    if (total === 0) return insights;

    const config = SCORING_CONFIG[scoringType];

    // Calculate top and bottom ratios based on scoring type
    const topCount = data
        .filter(d => config.topGrades.includes(d.grade))
        .reduce((sum, d) => sum + d.count, 0);
    const bottomCount = data
        .filter(d => config.bottomGrades.includes(d.grade))
        .reduce((sum, d) => sum + d.count, 0);

    const topRatio = (topCount / total) * 100;
    const bottomRatio = (bottomCount / total) * 100;

    // Rule: IF top ratio > 40% THEN positive
    if (topRatio > 40) {
        insights.push({
            type: 'positive',
            message: `상위 성과(${config.topLabel}) 비율이 ${topRatio.toFixed(0)}%로 우수합니다.`,
            metric: config.topLabel,
            value: topRatio
        });
    }

    // Rule: IF bottom ratio > 25% THEN warning
    if (bottomRatio > 25) {
        insights.push({
            type: 'warning',
            message: `하위 성과(${config.bottomLabel}) 비율이 ${bottomRatio.toFixed(0)}%로 관리가 필요합니다.`,
            metric: config.bottomLabel,
            value: bottomRatio
        });
    }

    // Special rule for 5grade: Check S grade specifically
    if (scoringType === '5grade') {
        const sCount = data.find(d => d.grade === 'S')?.count || 0;
        const sRatio = (sCount / total) * 100;
        if (sRatio > 15) {
            insights.push({
                type: 'positive',
                message: `S등급 인력 비율이 ${sRatio.toFixed(0)}%로 우수합니다.`,
                metric: 'S등급 비율',
                value: sRatio
            });
        }
    }

    return insights;
}

/**
 * 2. 역량 변화율 분석 (Change Detection)
 */
export function analyzeCapabilityChanges(data: CapabilityData[]): InsightResult[] {
    const insights: InsightResult[] = [];

    const withChanges = data.filter(d => d.previousValue !== undefined);
    if (withChanges.length === 0) return insights;

    const changes = withChanges.map(d => {
        const previousValue = d.previousValue ?? d.value;
        const denominator = previousValue === 0 ? 1 : previousValue;
        return {
            label: d.label,
            change: ((d.value - previousValue) / denominator) * 100
        };
    });

    const sortedByImprovement = [...changes].sort((a, b) => b.change - a.change);
    const sortedByDecline = [...changes].sort((a, b) => a.change - b.change);

    const topImprover = sortedByImprovement[0];
    if (topImprover && topImprover.change > 5) {
        insights.push({
            type: 'positive',
            message: `'${topImprover.label}' 역량이 가장 크게 상승했습니다(▲${topImprover.change.toFixed(0)}%).`,
            metric: topImprover.label,
            value: topImprover.change
        });
    }

    const topDecliner = sortedByDecline[0];
    if (topDecliner && topDecliner.change < -5) {
        insights.push({
            type: 'warning',
            message: `'${topDecliner.label}' 역량이 하락세입니다(▼${Math.abs(topDecliner.change).toFixed(0)}%).`,
            metric: topDecliner.label,
            value: topDecliner.change
        });
    }

    return insights;
}

/**
 * 3. Top/Bottom Performer 식별
 */
export function identifyPerformers(data: TeamPerformance[]): {
    topPerformers: TeamPerformance[];
    bottomPerformers: TeamPerformance[];
    insights: InsightResult[];
} {
    const insights: InsightResult[] = [];
    const sorted = [...data].sort((a, b) => b.score - a.score);

    const topPerformers = sorted.slice(0, 3);
    const avgScore = data.reduce((sum, d) => sum + d.score, 0) / data.length;
    const bottomPerformers = data.filter(d => d.score < avgScore * 0.95);

    if (topPerformers.length > 0) {
        insights.push({
            type: 'positive',
            message: `'${topPerformers[0].name}'이(가) ${topPerformers[0].score.toFixed(1)}점으로 최고 성과를 달성했습니다.`,
            metric: 'Top Performer',
            value: topPerformers[0].score
        });
    }

    if (bottomPerformers.length > 0) {
        insights.push({
            type: 'warning',
            message: `${bottomPerformers.length}개 팀/인원이 평균 이하 성과를 보이고 있습니다.`,
            metric: '관리 필요',
            value: bottomPerformers.length
        });
    }

    return { topPerformers, bottomPerformers, insights };
}

/**
 * 4. 진행률 분석
 */
export function analyzeProgressRate(currentRate: number, targetRate: number = 100): InsightResult[] {
    const insights: InsightResult[] = [];
    const gap = targetRate - currentRate;

    if (currentRate >= 95) {
        insights.push({
            type: 'positive',
            message: `평가 진행률이 ${currentRate}%로 거의 완료되었습니다.`,
            metric: '진행률',
            value: currentRate
        });
    } else if (gap > 20) {
        insights.push({
            type: 'warning',
            message: `평가 진행률이 ${currentRate}%로 목표 대비 ${gap}% 부족합니다.`,
            metric: '진행률 GAP',
            value: gap
        });
    }

    return insights;
}

/**
 * 종합 인사이트 생성기 (Extended with scoringType support)
 */
export function generateInsights(
    gradeData: PerformanceData[],
    capabilityData: CapabilityData[],
    performanceData: TeamPerformance[],
    progressRate: number,
    scoringType: ScoringType = '5grade'
): InsightResult[] {
    const allInsights: InsightResult[] = [];

    allInsights.push(...analyzeGradeDistribution(gradeData, scoringType));
    allInsights.push(...analyzeCapabilityChanges(capabilityData));

    const { insights: performerInsights } = identifyPerformers(performanceData);
    allInsights.push(...performerInsights);

    allInsights.push(...analyzeProgressRate(progressRate));

    // Return top 2 insights (1 positive, 1 warning if available)
    const positive = allInsights.filter(i => i.type === 'positive');
    const warnings = allInsights.filter(i => i.type === 'warning');

    const result: InsightResult[] = [];
    if (positive.length > 0) result.push(positive[0]);
    if (warnings.length > 0) result.push(warnings[0]);

    if (result.length < 2) {
        const remaining = allInsights.filter(i => !result.includes(i));
        result.push(...remaining.slice(0, 2 - result.length));
    }

    return result;
}

/**
 * Grade thresholds configuration for each scoring type
 * Format: [threshold, label][] - score >= threshold returns label
 */
const GRADE_THRESHOLDS: Record<ScoringType, [number, string][]> = {
    '5grade': [[95, 'S'], [85, 'A'], [70, 'B'], [60, 'C'], [0, 'D']],
    '100point': [[90, '90-100'], [80, '80-89'], [70, '70-79'], [60, '60-69'], [50, '50-59'], [0, '0-49']],
    '3level': [[80, '상'], [50, '중'], [0, '하']],
    'likert5': [[80, '매우만족'], [60, '만족'], [40, '보통'], [20, '불만족'], [0, '매우불만족']],
    '5point': [], // Handled separately
    '10point': [], // Handled separately
};

/**
 * Helper: Convert numeric scores to grade labels based on scoring type
 */
export function scoreToGrade(score: number, scoringType: ScoringType): string {
    // Point-based scoring (5point, 10point) - use calculation
    if (scoringType === '5point') {
        return Math.min(5, Math.max(1, Math.round(score / 20))).toString();
    }
    if (scoringType === '10point') {
        return Math.min(10, Math.max(1, Math.round(score / 10))).toString();
    }

    // Threshold-based scoring - use lookup table
    const thresholds = GRADE_THRESHOLDS[scoringType];
    if (thresholds && thresholds.length > 0) {
        for (const [threshold, label] of thresholds) {
            if (score >= threshold) return label;
        }
    }

    return 'B'; // Default fallback
}
