import { useCallback, useState } from 'react';
import { EvaluationItem } from '../../../constants';

interface UseItemDragDropOptions {
    items: EvaluationItem[];
    setItems: (updater: (items: EvaluationItem[]) => EvaluationItem[]) => void;
    activeItemId: number | null;
    isArchived: boolean;
}

interface DragOverState {
    id: number | 'end';
    position: 'before' | 'after';
}

export function useItemDragDrop({ setItems, activeItemId, isArchived }: UseItemDragDropOptions) {
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState<DragOverState | null>(null);

    const isDragEnabled = activeItemId === null && !isArchived;

    const handleDragStart = useCallback(
        (event: React.DragEvent<HTMLButtonElement>, id: number) => {
            if (!isDragEnabled) return;
            event.dataTransfer.setData('text/plain', String(id));
            event.dataTransfer.effectAllowed = 'move';
            setDraggedItemId(id);
        },
        [isDragEnabled]
    );

    const handleDragEnd = useCallback(() => {
        setDraggedItemId(null);
        setDragOver(null);
    }, []);

    const getDraggedId = useCallback(
        (event?: React.DragEvent<HTMLDivElement>) => {
            if (draggedItemId !== null) return draggedItemId;
            const raw = event?.dataTransfer?.getData('text/plain');
            const parsed = raw ? Number(raw) : NaN;
            return Number.isFinite(parsed) ? parsed : null;
        },
        [draggedItemId]
    );

    const handleDropAt = useCallback(
        (event: React.DragEvent<HTMLDivElement>, targetId: number, position: 'before' | 'after') => {
            if (!isDragEnabled) return;
            const sourceId = getDraggedId(event);
            if (sourceId === null || sourceId === targetId) {
                setDraggedItemId(null);
                setDragOver(null);
                return;
            }

            setItems((prevItems) => {
                const newItems = [...prevItems];
                const fromIndex = newItems.findIndex((item) => item.id === sourceId);
                const targetIndex = newItems.findIndex((item) => item.id === targetId);
                if (fromIndex === -1 || targetIndex === -1) return prevItems;

                const [moved] = newItems.splice(fromIndex, 1);
                let insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
                if (fromIndex < targetIndex) insertIndex -= 1;
                insertIndex = Math.max(0, Math.min(insertIndex, newItems.length));
                newItems.splice(insertIndex, 0, moved);
                return newItems;
            });

            setDraggedItemId(null);
            setDragOver(null);
        },
        [getDraggedId, isDragEnabled, setItems]
    );

    const handleDropAtEnd = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            if (!isDragEnabled) return;
            const sourceId = getDraggedId(event);
            if (sourceId === null) {
                setDraggedItemId(null);
                setDragOver(null);
                return;
            }

            setItems((prevItems) => {
                const newItems = [...prevItems];
                const fromIndex = newItems.findIndex((item) => item.id === sourceId);
                if (fromIndex === -1) return prevItems;
                const [moved] = newItems.splice(fromIndex, 1);
                newItems.push(moved);
                return newItems;
            });

            setDraggedItemId(null);
            setDragOver(null);
        },
        [getDraggedId, isDragEnabled, setItems]
    );

    const handleMoveItem = useCallback(
        (id: number, direction: 'up' | 'down') => {
            setItems((prevItems) => {
                const newItems = [...prevItems];
                const index = newItems.findIndex((item) => item.id === id);
                if (index === -1) return prevItems;

                const nextIndex = direction === 'up' ? index - 1 : index + 1;
                if (nextIndex < 0 || nextIndex >= newItems.length) return prevItems;

                const [moved] = newItems.splice(index, 1);
                newItems.splice(nextIndex, 0, moved);
                return newItems;
            });
        },
        [setItems]
    );

    return {
        draggedItemId,
        dragOver,
        setDragOver,
        isDragEnabled,
        handleDragStart,
        handleDragEnd,
        handleDropAt,
        handleDropAtEnd,
        handleMoveItem,
    };
}
