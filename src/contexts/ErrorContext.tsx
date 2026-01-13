import React, { createContext, ReactNode, useContext, useMemo } from 'react';
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

    const value: ErrorContextType = useMemo(
        () => ({
            errors,
            showError,
            showWarning,
            showInfo,
            showSuccess,
            dismissError,
            clearAllErrors,
        }),
        [errors, showError, showWarning, showInfo, showSuccess, dismissError, clearAllErrors]
    );

    return (
        <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
    );
};
