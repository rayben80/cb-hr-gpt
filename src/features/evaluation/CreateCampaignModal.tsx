import { CheckCircle } from '@phosphor-icons/react';
import React, { memo, useCallback, useMemo } from 'react';
import { Modal, ModalFooter, ModalHeader } from '../../components/common/Modal';
import { EvaluationTemplate, Team } from '../../constants';
import { useCampaignForm } from '../../hooks/evaluation/useCampaignForm';
import { EvaluationAssignment, EvaluationCampaign } from '../../hooks/evaluation/useFirestoreEvaluation';
import {
    CampaignBasicInfo,
    CampaignRaterSetup,
    CampaignReview,
    CampaignTargetSelector,
    CampaignTemplateSelect,
} from './components';
import { buildLaunchData } from './createCampaignLaunch';
import { computePeerAvailability } from './createCampaignUtils';

interface LaunchData {
    campaign: Omit<EvaluationCampaign, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalTargets'>;
    assignments: Omit<EvaluationAssignment, 'id' | 'campaignId' | 'status' | 'progress'>[];
}

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: (data: LaunchData) => void;
    templates: EvaluationTemplate[];
    teams: Team[];
}

const STEPS = ['기본 정보', '템플릿 선택', '대상자 지정', '평가자 지정', '검토 및 시작'];

const StepIndicator = memo(({ step }: { step: number }) => (
    <ol className="flex items-center w-full text-sm font-medium text-center text-slate-500 mb-8">
        {STEPS.map((s, index) => (
            <li
                key={s}
                className={`flex items-center ${index < STEPS.length - 1 ? "w-full after:content-[''] after:w-full after:h-px after:border-b after:border-slate-200 after:inline-block mx-2" : ''} ${step > index + 1 ? 'text-primary' : ''}`}
            >
                <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 mr-2 shrink-0 ${step >= index + 1 ? 'bg-primary/10 text-primary' : 'bg-slate-100'}`}
                >
                    {step > index + 1 ? <CheckCircle className="w-5 h-5" weight="fill" /> : index + 1}
                </span>
                <span className="hidden md:inline-block whitespace-nowrap">{s}</span>
            </li>
        ))}
    </ol>
));
StepIndicator.displayName = 'StepIndicator';

type CampaignFormState = ReturnType<typeof useCampaignForm>;
type PeerAvailability = ReturnType<typeof computePeerAvailability>;

interface StepContentProps {
    step: CampaignFormState['step'];
    formData: CampaignFormState['formData'];
    today: string;
    periodOptions: CampaignFormState['periodOptions'];
    evaluationTypeOptions: CampaignFormState['evaluationTypeOptions'];
    raterProfileOptions: CampaignFormState['raterProfileOptions'];
    ratingScaleOptions: CampaignFormState['ratingScaleOptions'];
    scoringRuleOptions: CampaignFormState['scoringRuleOptions'];
    cycleKey: CampaignFormState['cycleKey'];
    updateField: CampaignFormState['updateField'];
    handleTimingChange: CampaignFormState['handleTimingChange'];
    templates: EvaluationTemplate[];
    onSelectTemplate: (templateId: string | number) => void;
    teams: Team[];
    selectedMembers: CampaignFormState['selectedMembers'];
    sortedSelectedMembers: CampaignFormState['sortedSelectedMembers'];
    toggleMember: CampaignFormState['toggleMember'];
    toggleGroup: CampaignFormState['toggleGroup'];
    getGroupMembers: CampaignFormState['getGroupMembers'];
    getGroupSelectionState: CampaignFormState['getGroupSelectionState'];
    raterGroups: CampaignFormState['raterGroups'];
    peerAvailability: PeerAvailability;
}

const renderCampaignStepContent = ({
    step,
    formData,
    today,
    periodOptions,
    evaluationTypeOptions,
    raterProfileOptions,
    ratingScaleOptions,
    scoringRuleOptions,
    cycleKey,
    updateField,
    handleTimingChange,
    templates,
    onSelectTemplate,
    teams,
    selectedMembers,
    sortedSelectedMembers,
    toggleMember,
    toggleGroup,
    getGroupMembers,
    getGroupSelectionState,
    raterGroups,
    peerAvailability,
}: StepContentProps) => {
    switch (step) {
        case 1:
            return (
                <CampaignBasicInfo
                    formData={formData}
                    today={today}
                    periodOptions={periodOptions}
                    evaluationTypeOptions={evaluationTypeOptions}
                    raterProfileOptions={raterProfileOptions}
                    ratingScaleOptions={ratingScaleOptions}
                    scoringRuleOptions={scoringRuleOptions}
                    cycleKey={cycleKey}
                    updateField={updateField}
                    handleTimingChange={handleTimingChange}
                />
            );
        case 2:
            return (
                <CampaignTemplateSelect
                    templates={templates}
                    selectedTemplateId={formData.templateId}
                    onSelectTemplate={onSelectTemplate}
                />
            );
        case 3:
            return (
                <CampaignTargetSelector
                    teams={teams}
                    selectedMembers={selectedMembers}
                    sortedSelectedMembers={sortedSelectedMembers}
                    toggleMember={toggleMember}
                    toggleGroup={toggleGroup}
                    getGroupMembers={getGroupMembers}
                    getGroupSelectionState={getGroupSelectionState}
                />
            );
        case 4:
            return (
                <CampaignRaterSetup
                    formData={formData}
                    peerAvailability={peerAvailability}
                    updateField={updateField}
                    raterGroups={raterGroups}
                />
            );
        case 5:
            return (
                <CampaignReview
                    formData={formData}
                    today={today}
                    selectedMembersCount={selectedMembers.size}
                    templates={templates}
                    raterProfileOptions={raterProfileOptions}
                    cycleKey={cycleKey}
                    raterGroups={raterGroups}
                    peerAvailability={peerAvailability}
                />
            );
        default:
            return null;
    }
};


const CampaignModalFooter = memo(
    ({
        step,
        canProceed,
        onPrev,
        onNext,
        onLaunch,
    }: {
        step: number;
        canProceed: boolean;
        onPrev: () => void;
        onNext: () => void;
        onLaunch: () => void;
    }) => (
        <ModalFooter className="flex justify-between items-center">
            <div>
                {step > 1 && (
                    <button onClick={onPrev} className="font-bold py-2 px-4 rounded-lg">
                        이전
                    </button>
                )}
            </div>
            <div>
                {step < 5 ? (
                    <button
                        onClick={onNext}
                        disabled={!canProceed}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        다음
                    </button>
                ) : (
                    <button
                        onClick={onLaunch}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all"
                    >
                        평가 생성 완료
                    </button>
                )}
            </div>
        </ModalFooter>
    )
);
CampaignModalFooter.displayName = 'CampaignModalFooter';

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = memo(
    ({ isOpen, onClose, onLaunch, templates, teams }) => {
        const {
            step,
            formData,
            selectedMembers,
            today,
            periodOptions,
            evaluationTypeOptions,
            raterProfileOptions,
            ratingScaleOptions,
            scoringRuleOptions,
            cycleKey,
            raterGroups,
            requiresPeer,
            canProceed,
            updateField,
            handleTimingChange,
            resetForm,
            goToNextStep,
            goToPrevStep,
            toggleMember,
            toggleGroup,
            getGroupMembers,
            getGroupSelectionState,
            sortedSelectedMembers,
            getSelectedMemberObjects,
        } = useCampaignForm({ onClose });

        const selectedTargetMembers = useMemo(
            () => getSelectedMemberObjects(teams),
            [getSelectedMemberObjects, teams]
        );

        const peerAvailability = useMemo(
            () =>
                computePeerAvailability(
                    selectedTargetMembers,
                    teams,
                    formData.peerScope,
                    raterGroups.some((group) => group.role === 'LEADER')
                ),
            [selectedTargetMembers, teams, formData.peerScope, raterGroups]
        );

        const peerCountValid =
            !requiresPeer || (formData.peerCount > 0 && peerAvailability.min >= formData.peerCount);

        const handleLaunch = useCallback(() => {
            const launchData = buildLaunchData({
                formData,
                templates,
                today,
                teams,
                cycleKey,
                raterGroups,
                getSelectedMemberObjects,
            });
            if (!launchData) return;
            onLaunch(launchData);
            resetForm();
        }, [formData, templates, today, teams, cycleKey, raterGroups, getSelectedMemberObjects, onLaunch, resetForm]);

        const handleTemplateSelect = useCallback(
            (templateId: string | number) => updateField('templateId', templateId),
            [updateField]
        );

        const renderStepContent = useMemo(
            () =>
                renderCampaignStepContent({
                    step,
                    formData,
                    today,
                    periodOptions,
                    evaluationTypeOptions,
                    raterProfileOptions,
                    ratingScaleOptions,
                    scoringRuleOptions,
                    cycleKey,
                    updateField,
                    handleTimingChange,
                    templates,
                    onSelectTemplate: handleTemplateSelect,
                    teams,
                    selectedMembers,
                    sortedSelectedMembers,
                    toggleMember,
                    toggleGroup,
                    getGroupMembers,
                    getGroupSelectionState,
                    raterGroups,
                    peerAvailability,
                }),
            [
                step,
                formData,
                today,
                periodOptions,
                evaluationTypeOptions,
                raterProfileOptions,
                ratingScaleOptions,
                scoringRuleOptions,
                cycleKey,
                updateField,
                handleTimingChange,
                templates,
                handleTemplateSelect,
                teams,
                selectedMembers,
                sortedSelectedMembers,
                toggleMember,
                toggleGroup,
                getGroupMembers,
                getGroupSelectionState,
                raterGroups,
                peerAvailability,
            ]
        );

        if (!isOpen) return null;

        const canProceedWithAvailability = step === 4 ? canProceed && peerCountValid : canProceed;

        return (
            <Modal
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) resetForm();
                }}
                maxWidth="sm:max-w-4xl"
                className="p-0 max-h-[90vh] overflow-hidden"
                bodyClassName="p-0"
            >
                <div className="bg-white flex flex-col h-full max-h-[90vh]">
                    <ModalHeader>
                        <h2 className="text-xl font-bold text-slate-900">새 평가 생성</h2>
                    </ModalHeader>
                    <div className="p-8 flex-grow overflow-y-auto">
                        <StepIndicator step={step} />
                        {renderStepContent}
                    </div>
                    <CampaignModalFooter
                        step={step}
                        canProceed={canProceedWithAvailability}
                        onPrev={goToPrevStep}
                        onNext={goToNextStep}
                        onLaunch={handleLaunch}
                    />
                </div>
            </Modal>
        );
    }
);

CreateCampaignModal.displayName = 'CreateCampaignModal';
export default CreateCampaignModal;
