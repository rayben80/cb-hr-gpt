import React, { memo } from 'react';
import { EvaluationItem } from '../../../constants';
import { EvaluationItemEditor, EvaluationItemSummary } from './index';

interface TemplateItemRowProps {
    item: EvaluationItem;
    index: number;
    totalItems: number;
    isActive: boolean;
    dragOver: { id: number | 'end'; position: 'before' | 'after' } | null;
    draggedItemId: number | null;
    isDragEnabled: boolean;
    usesWeights: boolean;
    setDragOver: (value: { id: number | 'end'; position: 'before' | 'after' } | null) => void;
    getDropPosition: (event: React.DragEvent<HTMLDivElement>) => 'before' | 'after';
    handleDropAt: (e: React.DragEvent<HTMLDivElement>, targetId: number, position: 'before' | 'after') => void;
    handleItemChange: (item: EvaluationItem) => void;
    setActiveItemId: (id: number | null) => void;
    removeItem: (id: number) => void;
    handleCopyItem: (item: EvaluationItem) => void;
    handleMoveItem: (id: number, direction: 'up' | 'down') => void;
    handleDragStart: (e: React.DragEvent<HTMLButtonElement>, id: number) => void;
    handleDragEnd: () => void;
}

export const TemplateItemRow = memo(
    ({
        item,
        index,
        totalItems,
        isActive,
        dragOver,
        draggedItemId,
        isDragEnabled,
        usesWeights,
        setDragOver,
        getDropPosition,
        handleDropAt,
        handleItemChange,
        setActiveItemId,
        removeItem,
        handleCopyItem,
        handleMoveItem,
        handleDragStart,
        handleDragEnd,
    }: TemplateItemRowProps) => {
        const dropBefore = dragOver?.id === item.id && dragOver.position === 'before';
        const dropAfter = dragOver?.id === item.id && dragOver.position === 'after';
        const isDragging = draggedItemId === item.id;

        return (
            <div
                onDragOver={
                    isDragEnabled
                        ? (e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              const position = getDropPosition(e);
                              setDragOver({ id: item.id, position });
                          }
                        : undefined
                }
                onDrop={
                    isDragEnabled
                        ? (e) => {
                              e.preventDefault();
                              const position = getDropPosition(e);
                              handleDropAt(e, item.id, position);
                          }
                        : undefined
                }
                className="relative"
            >
                {dropBefore && (
                    <div className="absolute -top-2 left-0 right-0 flex items-center gap-1 z-10">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1 h-0.5 bg-primary rounded-full" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                )}
                {dropAfter && (
                    <div className="absolute -bottom-2 left-0 right-0 flex items-center gap-1 z-10">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1 h-0.5 bg-primary rounded-full" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                )}
                {isActive ? (
                    <EvaluationItemEditor
                        item={item}
                        onSave={handleItemChange}
                        onCancel={() => setActiveItemId(null)}
                        showWeight={usesWeights}
                    />
                ) : (
                    <EvaluationItemSummary
                        item={item}
                        onEdit={() => setActiveItemId(item.id)}
                        onRemove={() => removeItem(item.id)}
                        onCopy={() => handleCopyItem(item)}
                        onMoveUp={() => handleMoveItem(item.id, 'up')}
                        onMoveDown={() => handleMoveItem(item.id, 'down')}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        dragEnabled={isDragEnabled}
                        isDragging={isDragging}
                        canMoveUp={index > 0}
                        canMoveDown={index < totalItems - 1}
                        showWeight={usesWeights}
                    />
                )}
            </div>
        );
    }
);

TemplateItemRow.displayName = 'TemplateItemRow';
