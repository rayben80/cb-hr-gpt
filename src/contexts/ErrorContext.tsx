import React, { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import ToastContainer from '../components/feedback/ToastContainer';
import { useToast } from '../hooks';
import { useErrorActions } from '../hooks/useErrorActions';
import { useErrorState } from '../hooks/useErrorState';
import { ErrorInfo } from '../utils/errorUtils';

interface ErrorContextType {
    errors: ErrorInfo[];
    showError: (message: string, details?: string, error?: Error) => void;
    showWarning: (message: string, details?: string) => void;
    showInfo: (message: string, details?: string) => void;
    showSuccess: (message: string, details?: string) => void;
    dismissError: (id: string) => void;
    clearAllErrors: () => void;
    showToastError: (title: string, message?: string) => void;
    showToastSuccess: (title: string, message?: string) => void;
    showToastWarning: (title: string, message?: string) => void;
    showToastInfo: (title: string, message?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

interface ErrorProviderProps {
    children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
    const { errors, setErrors, dismissError, clearAllErrors, timeoutRefs } = useErrorState();
    const { showError, showWarning, showInfo, showSuccess } = useErrorActions(setErrors, dismissError, timeoutRefs);

    const {
        toasts,
        showError: showToastErrorInternal,
        showSuccess: showToastSuccessInternal,
        showWarning: showToastWarningInternal,
        showInfo: showToastInfoInternal,
    } = useToast();

    const showToastError = useCallback(
        (title: string, message?: string) => {
            showToastErrorInternal(title, message);
            console.error('Toast Error:', { title, message });
        },
        [showToastErrorInternal]
    );

    const showToastSuccess = useCallback(
        (title: string, message?: string) => {
            showToastSuccessInternal(title, message);
        },
        [showToastSuccessInternal]
    );

    const showToastWarning = useCallback(
        (title: string, message?: string) => {
            showToastWarningInternal(title, message);
            console.warn('Toast Warning:', { title, message });
        },
        [showToastWarningInternal]
    );

    const showToastInfo = useCallback(
        (title: string, message?: string) => {
            showToastInfoInternal(title, message);
        },
        [showToastInfoInternal]
    );

    const value: ErrorContextType = useMemo(
        () => ({
            errors,
            showError,
            showWarning,
            showInfo,
            showSuccess,
            dismissError,
            clearAllErrors,
            showToastError,
            showToastSuccess,
            showToastWarning,
            showToastInfo,
        }),
        [
            errors,
            showError,
            showWarning,
            showInfo,
            showSuccess,
            dismissError,
            clearAllErrors,
            showToastError,
            showToastSuccess,
            showToastWarning,
            showToastInfo,
        ]
    );

    return (
        <ErrorContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} position="top-right" />
        </ErrorContext.Provider>
    );
};
