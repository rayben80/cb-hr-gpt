import { CheckCircle } from '@phosphor-icons/react';
import React, { memo, useCallback, useMemo } from 'react';
import { CloseButton } from '../../components/common/index';
import { Evaluation, EvaluationTemplate, Team } from '../../constants';
import { useCampaignForm } from '../../hooks/evaluation/useCampaignForm';
import { CampaignBasicInfo, CampaignReview, CampaignTargetSelector, CampaignTemplateSelect } from './components';

interface LaunchData extends Omit<
    Evaluation,
    'id' | 'status' | 'progress' | 'score' | 'subjectId' | 'subjectSnapshot'
> {
    templateSnapshot: EvaluationTemplate;
}

interface CreateCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: (data: LaunchData) => void;
    templates: EvaluationTemplate[];
    teams: Team[];
}

const STEPS = ['기본 정보', '템플릿 선택', '대상자 지정', '검토 및 시작'];

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

const ModalFooter = memo(
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
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div>
                {step > 1 && (
                    <button onClick={onPrev} className="font-bold py-2 px-4 rounded-lg">
                        이전
                    </button>
                )}
            </div>
            <div>
                {step < 4 ? (
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
                        캠페인 생성 완료
                    </button>
                )}
            </div>
        </div>
    )
);
ModalFooter.displayName = 'ModalFooter';

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = memo(
    ({ isOpen, onClose, onLaunch, templates, teams }) => {
        const {
            step,
            formData,
            selectedMembers,
            today,
            periodOptions,
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
        } = useCampaignForm({ onClose });

        const handleLaunch = useCallback(() => {
            const template = templates.find((t) => t.id === formData.templateId);
            if (!template) return;
            onLaunch({
                name: formData.name,
                type: template.type,
                period: formData.period,
                subject: `${selectedMembers.size} 명`,
                startDate: formData.timing === 'now' ? today : formData.startDate,
                endDate: formData.endDate,
                templateSnapshot: template,
            });
            resetForm();
        }, [templates, formData, selectedMembers.size, onLaunch, resetForm, today]);

        const handleTemplateSelect = useCallback(
            (templateId: string | number) => updateField('templateId', templateId),
            [updateField]
        );

        const renderStepContent = useMemo(() => {
            switch (step) {
                case 1:
                    return (
                        <CampaignBasicInfo
                            formData={formData}
                            today={today}
                            periodOptions={periodOptions}
                            updateField={updateField}
                            handleTimingChange={handleTimingChange}
                        />
                    );
                case 2:
                    return (
                        <CampaignTemplateSelect
                            templates={templates}
                            selectedTemplateId={formData.templateId}
                            onSelectTemplate={handleTemplateSelect}
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
                        <CampaignReview
                            formData={formData}
                            today={today}
                            selectedMembersCount={selectedMembers.size}
                            templates={templates}
                        />
                    );
                default:
                    return null;
            }
        }, [
            step,
            formData,
            today,
            periodOptions,
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
        ]);

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">새 평가 캠페인 생성</h2>
                        <CloseButton onClick={resetForm} />
                    </div>
                    <div className="p-8 flex-grow overflow-y-auto">
                        <StepIndicator step={step} />
                        {renderStepContent}
                    </div>
                    <ModalFooter
                        step={step}
                        canProceed={canProceed}
                        onPrev={goToPrevStep}
                        onNext={goToNextStep}
                        onLaunch={handleLaunch}
                    />
                </div>
            </div>
        );
    }
);

CreateCampaignModal.displayName = 'CreateCampaignModal';
export default CreateCampaignModal;
