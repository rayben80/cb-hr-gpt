import { useCallback, useEffect, useState } from 'react';
import { EvaluationItem, SCORING_TYPES, SCORING_TYPE_PRESETS } from '../../../constants';

const defaultScoring = [
    { grade: 'S', description: '', score: 100 },
    { grade: 'A', description: '', score: 90 },
    { grade: 'B', description: '', score: 80 },
    { grade: 'C', description: '', score: 70 },
    { grade: 'D', description: '', score: 60 },
];

const createNewItem = (type: '정량' | '정성', weight = 10): EvaluationItem => ({
    id: Date.now(),
    type,
    title: '',
    weight,
    details:
        type === '정량'
            ? {
                  metric: '',
                  target: '',
                  calculation: '달성치 / 목표치 * 100%',
              }
            : {
                  description: '',
              },
    scoring: JSON.parse(JSON.stringify(defaultScoring)),
});

const safeStorageGet = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeStorageSet = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures (private mode/quota)
    }
};

interface UseItemActionsOptions {
    items: EvaluationItem[];
    setItems: (updater: (items: EvaluationItem[]) => EvaluationItem[]) => void;
    usesWeights: boolean;
    defaultScoringType: string;
}

export function useItemActions({ items, setItems, usesWeights, defaultScoringType }: UseItemActionsOptions) {
    const [activeItemId, setActiveItemId] = useState<number | null>(null);
    const [copiedItem, setCopiedItem] = useState<EvaluationItem | null>(null);
    const [collapsedItems, setCollapsedItems] = useState<Set<number>>(new Set());
    const clipboardKey = 'template-item-clipboard';

    // Load from clipboard on mount
    useEffect(() => {
        const raw = safeStorageGet(clipboardKey);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as EvaluationItem;
            if (parsed?.id) setCopiedItem(parsed);
        } catch {
            setCopiedItem(null);
        }
    }, []);

    const handleItemChange = useCallback(
        (updatedItem: EvaluationItem) => {
            setItems((prevItems) => prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
            setActiveItemId(null);
        },
        [setItems]
    );

    const addItem = useCallback(
        (type: '정량' | '정성') => {
            const defaultWeight = usesWeights ? 10 : 0;
            const newItem = createNewItem(type, defaultWeight);
            const selectedType = SCORING_TYPES.find((t) => t.id === defaultScoringType);

            if (selectedType) {
                const presets = SCORING_TYPE_PRESETS[defaultScoringType]?.[type];
                newItem.scoringType = defaultScoringType as any;
                newItem.scoring = presets
                    ? presets.map((p) => ({ grade: p.grade, description: p.description, score: p.score }))
                    : selectedType.grades.map((g, i) => ({
                          grade: g,
                          description: '',
                          score: selectedType.id === '5grade' ? 100 - i * 10 : 0,
                      }));
            }

            setItems((prevItems) => [...prevItems, newItem]);
            setActiveItemId(newItem.id);
        },
        [usesWeights, defaultScoringType, setItems]
    );

    const removeItem = useCallback(
        (id: number) => {
            setItems((prevItems) => prevItems.filter((item) => item.id !== id));
            if (activeItemId === id) setActiveItemId(null);
        },
        [activeItemId, setItems]
    );

    const handleCopyItem = useCallback((item: EvaluationItem) => {
        const copied = {
            ...item,
            details: { ...item.details },
            scoring: item.scoring.map((s) => ({ ...s })),
        };
        setCopiedItem(copied);
        safeStorageSet(clipboardKey, JSON.stringify(copied));
    }, []);

    const handlePasteItem = useCallback(() => {
        if (!copiedItem) return;
        const newItem: EvaluationItem = {
            ...copiedItem,
            id: Date.now(),
            weight: usesWeights ? copiedItem.weight : 0,
            details: { ...copiedItem.details },
            scoring: copiedItem.scoring.map((s) => ({ ...s })),
        };
        setItems((prevItems) => [...prevItems, newItem]);
        setActiveItemId(newItem.id);
    }, [copiedItem, usesWeights, setItems]);

    const toggleCollapseAll = useCallback(() => {
        if (collapsedItems.size === items.length) {
            setCollapsedItems(new Set());
        } else {
            setCollapsedItems(new Set(items.map((i) => i.id)));
        }
    }, [collapsedItems.size, items]);

    const isAllCollapsed = collapsedItems.size === items.length && items.length > 0;

    return {
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
    };
}
