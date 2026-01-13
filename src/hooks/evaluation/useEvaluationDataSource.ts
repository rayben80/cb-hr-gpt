import { useCallback, useEffect, useState } from 'react';
import {
    Evaluation,
    EvaluationTemplate,
    initialEvaluationsData,
    initialLibraryData,
    initialTeamsData,
    Team,
} from '../../constants';
import { auth } from '../../firebase';
import { normalizeTeamsMemberRoles } from '../../utils/memberRoleUtils';
import { resolveReportingCategory } from '../../utils/reportingCategoryUtils';
import { useFirestoreEvaluation } from './useFirestoreEvaluation';

interface UseEvaluationDataSourceReturn {
    evaluations: Evaluation[];
    setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
    templates: EvaluationTemplate[];
    teams: Team[];
    isLoading: boolean;
    refreshEvaluations: () => Promise<void>;
    useMockData: boolean;
}

export const useEvaluationDataSource = (role: string | undefined): UseEvaluationDataSourceReturn => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { fetchAllCampaigns, fetchMyAssignments, fetchCampaignStatistics } = useFirestoreEvaluation();
    const useMockData =
        import.meta.env.VITE_USE_MOCK_MONITORING === '1' || import.meta.env.VITE_USE_MOCK_MONITORING === 'true';

    const fetchAndAdaptData = useCallback(async () => {
        setIsLoading(true);
        try {
            setTemplates(initialLibraryData);
            setTeams(normalizeTeamsMemberRoles(initialTeamsData).teams);

            const user = auth.currentUser;
            let campaignEvaluations: Evaluation[] = [];
            let assignmentEvaluations: Evaluation[] = [];

            // 1. Fetch Assignments (For All Users)
            if (user) {
                const assignments = await fetchMyAssignments(user.uid);
                assignmentEvaluations = assignments.map((assignment) => {
                    const inProgressStatuses = new Set(['PENDING', 'IN_PROGRESS', 'RESUBMIT_REQUESTED']);
                    const isInProgress = inProgressStatuses.has(assignment.status);
                    return {
                        id: assignment.id,
                        name: assignment.campaignTitle || '평가',
                        type: assignment.relation === 'SELF' ? '본인평가' : '다면평가',
                        status: isInProgress ? '진행중' : '완료',
                        startDate: '',
                        endDate: assignment.dueDate,
                        subject: assignment.relation === 'SELF' ? '본인' : assignment.evaluateeName || '동료',
                        subjectId: assignment.evaluateeId,
                        progress: assignment.progress,
                        score: null,
                        answers: [],
                        templateSnapshot: null as any,
                        period: '수시',
                        subjectSnapshot: {
                            name: assignment.evaluateeName || 'Unknown',
                            role: 'Member',
                            teamId: 'unknown',
                            teamName: 'Unknown',
                        },
                    };
                });
            }

            // 2. Fetch Campaigns (For Admins)
            if (role === 'SUPER_ADMIN' || role === 'HQ_LEADER' || role === 'TEAM_LEADER') {
                if (useMockData) {
                    setEvaluations(initialEvaluationsData);
                    return;
                }
                const campaigns = await fetchAllCampaigns();
                const campaignStats =
                    campaigns.length > 0
                        ? await Promise.all(campaigns.map((campaign) => fetchCampaignStatistics(campaign.id)))
                        : [];

                campaignEvaluations = campaigns.map((campaign, index) => ({
                    id: campaign.id,
                    name: campaign.title,
                    type: campaign.type as any,
                    status: campaign.status === 'ACTIVE' ? '진행중' : '완료',
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    evaluationType: campaign.evaluationType,
                    cycleKey: campaign.cycleKey,
                    periodStart: campaign.periodStart,
                    periodEnd: campaign.periodEnd,
                    dueDate: campaign.dueDate,
                    ratingScale: campaign.ratingScale,
                    scoringRule: campaign.scoringRule,
                    adjustmentMode: campaign.adjustmentMode,
                    adjustmentRange: campaign.adjustmentRange,
                    allowReview: campaign.allowReview,
                    allowResubmission: campaign.allowResubmission,
                    allowHqFinalOverride: campaign.allowHqFinalOverride,
                    hqAdjustmentRule: campaign.hqAdjustmentRule,
                    raterGroups: campaign.raterGroups,
                    peerScope: campaign.peerScope,
                    peerCount: campaign.peerCount,
                    subject: `${campaign.totalTargets} 명`,
                    subjectId: 'campaign',
                    progress: campaignStats[index]?.progress ?? 0,
                    score: 0,
                    answers: [],
                    templateSnapshot: campaign.templateSnapshot,
                    period: campaign.period || '수시',
                    subjectSnapshot: {
                        name: 'N/A',
                        role: 'N/A',
                        teamId: 'N/A',
                        teamName: 'N/A',
                    },
                    reportingCategory: resolveReportingCategory({
                        reportingCategory: campaign.reportingCategory,
                        templateCategory: campaign.templateSnapshot?.category,
                        templateType: campaign.templateSnapshot?.type,
                        type: campaign.type,
                        title: campaign.title,
                    }),
                }));
            }

            setEvaluations([...campaignEvaluations, ...assignmentEvaluations]);
        } catch (error) {
            console.error(error);
            setEvaluations([]);
        } finally {
            setIsLoading(false);
        }
    }, [fetchAllCampaigns, fetchCampaignStatistics, fetchMyAssignments, role, useMockData]);

    useEffect(() => {
        fetchAndAdaptData();
    }, [fetchAndAdaptData]);

    const refreshEvaluations = useCallback(async () => {
        await fetchAndAdaptData();
    }, [fetchAndAdaptData]);

    return {
        evaluations,
        setEvaluations,
        templates,
        teams,
        isLoading,
        refreshEvaluations,
        useMockData,
    };
};
