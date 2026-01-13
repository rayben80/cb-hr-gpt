import { useCallback, useMemo, useState } from 'react';
import { EvaluationScale, EvaluationType, RaterGroup, ScoringRule } from '../../constants';
import { useMemberSelection } from './useMemberSelection';

export interface CampaignFormData {
    name: string;
    period: string;
    reportingCategory: string;
    evaluationType: EvaluationType;
    raterProfile: 'LEADER_ONLY' | 'PEER_ONLY' | 'SELF_ONLY' | 'MULTI_360';
    ratingScale: EvaluationScale;
    scoringRule: ScoringRule;
    adjustmentMode: 'points' | 'percent';
    adjustmentRange: number;
    allowReview: boolean;
    allowResubmission: boolean;
    allowHqFinalOverride: boolean;
    hqAdjustmentRule: 'after_leader_submit' | 'after_leader_adjustment' | 'anytime';
    peerScope: 'team' | 'part' | 'all';
    peerCount: number;
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
    reportingCategory: '',
    evaluationType: '성과',
    raterProfile: 'LEADER_ONLY',
    ratingScale: '5점',
    scoringRule: '가중합',
    adjustmentMode: 'points',
    adjustmentRange: 10,
    allowReview: false,
    allowResubmission: false,
    allowHqFinalOverride: true,
    hqAdjustmentRule: 'after_leader_submit',
    peerScope: 'team',
    peerCount: 3,
    timing: 'scheduled',
    startDate: '',
    endDate: '',
    templateId: null,
    subjects: [],
};

const parseDateString = (value: string) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildCycleKey = (period: string, referenceDate: string) => {
    const date = parseDateString(referenceDate);
    if (!date) return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3);

    switch (period) {
        case '월별':
            return `${year}-${String(month).padStart(2, '0')}`;
        case '분기별':
            return `${year}-Q${quarter}`;
        case '반기별':
            return `${year}-H${month <= 6 ? 1 : 2}`;
        case '상반기':
            return `${year}-H1`;
        case '하반기':
            return `${year}-H2`;
        case '연말':
        case '연간':
            return `${year}`;
        case '수시':
            return `${year}-ADHOC`;
        default:
            return `${year}`;
    }
};

const buildRaterGroups = (profile: CampaignFormData['raterProfile']): RaterGroup[] => {
    switch (profile) {
        case 'SELF_ONLY':
            return [{ role: 'SELF', weight: 100, required: true }];
        case 'PEER_ONLY':
            return [{ role: 'PEER', weight: 100, required: true }];
        case 'MULTI_360':
            return [
                { role: 'LEADER', weight: 50, required: true },
                { role: 'PEER', weight: 40, required: true },
                { role: 'SELF', weight: 10, required: false },
            ];
        case 'LEADER_ONLY':
        default:
            return [{ role: 'LEADER', weight: 100, required: true }];
    }
};

export const useCampaignForm = ({ onClose }: UseCampaignFormOptions = {}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
    const memberSelection = useMemberSelection();

    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const periodOptions = useMemo(
        () => ['월별', '분기별', '반기별', '상반기', '하반기', '연말', '연간', '수시'],
        []
    );
    const evaluationTypeOptions = useMemo(() => ['성과', '역량', '리더십', '직무', '프로젝트', '기타'], []);
    const raterProfileOptions = useMemo(
        () => [
            { value: 'LEADER_ONLY', label: '상사 평가' },
            { value: 'PEER_ONLY', label: '동료 평가 (동료만)' },
            { value: 'SELF_ONLY', label: '본인 평가' },
            { value: 'MULTI_360', label: '다면 평가 (상사/동료/본인)' },
        ],
        []
    );
    const ratingScaleOptions = useMemo(() => ['5점', '7점', '10점', '100점'], []);
    const scoringRuleOptions = useMemo(() => ['가중합', '단순평균', '총점합산'], []);
    const cycleKey = useMemo(
        () => buildCycleKey(formData.period, formData.startDate || formData.endDate || today),
        [formData.period, formData.startDate, formData.endDate, today]
    );
    const raterGroups = useMemo(() => buildRaterGroups(formData.raterProfile), [formData.raterProfile]);
    const requiresPeer = useMemo(() => raterGroups.some((group) => group.role === 'PEER'), [raterGroups]);

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
                formData.reportingCategory &&
                formData.evaluationType &&
                formData.raterProfile &&
                formData.endDate &&
                (formData.timing === 'now' || formData.startDate)
            ),
            isStep2Valid: formData.templateId !== null,
            isStep3Valid: memberSelection.selectedMembers.size > 0,
            isStep4Valid: !requiresPeer || formData.peerCount > 0,
        }),
        [formData, memberSelection.selectedMembers.size, requiresPeer]
    );

    const goToNextStep = useCallback(() => setStep((prev) => Math.min(prev + 1, 5)), []);
    const goToPrevStep = useCallback(() => setStep((prev) => Math.max(prev - 1, 1)), []);

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return validationStates.isStep1Valid;
            case 2:
                return validationStates.isStep2Valid;
            case 3:
                return validationStates.isStep3Valid;
            case 4:
                return validationStates.isStep4Valid;
            default:
                return true;
        }
    }, [step, validationStates]);

    return {
        step,
        formData,
        today,
        periodOptions,
        evaluationTypeOptions,
        raterProfileOptions,
        ratingScaleOptions,
        scoringRuleOptions,
        cycleKey,
        raterGroups,
        requiresPeer,
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
        // Expose helper to get full member objects for ID resolution
        getSelectedMemberObjects: memberSelection.getSelectedMemberObjects,
        toggleMember: memberSelection.toggleMember,
        toggleGroup: memberSelection.toggleGroup,
        getGroupMembers: memberSelection.getGroupMembers,
        getGroupSelectionState: memberSelection.getGroupSelectionState,
    };
};

export type UseCampaignFormReturn = ReturnType<typeof useCampaignForm>;
