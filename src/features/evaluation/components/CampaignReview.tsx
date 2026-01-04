import React, { memo } from 'react';
import { EvaluationTemplate } from '../../../constants';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

interface CampaignReviewProps {
    formData: UseCampaignFormReturn['formData'];
    today: string;
    selectedMembersCount: number;
    templates: EvaluationTemplate[];
}

export const CampaignReview: React.FC<CampaignReviewProps> = memo(({
    formData,
    today,
    selectedMembersCount,
    templates,
}) => {
    const selectedTemplate = templates.find(t => t.id === formData.templateId);

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">입력하신 정보를 확인해주세요.</h3>
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div>
                    <span className="font-semibold text-slate-600">평가명:</span> {formData.name}
                </div>
                <div>
                    <span className="font-semibold text-slate-600">평가 구분:</span> {formData.period}
                </div>
                <div>
                    <span className="font-semibold text-slate-600">시작 방식:</span>{' '}
                    {formData.timing === 'now' ? '즉시 시작' : '예약 시작'}
                </div>
                <div>
                    <span className="font-semibold text-slate-600">평가 일정:</span>{' '}
                    {formData.timing === 'now' ? today : formData.startDate} ~ {formData.endDate}
                </div>
                <div>
                    <span className="font-semibold text-slate-600">템플릿:</span>{' '}
                    {selectedTemplate?.name}
                </div>
                <div>
                    <span className="font-semibold text-slate-600">대상자:</span> 총 {selectedMembersCount}명
                </div>
            </div>
        </div>
    );
});

CampaignReview.displayName = 'CampaignReview';
