import React from 'react';
import { Modal, ModalFooter, ModalHeader } from '@/components/common/Modal';
import { EvaluateeSummary } from '@/hooks/evaluation/monitoringTypes';

interface AdjustmentPreview {
    baseScore: number;
    adjustedScore: number;
}

interface MonitoringAdjustmentModalProps {
    open: boolean;
    target: EvaluateeSummary;
    role: 'manager' | 'hq';
    adjustmentValue: number;
    adjustmentNote: string;
    adjustmentRange: number | null;
    adjustmentUnit: string;
    preview: AdjustmentPreview | null;
    isSaving: boolean;
    onChangeValue: (value: number) => void;
    onChangeNote: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
}

export const MonitoringAdjustmentModal: React.FC<MonitoringAdjustmentModalProps> = ({
    open,
    target,
    role,
    adjustmentValue,
    adjustmentNote,
    adjustmentRange,
    adjustmentUnit,
    preview,
    isSaving,
    onChangeValue,
    onChangeNote,
    onClose,
    onSave,
}) => (
    <Modal
        open={open}
        onOpenChange={(nextOpen) => !nextOpen && onClose()}
        maxWidth="sm:max-w-lg"
        className="p-0"
        bodyClassName="p-0"
        title={<span className="sr-only">{role === 'manager' ? '팀장 보정' : '본부장 보정'}</span>}
        description={<span className="sr-only">보정 값을 입력하는 모달입니다.</span>}
    >
        <div className="bg-white rounded-2xl flex flex-col">
            <ModalHeader className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{role === 'manager' ? '팀장 보정' : '본부장 보정'}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {target.name} · {target.team}
                    </p>
                </div>
            </ModalHeader>
            <div className="p-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    보정 범위: {adjustmentRange !== null ? `±${adjustmentRange}${adjustmentUnit}` : '제한 없음'}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">보정 값</label>
                    <input
                        type="number"
                        value={adjustmentValue}
                        onChange={(e) => onChangeValue(Number(e.target.value))}
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:ring-primary"
                        placeholder={adjustmentUnit === '%' ? '예: 5' : '예: 10'}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">메모 (선택)</label>
                    <textarea
                        value={adjustmentNote}
                        onChange={(e) => onChangeNote(e.target.value)}
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:ring-primary"
                        rows={3}
                        placeholder="보정 사유를 간단히 입력하세요."
                    />
                </div>
                {preview && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                        기본 점수 {preview.baseScore.toFixed(1)} → 예상 최종{' '}
                        <span className="font-semibold text-slate-900">{preview.adjustedScore.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <ModalFooter className="flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    취소
                </button>
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-60"
                >
                    {isSaving ? '저장 중...' : '보정 저장'}
                </button>
            </ModalFooter>
        </div>
    </Modal>
);
