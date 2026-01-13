import { EvaluationTemplate } from '@/constants';
import { useCallback, useMemo, useState } from 'react';

export interface WizardTarget {
    type: 'all' | 'team' | 'individual';
    teamIds: string[];
    memberIds: string[];
    includeSelf: boolean;
}

export interface WizardPeriod {
    name: string;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    recurringType?: 'monthly' | 'quarterly' | 'yearly';
    recurringStartDay?: number;
    recurringDurationDays?: number;
}

export interface CampaignDraft {
    templateId: string | number;
    templateSnapshot: EvaluationTemplate;
    target: WizardTarget;
    period: WizardPeriod;
}

const WIZARD_STEPS = ['template', 'target', 'period', 'summary'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

const defaultPeriod: WizardPeriod = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isRecurring: false,
    recurringType: 'monthly',
    recurringStartDay: 1,
    recurringDurationDays: 14,
};

export const useCampaignWizard = (template: EvaluationTemplate | null | undefined) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>('template');

    // 스마트 기본값 계산 로직
    const initialIncludeSelf = useMemo(() => {
        if (!template) return false;
        const type = template.type || '';
        const name = template.name || '';
        const tags = template.tags || [];

        // 포함해야 하는 케이스 (다면, 리더십, 설문, 투표 등)
        const includeKeywords = ['다면', '360', '동료', '리더십', '상향', '설문', '투표', '피어'];
        const shouldInclude = includeKeywords.some(
            (k) => type.includes(k) || name.includes(k) || tags.some((t) => t.includes(k))
        );

        return shouldInclude;
    }, [template]);

    const [target, setTarget] = useState<WizardTarget>({
        type: 'all',
        teamIds: [],
        memberIds: [],
        includeSelf: initialIncludeSelf,
    });

    const [period, setPeriod] = useState<WizardPeriod>({
        ...defaultPeriod,
        name: template?.name ? `${template.name} - ${new Date().toLocaleDateString('ko-KR')}` : '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stepIndex = useMemo(() => WIZARD_STEPS.indexOf(currentStep), [currentStep]);
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

    const goNext = useCallback(() => {
        if (!isLastStep) {
            setCurrentStep(WIZARD_STEPS[stepIndex + 1]);
        }
    }, [stepIndex, isLastStep]);

    const goBack = useCallback(() => {
        if (!isFirstStep) {
            setCurrentStep(WIZARD_STEPS[stepIndex - 1]);
        }
    }, [stepIndex, isFirstStep]);

    const goToStep = useCallback((step: WizardStep) => {
        setCurrentStep(step);
    }, []);

    const updateTarget = useCallback((updates: Partial<WizardTarget>) => {
        setTarget((prev) => ({ ...prev, ...updates }));
    }, []);

    const updatePeriod = useCallback((updates: Partial<WizardPeriod>) => {
        setPeriod((prev) => ({ ...prev, ...updates }));
    }, []);

    const reset = useCallback(() => {
        setCurrentStep('template');
        setTarget({
            type: 'all',
            teamIds: [],
            memberIds: [],
            includeSelf: initialIncludeSelf,
        });
        setPeriod({
            ...defaultPeriod,
            name: template?.name ? `${template.name} - ${new Date().toLocaleDateString('ko-KR')}` : '',
        });
    }, [template?.name, initialIncludeSelf]);

    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 'template':
                return !!template;
            case 'target':
                return target.type === 'all' || target.teamIds.length > 0 || target.memberIds.length > 0;
            case 'period':
                return !!period.name && !!period.startDate && !!period.endDate;
            case 'summary':
                return true;
            default:
                return false;
        }
    }, [currentStep, template, target, period]);

    const draft: CampaignDraft | null = useMemo(() => {
        if (!template) return null;
        return {
            templateId: template.id,
            templateSnapshot: template,
            target,
            period,
        };
    }, [template, target, period]);

    return {
        // Step navigation
        currentStep,
        stepIndex,
        steps: WIZARD_STEPS,
        isFirstStep,
        isLastStep,
        goNext,
        goBack,
        goToStep,
        canProceed,

        // Target
        target,
        updateTarget,

        // Period
        period,
        updatePeriod,

        // Draft
        draft,
        reset,

        // Submission
        isSubmitting,
        setIsSubmitting,
    };
};
