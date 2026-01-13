import React, { memo, useMemo } from 'react';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';
import {
    AdjustmentOptions,
    CampaignNameField,
    DateRangePicker,
    EvaluationTypeSelect,
    PeriodSelector,
    RaterAndScaleSection,
    ReportingCategorySelect,
    ScoringRuleSelect,
    TimingSelector,
} from './CampaignBasicInfoSections';

interface CampaignBasicInfoProps {
    formData: UseCampaignFormReturn['formData'];
    today: string;
    periodOptions: string[];
    evaluationTypeOptions: string[];
    raterProfileOptions: { value: string; label: string }[];
    ratingScaleOptions: string[];
    scoringRuleOptions: string[];
    cycleKey: string;
    updateField: UseCampaignFormReturn['updateField'];
    handleTimingChange: UseCampaignFormReturn['handleTimingChange'];
}

export const CampaignBasicInfo: React.FC<CampaignBasicInfoProps> = memo(
    ({
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
    }) => {
        const startDateValue = useMemo(
            () => (formData.timing === 'now' ? today : formData.startDate),
            [formData.startDate, formData.timing, today]
        );

        const adjustmentRangeLabel = formData.adjustmentMode === 'percent' ? '보정 범위 (±%)' : '보정 범위 (±점)';
        const adjustmentRangeMax = formData.adjustmentMode === 'percent' ? 100 : undefined;

        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">평가 기본 정보를 입력해주세요.</h3>
                <div className="space-y-6">
                    <CampaignNameField value={formData.name} onChange={(value) => updateField('name', value)} />
                    <PeriodSelector
                        options={periodOptions}
                        value={formData.period}
                        cycleKey={cycleKey}
                        onSelect={(value) => updateField('period', value)}
                    />
                    <EvaluationTypeSelect
                        value={formData.evaluationType}
                        options={evaluationTypeOptions}
                        onChange={(value) => updateField('evaluationType', value as any)}
                    />
                    <ReportingCategorySelect
                        value={formData.reportingCategory}
                        onChange={(value) => updateField('reportingCategory', value)}
                    />
                    <RaterAndScaleSection
                        raterProfile={formData.raterProfile}
                        ratingScale={formData.ratingScale}
                        raterOptions={raterProfileOptions}
                        ratingOptions={ratingScaleOptions}
                        onProfileChange={(value) => updateField('raterProfile', value)}
                        onScaleChange={(value) => updateField('ratingScale', value)}
                    />
                    <ScoringRuleSelect
                        value={formData.scoringRule}
                        options={scoringRuleOptions}
                        onChange={(value) => updateField('scoringRule', value)}
                    />
                    <AdjustmentOptions
                        adjustmentMode={formData.adjustmentMode}
                        adjustmentRange={formData.adjustmentRange}
                        adjustmentRangeLabel={adjustmentRangeLabel}
                        adjustmentRangeMax={adjustmentRangeMax}
                        allowReview={formData.allowReview}
                        allowResubmission={formData.allowResubmission}
                        allowHqFinalOverride={formData.allowHqFinalOverride}
                        hqAdjustmentRule={formData.hqAdjustmentRule}
                        onModeChange={(value) => updateField('adjustmentMode', value)}
                        onRangeChange={(value) => updateField('adjustmentRange', value)}
                        onAllowReviewChange={(value) => updateField('allowReview', value)}
                        onAllowResubmissionChange={(value) => updateField('allowResubmission', value)}
                        onAllowHqChange={(value) => updateField('allowHqFinalOverride', value)}
                        onHqRuleChange={(value) => updateField('hqAdjustmentRule', value)}
                    />
                    <TimingSelector timing={formData.timing} onChange={handleTimingChange} />
                    <DateRangePicker
                        startDateValue={startDateValue}
                        endDateValue={formData.endDate}
                        disableStart={formData.timing === 'now'}
                        onChangeStart={(value) => updateField('startDate', value)}
                        onChangeEnd={(value) => updateField('endDate', value)}
                    />
                </div>
            </div>
        );
    }
);

CampaignBasicInfo.displayName = 'CampaignBasicInfo';
