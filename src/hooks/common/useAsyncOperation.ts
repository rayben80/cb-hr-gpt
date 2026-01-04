import { useState, useCallback } from 'react';
import { useError } from '../../contexts/ErrorContext';

export interface AsyncOperationState {
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export interface AsyncOperationActions {
    execute: <T>(
        operation: () => Promise<T>,
        options?: {
            successMessage?: string;
            errorMessage?: string;
            onSuccess?: (result: T) => void;
            onError?: (error: any) => void;
        }
    ) => Promise<T | null>;
    reset: () => void;
    setLoading: (loading: boolean) => void;
}

/**
 * 비동기 작업의 로딩, 에러, 성공 상태를 관리하는 커스텀 훅
 * Firebase 작업이나 API 호출 등에 사용
 */
export const useAsyncOperation = (): [AsyncOperationState, AsyncOperationActions] => {
    const [state, setState] = useState<AsyncOperationState>({
        isLoading: false,
        error: null,
        success: false,
    });

    const { showError, showSuccess } = useError();

    const execute = useCallback(async <T>(
        operation: () => Promise<T>,
        options?: {
            successMessage?: string;
            errorMessage?: string;
            onSuccess?: (result: T) => void;
            onError?: (error: any) => void;
        }
    ): Promise<T | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null, success: false }));

        try {
            const result = await operation();

            setState(prev => ({ ...prev, isLoading: false, success: true }));

            if (options?.successMessage) {
                showSuccess(options.successMessage);
            }

            if (options?.onSuccess) {
                options.onSuccess(result);
            }

            return result;
        } catch (error: any) {
            const errorMessage = options?.errorMessage ||
                error.message ||
                '작업 중 오류가 발생했습니다.';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
                success: false
            }));

            showError('작업 실패', errorMessage);

            if (options?.onError) {
                options.onError(error);
            }

            console.error('Async operation failed:', error);
            return null;
        }
    }, [showError, showSuccess]);

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            success: false,
        });
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const actions: AsyncOperationActions = {
        execute,
        reset,
        setLoading,
    };

    return [state, actions];
};