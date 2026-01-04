import { Warning } from '@phosphor-icons/react';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { InputField } from '../../components/common';
import { ModalActions } from '../../components/common/Modal';
import { CloseButton } from '../../components/common/index';

interface Weights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
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

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalWeights((prev) => ({ ...prev, [name]: value === '' ? 0 : parseInt(value, 10) }));
    }, []);

    const totalWeight = localWeights.firstHalf + localWeights.secondHalf + localWeights.peerReview;
    const isValid = totalWeight === 100;

    const handleSave = useCallback(() => {
        onSave(localWeights);
        onClose();
    }, [localWeights, onSave, onClose]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid) handleSave();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">종합 평가 기준 설정</h2>
                        <CloseButton onClick={onClose} />
                    </div>
                    <div className="p-8 space-y-6">
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
                        <WeightSummary totalWeight={totalWeight} isValid={isValid} />
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                        <ModalActions
                            onCancel={onClose}
                            onConfirm={handleSave}
                            cancelText="취소"
                            confirmText="설정 저장"
                            confirmVariant="primary"
                            confirmDisabled={!isValid}
                            className="justify-end"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnualEvaluationSettingsModal;
