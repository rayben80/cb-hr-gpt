import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for managing toast timer with progress animation.
 * Handles automatic close after duration and cleanup on unmount.
 *
 * @param duration - Duration in milliseconds before auto-close (0 = no auto-close)
 * @param onClose - Callback function when toast closes
 * @param id - Unique identifier for the toast
 *
 * @returns Object containing:
 *   - progress: Current progress percentage (100 to 0)
 *   - isVisible: Whether the toast is visible (for animation)
 *   - handleClose: Function to manually close the toast
 *
 * @example
 * const { progress, isVisible, handleClose } = useToastTimer(5000, onClose, 'toast-1');
 */
export const useToastTimer = (duration: number, onClose: (id: string) => void, id: string) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
    }, [id, onClose]);

    useEffect(() => {
        const showTimer = setTimeout(() => setIsVisible(true), 10);

        if (duration <= 0) {
            clearTimeout(showTimer);
            return;
        }

        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - 100 / (duration / 100);
                if (newProgress <= 0) {
                    clearInterval(progressTimer);
                    return 0;
                }
                return newProgress;
            });
        }, 100);

        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(closeTimer);
            clearInterval(progressTimer);
        };
    }, [duration, handleClose]);

    return { progress, isVisible, handleClose };
};
