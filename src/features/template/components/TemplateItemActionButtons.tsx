import { ArrowDown, Copy, Plus, Scales, Sparkle } from '@phosphor-icons/react';
import { memo } from 'react';
import { EvaluationItem } from '../../../constants';

interface TemplateItemActionButtonsProps {
    usesWeights: boolean;
    hasPresets: boolean;
    isArchived: boolean;
    existingTemplatesCount: number;
    itemsLength: number;
    copiedItem: EvaluationItem | null;
    addItem: (type: '정량' | '정성') => void;
    handlePasteItem: () => void;
    handleLoadPresets: () => void;
    onShowImportModal: () => void;
    handleDistributeWeights: () => void;
}

export const TemplateItemActionButtons = memo(
    ({
        usesWeights,
        hasPresets,
        isArchived,
        existingTemplatesCount,
        itemsLength,
        copiedItem,
        addItem,
        handlePasteItem,
        handleLoadPresets,
        onShowImportModal,
        handleDistributeWeights,
    }: TemplateItemActionButtonsProps) => (
        <div className="space-y-4">
            <div className="flex gap-4 pt-4">
                {usesWeights ? (
                    <>
                        <button
                            onClick={() => addItem('정량')}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 p-3 rounded-lg border-2 border-dashed border-green-200 transition-colors"
                        >
                            <Plus className="w-5 h-5" weight="bold" /> 정량(KPI) 항목 추가
                        </button>
                        <button
                            onClick={() => addItem('정성')}
                            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 p-3 rounded-lg border-2 border-dashed border-primary/20 transition-colors"
                        >
                            <Plus className="w-5 h-5" weight="bold" /> 정성(서술) 항목 추가
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => addItem('정성')}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 p-3 rounded-lg border-2 border-dashed border-primary/20 transition-colors"
                    >
                        <Plus className="w-5 h-5" weight="bold" /> 질문 추가
                    </button>
                )}
                <button
                    onClick={handlePasteItem}
                    disabled={!copiedItem}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border-2 border-dashed border-slate-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Copy className="w-5 h-5" weight="regular" /> 항목 붙여넣기
                </button>
            </div>

            <div className="flex gap-4">
                {hasPresets && (
                    <button
                        onClick={handleLoadPresets}
                        disabled={isArchived}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 p-3 rounded-lg border border-purple-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Sparkle className="w-5 h-5" weight="regular" /> 추천 템플릿 불러오기
                    </button>
                )}
                {existingTemplatesCount > 0 && (
                    <button
                        onClick={onShowImportModal}
                        disabled={isArchived}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 p-3 rounded-lg border border-primary/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ArrowDown className="w-5 h-5" weight="regular" /> 다른 템플릿에서 가져오기
                    </button>
                )}
                {usesWeights && itemsLength > 0 && (
                    <button
                        onClick={handleDistributeWeights}
                        disabled={isArchived}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 p-3 rounded-lg border border-amber-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Scales className="w-5 h-5" weight="regular" /> 가중치 균등 분배
                    </button>
                )}
            </div>

            {copiedItem && <p className="text-xs text-slate-500">복사됨: {copiedItem.title || '이름 없는 항목'}</p>}
        </div>
    )
);

TemplateItemActionButtons.displayName = 'TemplateItemActionButtons';
