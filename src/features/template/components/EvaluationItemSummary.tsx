import {
    ArrowDown,
    ArrowUp,
    Copy,
    DotsSixVertical,
    FileText,
    PencilSimple,
    SquaresFour,
    Trash,
} from '@phosphor-icons/react';
import React, { memo, useMemo } from 'react';
import { EvaluationItem } from '../../../constants';

interface EvaluationItemSummaryProps {
    item: EvaluationItem;
    onEdit: () => void;
    onRemove: () => void;
    onCopy: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd: () => void;
    dragEnabled: boolean;
    isDragging: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    showWeight: boolean;
}

export const EvaluationItemSummary = memo(
    ({
        item,
        onEdit,
        onRemove,
        onCopy,
        onMoveUp,
        onMoveDown,
        onDragStart,
        onDragEnd,
        dragEnabled,
        isDragging,
        canMoveUp,
        canMoveDown,
        showWeight,
    }: EvaluationItemSummaryProps) => {
        const IconComponent = useMemo(() => (item.type === '정량' ? SquaresFour : FileText), [item.type]);
        const color = useMemo(() => (item.type === '정량' ? 'text-green-600' : 'text-primary'), [item.type]);

        return (
            <div
                className={`bg-slate-50 p-4 rounded-lg flex items-center justify-between group transition-all duration-200 ${isDragging ? 'opacity-60 scale-[0.98] shadow-lg ring-2 ring-primary/40 bg-primary/5' : ''}`}
            >
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        draggable={dragEnabled}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        disabled={!dragEnabled}
                        className={`p-1 rounded ${dragEnabled ? 'text-slate-400 cursor-grab' : 'text-slate-300 cursor-not-allowed'}`}
                        aria-label="항목 순서 변경"
                        title={dragEnabled ? '드래그하여 순서 변경' : '편집 중에는 순서를 변경할 수 없습니다.'}
                    >
                        <DotsSixVertical className="w-5 h-5" weight="regular" />
                    </button>
                    <IconComponent className={`w-6 h-6 ${color}`} weight="regular" />
                    <p className="font-semibold text-slate-800">{item.title || '새 항목'}</p>
                    {showWeight && <span className="text-sm text-slate-500">({item.weight}%)</span>}
                </div>
                <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity flex items-center gap-2">
                    <div className="flex items-center gap-1 sm:hidden">
                        <button
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="위로 이동"
                        >
                            <ArrowUp className="w-4 h-4" weight="regular" />
                        </button>
                        <button
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="아래로 이동"
                        >
                            <ArrowDown className="w-4 h-4" weight="regular" />
                        </button>
                    </div>
                    <button
                        onClick={onCopy}
                        className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition-colors"
                        title="복사"
                    >
                        <Copy className="w-5 h-5" weight="regular" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-200 transition-colors"
                        aria-label="편집"
                    >
                        <PencilSimple className="w-5 h-5" weight="regular" />
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-200 transition-colors"
                        aria-label="삭제"
                    >
                        <Trash className="w-5 h-5" weight="regular" />
                    </button>
                </div>
            </div>
        );
    }
);

EvaluationItemSummary.displayName = 'EvaluationItemSummary';
