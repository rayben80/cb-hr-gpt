import { useCallback, useState } from 'react';
import { ToastProps, ToastType } from '../../components/feedback/Toast';

export interface UseToastReturn {
    toasts: ToastProps[];
    showToast: (
        type: ToastType,
        title: string,
        message?: string,
        options?: {
            duration?: number;
            showProgress?: boolean;
        }
    ) => string;
    showSuccess: (title: string, message?: string) => string;
    showError: (title: string, message?: string) => string;
    showWarning: (title: string, message?: string) => string;
    showInfo: (title: string, message?: string) => string;
    hideToast: (id: string) => void;
    clearAllToasts: () => void;
}

/**
 * 토스트 알림을 관리하는 커스텀 훅
 */
export const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const hideToast = useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (
            type: ToastType,
            title: string,
            message?: string,
            options?: {
                duration?: number;
                showProgress?: boolean;
            }
        ): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const newToast: ToastProps = {
                id,
                type,
                title,
                message,
                duration: options?.duration ?? 5000,
                showProgress: options?.showProgress ?? true,
                onClose: hideToast,
            };

            setToasts((prevToasts) => {
                // 최대 5개의 토스트만 표시
                const updatedToasts = [...prevToasts, newToast];
                if (updatedToasts.length > 5) {
                    return updatedToasts.slice(-5);
                }
                return updatedToasts;
            });

            return id;
        },
        [hideToast]
    );

    const showSuccess = useCallback(
        (title: string, message?: string): string => {
            return showToast('success', title, message);
        },
        [showToast]
    );

    const showError = useCallback(
        (title: string, message?: string): string => {
            return showToast('error', title, message, { duration: 7000 }); // 에러는 조금 더 길게
        },
        [showToast]
    );

    const showWarning = useCallback(
        (title: string, message?: string): string => {
            return showToast('warning', title, message, { duration: 6000 });
        },
        [showToast]
    );

    const showInfo = useCallback(
        (title: string, message?: string): string => {
            return showToast('info', title, message);
        },
        [showToast]
    );

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
        clearAllToasts,
    };
};
