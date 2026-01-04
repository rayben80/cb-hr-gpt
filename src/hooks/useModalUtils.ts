import { useCallback, useEffect } from 'react';

interface UseEscapeKeyOptions {
    isOpen: boolean;
    onEscape: () => void;
}

/**
 * ESC 키 누르면 콜백 실행하는 훅
 */
export const useEscapeKey = ({ isOpen, onEscape }: UseEscapeKeyOptions) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onEscape();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
        return undefined;
    }, [isOpen, onEscape]);
};

interface UseModalCloseOptions {
    hasChanges: () => boolean;
    hasContent: boolean;
    onClose: () => void;
    setShowConfirmation: (show: boolean) => void;
}

/**
 * 모달 닫기 요청 처리 훅
 */
export const useModalClose = ({ hasChanges, hasContent, onClose, setShowConfirmation }: UseModalCloseOptions) => {
    const handleCloseRequest = useCallback(() => {
        if (hasChanges() && hasContent) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    }, [hasChanges, hasContent, onClose, setShowConfirmation]);

    return { handleCloseRequest };
};
