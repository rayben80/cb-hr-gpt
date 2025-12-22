import { useState, useCallback } from 'react';

export interface ModalState<T = any> {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: T | null;
}

export interface ModalActions<T = any> {
    openModal: (mode: 'add' | 'edit', data?: T) => void;
    closeModal: () => void;
    setModalData: (data: T | null) => void;
}

/**
 * 모달 상태를 관리하는 범용적인 커스텀 훅
 * add/edit 모드를 가진 모달의 공통 로직을 처리
 */
export const useModal = <T = any>(initialData: T | null = null): [ModalState<T>, ModalActions<T>] => {
    const [modalState, setModalState] = useState<ModalState<T>>({
        isOpen: false,
        mode: 'add',
        data: initialData,
    });

    const openModal = useCallback((mode: 'add' | 'edit', data?: T) => {
        setModalState({
            isOpen: true,
            mode,
            data: data || null,
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const setModalData = useCallback((data: T | null) => {
        setModalState(prev => ({ ...prev, data }));
    }, []);

    const actions: ModalActions<T> = {
        openModal,
        closeModal,
        setModalData,
    };

    return [modalState, actions];
};