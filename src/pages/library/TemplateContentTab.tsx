import { memo } from 'react';
import { EvaluationItem } from '../../constants';

interface TemplateContentTabProps {
    items: EvaluationItem[];
    hasItems: boolean;
    hasWeights: boolean;
    questionCount: number;
    fallbackQuestions: string[];
}

export const TemplateContentTab = memo(
    ({ items, hasItems, hasWeights, questionCount, fallbackQuestions }: TemplateContentTabProps) => {
        return (
            <>
                <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between text-sm text-slate-600">
                    <span>총 항목: {questionCount}개</span>
                    {hasWeights && (
                        <span>가중치 합계: {items.reduce((sum, item) => sum + (item.weight || 0), 0)}%</span>
                    )}
                </div>
                {hasItems ? (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <TemplateItemRow key={item.id ?? index} item={item} index={index} hasWeights={hasWeights} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {fallbackQuestions.map((label, index) => (
                            <div
                                key={label}
                                className="bg-white border border-dashed border-slate-200 rounded-lg p-4 text-sm text-slate-600"
                            >
                                {label}
                                {questionCount > 10 && index === fallbackQuestions.length - 1 && (
                                    <span className="ml-2 text-xs text-slate-400">
                                        외 {questionCount - fallbackQuestions.length}개
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    }
);

TemplateContentTab.displayName = 'TemplateContentTab';

interface TemplateItemRowProps {
    item: EvaluationItem;
    index: number;
    hasWeights: boolean;
}

const TemplateItemRow = memo(({ item, index, hasWeights }: TemplateItemRowProps) => {
    return (
        <div className="flex items-start justify-between bg-white border border-slate-200 rounded-lg p-4">
            <div>
                <p className="text-sm font-semibold text-slate-800">{item.title || `질문 ${index + 1}`}</p>
                <p className="text-xs text-slate-500 mt-1">{item.type}</p>
            </div>
            {hasWeights && <span className="text-xs text-slate-500">{item.weight || 0}%</span>}
        </div>
    );
});

TemplateItemRow.displayName = 'TemplateItemRow';
