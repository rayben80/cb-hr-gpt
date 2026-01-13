import { Warning } from '@phosphor-icons/react';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Checkbox, InputField } from '../../components/common';
import { Modal, ModalActions, ModalFooter, ModalHeader } from '../../components/common/Modal';

interface Weights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
    summaryYear: number;
    showMonthlyPartialAverage: boolean;
}

interface AnnualEvaluationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (weights: Weights) => void;
    weights: Weights;
}

const useEscapeKey = (isOpen: boolean, onEscape: () => void) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onEscape();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
        return undefined;
    }, [isOpen, onEscape]);
};

const WeightSummary = memo(({ totalWeight, isValid }: { totalWeight: number; isValid: boolean }) => (
    <>
        <div
            className={`p-4 rounded-lg flex items-center justify-between text-lg font-bold ${isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
            <span>가중치 총 합:</span>
            <span>{totalWeight}%</span>
        </div>
        {!isValid && (
            <div className="flex items-center text-sm text-red-600">
                <Warning className="w-5 h-5 mr-2" weight="regular" />
                <p>가중치의 총 합은 100%여야 합니다.</p>
            </div>
        )}
    </>
));
WeightSummary.displayName = 'WeightSummary';

const AnnualEvaluationSettingsModal: React.FC<AnnualEvaluationSettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    weights,
}) => {
    const [localWeights, setLocalWeights] = useState(weights);

    useEscapeKey(isOpen, onClose);

    useEffect(() => {
        if (isOpen) setLocalWeights(weights);
    }, [isOpen, weights]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalWeights((prev) => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
    }, []);

    const handleTogglePartialAverage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setLocalWeights((prev) => ({ ...prev, showMonthlyPartialAverage: checked }));
    }, []);

    const totalWeight = localWeights.firstHalf + localWeights.secondHalf + localWeights.peerReview;
    const isValid = totalWeight === 100;
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 15 }, (_, index) => currentYear + index);

    const handleSave = useCallback(() => {
        onSave(localWeights);
        onClose();
    }, [localWeights, onSave, onClose]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid) handleSave();
    };

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            maxWidth="sm:max-w-xl"
            className="p-0 max-h-[calc(100vh-4rem)] overflow-hidden"
            bodyClassName="p-0"
        >
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(100vh-4rem)]">
                <ModalHeader>
                    <h2 className="text-xl font-bold text-slate-900">종합 평가 기준 설정</h2>
                </ModalHeader>
                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    <p className="text-sm text-slate-600">
                        연간 종합 평가 점수에 반영될 각 평가 항목의 가중치를 설정합니다. 가중치의 총 합은 반드시
                        100%가 되어야 합니다.
                    </p>
                    <InputField
                        label="상반기 평가 가중치 (%)"
                        id="firstHalf"
                        name="firstHalf"
                        type="number"
                        value={String(localWeights.firstHalf)}
                        onChange={handleChange}
                        placeholder="예: 40"
                    />
                    <InputField
                        label="하반기 평가 가중치 (%)"
                        id="secondHalf"
                        name="secondHalf"
                        type="number"
                        value={String(localWeights.secondHalf)}
                        onChange={handleChange}
                        placeholder="예: 40"
                    />
                    <InputField
                        label="다면 평가 가중치 (%)"
                        id="peerReview"
                        name="peerReview"
                        type="number"
                        value={String(localWeights.peerReview)}
                        onChange={handleChange}
                        placeholder="예: 20"
                    />
                    <div>
                        <label htmlFor="summaryYear" className="block text-sm font-medium text-slate-700 mb-1">
                            종합 점수 연도
                        </label>
                        <select
                            id="summaryYear"
                            name="summaryYear"
                            value={String(localWeights.summaryYear)}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}년
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
                        <Checkbox
                            checked={localWeights.showMonthlyPartialAverage}
                            indeterminate={false}
                            onChange={handleTogglePartialAverage}
                            aria-label="월별 진행 평균 표시"
                        />
                        <div>
                            <div className="text-sm font-medium text-slate-700">월별 진행 평균 표시</div>
                            <div className="text-xs text-slate-500">
                                6개월이 채워지지 않아도 완료된 월의 평균을 표시합니다.
                            </div>
                        </div>
                    </div>
                    <WeightSummary totalWeight={totalWeight} isValid={isValid} />
                </div>
                <ModalFooter>
                    <ModalActions
                        onCancel={onClose}
                        onConfirm={handleSave}
                        cancelText="취소"
                        confirmText="설정 저장"
                        confirmVariant="primary"
                        confirmDisabled={!isValid}
                        className="justify-end"
                    />
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default AnnualEvaluationSettingsModal;
