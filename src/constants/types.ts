export type MemberStatus = 'active' | 'on_leave' | 'resigned' | 'intern';
export type EmploymentType = 'regular' | 'intern';
export type MemberRole = string;

export interface Member {
    id: string;
    name: string;
    role: MemberRole;
    roleBeforeLead?: MemberRole | undefined;
    avatar: string;
    status: MemberStatus;
    employmentType?: EmploymentType | undefined;
    hireDate: string;
    email: string;
    phone?: string | undefined;
    teamName?: string | null | undefined;
    partName?: string | null | undefined;
    teamId?: string | null | undefined;
    partId?: string | null | undefined;
    order?: number; // 순서 정렬을 위한 필드
}

export interface Part {
    id: string;
    title: string;
    members: Member[];
    originalMemberCount?: number;
}

export interface Team {
    id: string;
    name: string;
    lead: string;
    leadId?: string | null;
    members?: Member[];
    parts: Part[];
    originalTotalMemberCount?: number;
    headquarterId?: string;
}

export interface Headquarter {
    id: string;
    name: string;
    leader?:
        | {
              name: string;
              role: string;
              avatar: string;
              email: string;
              phone?: string;
          }
        | undefined;
    description?: string;
}

// 본부장 변경 이력
export interface LeaderHistory {
    id: string;
    headquarterId: string;
    leaderName: string;
    action: 'appointed' | 'dismissed' | 'resigned';
    timestamp: string;
    reason?: string;
}

export type EvaluationCycle = '월별' | '분기별' | '반기별' | '상반기' | '하반기' | '연말' | '연간' | '수시';

export type EvaluationType = '성과' | '역량' | '리더십' | '직무' | '프로젝트' | '기타';

export type EvaluationScale = '5점' | '7점' | '10점' | '100점';

export type ScoringRule = '가중합' | '단순평균' | '총점합산';

export type RaterRole = 'SELF' | 'LEADER' | 'PEER' | 'MEMBER';

export interface RaterGroup {
    role: RaterRole;
    weight: number;
    required?: boolean;
}

export interface Evaluation {
    id: number | string;
    name: string;
    type: string;
    period: string;
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
    status: '완료' | '진행중' | '예정';
    subject: string; // Keep for display fallback
    subjectId: string; // [NEW] Link by ID
    subjectSnapshot: {
        // [NEW] Presley historical context
        name: string;
        role: string;
        teamId: string;
        teamName: string;
        partId?: string;
        partName?: string;
        headquarterId?: string;
    };
    startDate: string;
    endDate: string;
    progress: number;
    score: number | null;
    templateSnapshot?: EvaluationTemplate;
    answers?: { itemId: number; score: number; grade?: string | undefined; comment: string }[];
}

export interface EvaluationTemplate {
    id: number | string;
    name: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
    version?: number;

    archived?: boolean | undefined;
    questions?: number;
    items?: EvaluationItem[];
    lastUpdated: string;
    author: string;
    versionHistory?: TemplateVersionHistory[];
}

export interface TemplateVersionHistory {
    version: number;
    savedAt: string;
    savedBy: string;
    changeNote?: string;
    snapshot: Omit<EvaluationTemplate, 'versionHistory'>;
}

export interface EvaluationItem {
    id: number;
    type: '정량' | '정성';
    title: string;
    weight: number;
    details: {
        metric?: string;
        target?: string;
        calculation?: string;
        description?: string;
    };
    scoringType?: '5grade' | '5point' | '10point' | '100point' | '3level' | 'likert5';
    scoring: { grade: string; description: string; score?: number }[];
}
