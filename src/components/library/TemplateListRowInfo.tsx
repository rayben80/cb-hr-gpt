import React from 'react';
import { EvaluationTemplate } from '../../constants';

interface TemplateListRowInfoProps {
    template: EvaluationTemplate;
    itemCount: number;
}

export const TemplateListRowInfo: React.FC<TemplateListRowInfoProps> = ({ template, itemCount }) => {
    return (
        <>
            {/* 유형 */}
            <div className="hidden md:block w-28 text-sm text-slate-600">{template.type}</div>

            {/* 카테고리 */}
            <div className="hidden md:block w-24 text-sm text-slate-600">{template.category || '미지정'}</div>

            {/* 항목 수 */}
            <div className="hidden md:block w-20 text-sm text-slate-600 text-center">{itemCount}</div>

            {/* 작성자 */}
            <div className="hidden md:block w-24 text-sm text-slate-600 truncate">{template.author}</div>

            {/* 수정일 */}
            <div className="hidden md:block w-28 text-sm text-slate-500">{template.lastUpdated}</div>
        </>
    );
};
