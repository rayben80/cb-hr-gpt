import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastTimer } from '../useToastTimer';

describe('useToastTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with progress at 100', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useToastTimer(5000, onClose, 'toast-1'));

        expect(result.current.progress).toBe(100);
    });

    it('should start visible after initial animation delay', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useToastTimer(5000, onClose, 'toast-1'));

        expect(result.current.isVisible).toBe(false);

        act(() => {
            vi.advanceTimersByTime(50);
        });

        expect(result.current.isVisible).toBe(true);
    });

    it('should decrease progress over time', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useToastTimer(5000, onClose, 'toast-1'));

        act(() => {
            vi.advanceTimersByTime(2500);
        });

        // Progress should be around 50% after half the duration
        expect(result.current.progress).toBeLessThan(100);
        expect(result.current.progress).toBeGreaterThan(0);
    });

    it('should call onClose when duration expires', () => {
        const onClose = vi.fn();
        renderHook(() => useToastTimer(5000, onClose, 'toast-1'));

        // Advance past the duration + animation delay
        act(() => {
            vi.advanceTimersByTime(5500);
        });

        expect(onClose).toHaveBeenCalledWith('toast-1');
    });

    it('should not auto-close when duration is 0', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useToastTimer(0, onClose, 'toast-1'));

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        // Should remain at 100% and not close
        expect(result.current.progress).toBe(100);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('should close when handleClose is called', () => {
        const onClose = vi.fn();
        const { result } = renderHook(() => useToastTimer(5000, onClose, 'toast-1'));

        act(() => {
            result.current.handleClose();
        });

        // isVisible should become false
        expect(result.current.isVisible).toBe(false);

        // After animation delay, onClose should be called
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(onClose).toHaveBeenCalledWith('toast-1');
    });
});
