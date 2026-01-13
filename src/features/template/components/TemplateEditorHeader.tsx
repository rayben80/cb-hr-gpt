import { memo } from 'react';
import { EvaluationTemplate } from '../../../constants';
import { useTemplateTags } from '../hooks/useTemplateTags';
import { TemplateBasicInfo } from './TemplateBasicInfo';
import { TemplateHeaderToolbar } from './TemplateHeaderToolbar';

interface TemplateEditorHeaderProps {
    template: EvaluationTemplate;
    onChange: (field: keyof EvaluationTemplate, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    categoryOptions: string[];
    isArchived: boolean;
    onArchive: () => void;
    onRestore: () => void;
    tagProps: ReturnType<typeof useTemplateTags>;
    validationMessages: string[];
}

export const TemplateEditorHeader = memo(
    ({
        template,
        onChange,
        onSave,
        onCancel,
        categoryOptions,
        isArchived,
        onArchive,
        onRestore,
        tagProps,
        validationMessages,
    }: TemplateEditorHeaderProps) => {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <TemplateHeaderToolbar
                    templateId={template.id}
                    title={template.id ? '템플릿 수정' : '새 템플릿 만들기'}
                    description="평가 템플릿의 기본 정보를 입력하고 항목을 구성하세요."
                    isArchived={isArchived}
                    onCancel={onCancel}
                    onSave={onSave}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    validationMessages={validationMessages}
                />

                <TemplateBasicInfo
                    template={template}
                    onChange={onChange}
                    categoryOptions={categoryOptions}
                    tagProps={tagProps}
                />

                {validationMessages.length > 0 && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="font-medium">!</span>
                        다음 항목을 입력해주세요: {validationMessages.join(', ')}
                    </div>
                )}
            </div>
        );
    }
);
TemplateEditorHeader.displayName = 'TemplateEditorHeader';
