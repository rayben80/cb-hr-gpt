import { useCallback } from 'react';
import { EvaluationItem } from '../../../constants';
import { useItemActions } from './useItemActions';
import { useItemDragDrop } from './useItemDragDrop';
import { useItemPresets } from './useItemPresets';

interface TemplateState {
    name: string;
    type: string;
    category: string;
    items: EvaluationItem[];
}

interface UseTemplateItemsOptions {
    template: TemplateState;
    setTemplate: React.Dispatch<React.SetStateAction<TemplateState>>;
    usesWeights: boolean;
    defaultScoringType: string;
    isArchived: boolean;
    setConfirmation: (conf: { isOpen: boolean; title: string; message: string; onConfirm: () => void }) => void;
}

export function useTemplateItems({
    template,
    setTemplate,
    usesWeights,
    defaultScoringType,
    isArchived,
    setConfirmation,
}: UseTemplateItemsOptions) {
    // Helper to update items within template
    const setItems = useCallback(
        (updater: (items: EvaluationItem[]) => EvaluationItem[]) => {
            setTemplate((prev) => ({ ...prev, items: updater(prev.items) }));
        },
        [setTemplate]
    );

    // Item CRUD actions
    const {
        activeItemId,
        setActiveItemId,
        copiedItem,
        collapsedItems,
        setCollapsedItems,
        isAllCollapsed,
        handleItemChange,
        addItem,
        removeItem,
        handleCopyItem,
        handlePasteItem,
        toggleCollapseAll,
    } = useItemActions({
        items: template.items,
        setItems,
        usesWeights,
        defaultScoringType,
    });

    // Drag and drop
    const {
        draggedItemId,
        dragOver,
        setDragOver,
        isDragEnabled,
        handleDragStart,
        handleDragEnd,
        handleDropAt,
        handleDropAtEnd,
        handleMoveItem,
    } = useItemDragDrop({
        items: template.items,
        setItems,
        activeItemId,
        isArchived,
    });

    // Presets and bulk operations
    const {
        hasPresets,
        handleLoadPresets,
        handleImportFromTemplate,
        handleDistributeWeights,
        handleBulkScoringUpdate,
    } = useItemPresets({
        templateType: template.type,
        items: template.items,
        setItems,
        usesWeights,
        defaultScoringType,
        setActiveItemId,
        setConfirmation,
    });

    return {
        activeItemId,
        setActiveItemId,
        draggedItemId,
        dragOver,
        setDragOver,
        copiedItem,
        collapsedItems,
        setCollapsedItems,
        isAllCollapsed,
        isDragEnabled,
        hasPresets,
        handleItemChange,
        addItem,
        removeItem,
        handleCopyItem,
        handlePasteItem,
        handleLoadPresets,
        handleImportFromTemplate,
        handleDistributeWeights,
        handleBulkScoringUpdate,
        handleDragStart,
        handleDragEnd,
        handleDropAt,
        handleDropAtEnd,
        handleMoveItem,
        toggleCollapseAll,
    };
}
