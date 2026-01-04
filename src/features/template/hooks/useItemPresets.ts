import { useCallback } from 'react';
import {
    EvaluationItem,
    EvaluationTemplate,
    SCORING_TYPES,
    SCORING_TYPE_PRESETS,
    TEMPLATE_ITEM_PRESETS,
} from '../../../constants';
import { showWarning } from '../../../utils/toast';

const defaultScoring = [
    { grade: 'S', description: '', score: 100 },
    { grade: 'A', description: '', score: 90 },
    { grade: 'B', description: '', score: 80 },
    { grade: 'C', description: '', score: 70 },
    { grade: 'D', description: '', score: 60 },
];

interface UseItemPresetsOptions {
    templateType: string;
    items: EvaluationItem[];
    setItems: (updater: (items: EvaluationItem[]) => EvaluationItem[]) => void;
    usesWeights: boolean;
    defaultScoringType: string;
    setActiveItemId: (id: number | null) => void;
    setConfirmation: (conf: { isOpen: boolean; title: string; message: string; onConfirm: () => void }) => void;
}

export function useItemPresets({
    templateType,
    items,
    setItems,
    usesWeights,
    defaultScoringType,
    setActiveItemId,
    setConfirmation,
}: UseItemPresetsOptions) {
    const hasPresets = Boolean(TEMPLATE_ITEM_PRESETS[templateType]);

    const executeLoadPresets = useCallback(() => {
        const presets = TEMPLATE_ITEM_PRESETS[templateType];
        const newItems: EvaluationItem[] = presets.map((preset, index) => ({
            ...preset,
            id: Date.now() + index,
            weight: usesWeights ? preset.weight : 0,
            scoring: JSON.parse(JSON.stringify(defaultScoring)),
        }));
        setItems(() => newItems);
        setActiveItemId(null);
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    }, [templateType, usesWeights, setItems, setActiveItemId, setConfirmation]);

    const handleLoadPresets = useCallback(() => {
        const presets = TEMPLATE_ITEM_PRESETS[templateType];
        if (!presets || presets.length === 0) {
            showWarning('선택한 템플릿 유형에 대한 추천 항목이 없습니다.');
            return;
        }
        if (items.length > 0) {
            setConfirmation({
                isOpen: true,
                title: '항목 교체',
                message: '기존 항목을 모두 삭제하고 추천 항목으로 교체하시겠습니까?',
                onConfirm: executeLoadPresets,
            });
        } else {
            executeLoadPresets();
        }
    }, [templateType, items.length, executeLoadPresets, setConfirmation]);

    const handleImportFromTemplate = useCallback(
        (sourceTemplate: EvaluationTemplate) => {
            if (!sourceTemplate.items || sourceTemplate.items.length === 0) {
                showWarning('선택한 템플릿에 가져올 항목이 없습니다.');
                return;
            }
            const importedItems: EvaluationItem[] = sourceTemplate.items.map((item, index) => ({
                ...item,
                id: Date.now() + index,
                scoring: JSON.parse(JSON.stringify(item.scoring || defaultScoring)),
            }));
            setItems((prevItems) => [...prevItems, ...importedItems]);
            setActiveItemId(null);
        },
        [setItems, setActiveItemId]
    );

    const handleDistributeWeights = useCallback(() => {
        if (items.length === 0) return;
        const weightPerItem = Math.floor(100 / items.length);
        const remainder = 100 - weightPerItem * items.length;
        setItems((prevItems) =>
            prevItems.map((item, index) => ({
                ...item,
                weight: weightPerItem + (index < remainder ? 1 : 0),
            }))
        );
    }, [items.length, setItems]);

    const executeBulkScoringUpdate = useCallback(() => {
        const selectedType = SCORING_TYPES.find((t) => t.id === defaultScoringType);
        if (!selectedType) return;

        setItems((prevItems) =>
            prevItems.map((item) => ({
                ...item,
                scoringType: defaultScoringType as any,
                scoring: calculateNewScoring(item, defaultScoringType, selectedType),
            }))
        );
        setConfirmation({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    }, [defaultScoringType, setItems, setConfirmation]);

    const handleBulkScoringUpdate = useCallback(() => {
        const selectedType = SCORING_TYPES.find((t) => t.id === defaultScoringType);
        if (!selectedType) return;
        if (items.length > 0) {
            setConfirmation({
                isOpen: true,
                title: '채점 방식 일괄 변경',
                message: `모든 항목의 채점 방식을 '${selectedType.label}'(으)로 변경하시겠습니까?\n\n주의: 기존에 설정된 등급 설명과 점수가 초기화될 수 있습니다.`,
                onConfirm: executeBulkScoringUpdate,
            });
        } else {
            executeBulkScoringUpdate();
        }
    }, [items.length, defaultScoringType, executeBulkScoringUpdate, setConfirmation]);

    return {
        hasPresets,
        handleLoadPresets,
        handleImportFromTemplate,
        handleDistributeWeights,
        handleBulkScoringUpdate,
    };
}

function calculateNewScoring(item: EvaluationItem, scoringType: string, selectedType: any) {
    const presets = SCORING_TYPE_PRESETS[scoringType]?.[item.type as '정량' | '정성'];
    if (presets) {
        return presets.map((p) => ({ grade: p.grade, description: p.description, score: p.score }));
    }
    return selectedType.grades.map((g: string, i: number) => ({
        grade: g,
        description: '',
        score: selectedType.id === '5grade' ? 100 - i * 10 : 0,
    }));
}
