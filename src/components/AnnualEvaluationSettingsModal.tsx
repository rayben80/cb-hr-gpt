
import React, { useState, useEffect } from 'react';
import { Icon, InputField } from './common';
import { ModalActions } from './common/Button';
import { ICONS } from '../constants';

interface AnnualEvaluationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (weights: { firstHalf: number, secondHalf: number, peerReview: number }) => void;
    weights: { firstHalf: number, secondHalf: number, peerReview: number };
}

const AnnualEvaluationSettingsModal: React.FC<AnnualEvaluationSettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    weights,
}) => {
    const [localWeights, setLocalWeights] = useState(weights);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setLocalWeights(weights);
        }
    }, [isOpen, weights]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalWeights(prev => ({
            ...prev,
            [name]: value === '' ? 0 : parseInt(value, 10),
        }));
    };

    const totalWeight = localWeights.firstHalf + localWeights.secondHalf + localWeights.peerReview;
    const isValid = totalWeight === 100;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid) {
            handleSave();
        }
    };

    const handleSave = () => {
        onSave(localWeights);
        onClose();
    };

    // 배경 클릭으로 모달 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">종합 평가 기준 설정</h2>
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                            <Icon path={ICONS.xMark} className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-sm text-slate-600">연간 종합 평가 점수에 반영될 각 평가 항목의 가중치를 설정합니다. 가중치의 총 합은 반드시 100%가 되어야 합니다.</p>
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
                         <div className={`p-4 rounded-lg flex items-center justify-between text-lg font-bold ${isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <span>가중치 총 합:</span>
                            <span>{totalWeight}%</span>
                        </div>
                        {!isValid && (
                            <div className="flex items-center text-sm text-red-600">
                                <Icon path={ICONS.warning} className="w-5 h-5 mr-2" />
                                <p>가중치의 총 합은 100%여야 합니다.</p>
                            </div>
                        )}
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
