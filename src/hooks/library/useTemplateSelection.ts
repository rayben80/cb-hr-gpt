import { useCallback, useState } from 'react';

export const useTemplateSelection = () => {
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const toggleSelectionMode = useCallback(() => {
        setIsSelectionMode((prev) => !prev);
        setSelectedIds(new Set());
    }, []);

    const toggleSelectItem = useCallback((id: string | number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback((ids: (string | number)[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    return {
        selectedIds,
        setSelectedIds,
        isSelectionMode,
        setIsSelectionMode,
        toggleSelectionMode,
        toggleSelectItem,
        selectAll,
        deselectAll,
    };
};
