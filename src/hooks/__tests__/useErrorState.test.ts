import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useErrorState } from '../useErrorState';

describe('useErrorState', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with empty errors array', () => {
        const { result } = renderHook(() => useErrorState());

        expect(result.current.errors).toEqual([]);
    });

    it('should add errors via setErrors', () => {
        const { result } = renderHook(() => useErrorState());

        act(() => {
            result.current.setErrors([{ id: '1', message: 'Error 1', type: 'error', timestamp: Date.now() }]);
        });

        expect(result.current.errors).toHaveLength(1);
        expect(result.current.errors[0].message).toBe('Error 1');
    });

    it('should dismiss a specific error by ID', () => {
        const { result } = renderHook(() => useErrorState());

        act(() => {
            result.current.setErrors([
                { id: '1', message: 'Error 1', type: 'error', timestamp: Date.now() },
                { id: '2', message: 'Error 2', type: 'error', timestamp: Date.now() },
            ]);
        });

        act(() => {
            result.current.dismissError('1');
        });

        expect(result.current.errors).toHaveLength(1);
        expect(result.current.errors[0].id).toBe('2');
    });

    it('should clear all errors', () => {
        const { result } = renderHook(() => useErrorState());

        act(() => {
            result.current.setErrors([
                { id: '1', message: 'Error 1', type: 'error', timestamp: Date.now() },
                { id: '2', message: 'Error 2', type: 'error', timestamp: Date.now() },
                { id: '3', message: 'Error 3', type: 'error', timestamp: Date.now() },
            ]);
        });

        act(() => {
            result.current.clearAllErrors();
        });

        expect(result.current.errors).toEqual([]);
    });

    it('should limit errors to MAX_VISIBLE_ERRORS (5)', () => {
        const { result } = renderHook(() => useErrorState());

        act(() => {
            result.current.setErrors([
                { id: '1', message: 'Error 1', type: 'error', timestamp: Date.now() },
                { id: '2', message: 'Error 2', type: 'error', timestamp: Date.now() },
                { id: '3', message: 'Error 3', type: 'error', timestamp: Date.now() },
                { id: '4', message: 'Error 4', type: 'error', timestamp: Date.now() },
                { id: '5', message: 'Error 5', type: 'error', timestamp: Date.now() },
                { id: '6', message: 'Error 6', type: 'error', timestamp: Date.now() },
                { id: '7', message: 'Error 7', type: 'error', timestamp: Date.now() },
            ]);
        });

        // After setting 7 errors, useEffect should trim to last 5
        expect(result.current.errors).toHaveLength(5);
        expect(result.current.errors[0].id).toBe('3'); // oldest removed, newest kept
    });
});
