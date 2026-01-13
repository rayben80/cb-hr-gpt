import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EvaluationTemplate, Member, Team } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignWizard } from '@/hooks/evaluation/useCampaignWizard';
import { memo, useCallback, useEffect } from 'react';
import { PeriodSettingsStep } from './components/wizard/PeriodSettingsStep';
import { SummaryStep } from './components/wizard/SummaryStep';
import { TargetSelectionStep } from './components/wizard/TargetSelectionStep';
import { TemplatePreviewStep, WizardNavigation, WizardStepIndicator } from './components/wizard/WizardSteps';

interface CampaignWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string | number | null;
    template?: EvaluationTemplate | null;
    teams?: Team[];
    members?: Member[];
    onSubmit?: (draft: ReturnType<typeof useCampaignWizard>['draft']) => Promise<void>;
}

export const CampaignWizardModal = memo(
    ({ isOpen, onClose, template, teams = [], members = [], onSubmit }: CampaignWizardModalProps) => {
        const wizard = useCampaignWizard(template);
        const { currentUser } = useAuth(); // Get current user

        // Reset wizard when modal opens
        useEffect(() => {
            if (isOpen) {
                wizard.reset();
            }
        }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

        const handleSubmit = useCallback(async () => {
            if (!wizard.draft || !onSubmit) return;
            wizard.setIsSubmitting(true);
            try {
                await onSubmit(wizard.draft);
                onClose();
            } catch (error) {
                console.error('Failed to create campaign:', error);
            } finally {
                wizard.setIsSubmitting(false);
            }
        }, [wizard, onSubmit, onClose]);

        const handleClose = useCallback(() => {
            if (!wizard.isSubmitting) {
                onClose();
            }
        }, [wizard.isSubmitting, onClose]);

        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b border-slate-100">
                        <DialogTitle className="text-lg font-bold text-slate-800">평가 시작하기</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            선택한 템플릿으로 새로운 평가를 시작합니다.
                        </DialogDescription>
                    </DialogHeader>

                    <WizardStepIndicator
                        steps={wizard.steps}
                        currentStep={wizard.currentStep}
                        onStepClick={wizard.goToStep}
                    />

                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                        {wizard.currentStep === 'template' && <TemplatePreviewStep template={template} />}
                        {wizard.currentStep === 'target' && (
                            <TargetSelectionStep
                                target={wizard.target}
                                onUpdate={wizard.updateTarget}
                                teams={teams}
                                members={members}
                                currentUserEmail={currentUser?.email || ''} // Pass current user email
                            />
                        )}
                        {wizard.currentStep === 'period' && (
                            <PeriodSettingsStep period={wizard.period} onUpdate={wizard.updatePeriod} />
                        )}
                        {wizard.currentStep === 'summary' && (
                            <SummaryStep template={template} draft={wizard.draft} teams={teams} members={members} />
                        )}
                    </div>

                    <WizardNavigation
                        isFirstStep={wizard.isFirstStep}
                        isLastStep={wizard.isLastStep}
                        canProceed={wizard.canProceed}
                        isSubmitting={wizard.isSubmitting}
                        onBack={wizard.goBack}
                        onNext={wizard.goNext}
                        onSubmit={handleSubmit}
                    />
                </DialogContent>
            </Dialog>
        );
    }
);

CampaignWizardModal.displayName = 'CampaignWizardModal';
