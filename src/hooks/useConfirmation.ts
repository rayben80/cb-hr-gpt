import { useState, useCallback } from 'react';

export interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmButtonText?: string;
    confirmButtonColor?: string;
}

export interface ConfirmationActions {
    showConfirmation: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        confirmButtonText?: string;
        confirmButtonColor?: string;
    }) => void;
    closeConfirmation: () => void;
}

const initialState: ConfirmationState = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmButtonText: '확인',
    confirmButtonColor: 'bg-red-600 hover:bg-red-700',
};

/**
 * Confirmation Modal 상태를 관리하는 커스텀 훅
 * 중복되는 confirmation 상태 관리 로직을 통합
 */
export const useConfirmation = (): [ConfirmationState, ConfirmationActions] => {
    const [confirmation, setConfirmation] = useState<ConfirmationState>(initialState);

    const showConfirmation = useCallback((config: {
        title: string;
        message: string;
        onConfirm: () => void;
        confirmButtonText?: string;
        confirmButtonColor?: string;
    }) => {
        setConfirmation({
            isOpen: true,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText || '확인',
            confirmButtonColor: config.confirmButtonColor || 'bg-red-600 hover:bg-red-700',
        });
    }, []);

    const closeConfirmation = useCallback(() => {
        setConfirmation(prev => ({ ...prev, isOpen: false }));
    }, []);

    const actions: ConfirmationActions = {
        showConfirmation,
        closeConfirmation,
    };

    return [confirmation, actions];
};