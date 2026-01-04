import { useCallback, useState } from 'react';

export function useBulkSelection() {
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

    const toggleSelection = useCallback((id: string) => {
        setSelectedMemberIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback((ids: string[]) => {
        setSelectedMemberIds(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedMemberIds(new Set());
    }, []);

    return {
        selectedMemberIds,
        toggleSelection,
        selectAll,
        clearSelection,
    };
}
