import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { memo } from 'react';
import DatePicker from 'react-datepicker';
import { Checkbox, InputField } from '../../../components/common';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { REPORTING_CATEGORY_OPTIONS } from '../../../constants';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

type FormData = UseCampaignFormReturn['formData'];

export const CampaignNameField = memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <InputField
        label="평가명"
        id="evalName"
        name="evalName"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="예: 2024년 4분기 동료 피드백"
    />
));
CampaignNameField.displayName = 'CampaignNameField';

export const PeriodSelector = memo(
    ({
        options,
        value,
        cycleKey,
        onSelect,
    }: {
        options: string[];
        value: string;
        cycleKey: string;
        onSelect: (value: string) => void;
    }) => (
        <div>
            <p className="block text-sm font-medium text-slate-700 mb-2">평가 주기</p>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onSelect(option)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                            value === option
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                        aria-pressed={value === option ? 'true' : 'false'}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {cycleKey && <p className="text-xs text-slate-500 mt-2">주기 키: {cycleKey}</p>}
        </div>
    )
);
PeriodSelector.displayName = 'PeriodSelector';

export const EvaluationTypeSelect = memo(
    ({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">평가 유형</Label>
            <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="평가 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
);
EvaluationTypeSelect.displayName = 'EvaluationTypeSelect';

export const ReportingCategorySelect = memo(
    ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">리포팅 분류</Label>
            <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="대시보드 집계 기준을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                    {REPORTING_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">팀별 카테고리와 별개로 대시보드 집계에 사용됩니다.</p>
        </div>
    )
);
ReportingCategorySelect.displayName = 'ReportingCategorySelect';

export const RaterAndScaleSection = memo(
    ({
        raterProfile,
        ratingScale,
        raterOptions,
        ratingOptions,
        onProfileChange,
        onScaleChange,
    }: {
        raterProfile: FormData['raterProfile'];
        ratingScale: FormData['ratingScale'];
        raterOptions: { value: string; label: string }[];
        ratingOptions: string[];
        onProfileChange: (value: FormData['raterProfile']) => void;
        onScaleChange: (value: FormData['ratingScale']) => void;
    }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">평가자 구성</Label>
                <Select value={raterProfile ?? ''} onValueChange={onProfileChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="평가자 구성을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                        {raterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                    동료 평가는 동료만 평가하며, 다면 평가는 상사·동료·본인 등 복수 관계를 묶습니다.
                </p>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">점수 척도</Label>
                <Select value={ratingScale ?? ''} onValueChange={onScaleChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="점수 척도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        {ratingOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
);
RaterAndScaleSection.displayName = 'RaterAndScaleSection';

export const ScoringRuleSelect = memo(
    ({
        value,
        options,
        onChange,
    }: {
        value: FormData['scoringRule'];
        options: string[];
        onChange: (value: FormData['scoringRule']) => void;
    }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">집계 방식</Label>
            <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="집계 방식을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">합산 방식에 따라 결과 편차가 달라질 수 있습니다.</p>
        </div>
    )
);
ScoringRuleSelect.displayName = 'ScoringRuleSelect';

export const AdjustmentOptions = memo(
    ({
        adjustmentMode,
        adjustmentRange,
        adjustmentRangeLabel,
        adjustmentRangeMax,
        allowReview,
        allowResubmission,
        allowHqFinalOverride,
        hqAdjustmentRule,
        onModeChange,
        onRangeChange,
        onAllowReviewChange,
        onAllowResubmissionChange,
        onAllowHqChange,
        onHqRuleChange,
    }: {
        adjustmentMode: FormData['adjustmentMode'];
        adjustmentRange: number;
        adjustmentRangeLabel: string;
        adjustmentRangeMax?: number | undefined;
        allowReview: boolean;
        allowResubmission: boolean;
        allowHqFinalOverride: boolean;
        hqAdjustmentRule: FormData['hqAdjustmentRule'];
        onModeChange: (value: FormData['adjustmentMode']) => void;
        onRangeChange: (value: number) => void;
        onAllowReviewChange: (value: boolean) => void;
        onAllowResubmissionChange: (value: boolean) => void;
        onAllowHqChange: (value: boolean) => void;
        onHqRuleChange: (value: FormData['hqAdjustmentRule']) => void;
    }) => (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="text-sm font-medium text-slate-700">보정 및 재평가 옵션</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">보정 방식</Label>

                    <Select value={adjustmentMode ?? ''} onValueChange={(val) => onModeChange(val as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="보정 방식을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="points">점수 보정 (±점)</SelectItem>
                            <SelectItem value="percent">비율 보정 (±%)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <InputField
                    label={adjustmentRangeLabel}
                    id="adjustmentRange"
                    name="adjustmentRange"
                    type="number"
                    value={adjustmentRange}
                    onChange={(event) => onRangeChange(Math.max(0, Number(event.target.value)))}
                    min={0}
                    max={adjustmentRangeMax}
                    placeholder={adjustmentMode === 'percent' ? '예: 10' : '예: 15'}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                        checked={allowReview}
                        indeterminate={false}
                        onChange={(e) => onAllowReviewChange(e.target.checked)}
                    />
                    재열람 허용 (결과 확인 후 다시 보기)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                        checked={allowResubmission}
                        indeterminate={false}
                        onChange={(e) => onAllowResubmissionChange(e.target.checked)}
                    />
                    재제출 허용 (이의 제기 시 재평가)
                </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
                <Checkbox
                    checked={allowHqFinalOverride}
                    indeterminate={false}
                    onChange={(e) => onAllowHqChange(e.target.checked)}
                />
                본부장 최종 보정 권한 허용
            </label>
            {allowHqFinalOverride && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">본부장 보정 조건</Label>

                    <Select value={hqAdjustmentRule ?? ''} onValueChange={(val) => onHqRuleChange(val as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="보정 조건을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="after_leader_submit">팀장 평가 완료 후 보정</SelectItem>
                            <SelectItem value="after_leader_adjustment">팀장 보정 입력 후 보정</SelectItem>
                            <SelectItem value="anytime">제한 없음 (본부장 단독 보정 가능)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <p className="text-xs text-slate-500">보정 범위는 캠페인 전체에 동일하게 적용됩니다.</p>
        </div>
    )
);
AdjustmentOptions.displayName = 'AdjustmentOptions';

export const TimingSelector = memo(
    ({ timing, onChange }: { timing: FormData['timing']; onChange: (value: FormData['timing']) => void }) => (
        <div>
            <p className="block text-sm font-medium text-slate-700 mb-2">시작 방식</p>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onChange('now')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                        timing === 'now'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                    aria-pressed={timing === 'now' ? 'true' : 'false'}
                >
                    즉시 시작
                </button>
                <button
                    type="button"
                    onClick={() => onChange('scheduled')}
                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                        timing === 'scheduled'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                    aria-pressed={timing === 'scheduled' ? 'true' : 'false'}
                >
                    예약 시작
                </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">즉시 시작은 시작일을 오늘로 고정합니다.</p>
        </div>
    )
);
TimingSelector.displayName = 'TimingSelector';

export const DateRangePicker = memo(
    ({
        startDateValue,
        endDateValue,
        disableStart,
        onChangeStart,
        onChangeEnd,
    }: {
        startDateValue: string;
        endDateValue: string;
        disableStart: boolean;
        onChangeStart: (value: string) => void;
        onChangeEnd: (value: string) => void;
    }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                    평가 시작일
                </Label>
                <DatePicker
                    id="startDate"
                    selected={startDateValue ? parse(startDateValue, 'yyyy-MM-dd', new Date()) : null}
                    onChange={(date: Date | null) => onChangeStart(date ? format(date, 'yyyy-MM-dd') : '')}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="YYYY-MM-DD"
                    className="mt-2 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    wrapperClassName="w-full"
                    disabled={disableStart}
                />
            </div>
            <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                    평가 종료일
                </Label>
                <DatePicker
                    id="endDate"
                    selected={endDateValue ? parse(endDateValue, 'yyyy-MM-dd', new Date()) : null}
                    onChange={(date: Date | null) => onChangeEnd(date ? format(date, 'yyyy-MM-dd') : '')}
                    dateFormat="yyyy-MM-dd"
                    locale={ko}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="YYYY-MM-DD"
                    className="mt-2 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    wrapperClassName="w-full"
                />
            </div>
        </div>
    )
);
DateRangePicker.displayName = 'DateRangePicker';
