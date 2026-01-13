import { EvaluationTemplate, Member, Team } from '../../constants';
import { CampaignFormData } from '../../hooks/evaluation/useCampaignForm';
import { EvaluationAssignment, EvaluationCampaign } from '../../hooks/evaluation/useFirestoreEvaluation';
import {
    getAllMembers,
    pickPeers,
    resolveLeaderId,
    resolvePeerPool,
    resolveTeamForMember,
} from './createCampaignUtils';

interface BuildLaunchDataParams {
    formData: CampaignFormData;
    templates: EvaluationTemplate[];
    today: string;
    teams: Team[];
    cycleKey: string;
    raterGroups: EvaluationCampaign['raterGroups'];
    getSelectedMemberObjects: (teams: Team[]) => Member[];
}

export const buildLaunchData = ({
    formData,
    templates,
    today,
    teams,
    cycleKey,
    raterGroups,
    getSelectedMemberObjects,
}: BuildLaunchDataParams) => {
    const template = templates.find((item) => item.id === formData.templateId);
    if (!template) return null;

    const periodStart = formData.timing === 'now' ? today : formData.startDate;
    const periodEnd = formData.endDate;

    const campaignData: Omit<EvaluationCampaign, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalTargets'> = {
        title: formData.name,
        type: template.type,
        period: formData.period,
        reportingCategory: formData.reportingCategory,
        evaluationType: formData.evaluationType,
        cycleKey,
        periodStart,
        periodEnd,
        dueDate: periodEnd,
        ratingScale: formData.ratingScale,
        scoringRule: formData.scoringRule,
        adjustmentMode: formData.adjustmentMode,
        adjustmentRange: formData.adjustmentRange,
        allowReview: formData.allowReview,
        allowResubmission: formData.allowResubmission,
        allowHqFinalOverride: formData.allowHqFinalOverride,
        hqAdjustmentRule: formData.hqAdjustmentRule,
        raterGroups,
        peerScope: formData.peerScope,
        peerCount: formData.peerCount,
        startDate: periodStart,
        endDate: periodEnd,
        weights: {
            firstHalf: 40,
            secondHalf: 40,
            peer: 20,
        },
        templateSnapshot: template,
        createdBy: 'admin',
    };

    const targetMembers = getSelectedMemberObjects(teams);
    const allMembers = getAllMembers(teams);

    const includeSelf = raterGroups?.some((group) => group.role === 'SELF');
    const includeLeader = raterGroups?.some((group) => group.role === 'LEADER');
    const includePeer = raterGroups?.some((group) => group.role === 'PEER');

    const assignments: Omit<EvaluationAssignment, 'id' | 'campaignId' | 'status' | 'progress'>[] = [];
    const assignmentKeys = new Set<string>();
    const addAssignment = (
        evaluatorId: string | undefined,
        evaluateeId: string,
        relation: EvaluationAssignment['relation']
    ) => {
        if (!evaluatorId) return;
        const key = `${evaluatorId}:${evaluateeId}:${relation}`;
        if (assignmentKeys.has(key)) return;
        assignmentKeys.add(key);
        assignments.push({
            evaluatorId,
            evaluateeId,
            relation,
            dueDate: periodEnd,
        });
    };

    targetMembers.forEach((member, index) => {
        if (includeSelf) {
            addAssignment(member.id, member.id, 'SELF');
        }

        if (includeLeader) {
            const team = resolveTeamForMember(member, teams);
            const leaderId = resolveLeaderId(team);
            if (leaderId && leaderId !== member.id) {
                addAssignment(leaderId, member.id, 'LEADER');
            }
        }

        if (includePeer) {
            const team = resolveTeamForMember(member, teams);
            const leaderId = includeLeader ? resolveLeaderId(team) : undefined;
            const pool = resolvePeerPool(member, team, formData.peerScope, allMembers).filter(
                (peer) => peer.id !== member.id && (!leaderId || peer.id !== leaderId)
            );
            const peers = pickPeers(pool, formData.peerCount, index);
            peers.forEach((peer) => addAssignment(peer.id, member.id, 'PEER'));
        }
    });

    return { campaign: campaignData, assignments };
};
