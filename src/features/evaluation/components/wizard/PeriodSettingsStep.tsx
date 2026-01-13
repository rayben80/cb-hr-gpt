/* eslint-disable max-lines-per-function */
import { DatePicker } from '@/components/common';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WizardPeriod } from '@/hooks/evaluation/useCampaignWizard';
import { Calendar as CalendarIcon, Repeat } from '@phosphor-icons/react';
import { format, parse } from 'date-fns';
import { memo } from 'react';

interface PeriodSettingsStepProps {
    period: WizardPeriod;
    onUpdate: (updates: Partial<WizardPeriod>) => void;
}

export const PeriodSettingsStep = memo(({ period, onUpdate }: PeriodSettingsStepProps) => {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Campaign Name */}
            <div className="space-y-2">
                <Label htmlFor="campaignName" className="text-sm font-medium text-slate-700">
                    평가 캠페인 이름
                </Label>
                <Input
                    id="campaignName"
                    value={period.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="예: 2024년 하반기 월별 성과 평가"
                    className="text-lg"
                />
            </div>

            {/* Date Range */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        시작일
                    </Label>
                    <DatePicker
                        id="startDate"
                        selected={period.startDate ? parse(period.startDate, 'yyyy-MM-dd', new Date()) : null}
                        onChange={(date: Date | null) =>
                            onUpdate({ startDate: date ? format(date, 'yyyy-MM-dd') : '' })
                        }
                        placeholderText="시작일 선택"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        종료일
                    </Label>
                    <DatePicker
                        id="endDate"
                        selected={period.endDate ? parse(period.endDate, 'yyyy-MM-dd', new Date()) : null}
                        onChange={(date: Date | null) => onUpdate({ endDate: date ? format(date, 'yyyy-MM-dd') : '' })}
                        minDate={period.startDate ? parse(period.startDate, 'yyyy-MM-dd', new Date()) : undefined}
                        placeholderText="종료일 선택"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Recurring Option */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Repeat className="w-5 h-5 text-slate-500" />
                        <div>
                            <p className="font-medium text-slate-700">반복 평가</p>
                            <p className="text-sm text-slate-500">주기적으로 자동 생성되는 평가 캠페인</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate({ isRecurring: !period.isRecurring })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            period.isRecurring ? 'bg-primary' : 'bg-slate-200'
                        }`}
                        role="switch"
                        aria-checked={period.isRecurring ? 'true' : 'false'}
                        aria-label="반복 평가 설정"
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                period.isRecurring ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {period.isRecurring && (
                    <div className="space-y-4 pt-2 border-t border-slate-200">
                        <div className="flex gap-2">
                            {(['monthly', 'quarterly', 'yearly'] as const).map((type) => {
                                const labels = { monthly: '월별', quarterly: '분기별', yearly: '연별' };
                                const isSelected = period.recurringType === type;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => onUpdate({ recurringType: type })}
                                        aria-pressed={isSelected}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-primary'
                                        }`}
                                    >
                                        {labels[type]}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="recurringStartDay" className="text-sm font-medium text-slate-700">
                                    매월 반복 시작일
                                </Label>
                                <div className="flex items-center gap-2 relative">
                                    <Input
                                        id="recurringStartDay"
                                        type="number"
                                        min={1}
                                        max={31}
                                        value={period.recurringStartDay || 1}
                                        onChange={(e) =>
                                            onUpdate({
                                                recurringStartDay: Math.min(
                                                    31,
                                                    Math.max(1, parseInt(e.target.value) || 1)
                                                ),
                                            })
                                        }
                                        className="text-right pr-8"
                                    />
                                    <span className="absolute right-3 text-sm text-slate-500 pointer-events-none">
                                        일
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">매월 해당 날짜에 평가가 시작됩니다.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recurringDuration" className="text-sm font-medium text-slate-700">
                                    평가 진행 기간
                                </Label>
                                <div className="flex items-center gap-2 relative">
                                    <Input
                                        id="recurringDuration"
                                        type="number"
                                        min={1}
                                        max={60}
                                        value={period.recurringDurationDays || 14}
                                        onChange={(e) =>
                                            onUpdate({
                                                recurringDurationDays: Math.min(
                                                    60,
                                                    Math.max(1, parseInt(e.target.value) || 1)
                                                ),
                                            })
                                        }
                                        className="text-right pr-9"
                                    />
                                    <span className="absolute right-3 text-sm text-slate-500 pointer-events-none">
                                        일간
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">시작일로부터 지정된 기간 동안 진행됩니다.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4">
                <p className="text-sm text-slate-600">
                    <strong>기간:</strong>{' '}
                    {period.startDate && period.endDate
                        ? `${new Date(period.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(period.endDate).toLocaleDateString('ko-KR')}`
                        : '날짜를 선택해주세요'}
                </p>
                {period.isRecurring && period.recurringType && (
                    <p className="text-sm text-slate-600 mt-1">
                        <strong>반복:</strong>{' '}
                        {{ monthly: '매월', quarterly: '분기마다', yearly: '매년' }[period.recurringType]} 자동 생성
                        {period.recurringStartDay && (
                            <span className="block mt-1 text-xs text-slate-500">
                                (시작: 매월 {period.recurringStartDay}일, 기간: {period.recurringDurationDays}일간)
                            </span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
});
PeriodSettingsStep.displayName = 'PeriodSettingsStep';
