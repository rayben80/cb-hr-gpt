import { useState, useCallback } from 'react';

type ConfirmButtonColor = 'primary' | 'destructive' | 'outline';

export interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmButtonText?: string;
    confirmButtonColor?: ConfirmButtonColor;
}

export interface ConfirmationActions {
    showConfirmation: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        confirmButtonText?: string;
        confirmButtonColor?: ConfirmButtonColor;
    }) => void;
    closeConfirmation: () => void;
}

const initialState: ConfirmationState = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    confirmButtonText: '확인',
    confirmButtonColor: 'destructive',
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
        confirmButtonColor?: ConfirmButtonColor;
    }) => {
        setConfirmation({
            isOpen: true,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm,
            confirmButtonText: config.confirmButtonText || '확인',
            confirmButtonColor: config.confirmButtonColor || 'destructive',
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