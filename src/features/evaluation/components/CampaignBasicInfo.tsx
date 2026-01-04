import React, { memo } from 'react';
import { InputField } from '../../../components/common';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

interface CampaignBasicInfoProps {
    formData: UseCampaignFormReturn['formData'];
    today: string;
    periodOptions: string[];
    updateField: UseCampaignFormReturn['updateField'];
    handleTimingChange: UseCampaignFormReturn['handleTimingChange'];
}

export const CampaignBasicInfo: React.FC<CampaignBasicInfoProps> = memo(
    ({ formData, today, periodOptions, updateField, handleTimingChange }) => {
        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">캠페인 기본 정보를 입력해주세요.</h3>
                <div className="space-y-6">
                    <InputField
                        label="평가명"
                        id="evalName"
                        name="evalName"
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="예: 2024년 4분기 동료 피드백"
                    />

                    <div>
                        <p className="block text-sm font-medium text-slate-700 mb-2">평가 기간</p>
                        <div className="flex flex-wrap gap-2">
                            {periodOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => updateField('period', option)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                        formData.period === option
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                    aria-pressed={formData.period === option ? 'true' : 'false'}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="block text-sm font-medium text-slate-700 mb-2">시작 방식</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleTimingChange('now')}
                                className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                    formData.timing === 'now'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                                aria-pressed={formData.timing === 'now' ? 'true' : 'false'}
                            >
                                즉시 시작
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTimingChange('scheduled')}
                                className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                    formData.timing === 'scheduled'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                                aria-pressed={formData.timing === 'scheduled' ? 'true' : 'false'}
                            >
                                예약 시작
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">즉시 시작은 시작일을 오늘로 고정합니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="평가 시작일"
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.timing === 'now' ? today : formData.startDate}
                            onChange={(e) => updateField('startDate', e.target.value)}
                            placeholder=""
                            disabled={formData.timing === 'now'}
                        />
                        <InputField
                            label="평가 종료일"
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => updateField('endDate', e.target.value)}
                            placeholder=""
                        />
                    </div>
                </div>
            </div>
        );
    }
);

CampaignBasicInfo.displayName = 'CampaignBasicInfo';
