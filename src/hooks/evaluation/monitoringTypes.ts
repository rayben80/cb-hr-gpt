export type MonitoringStatusFilter = 'all' | 'complete' | 'incomplete';
export type MonitoringSortKey = 'score_desc' | 'score_asc' | 'submission_desc' | 'name';

export interface ParticipantStatus {
    assignmentId: string;
    name: string;
    team: string;
    evaluateeName: string;
    relation?: 'SELF' | 'PEER' | 'LEADER' | 'MEMBER';
    status: 'completed' | 'in_progress' | 'not_started' | 'review_open' | 'resubmit_requested';
    progress: number;
}

export interface EvaluateeSummary {
    id: string;
    name: string;
    team: string;
    submittedCount: number;
    assignmentCount: number;
    leaderAssignmentCount: number;
    leaderSubmitted: boolean;
    hasManagerAdjustment: boolean;
    baseScore: number | null;
    finalScore: number | null;
    managerAdjustment?: number | undefined;
    hqAdjustment?: number | undefined;
}

export interface MonitoringStats {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
}
