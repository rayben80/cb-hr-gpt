export interface DashboardStats {
    totalMembers: number;
    completedEvaluations: number;
    progressRate: number;
    averageScore: number;
    changes: {
        members: number;
        evaluations: number;
        progress: number;
        score: number;
    };
}

export interface ScoreDistribution {
    grade: string;
    count: number;
    color: string;
    percentage?: number; // Used in Chart logic
}

export interface DepartmentPerformance {
    department: string;
    teamId?: string;
    score: number;
    average: number;
    memberCount?: number;
}

export interface CapabilityRadarData {
    label: string;
    value: number;
    previousValue?: number;
}

export interface Insight {
    type: 'positive' | 'negative' | 'warning' | 'neutral';
    message: string;
    metric?: string;
    value?: number;
}

export interface Performer {
    id?: string;
    name: string;
    score: number;
    avatar?: string;
    team?: string;
    trend?: 'up' | 'down' | 'stable';
}
