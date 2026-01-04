import { useCallback, useMemo, useState } from 'react';
import { useMemberSelection } from './useMemberSelection';

export interface CampaignFormData {
    name: string;
    period: string;
    timing: 'now' | 'scheduled';
    startDate: string;
    endDate: string;
    templateId: string | number | null;
    subjects: string[];
}

export interface UseCampaignFormOptions {
    onClose?: () => void;
}

const initialFormData: CampaignFormData = {
    name: '',
    period: '수시',
    timing: 'scheduled',
    startDate: '',
    endDate: '',
    templateId: null,
    subjects: [],
};

export const useCampaignForm = ({ onClose }: UseCampaignFormOptions = {}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
    const memberSelection = useMemberSelection();

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const periodOptions = useMemo(() => ['상반기', '하반기', '연간', '수시'], []);

    const resetForm = useCallback(() => {
        setStep(1);
        setFormData(initialFormData);
        memberSelection.clearSelection();
        onClose?.();
    }, [onClose, memberSelection]);

    const updateField = useCallback(<K extends keyof CampaignFormData>(field: K, value: CampaignFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleTimingChange = useCallback(
        (timing: 'now' | 'scheduled') => {
            setFormData((prev) => ({ ...prev, timing, startDate: timing === 'now' ? today : '' }));
        },
        [today]
    );

    const validationStates = useMemo(
        () => ({
            isStep1Valid: Boolean(
                formData.name &&
                formData.period &&
                formData.endDate &&
                (formData.timing === 'now' || formData.startDate)
            ),
            isStep2Valid: formData.templateId !== null,
            isStep3Valid: memberSelection.selectedMembers.size > 0,
        }),
        [formData, memberSelection.selectedMembers.size]
    );

    const goToNextStep = useCallback(() => setStep((prev) => Math.min(prev + 1, 4)), []);
    const goToPrevStep = useCallback(() => setStep((prev) => Math.max(prev - 1, 1)), []);

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return validationStates.isStep1Valid;
            case 2:
                return validationStates.isStep2Valid;
            case 3:
                return validationStates.isStep3Valid;
            default:
                return true;
        }
    }, [step, validationStates]);

    return {
        step,
        formData,
        today,
        periodOptions,
        validationStates,
        canProceed,
        updateField,
        handleTimingChange,
        resetForm,
        goToNextStep,
        goToPrevStep,
        setStep,
        // 멤버 선택 관련
        selectedMembers: memberSelection.selectedMembers,
        sortedSelectedMembers: memberSelection.sortedSelectedMembers,
        toggleMember: memberSelection.toggleMember,
        toggleGroup: memberSelection.toggleGroup,
        getGroupMembers: memberSelection.getGroupMembers,
        getGroupSelectionState: memberSelection.getGroupSelectionState,
    };
};

export type UseCampaignFormReturn = ReturnType<typeof useCampaignForm>;
