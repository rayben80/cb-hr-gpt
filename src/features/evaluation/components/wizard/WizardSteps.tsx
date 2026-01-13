import { Button } from '@/components/ui/button';
import { EvaluationTemplate } from '@/constants';
import { WizardStep } from '@/hooks/evaluation/useCampaignWizard';
import { ArrowLeft, ArrowRight, Check, RocketLaunch, Spinner } from '@phosphor-icons/react';
import { memo } from 'react';

interface WizardStepIndicatorProps {
    steps: readonly WizardStep[];
    currentStep: WizardStep;
    onStepClick: (step: WizardStep) => void;
}

const STEP_LABELS: Record<WizardStep, string> = {
    template: '템플릿 확인',
    target: '대상 선택',
    period: '기간 설정',
    summary: '최종 확인',
};

export const WizardStepIndicator = memo(({ steps, currentStep, onStepClick }: WizardStepIndicatorProps) => {
    const currentIndex = steps.indexOf(currentStep);

    return (
        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-50 border-b border-slate-100">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                    <div key={step} className="flex items-center">
                        <button
                            onClick={() => isCompleted && onStepClick(step)}
                            disabled={isPending}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                isCurrent
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : isCompleted
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                    isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-white/20' : ''
                                }`}
                            >
                                {isCompleted ? <Check weight="bold" className="w-3 h-3" /> : index + 1}
                            </span>
                            <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
                        </button>
                        {index < steps.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1" />}
                    </div>
                );
            })}
        </div>
    );
});
WizardStepIndicator.displayName = 'WizardStepIndicator';

interface WizardNavigationProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    canProceed: boolean;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
}

export const WizardNavigation = memo(
    ({ isFirstStep, isLastStep, canProceed, isSubmitting, onBack, onNext, onSubmit }: WizardNavigationProps) => (
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50">
            <Button variant="ghost" onClick={onBack} disabled={isFirstStep || isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
            </Button>
            {isLastStep ? (
                <Button onClick={onSubmit} disabled={!canProceed || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Spinner className="w-4 h-4 mr-2 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        <>
                            <RocketLaunch className="w-4 h-4 mr-2" weight="fill" />
                            평가 시작
                        </>
                    )}
                </Button>
            ) : (
                <Button onClick={onNext} disabled={!canProceed}>
                    다음
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    )
);
WizardNavigation.displayName = 'WizardNavigation';

// Step 1: Template Preview
interface TemplatePreviewStepProps {
    template: EvaluationTemplate | null | undefined;
}

export const TemplatePreviewStep = memo(({ template }: TemplatePreviewStepProps) => {
    if (!template) {
        return <div className="text-center text-slate-400 py-12">템플릿 정보를 불러올 수 없습니다.</div>;
    }

    const qualitativeItems = template.items?.filter((item) => item.type === '정성') || [];
    const quantitativeItems = template.items?.filter((item) => item.type === '정량') || [];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{template.name}</h3>
                <p className="text-slate-600">{template.description || '설명 없음'}</p>
                <div className="flex gap-4 mt-4 text-sm text-slate-500">
                    <span>유형: {template.type}</span>
                    <span>카테고리: {template.category}</span>
                    <span>버전: v{template.version ?? 1}</span>
                </div>
            </div>

            {template.items && template.items.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 정성평가 */}
                    {qualitativeItems.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                정성평가 ({qualitativeItems.length}항목)
                            </h4>
                            <ul className="space-y-2">
                                {qualitativeItems.map((item) => (
                                    <li key={item.id} className="text-sm text-slate-600 flex justify-between">
                                        <span>{item.title}</span>
                                        <span className="text-slate-400">{item.scoring?.[0]?.score ?? 10}점</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 정량평가 */}
                    {quantitativeItems.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                정량평가 ({quantitativeItems.length}항목)
                            </h4>
                            <ul className="space-y-2">
                                {quantitativeItems.map((item) => (
                                    <li key={item.id} className="text-sm text-slate-600 flex justify-between">
                                        <span>{item.title}</span>
                                        <span className="text-slate-400">{item.scoring?.[0]?.score ?? 10}점</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
TemplatePreviewStep.displayName = 'TemplatePreviewStep';
