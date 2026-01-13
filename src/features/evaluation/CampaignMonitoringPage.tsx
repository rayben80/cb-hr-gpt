import { ArrowLeft } from '@phosphor-icons/react';
import React, { memo, useState } from 'react';
import { Evaluation, Member, Team } from '@/constants';
import { EvaluateeSummary } from '@/hooks/evaluation/monitoringTypes';
import { useRole } from '@/contexts/RoleContext';
import { useCampaignMonitoringData } from '@/hooks/evaluation/useCampaignMonitoringData';
import { useMonitoringAdjustments } from '@/hooks/evaluation/useMonitoringAdjustments';
import { useMonitoringAssignmentActions } from '@/hooks/evaluation/useMonitoringAssignmentActions';
import { useMonitoringReminder } from '@/hooks/evaluation/useMonitoringReminder';
import { useMonitoringRequestFlow } from '@/hooks/evaluation/useMonitoringRequestFlow';
import { MonitoringAdjustmentModal } from './components/monitoring/MonitoringAdjustmentModal';
import { MonitoringEvaluateeDetail } from './components/monitoring/MonitoringEvaluateeDetail';
import { MonitoringParticipantsSection } from './components/monitoring/MonitoringParticipantsSection';
import { MonitoringRequestModal } from './components/monitoring/MonitoringRequestModal';
import { MonitoringStatsRow } from './components/monitoring/MonitoringStatsRow';
import { MonitoringSummarySection } from './components/monitoring/MonitoringSummarySection';

interface CampaignMonitoringPageProps {
    evaluation: Evaluation;
    teams: Team[];
    onBack: () => void;
}

interface MonitoringPageLayoutProps {
    evaluation: Evaluation;
    detailTarget: EvaluateeSummary | null;
    assignments: any[];
    results: any[];
    membersMap: Map<string, Member>;
    participants: ReturnType<typeof useCampaignMonitoringData>['participants'];
    stats: ReturnType<typeof useCampaignMonitoringData>['stats'];
    filteredEvaluateeSummaries: ReturnType<typeof useCampaignMonitoringData>['filteredEvaluateeSummaries'];
    statusFilter: ReturnType<typeof useCampaignMonitoringData>['statusFilter'];
    sortKey: ReturnType<typeof useCampaignMonitoringData>['sortKey'];
    lowScoreThreshold: ReturnType<typeof useCampaignMonitoringData>['lowScoreThreshold'];
    resultsLoading: ReturnType<typeof useCampaignMonitoringData>['resultsLoading'];
    adjustmentUnit: ReturnType<typeof useMonitoringAdjustments>['adjustmentUnit'];
    canAdjustAsLeader: boolean;
    canAdjustAsHq: boolean;
    hqAdjustmentRule?: Evaluation['hqAdjustmentRule'];
    remindSending: ReturnType<typeof useMonitoringReminder>['remindSending'];
    remindResult: ReturnType<typeof useMonitoringReminder>['remindResult'];
    allowReview: boolean;
    allowResubmission: boolean;
    onBack: () => void;
    onOpenDetail: (summary: EvaluateeSummary | null) => void;
    onStatusFilterChange: (value: ReturnType<typeof useCampaignMonitoringData>['statusFilter']) => void;
    onSortKeyChange: (value: ReturnType<typeof useCampaignMonitoringData>['sortKey']) => void;
    onLowScoreThresholdChange: (value: ReturnType<typeof useCampaignMonitoringData>['lowScoreThreshold']) => void;
    onResetFilters: () => void;
    onSortByName: () => void;
    onSortBySubmission: () => void;
    onSortByScore: () => void;
    onOpenAdjustment: (summary: EvaluateeSummary, role: 'manager' | 'hq') => void;
    onRemindAll: () => void;
    onOpenReview: (assignmentId: string) => void;
    onRequestResubmission: (assignmentId: string) => void;
}

const MonitoringPageLayout: React.FC<MonitoringPageLayoutProps> = memo(
    ({
        evaluation,
        detailTarget,
        assignments,
        results,
        membersMap,
        participants,
        stats,
        filteredEvaluateeSummaries,
        statusFilter,
        sortKey,
        lowScoreThreshold,
        resultsLoading,
        adjustmentUnit,
        canAdjustAsLeader,
        canAdjustAsHq,
        hqAdjustmentRule,
        remindSending,
        remindResult,
        allowReview,
        allowResubmission,
        onBack,
        onOpenDetail,
        onStatusFilterChange,
        onSortKeyChange,
        onLowScoreThresholdChange,
        onResetFilters,
        onSortByName,
        onSortBySubmission,
        onSortByScore,
        onOpenAdjustment,
        onRemindAll,
        onOpenReview,
        onRequestResubmission,
    }) => (
        <div className="space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" weight="regular" />
                평가 목록으로 돌아가기
            </button>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">평가 현황</h1>
                        <p className="text-sm text-slate-500 mt-1">{evaluation.name}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                        {evaluation.startDate} ~ {evaluation.endDate}
                    </div>
                </div>
                <MonitoringStatsRow stats={stats} />
                <div className="p-6">
                    {detailTarget ? (
                        <MonitoringEvaluateeDetail
                            evaluation={evaluation}
                            summary={detailTarget}
                            assignments={assignments}
                            results={results}
                            membersMap={membersMap}
                            onBack={() => onOpenDetail(null)}
                        />
                    ) : (
                        <>
                            <MonitoringSummarySection
                                summaries={filteredEvaluateeSummaries}
                                statusFilter={statusFilter}
                                sortKey={sortKey}
                                lowScoreThreshold={lowScoreThreshold}
                                resultsLoading={resultsLoading}
                                adjustmentUnit={adjustmentUnit}
                                canAdjustAsLeader={canAdjustAsLeader}
                                canAdjustAsHq={canAdjustAsHq}
                                hqAdjustmentRule={hqAdjustmentRule}
                                onStatusFilterChange={onStatusFilterChange}
                                onSortKeyChange={onSortKeyChange}
                                onLowScoreThresholdChange={onLowScoreThresholdChange}
                                onResetFilters={onResetFilters}
                                onSortByName={onSortByName}
                                onSortBySubmission={onSortBySubmission}
                                onSortByScore={onSortByScore}
                                onOpenAdjustment={onOpenAdjustment}
                                onOpenDetail={(summary) => onOpenDetail(summary)}
                            />
                            <MonitoringParticipantsSection
                                participants={participants}
                                stats={stats}
                                remindSending={remindSending}
                                remindResult={remindResult}
                                onRemindAll={onRemindAll}
                                allowReview={allowReview}
                                allowResubmission={allowResubmission}
                                onOpenReview={onOpenReview}
                                onRequestResubmission={onRequestResubmission}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
);

MonitoringPageLayout.displayName = 'MonitoringPageLayout';

export const CampaignMonitoringPage: React.FC<CampaignMonitoringPageProps> = memo(
    ({ evaluation, teams, onBack }) => {
        const { isHeadquarterAdmin, isTeamAdmin, isSuperAdmin } = useRole();
        const {
            assignments,
            adjustmentsMap,
            setAdjustments,
            setAssignments,
            results,
            membersMap,
            participants,
            stats,
            filteredEvaluateeSummaries,
            statusFilter,
            setStatusFilter,
            sortKey,
            setSortKey,
            lowScoreThreshold,
            setLowScoreThreshold,
            resultsLoading,
            resetFilters,
        } = useCampaignMonitoringData({ evaluation, teams });
        const [detailTarget, setDetailTarget] = useState<EvaluateeSummary | null>(null);
        const {
            adjustmentTarget,
            adjustmentRole,
            adjustmentValue,
            setAdjustmentValue,
            adjustmentNote,
            setAdjustmentNote,
            isSavingAdjustment,
            adjustmentUnit,
            adjustmentRange,
            openAdjustmentModal,
            closeAdjustmentModal,
            handleSaveAdjustment,
            adjustmentPreview,
        } = useMonitoringAdjustments({ evaluation, adjustmentsMap, setAdjustments });

        const { remindSending, remindResult, handleRemindAll } = useMonitoringReminder(participants, evaluation);

        const { allowReview, allowResubmission, handleOpenReview, handleRequestResubmission } =
            useMonitoringAssignmentActions({ evaluation, setAssignments });
        const canAdjustAsLeader = isTeamAdmin;
        const canAdjustAsHq = (isHeadquarterAdmin || isSuperAdmin) && evaluation.allowHqFinalOverride !== false;

        const {
            isRequestOpen,
            requestReason,
            setRequestReason,
            openReviewRequest,
            openResubmissionRequest,
            closeRequestModal,
            submitRequest,
            modalTitle,
        } = useMonitoringRequestFlow({
            allowReview,
            allowResubmission,
            onOpenReview: handleOpenReview,
            onRequestResubmission: handleRequestResubmission,
        });

        return (
            <>
                <MonitoringPageLayout
                    evaluation={evaluation}
                    detailTarget={detailTarget}
                    assignments={assignments}
                    results={results}
                    membersMap={membersMap}
                    participants={participants}
                    stats={stats}
                    filteredEvaluateeSummaries={filteredEvaluateeSummaries}
                    statusFilter={statusFilter}
                    sortKey={sortKey}
                    lowScoreThreshold={lowScoreThreshold}
                    resultsLoading={resultsLoading}
                    adjustmentUnit={adjustmentUnit}
                    canAdjustAsLeader={canAdjustAsLeader}
                    canAdjustAsHq={canAdjustAsHq}
                    hqAdjustmentRule={evaluation.hqAdjustmentRule}
                    remindSending={remindSending}
                    remindResult={remindResult}
                    allowReview={allowReview}
                    allowResubmission={allowResubmission}
                    onBack={onBack}
                    onOpenDetail={setDetailTarget}
                    onStatusFilterChange={setStatusFilter}
                    onSortKeyChange={setSortKey}
                    onLowScoreThresholdChange={setLowScoreThreshold}
                    onResetFilters={resetFilters}
                    onSortByName={() => setSortKey('name')}
                    onSortBySubmission={() => setSortKey('submission_desc')}
                    onSortByScore={() =>
                        setSortKey((prev) => (prev === 'score_desc' ? 'score_asc' : 'score_desc'))
                    }
                    onOpenAdjustment={openAdjustmentModal}
                    onRemindAll={handleRemindAll}
                    onOpenReview={openReviewRequest}
                    onRequestResubmission={openResubmissionRequest}
                />
                {adjustmentTarget && adjustmentRole && (
                    <MonitoringAdjustmentModal
                        open={true}
                        target={adjustmentTarget}
                        role={adjustmentRole}
                        adjustmentValue={adjustmentValue}
                        adjustmentNote={adjustmentNote}
                        adjustmentRange={adjustmentRange}
                        adjustmentUnit={adjustmentUnit}
                        preview={adjustmentPreview}
                        isSaving={isSavingAdjustment}
                        onChangeValue={setAdjustmentValue}
                        onChangeNote={setAdjustmentNote}
                        onClose={closeAdjustmentModal}
                        onSave={handleSaveAdjustment}
                    />
                )}
                <MonitoringRequestModal
                    open={isRequestOpen}
                    title={modalTitle}
                    reason={requestReason}
                    onChangeReason={setRequestReason}
                    onClose={closeRequestModal}
                    onSubmit={submitRequest}
                />
            </>
        );
    }
);

CampaignMonitoringPage.displayName = 'CampaignMonitoringPage';
