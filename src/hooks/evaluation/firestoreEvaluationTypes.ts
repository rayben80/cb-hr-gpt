import { EvaluationScale, EvaluationTemplate, EvaluationType, RaterGroup, ScoringRule } from '../../constants';

export interface EvaluationCampaign {
    id: string;
    title: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
    type: string;
    period: string;
    isRecurring?: boolean | undefined;
    recurringType?: 'monthly' | 'quarterly' | 'yearly' | undefined;
    reportingCategory?: string | undefined;
    evaluationType?: EvaluationType | undefined;
    cycleKey?: string | undefined;
    periodStart?: string | undefined;
    periodEnd?: string | undefined;
    dueDate?: string | undefined;
    ratingScale?: EvaluationScale | undefined;
    scoringRule?: ScoringRule | undefined;
    adjustmentMode?: 'points' | 'percent' | undefined;
    adjustmentRange?: number | undefined;
    allowReview?: boolean | undefined;
    allowResubmission?: boolean | undefined;
    allowHqFinalOverride?: boolean | undefined;
    hqAdjustmentRule?: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime' | undefined;
    raterGroups?: RaterGroup[] | undefined;
    peerScope?: 'team' | 'part' | 'all' | undefined;
    peerCount?: number | undefined;
    recurringStartDay?: number | undefined;
    recurringDurationDays?: number | undefined;
    startDate: string;
    endDate: string;
    weights: {
        firstHalf: number;
        secondHalf: number;
        peer: number;
    };
    templateSnapshot: EvaluationTemplate;
    createdBy: string;
    createdAt: any;
    updatedAt: any;
    totalTargets: number;
}

export interface EvaluationAssignment {
    id: string;
    campaignId: string;
    evaluatorId: string;
    evaluateeId: string;
    relation: 'SELF' | 'PEER' | 'LEADER' | 'MEMBER';
    status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEW_OPEN' | 'RESUBMIT_REQUESTED';
    progress: number;
    dueDate: string;
    campaignTitle?: string;
    evaluateeName?: string;
    reviewRequestedAt?: string;
    reviewRequestedBy?: string;
    reviewReason?: string;
    resubmissionRequestedAt?: string;
    resubmissionRequestedBy?: string;
    resubmissionReason?: string;
}

export interface EvaluationResult {
    id: string;
    assignmentId: string;
    campaignId: string;
    evaluatorId: string;
    evaluateeId: string;
    relation?: 'SELF' | 'PEER' | 'LEADER' | 'MEMBER';
    answers: any[];
    totalScore: number;
    submittedAt: any;
}

export interface EvaluationAdjustmentEntry {
    value: number;
    note?: string | undefined;
    adjustedBy?: string;
    adjustedAt?: any;
}

export interface EvaluationAdjustment {
    id: string;
    campaignId: string;
    evaluateeId: string;
    managerAdjustment?: EvaluationAdjustmentEntry | undefined;
    hqAdjustment?: EvaluationAdjustmentEntry | undefined;
    createdAt?: any;
    updatedAt?: any;
}
