import React from 'react';
import { EvaluationTemplate } from '../../constants';

interface TemplateListRowContentProps {
    template: EvaluationTemplate;
    itemCount: number;
    isArchived: boolean;
}

export const TemplateListRowContent: React.FC<TemplateListRowContentProps> = ({ template, itemCount, isArchived }) => {
    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 truncate">{template.name}</span>
                {isArchived && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">보관됨</span>
                )}
            </div>
            {/* 모바일 추가 정보 */}
            <div className="md:hidden text-xs text-slate-500 mt-1">
                {template.type} · {template.category || '미지정'} · 항목 {itemCount}개
            </div>
        </div>
    );
};
