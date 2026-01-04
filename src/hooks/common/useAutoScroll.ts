import { useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
    threshold?: number;
    maxSpeed?: number;
}

interface UseAutoScrollReturn {
    handleContainerDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    handleContainerDrop: () => void;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}): UseAutoScrollReturn {
    const { threshold = 200, maxSpeed = 32 } = options;

    const scrollContainerRef = useRef<HTMLElement | null>(null);
    const scrollTimerRef = useRef<number | null>(null);
    const isAutoScrolling = useRef(false);
    const scrollDirection = useRef<'up' | 'down' | null>(null);
    const scrollSpeed = useRef(0);
    const isDraggingRef = useRef(false);

    const stopAutoScroll = useCallback(() => {
        if (scrollTimerRef.current !== null) {
            cancelAnimationFrame(scrollTimerRef.current);
            scrollTimerRef.current = null;
        }
        isAutoScrolling.current = false;
        scrollDirection.current = null;
        scrollSpeed.current = 0;
    }, []);

    const startAutoScroll = useCallback(() => {
        if (isAutoScrolling.current) return;
        isAutoScrolling.current = true;
        const tick = () => {
            if (!scrollContainerRef.current || !scrollDirection.current) {
                stopAutoScroll();
                return;
            }

            const container = scrollContainerRef.current;
            const delta = scrollSpeed.current;
            const maxScroll = container.scrollHeight - container.clientHeight;

            if (scrollDirection.current === 'up') {
                if (container.scrollTop <= 0) {
                    stopAutoScroll();
                    return;
                }
                container.scrollTop = Math.max(0, container.scrollTop - delta);
            } else {
                if (container.scrollTop >= maxScroll) {
                    stopAutoScroll();
                    return;
                }
                container.scrollTop = Math.min(maxScroll, container.scrollTop + delta);
            }

            scrollTimerRef.current = requestAnimationFrame(tick);
        };

        scrollTimerRef.current = requestAnimationFrame(tick);
    }, [stopAutoScroll]);

    const updateAutoScroll = useCallback((clientY: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const viewportTop = 0;
        const viewportBottom = window.innerHeight;
        const visibleTop = Math.max(rect.top, viewportTop);
        const visibleBottom = Math.min(rect.bottom, viewportBottom);

        if (visibleBottom <= visibleTop) {
            stopAutoScroll();
            return;
        }

        const distanceToTop = Math.abs(clientY - visibleTop);
        const distanceToBottom = Math.abs(visibleBottom - clientY);

        const topProximity = distanceToTop <= threshold ? threshold - distanceToTop : 0;
        const bottomProximity = distanceToBottom <= threshold ? threshold - distanceToBottom : 0;

        if (topProximity === 0 && bottomProximity === 0) {
            stopAutoScroll();
            return;
        }

        const nextDirection = topProximity >= bottomProximity ? 'up' : 'down';
        const nextSpeed = topProximity >= bottomProximity
            ? Math.ceil((topProximity / threshold) * maxSpeed)
            : Math.ceil((bottomProximity / threshold) * maxSpeed);

        scrollDirection.current = nextDirection;
        scrollSpeed.current = Math.max(3, nextSpeed);
        startAutoScroll();
    }, [startAutoScroll, stopAutoScroll, threshold, maxSpeed]);

    const handleContainerDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        isDraggingRef.current = true;
        updateAutoScroll(event.clientY);
    }, [updateAutoScroll]);

    const handleContainerDrop = useCallback(() => {
        stopAutoScroll();
    }, [stopAutoScroll]);

    // Initialize scroll container
    useEffect(() => {
        if (scrollContainerRef.current) return;

        const mainElement = document.querySelector('main');
        if (mainElement) {
            scrollContainerRef.current = mainElement as HTMLElement;
            return;
        }

        if (document.scrollingElement) {
            scrollContainerRef.current = document.scrollingElement as HTMLElement;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        return () => {
            if (scrollTimerRef.current !== null) {
                cancelAnimationFrame(scrollTimerRef.current);
                scrollTimerRef.current = null;
            }
        };
    }, []);

    // Global drag event listeners
    useEffect(() => {
        const handleDragStart = () => {
            isDraggingRef.current = true;
        };
        const handleDragOver = (event: DragEvent) => {
            if (!isDraggingRef.current) return;
            updateAutoScroll(event.clientY);
        };
        const handleDragEnd = () => {
            isDraggingRef.current = false;
            stopAutoScroll();
        };

        window.addEventListener('dragstart', handleDragStart);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragend', handleDragEnd);
        window.addEventListener('drop', handleDragEnd);

        return () => {
            window.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragend', handleDragEnd);
            window.removeEventListener('drop', handleDragEnd);
            stopAutoScroll();
        };
    }, [stopAutoScroll, updateAutoScroll]);

    return {
        handleContainerDragOver,
        handleContainerDrop,
    };
}
