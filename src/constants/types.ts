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
    teamName?: string | undefined;
    partName?: string | undefined;
    teamId?: string | undefined;
    partId?: string | undefined;
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
    leadId?: string;
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

export interface Evaluation {
    id: number | string;
    name: string;
    type: string;
    period: string;
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
    answers?: { itemId: number; score: number; grade?: string; comment: string }[];
}

export interface EvaluationTemplate {
    id: number | string;
    name: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
    version?: number;
    favorite?: boolean | undefined;
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
