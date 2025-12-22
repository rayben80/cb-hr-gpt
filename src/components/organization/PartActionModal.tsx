import React, { useState, useEffect } from 'react';
import { Icon, InputField } from '../common';
import { ModalActions } from '../common/Button';
import { ICONS } from '../../constants';
import { ConfirmationModal } from '../ConfirmationModal';

interface PartActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string }) => void;
    mode: 'add' | 'edit';
    initialName?: string;
}

export const PartActionModal: React.FC<PartActionModalProps> = ({ isOpen, onClose, onSave, mode, initialName = '' }) => {
    const [name, setName] = useState(initialName);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleCloseRequest();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setHasChanges(false);
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSave();
    };

    const handleSave = () => {
        onSave({ name });
        setHasChanges(false);
        onClose();
    };

    const handleCloseRequest = () => {
        // 변경사항이 있으면 확인 모달 표시
        if (hasChanges) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmation(false);
        setHasChanges(false);
        onClose();
    };

    // 배경 클릭으로 모달 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCloseRequest();
        }
    };

    const title = mode === 'add' ? '새 파트 추가' : '파트명 변경';

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                            <button type="button" onClick={handleCloseRequest} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                                <Icon path={ICONS.xMark} className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <InputField label="파트 이름" id="partName" name="partName" type="text" value={name} onChange={(e) => {
                                setName(e.target.value);
                                // 변경사항 확인
                                setHasChanges(e.target.value !== initialName || !!e.target.value);
                            }} placeholder="파트 이름 입력" />
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <ModalActions
                                onCancel={handleCloseRequest}
                                onConfirm={handleSave}
                                cancelText="취소"
                                confirmText="저장"
                                confirmVariant="primary"
                                className="justify-end"
                            />
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmationModal 
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="변경사항 취소"
                message="정말 닫으시겠습니까? 입력한 내용은 저장되지 않습니다."
                confirmButtonText="네, 닫습니다"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
}