import { Button } from '@/components/ui/button';
import { CaretRight, Check } from '@phosphor-icons/react';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ProgressBar } from '../../components/feedback/Progress';
import { Evaluation, EvaluationItem as EvaluationItemType, EvaluationTemplate } from '../../constants';

export interface EvaluationExecutionResult {
    evaluationId: string | number;
    answers: ItemScoreState[];
    totalScore: number;
    completedAt: string;
}

interface EvaluationExecutionProps {
    evaluation: Evaluation;
    template: EvaluationTemplate;
    onSave: (executionResult: EvaluationExecutionResult) => void;
    onCancel: () => void;
}

interface ItemScoreState {
    itemId: number;
    score: number;
    grade?: string | undefined;
    comment: string;
}

interface EvaluationHeaderProps {
    evaluation: Evaluation;
    totalScore: number;
    answers: Record<number, ItemScoreState>;
    template: EvaluationTemplate;
}

const EvaluationHeader = memo(({ evaluation, totalScore, answers, template }: EvaluationHeaderProps) => {
    const completedCount = Object.values(answers).filter((a) => a.score > 0).length;
    const totalItems = template.items?.length || 0;
    const progressPercent = totalItems > 0 ? Math.min(100, (completedCount / totalItems) * 100) : 0;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wide">
                            {evaluation.type}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">{evaluation.period}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{evaluation.name}</h1>
                    <p className="text-slate-600 mt-1 flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-900 border-b-2 border-primary/20 pb-0.5">
                            {evaluation.subject}
                        </span>
                        <span>님에 대한 평가를 진행 중입니다.</span>
                    </p>
                </div>
                <div className="text-right bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">현재 총점</div>
                    <div className="text-3xl font-bold text-primary tabular-nums tracking-tight">
                        {totalScore}
                        <span className="text-lg text-slate-400 font-medium ml-1">점</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>진행률</span>
                    <span>
                        {Math.round(progressPercent)}% ({completedCount}/{totalItems})
                    </span>
                </div>
                <ProgressBar progress={progressPercent} size="md" color="primary" showPercentage={false} />
            </div>
        </div>
    );
});
EvaluationHeader.displayName = 'EvaluationHeader';

interface ScoringOptionsProps {
    item: EvaluationItemType;
    answer: ItemScoreState;
    onScoreChange: (itemId: number, score: number, grade?: string) => void;
}

const ScoringOptions = memo(({ item, answer, onScoreChange }: ScoringOptionsProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
        {item.scoring.map((option) => {
            const isSelected = answer.grade === option.grade;
            return (
                <button
                    key={option.grade}
                    type="button"
                    onClick={() => onScoreChange(item.id, option.score ?? 0, option.grade)}
                    className={`
                        relative p-3 rounded-lg text-left transition-all duration-200 group
                        ${
                            isSelected
                                ? 'bg-white shadow-sm ring-1 ring-slate-200 scale-[1.02] z-10'
                                : 'hover:bg-white/60 hover:shadow-sm text-slate-500 hover:text-slate-900'
                        }
                    `}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span
                            className={`font-bold transition-colors ${isSelected ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900'}`}
                        >
                            {option.grade}
                        </span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-primary/70' : 'text-slate-400'}`}>
                            {option.score}점
                        </span>
                    </div>
                    {option.description && (
                        <p
                            className={`text-[11px] leading-snug line-clamp-2 transition-colors ${
                                isSelected ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'
                            }`}
                        >
                            {option.description}
                        </p>
                    )}
                </button>
            );
        })}
    </div>
));
ScoringOptions.displayName = 'ScoringOptions';

interface ScoringSliderProps {
    answer: ItemScoreState;
    itemId: number;
    onScoreChange: (itemId: number, score: number) => void;
}

const ScoringSlider = memo(({ answer, itemId, onScoreChange }: ScoringSliderProps) => (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center gap-6">
        <div className="flex-1">
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={answer.score}
                onChange={(e) => onScoreChange(itemId, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={`점수 선택: ${answer.score}점`}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium px-1">
                <span>0점</span>
                <span>50점</span>
                <span>100점</span>
            </div>
        </div>
        <div className="w-24 text-center bg-white py-3 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-3xl font-bold text-primary tracking-tight">{answer.score}</span>
            <span className="text-xs text-slate-500 font-medium ml-1 block mt-0.5">점수</span>
        </div>
    </div>
));
ScoringSlider.displayName = 'ScoringSlider';

interface EvaluationItemProps {
    item: EvaluationItemType;
    index: number;
    answer: ItemScoreState;
    template: EvaluationTemplate;
    onScoreChange: (itemId: number, score: number, grade?: string) => void;
    onCommentChange: (itemId: number, comment: string) => void;
}

const EvaluationItem = memo(
    ({ item, index, answer, template, onScoreChange, onCommentChange }: EvaluationItemProps) => {
        const commentInputId = `comment-${item.id}`;
        const isCompleted = answer.score > 0;

        return (
            <div
                className={`
                bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300
                ${isCompleted ? 'border-primary/20 shadow-primary/5' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
            `}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span
                                className={`
                                flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-colors
                                ${isCompleted ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600'}
                            `}
                            >
                                Q{index + 1}
                            </span>
                            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                                {template.category}
                                <CaretRight className="inline w-3 h-3 mx-1 text-slate-400" weight="bold" />
                                {item.type}
                            </span>
                            {item.weight > 0 && (
                                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-bold border border-amber-100">
                                    가중치 {item.weight}%
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                        {item.details?.description && (
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                {item.details.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            평가 점수
                            {isCompleted && <Check className="w-4 h-4 text-primary" weight="bold" />}
                        </p>
                        {item.scoring?.length > 0 ? (
                            <ScoringOptions item={item} answer={answer} onScoreChange={onScoreChange} />
                        ) : (
                            <ScoringSlider answer={answer} itemId={item.id} onScoreChange={onScoreChange} />
                        )}
                    </div>

                    <div>
                        <label htmlFor={commentInputId} className="block text-sm font-semibold text-slate-900 mb-2">
                            코멘트/피드백
                            <span className="text-xs text-slate-400 font-normal ml-2">
                                (선택사항 - 평가에 대한 구체적인 근거를 남겨주세요)
                            </span>
                        </label>
                        <textarea
                            id={commentInputId}
                            value={answer.comment}
                            onChange={(e) => onCommentChange(item.id, e.target.value)}
                            placeholder="내용을 입력해주세요."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm transition-all resize-none placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>
        );
    }
);
EvaluationItem.displayName = 'EvaluationItem';

const EvaluationExecution: React.FC<EvaluationExecutionProps> = ({ evaluation, template, onSave, onCancel }) => {
    const [answers, setAnswers] = useState<Record<number, ItemScoreState>>({});
    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        if (Object.keys(answers).length === 0 && template.items) {
            const initialAnswers: Record<number, ItemScoreState> = {};
            template.items.forEach((item) => {
                initialAnswers[item.id] = { itemId: item.id, score: 0, grade: undefined, comment: '' };
            });
            setAnswers(initialAnswers);
        }
    }, [template.items, answers]);

    useEffect(() => {
        if (!template.items?.length) return;
        let calculatedTotal = 0,
            totalWeight = 0;
        template.items.forEach((item) => {
            const answer = answers[item.id];
            if (answer?.score > 0) {
                if (template.items?.some((i) => i.weight > 0)) {
                    calculatedTotal += (answer.score * item.weight) / 100;
                    totalWeight += item.weight;
                } else {
                    calculatedTotal += answer.score / (template.items?.length || 1);
                }
            }
        });
        setTotalScore(
            totalWeight > 0
                ? Math.round((calculatedTotal / totalWeight) * 100 * 10) / 10
                : Math.round(calculatedTotal * 10) / 10
        );
    }, [answers, template.items]);

    const handleScoreChange = useCallback(
        (itemId: number, score: number, grade?: string) =>
            setAnswers((prev) => ({ ...prev, [itemId]: { ...prev[itemId], itemId, score, grade } })),
        []
    );
    const handleCommentChange = useCallback(
        (itemId: number, comment: string) =>
            setAnswers((prev) => ({ ...prev, [itemId]: { ...prev[itemId], comment } })),
        []
    );
    const handleSaveEvaluation = useCallback(
        () =>
            onSave({
                evaluationId: evaluation.id,
                answers: Object.values(answers),
                totalScore,
                completedAt: new Date().toISOString(),
            }),
        [evaluation.id, answers, totalScore, onSave]
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <EvaluationHeader evaluation={evaluation} totalScore={totalScore} answers={answers} template={template} />

            <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-sm font-medium text-slate-400 px-2 uppercase tracking-widest">
                    Evaluation Form
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="space-y-6">
                {template.items?.map((item, index) => (
                    <EvaluationItem
                        key={item.id}
                        item={item}
                        index={index}
                        answer={answers[item.id] || { itemId: item.id, score: 0, comment: '', grade: undefined }}
                        template={template}
                        onScoreChange={handleScoreChange}
                        onCommentChange={handleCommentChange}
                    />
                ))}
            </div>

            <div className="sticky bottom-6 z-20 flex justify-end gap-3 p-4 bg-white/90 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl ring-1 ring-slate-200 mt-10 max-w-4xl mx-auto">
                <Button variant="secondary" onClick={onCancel}>
                    취소 (목록으로)
                </Button>
                <Button
                    variant="default"
                    onClick={handleSaveEvaluation}
                    disabled={Object.values(answers).some((a) => a.score === 0)}
                    className="shadow-lg"
                >
                    <Check className="w-4 h-4 mr-2" weight="bold" />
                    평가 제출하기
                </Button>
            </div>
        </div>
    );
};

export default EvaluationExecution;
