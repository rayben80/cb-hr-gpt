import React from 'react';

import { Button, Modal } from '../common';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
    confirmButtonColor?: 'primary' | 'destructive' | 'outline';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = '확인',
    confirmButtonColor = 'destructive',
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open: boolean) => !open && onClose()}
            title={title}
            description={message}
            maxWidth="sm:max-w-md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="rounded-xl">
                        취소
                    </Button>
                    <Button variant={confirmButtonColor} onClick={handleConfirm} className="rounded-xl">
                        {confirmButtonText}
                    </Button>
                </>
            }
        />
    );
};
