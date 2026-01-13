import React from 'react';
import { Modal, ModalFooter, ModalHeader } from '@/components/common/Modal';

interface MonitoringRequestModalProps {
    open: boolean;
    title: string;
    reason: string;
    onChangeReason: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

export const MonitoringRequestModal: React.FC<MonitoringRequestModalProps> = ({
    open,
    title,
    reason,
    onChangeReason,
    onClose,
    onSubmit,
}) => (
    <Modal
        open={open}
        onOpenChange={(nextOpen) => !nextOpen && onClose()}
        maxWidth="sm:max-w-lg"
        className="p-0"
        bodyClassName="p-0"
        title={<span className="sr-only">{title}</span>}
        description={<span className="sr-only">재열람 또는 재제출 요청 사유를 입력합니다.</span>}
    >
        <div className="bg-white rounded-2xl flex flex-col">
            <ModalHeader className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500 mt-1">사유를 남기면 이력이 기록됩니다.</p>
                </div>
            </ModalHeader>
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">사유 (선택)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => onChangeReason(e.target.value)}
                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:ring-primary"
                        rows={4}
                        placeholder="요청 사유를 입력하세요."
                    />
                </div>
            </div>
            <ModalFooter className="flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    취소
                </button>
                <button
                    onClick={onSubmit}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    요청 저장
                </button>
            </ModalFooter>
        </div>
    </Modal>
);
