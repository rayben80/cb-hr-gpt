import React, { memo } from 'react';
import { EvaluationTemplate } from '../../../constants';
import { UseCampaignFormReturn } from '../../../hooks/evaluation/useCampaignForm';

interface CampaignTemplateSelectProps {
    templates: EvaluationTemplate[];
    selectedTemplateId: UseCampaignFormReturn['formData']['templateId'];
    onSelectTemplate: (templateId: string | number) => void;
}

export const CampaignTemplateSelect: React.FC<CampaignTemplateSelectProps> = memo(
    ({ templates, selectedTemplateId, onSelectTemplate }) => {
        return (
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">평가에 사용할 템플릿을 선택해주세요.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 -mx-2">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => onSelectTemplate(template.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedTemplateId === template.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-400'
                            }`}
                        >
                            <h4 className="font-bold text-slate-800">{template.name}</h4>
                            <p className="text-sm text-slate-500">{template.type}</p>
                            <p className="text-xs text-slate-400 mt-2">
                                질문 {template.questions || (template.items && template.items.length) || 0}개
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

CampaignTemplateSelect.displayName = 'CampaignTemplateSelect';
