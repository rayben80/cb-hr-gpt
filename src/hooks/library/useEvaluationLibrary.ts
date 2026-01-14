import { ViewMode } from '@/components/common';
import { useCallback, useState } from 'react';
import { EvaluationTemplate, Member, Team } from '../../constants';
// Hooks
import { useAuth } from '../../contexts/AuthContext';
import { EvaluationAssignment, EvaluationCampaign } from '../evaluation/firestoreEvaluationTypes';
import { CampaignDraft } from '../evaluation/useCampaignWizard';
import { useFirestoreEvaluation } from '../evaluation/useFirestoreEvaluation';
import { useImportExport } from '../evaluation/useImportExport';
import { useLibraryFilters } from '../evaluation/useLibraryFilters';
import { useTemplateManagement } from './useTemplateManagement';

export const useEvaluationLibrary = () => {
    // 1. Core State & Management Hook
    const manager = useTemplateManagement();
    const { currentUser: user } = useAuth();
    const { createCampaign } = useFirestoreEvaluation();

    // 2. UI State (Modals & Views)
    const [previewTemplate, setPreviewTemplate] = useState<EvaluationTemplate | null>(null);
    const [campaignWizardTemplateId, setCampaignWizardTemplateId] = useState<string | number | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [listViewMode, setListViewMode] = useState<ViewMode>('grid');

    // 3. Filters & Import/Export Hooks
    const filters = useLibraryFilters(manager.templates);

    const importExport = useImportExport(manager.addTemplate);

    // 4. Derived Actions
    const handleCreateNew = useCallback(() => {
        setShowStartModal(true);
        manager.setEditingTemplate(null);
    }, [manager]);

    const handleSelectBlank = useCallback(() => {
        setShowStartModal(false);
        manager.setEditingTemplate(null);
        manager.setView('editor');
    }, [manager]);

    const handleSelectPreset = useCallback(
        (type: string) => {
            setShowStartModal(false);
            manager.setEditingTemplate({
                id: 0,
                name: '',
                type,
                category: '공통',
                items: [],
                description: '',
                questions: 0,
                author: '',
                lastUpdated: '',

                archived: false,
                version: 1,
            });
            manager.setView('editor');
        },
        [manager]
    );

    const handleSelectAll = useCallback(() => {
        manager.selectAll(filters.sortedTemplates.map((t) => t.id));
    }, [manager, filters.sortedTemplates]);

    const handleLaunch = useCallback((id: string | number) => {
        setCampaignWizardTemplateId(id);
    }, []);

    const createCampaignFromWizard = useCallback(
        async (draft: CampaignDraft, teams: Team[], members: Member[]) => {
            if (!user) throw new Error('User not authenticated');

            // 1. Resolve Targets
            let targetMembers: Member[] = [];
            const { includeSelf } = draft.target;

            if (draft.target.type === 'all') {
                targetMembers = members.filter((m) => m.status === 'active' && (includeSelf || m.email !== user.email));
            } else if (draft.target.type === 'team') {
                const teamIds = new Set(draft.target.teamIds);
                targetMembers = members.filter(
                    (m) =>
                        m.teamId &&
                        teamIds.has(m.teamId) &&
                        m.status === 'active' &&
                        (includeSelf || m.email !== user.email)
                );
            } else {
                const memberIds = new Set(draft.target.memberIds);
                targetMembers = members.filter((m) => memberIds.has(m.id));
            }

            // 2. Create Assignment Objects
            const assignments: Omit<EvaluationAssignment, 'id' | 'campaignId' | 'status' | 'progress'>[] = [];

            targetMembers.forEach((target) => {
                // 이메일이 일치하면 현재 로그인한 유저의 UID를 사용 (DB의 Member ID와 Auth UID가 다를 수 있음)
                const isCurrentUser = target.email === user.email;
                const realEvaluatorId = isCurrentUser ? user.uid : target.id;

                // Self Evaluation
                assignments.push({
                    evaluatorId: realEvaluatorId,
                    evaluateeId: target.id, // 대상자 ID는 Member ID 유지
                    relation: 'SELF',
                    dueDate: draft.period.endDate,
                    evaluateeName: target.name,
                    campaignTitle: draft.period.name,
                });

                // Leader Evaluation (if team lead exists and is different)
                const team = teams.find((t) => t.id === target.teamId);
                if (team && team.leadId && team.leadId !== target.id) {
                    // 리더도 로그인한 사용자일 수 있음 (이메일 체크 필요하지만 리더 객체 정보가 여기선 ID뿐임)
                    // 리더의 UID를 알아내려면 멤버 리스트에서 리더 ID로 멤버를 찾아야 함
                    const leaderMember = members.find((m) => m.id === team.leadId);
                    const leaderIsCurrentUser = leaderMember && leaderMember.email === user.email;
                    const realLeaderId = leaderIsCurrentUser ? user.uid : team.leadId;

                    assignments.push({
                        evaluatorId: realLeaderId,
                        evaluateeId: target.id,
                        relation: 'LEADER',
                        dueDate: draft.period.endDate,
                        evaluateeName: target.name,
                        campaignTitle: draft.period.name,
                    });
                }
            });

            // 3. Create Campaign Object
            const recurringType = draft.period.recurringType || 'monthly';
            const recurringLabelMap: Record<typeof recurringType, string> = {
                monthly: '월별',
                quarterly: '분기별',
                yearly: '연별',
            };
            const periodLabel = draft.period.isRecurring ? recurringLabelMap[recurringType] : '수시';
            const recurringFields = draft.period.isRecurring
                ? {
                      isRecurring: true,
                      recurringType,
                      recurringStartDay: draft.period.recurringStartDay ?? 1,
                      recurringDurationDays: draft.period.recurringDurationDays ?? 14,
                  }
                : { isRecurring: false };

            const campaignData: Omit<EvaluationCampaign, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalTargets'> =
                {
                    title: draft.period.name,
                    type: draft.templateSnapshot.type,
                    period: periodLabel,
                    startDate: draft.period.startDate,
                    endDate: draft.period.endDate,
                    templateSnapshot: draft.templateSnapshot,
                    createdBy: user.uid,
                    weights: { firstHalf: 0, secondHalf: 0, peer: 0 },
                    ...recurringFields,
                };

            // 4. Submit
            return await createCampaign(campaignData, assignments);
        },
        [user, createCampaign]
    );

    const handleBatchExportAction = useCallback(() => {
        const templatesToExport = manager.templates.filter((t) => manager.selectedIds.has(t.id));
        importExport.handleExport(templatesToExport);
    }, [manager.templates, manager.selectedIds, importExport]);

    return {
        ...manager,
        ...filters,
        ...importExport,
        previewTemplate,
        setPreviewTemplate,
        campaignWizardTemplateId,
        setCampaignWizardTemplateId,
        showStartModal,
        setShowStartModal,
        listViewMode,
        setListViewMode,
        handleCreateNew,
        handleSelectBlank,
        handleSelectPreset,
        handleSelectAll,
        handleBatchExportAction,
        handleLaunch,
        createCampaignFromWizard,
        handleArchiveTemplate: manager.handleArchiveTemplate,
        handleDeleteTemplate: manager.handleDeleteTemplate,
    };
};
