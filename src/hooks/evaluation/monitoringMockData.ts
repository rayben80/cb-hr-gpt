import { Evaluation, Member, Team } from '../../constants';
import { EvaluationAdjustment } from './useFirestoreEvaluation';
import { buildMembersMap } from './monitoringDataUtils';

const buildMockMembers = (): Member[] => [
    {
        id: 'mock-member-1',
        name: 'Alex Kim',
        role: 'Sales Team',
        avatar: '',
        status: 'active',
        hireDate: '2024-01-15',
        email: 'alex.kim@example.com',
        teamName: 'Sales',
        partName: 'Sales',
        teamId: 'mock-team-1',
        partId: 'mock-part-1',
    },
    {
        id: 'mock-member-2',
        name: 'Hana Lee',
        role: 'CX Team',
        avatar: '',
        status: 'active',
        hireDate: '2023-07-01',
        email: 'hana.lee@example.com',
        teamName: 'CX',
        partName: 'CX',
        teamId: 'mock-team-2',
        partId: 'mock-part-2',
    },
    {
        id: 'mock-member-3',
        name: 'Brian Park',
        role: 'Platform Team',
        avatar: '',
        status: 'active',
        hireDate: '2022-10-20',
        email: 'brian.park@example.com',
        teamName: 'Platform',
        partName: 'Platform',
        teamId: 'mock-team-3',
        partId: 'mock-part-3',
    },
    {
        id: 'mock-member-4',
        name: 'Emily Choi',
        role: 'Marketing Team',
        avatar: '',
        status: 'active',
        hireDate: '2021-05-12',
        email: 'emily.choi@example.com',
        teamName: 'Marketing',
        partName: 'Marketing',
        teamId: 'mock-team-4',
        partId: 'mock-part-4',
    },
    {
        id: 'mock-member-5',
        name: 'David Han',
        role: 'Design Team',
        avatar: '',
        status: 'active',
        hireDate: '2020-03-03',
        email: 'david.han@example.com',
        teamName: 'Design',
        partName: 'Design',
        teamId: 'mock-team-5',
        partId: 'mock-part-5',
    },
    {
        id: 'mock-member-6',
        name: 'Sophia Jung',
        role: 'HR Team',
        avatar: '',
        status: 'active',
        hireDate: '2019-09-18',
        email: 'sophia.jung@example.com',
        teamName: 'HR',
        partName: 'HR',
        teamId: 'mock-team-6',
        partId: 'mock-part-6',
    },
    {
        id: 'mock-member-7',
        name: 'Daniel Woo',
        role: 'Product Team',
        avatar: '',
        status: 'active',
        hireDate: '2018-11-08',
        email: 'daniel.woo@example.com',
        teamName: 'Product',
        partName: 'Product',
        teamId: 'mock-team-7',
        partId: 'mock-part-7',
    },
    {
        id: 'mock-member-8',
        name: 'Grace Lim',
        role: 'Data Team',
        avatar: '',
        status: 'active',
        hireDate: '2024-02-02',
        email: 'grace.lim@example.com',
        teamName: 'Data',
        partName: 'Data',
        teamId: 'mock-team-8',
        partId: 'mock-part-8',
    },
];

const buildAnswers = (seed: number) => [
    { itemId: 1, score: 80 + seed, grade: 'A', comment: 'Strong execution on goals.' },
    { itemId: 2, score: 75 + seed, grade: 'B', comment: 'Stable collaboration throughout the period.' },
    { itemId: 3, score: 82 + seed, grade: 'A', comment: 'Fast issue resolution.' },
];

const pickSampleMembers = (memberList: Member[]) => {
    const getMember = (index: number) => memberList[index % memberList.length];
    return {
        evaluatee1: getMember(0),
        evaluatee2: getMember(1),
        evaluatee3: getMember(2),
        evaluatee4: getMember(3),
        evaluator1: getMember(4),
        evaluator2: getMember(5),
        evaluator3: getMember(6),
    };
};

const buildMockAssignments = (
    campaignId: string,
    dueDate: string,
    sample: ReturnType<typeof pickSampleMembers>
) => [
    {
        id: 'mock-assignment-1',
        campaignId,
        evaluatorId: sample.evaluator1.id,
        evaluateeId: sample.evaluatee1.id,
        relation: 'SELF',
        status: 'SUBMITTED',
        progress: 100,
        dueDate,
    },
    {
        id: 'mock-assignment-2',
        campaignId,
        evaluatorId: sample.evaluator2.id,
        evaluateeId: sample.evaluatee1.id,
        relation: 'PEER',
        status: 'REVIEW_OPEN',
        progress: 100,
        dueDate,
    },
    {
        id: 'mock-assignment-3',
        campaignId,
        evaluatorId: sample.evaluator3.id,
        evaluateeId: sample.evaluatee2.id,
        relation: 'LEADER',
        status: 'RESUBMIT_REQUESTED',
        progress: 0,
        dueDate,
    },
    {
        id: 'mock-assignment-4',
        campaignId,
        evaluatorId: sample.evaluator1.id,
        evaluateeId: sample.evaluatee2.id,
        relation: 'PEER',
        status: 'IN_PROGRESS',
        progress: 45,
        dueDate,
    },
    {
        id: 'mock-assignment-5',
        campaignId,
        evaluatorId: sample.evaluator2.id,
        evaluateeId: sample.evaluatee3.id,
        relation: 'PEER',
        status: 'PENDING',
        progress: 0,
        dueDate,
    },
    {
        id: 'mock-assignment-6',
        campaignId,
        evaluatorId: sample.evaluator3.id,
        evaluateeId: sample.evaluatee3.id,
        relation: 'SELF',
        status: 'SUBMITTED',
        progress: 100,
        dueDate,
    },
    {
        id: 'mock-assignment-7',
        campaignId,
        evaluatorId: sample.evaluator1.id,
        evaluateeId: sample.evaluatee4.id,
        relation: 'MEMBER',
        status: 'SUBMITTED',
        progress: 100,
        dueDate,
    },
    {
        id: 'mock-assignment-8',
        campaignId,
        evaluatorId: sample.evaluator2.id,
        evaluateeId: sample.evaluatee4.id,
        relation: 'PEER',
        status: 'IN_PROGRESS',
        progress: 55,
        dueDate,
    },
];

const buildMockResults = (campaignId: string, sample: ReturnType<typeof pickSampleMembers>) => [
    {
        id: 'mock-result-1',
        assignmentId: 'mock-assignment-1',
        campaignId,
        evaluatorId: sample.evaluator1.id,
        evaluateeId: sample.evaluatee1.id,
        relation: 'SELF',
        answers: buildAnswers(2),
        totalScore: 88,
        submittedAt: new Date().toISOString(),
    },
    {
        id: 'mock-result-2',
        assignmentId: 'mock-assignment-2',
        campaignId,
        evaluatorId: sample.evaluator2.id,
        evaluateeId: sample.evaluatee1.id,
        relation: 'PEER',
        answers: buildAnswers(-1),
        totalScore: 74,
        submittedAt: new Date().toISOString(),
    },
    {
        id: 'mock-result-3',
        assignmentId: 'mock-assignment-6',
        campaignId,
        evaluatorId: sample.evaluator3.id,
        evaluateeId: sample.evaluatee3.id,
        relation: 'SELF',
        answers: buildAnswers(-4),
        totalScore: 61,
        submittedAt: new Date().toISOString(),
    },
    {
        id: 'mock-result-4',
        assignmentId: 'mock-assignment-7',
        campaignId,
        evaluatorId: sample.evaluator1.id,
        evaluateeId: sample.evaluatee4.id,
        relation: 'MEMBER',
        answers: buildAnswers(5),
        totalScore: 92,
        submittedAt: new Date().toISOString(),
    },
];

const buildMockAdjustments = (campaignId: string, sample: ReturnType<typeof pickSampleMembers>) => [
    {
        id: `${campaignId}_${sample.evaluatee1.id}`,
        campaignId,
        evaluateeId: sample.evaluatee1.id,
        managerAdjustment: {
            value: 5,
            note: 'Mock adjustment',
            adjustedBy: 'mock-user',
            adjustedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
    },
    {
        id: `${campaignId}_${sample.evaluatee3.id}`,
        campaignId,
        evaluateeId: sample.evaluatee3.id,
        hqAdjustment: {
            value: -3,
            note: 'Mock adjustment',
            adjustedBy: 'mock-user',
            adjustedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
    },
] as EvaluationAdjustment[];

export const buildMockMonitoringData = (teams: Team[], evaluation: Evaluation) => {
    const members = Array.from(buildMembersMap(teams).values());
    const memberList = members.length > 0 ? members : buildMockMembers();
    const campaignId = String(evaluation.id);
    const dueDate = evaluation.endDate || new Date().toISOString().slice(0, 10);
    const sample = pickSampleMembers(memberList);

    const assignments = buildMockAssignments(campaignId, dueDate, sample);
    const results = buildMockResults(campaignId, sample);
    const adjustments = buildMockAdjustments(campaignId, sample);

    return { assignments, results, adjustments };
};
