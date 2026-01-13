import { useCallback } from 'react';
import { ErrorInfo, createErrorInfo } from '../utils/errorUtils';
import { showError as showToastError, showInfo as showToastInfo, showSuccess as showToastSuccess, showWarning as showToastWarning } from '../utils/toast';

export const useErrorActions = (
    setErrors: React.Dispatch<React.SetStateAction<ErrorInfo[]>>,
    dismissError: (id: string) => void,
    timeoutRefs: React.MutableRefObject<Map<string, ReturnType<typeof setTimeout>>>
) => {
    const showError = useCallback(
        (message: string, details?: string, error?: Error) => {
            const errorInfo = createErrorInfo(message, 'error', details, error);
            setErrors((prev) => [...prev, errorInfo]);
            showToastError(message, details);
            console.error('Application Error:', { message, details, timestamp: errorInfo.timestamp, error });
        },
        [setErrors]
    );

    const showWarning = useCallback(
        (message: string, details?: string) => {
            const warning = createErrorInfo(message, 'warning', details);
            setErrors((prev) => [...prev, warning]);
            showToastWarning(message, details);
            console.warn('Application Warning:', { message, details });
        },
        [setErrors]
    );

    const showInfo = useCallback(
        (message: string, details?: string) => {
            const info = createErrorInfo(message, 'info', details);
            setErrors((prev) => [...prev, info]);
            showToastInfo(message, details);
        },
        [setErrors]
    );

    const showSuccess = useCallback(
        (message: string, details?: string) => {
            const success = createErrorInfo(message, 'success', details);
            setErrors((prev) => [...prev, success]);
            showToastSuccess(message, details);

            const timeoutId = setTimeout(() => {
                dismissError(success.id);
            }, 3000);

            timeoutRefs.current.set(success.id, timeoutId);
        },
        [dismissError, setErrors, timeoutRefs]
    );

    return { showError, showWarning, showInfo, showSuccess };
};
