import React, { useCallback, useEffect, useState } from 'react';
import { Button, InputField, Modal } from '../common';
import { ConfirmationModal } from '../feedback/ConfirmationModal';

interface PartActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string }) => void;
    mode: 'add' | 'edit';
    initialName?: string;
}

const usePartModalState = (isOpen: boolean, initialName: string, onClose: () => void) => {
    const [name, setName] = useState(initialName);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setHasChanges(false);
        }
    }, [isOpen, initialName]);

    const handleCloseRequest = useCallback(() => {
        if (hasChanges) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    }, [hasChanges, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowConfirmation(false);
        setHasChanges(false);
        onClose();
    }, [onClose]);

    const updateName = useCallback(
        (value: string) => {
            setName(value);
            setHasChanges(value !== initialName || !!value);
        },
        [initialName]
    );

    return { name, showConfirmation, setShowConfirmation, handleCloseRequest, handleConfirmClose, updateName };
};

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

export const PartActionModal: React.FC<PartActionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialName = '',
}) => {
    const { name, showConfirmation, setShowConfirmation, handleCloseRequest, handleConfirmClose, updateName } =
        usePartModalState(isOpen, initialName, onClose);

    useEscapeKey(isOpen, handleCloseRequest);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ name });
        onClose();
    };

    const handleSave = () => {
        onSave({ name });
        onClose();
    };

    const titleText = mode === 'add' ? '새 파트 추가' : '파트명 변경';

    return (
        <>
            <Modal
                open={isOpen}
                onOpenChange={(open) => !open && handleCloseRequest()}
                title={titleText}
                maxWidth="sm:max-w-md"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseRequest}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            저장
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="파트 이름"
                        id="partName"
                        name="partName"
                        type="text"
                        value={name}
                        onChange={(e) => updateName(e.target.value)}
                        placeholder="파트 이름 입력"
                        autoFocus
                    />
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="변경사항 취소"
                message="정말 닫으시겠습니까? 입력한 내용은 저장되지 않습니다."
                confirmButtonText="네, 닫습니다"
                confirmButtonColor="destructive"
            />
        </>
    );
};
