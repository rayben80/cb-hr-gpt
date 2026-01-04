import { useCallback, useEffect, useRef, useState } from 'react';
import { ErrorInfo } from '../utils/errorUtils';

/** Maximum number of errors to display at once */
const MAX_VISIBLE_ERRORS = 5;

/**
 * Custom hook for managing error state with automatic timeout cleanup.
 * Limits the maximum number of visible errors to prevent UI overflow.
 *
 * @returns Object containing:
 *   - errors: Current array of error info objects
 *   - setErrors: State setter for errors
 *   - dismissError: Function to dismiss a specific error by ID
 *   - clearAllErrors: Function to clear all errors
 *   - timeoutRefs: Ref map for timeout tracking
 *
 * @example
 * const { errors, dismissError, clearAllErrors } = useErrorState();
 */
export const useErrorState = () => {
    const [errors, setErrors] = useState<ErrorInfo[]>([]);
    const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const dismissError = useCallback((id: string) => {
        const timeoutId = timeoutRefs.current.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutRefs.current.delete(id);
        }
        setErrors((prev) => prev.filter((error) => error.id !== id));
    }, []);

    const clearAllErrors = useCallback(() => {
        timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
        timeoutRefs.current.clear();
        setErrors([]);
    }, []);

    useEffect(() => {
        if (errors.length > MAX_VISIBLE_ERRORS) {
            setErrors((prev) => prev.slice(-MAX_VISIBLE_ERRORS));
        }
    }, [errors.length]);

    return { errors, setErrors, dismissError, clearAllErrors, timeoutRefs };
};
