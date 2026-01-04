import React, { memo, useCallback, useMemo, useState } from 'react';
import { Button, InputField } from '../../../components/common';
import { EvaluationItem, SCORING_TYPES, SCORING_TYPE_PRESETS } from '../../../constants';
import { ItemDetailsEditor } from './ItemDetailsEditor';
import { ScoringEditor } from './ScoringEditor';

interface EvaluationItemEditorProps {
    item: EvaluationItem;
    onSave: (item: EvaluationItem) => void;
    onCancel: () => void;
    showWeight: boolean;
}

// Helper functions to reduce nesting
const updateScoring = (
    scoring: EvaluationItem['scoring'],
    grade: string,
    updates: Partial<{ description: string; score: number }>
) => scoring.map((s) => (s.grade === grade ? { ...s, ...updates } : s));

const createNewScoring = (typeId: string, itemType: '정량' | '정성') => {
    const selectedType = SCORING_TYPES.find((t) => t.id === typeId);
    if (!selectedType) return null;

    const presets = SCORING_TYPE_PRESETS[typeId]?.[itemType];
    return presets
        ? presets.map((p) => ({ grade: p.grade, description: p.description, score: p.score }))
        : selectedType.grades.map((g) => ({ grade: g, description: '', score: 0 }));
};

export const EvaluationItemEditor = memo(({ item, onSave, onCancel, showWeight }: EvaluationItemEditorProps) => {
    const [editedItem, setEditedItem] = useState(item);

    const handleDetailChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedItem((prev) => ({ ...prev, details: { ...prev.details, [name]: value } }));
    }, []);

    const handleScoringChange = useCallback((grade: string, description: string) => {
        setEditedItem((prev) => ({ ...prev, scoring: updateScoring(prev.scoring, grade, { description }) }));
    }, []);

    const handleScoringScoreChange = useCallback((grade: string, score: number) => {
        setEditedItem((prev) => ({ ...prev, scoring: updateScoring(prev.scoring, grade, { score }) }));
    }, []);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditedItem((prev) => ({ ...prev, title: e.target.value }));
    }, []);

    const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const nextValue = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
        setEditedItem((prev) => ({ ...prev, weight: nextValue }));
    }, []);

    const currentScoringType = useMemo(() => {
        const scoring = editedItem.scoring;
        return SCORING_TYPES.find((t) => t.grades.length === scoring.length && t.grades[0] === scoring[0]?.grade);
    }, [editedItem]);

    const handleScoringTypeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newScoring = createNewScoring(e.target.value, editedItem.type as '정량' | '정성');
            if (!newScoring) return;

            setEditedItem((prev) => ({
                ...prev,
                scoringType: e.target.value as NonNullable<EvaluationItem['scoringType']>,
                scoring: newScoring,
            }));
        },
        [editedItem.type]
    );

    const handleAutoComplete = useCallback(() => {
        const typeId = currentScoringType?.id || '5grade';
        const newScoring = createNewScoring(typeId, editedItem.type as '정량' | '정성');
        if (!newScoring) return;

        setEditedItem((prev) => ({ ...prev, scoring: newScoring }));
    }, [currentScoringType, editedItem.type]);

    const handleSave = useCallback(() => onSave(editedItem), [onSave, editedItem]);

    return (
        <EditorLayout title={`${item.type} 항목 편집`}>
            <TitleWeightSection
                title={editedItem.title}
                weight={editedItem.weight}
                showWeight={showWeight}
                onTitleChange={handleTitleChange}
                onWeightChange={handleWeightChange}
            />
            <ItemDetailsEditor editedItem={editedItem} onDetailChange={handleDetailChange} />
            <ScoringEditor
                editedItem={editedItem}
                currentScoringType={currentScoringType}
                onScoringTypeChange={handleScoringTypeChange}
                onScoringChange={handleScoringChange}
                onScoringScoreChange={handleScoringScoreChange}
                onAutoComplete={handleAutoComplete}
            />
            <ActionButtons onCancel={onCancel} onSave={handleSave} />
        </EditorLayout>
    );
});

EvaluationItemEditor.displayName = 'EvaluationItemEditor';

// Sub-components
const EditorLayout = memo(({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border animate-fade-in">
        <h3 className="text-lg font-bold text-primary mb-4">{title}</h3>
        <div className="space-y-6">{children}</div>
    </div>
));
EditorLayout.displayName = 'EditorLayout';

interface TitleWeightSectionProps {
    title: string;
    weight: number;
    showWeight: boolean;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onWeightChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const TitleWeightSection = memo(
    ({ title, weight, showWeight, onTitleChange, onWeightChange }: TitleWeightSectionProps) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={showWeight ? 'md:col-span-2' : 'md:col-span-3'}>
                <InputField
                    label="항목명"
                    id="title"
                    name="title"
                    type="text"
                    value={title}
                    onChange={onTitleChange}
                    placeholder="예: 1분기 신규 고객 유치"
                />
            </div>
            {showWeight && (
                <InputField
                    label="가중치(%)"
                    id="weight"
                    name="weight"
                    type="number"
                    value={weight}
                    onChange={onWeightChange}
                    placeholder="10"
                />
            )}
        </div>
    )
);
TitleWeightSection.displayName = 'TitleWeightSection';

const ActionButtons = memo(({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) => (
    <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
            취소
        </Button>
        <Button
            type="button"
            variant="primary" // gradient
            onClick={onSave}
        >
            항목 저장
        </Button>
    </div>
));
ActionButtons.displayName = 'ActionButtons';
