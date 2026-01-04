import { Sparkle } from '@phosphor-icons/react';
import React, { memo } from 'react';
import { InputField } from '../../../components/common';
import { SettingsCard } from '../../../components/settings/SettingsCard';
import { EvaluationItem, SCORING_TYPES } from '../../../constants';

interface ScoringEditorProps {
    editedItem: EvaluationItem;
    currentScoringType: (typeof SCORING_TYPES)[number] | undefined;
    onScoringTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onScoringChange: (grade: string, description: string) => void;
    onScoringScoreChange: (grade: string, score: number) => void;
    onAutoComplete: () => void;
}

export const ScoringEditor = memo(
    ({
        editedItem,
        currentScoringType,
        onScoringTypeChange,
        onScoringChange,
        onScoringScoreChange,
        onAutoComplete,
    }: ScoringEditorProps) => {
        return (
            <SettingsCard title="평가 기준 설정" description="채점 방식을 선택하고 각 단계별 기준을 정의합니다.">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <label htmlFor="scoring-type" className="text-sm font-medium text-slate-700">
                            채점 방식
                        </label>
                        <select
                            id="scoring-type"
                            value={currentScoringType?.id || '5grade'}
                            onChange={onScoringTypeChange}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            {SCORING_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={onAutoComplete}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
                    >
                        <Sparkle className="w-3.5 h-3.5" weight="regular" />
                        기준 자동 완성
                    </button>
                </div>
                <ScoringList
                    editedItem={editedItem}
                    onScoringChange={onScoringChange}
                    onScoringScoreChange={onScoringScoreChange}
                />
            </SettingsCard>
        );
    }
);

ScoringEditor.displayName = 'ScoringEditor';

interface ScoringListProps {
    editedItem: EvaluationItem;
    onScoringChange: (grade: string, description: string) => void;
    onScoringScoreChange: (grade: string, score: number) => void;
}

const ScoringList = memo(({ editedItem, onScoringChange, onScoringScoreChange }: ScoringListProps) => {
    return (
        <div className="space-y-3">
            {editedItem.scoring.map(({ grade }, index) => (
                <ScoringRow
                    key={grade}
                    grade={grade}
                    score={editedItem.scoring[index].score}
                    description={editedItem.scoring.find((s) => s.grade === grade)?.description || ''}
                    itemType={editedItem.type}
                    onScoreChange={(score) => onScoringScoreChange(grade, score)}
                    onDescriptionChange={(desc) => onScoringChange(grade, desc)}
                />
            ))}
        </div>
    );
});

ScoringList.displayName = 'ScoringList';

interface ScoringRowProps {
    grade: string;
    score: number | undefined;
    description: string;
    itemType: string;
    onScoreChange: (score: number) => void;
    onDescriptionChange: (description: string) => void;
}

const ScoringRow = memo(
    ({ grade, score, description, itemType, onScoreChange, onDescriptionChange }: ScoringRowProps) => {
        return (
            <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-slate-700 min-w-[60px] text-center bg-slate-100 px-2 py-1 rounded">
                    {grade}
                </span>
                <div className="w-24">
                    <InputField
                        label=""
                        id={`score-${grade}`}
                        name={`score-${grade}`}
                        type="number"
                        value={score?.toString() || '0'}
                        onChange={(e) => onScoreChange(Number(e.target.value))}
                        placeholder="점수"
                    />
                </div>
                <div className="flex-1">
                    <InputField
                        label=""
                        id={`scoring-${grade}`}
                        name={`scoring-${grade}`}
                        type="text"
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder={
                            itemType === '정량' ? '예: 달성률 120% 이상' : '예: 기대치를 월등히 초과하는 성과를 보임'
                        }
                    />
                </div>
            </div>
        );
    }
);

ScoringRow.displayName = 'ScoringRow';
