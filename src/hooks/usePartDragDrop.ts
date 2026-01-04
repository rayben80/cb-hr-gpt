import React, { useCallback, useState } from 'react';

interface UsePartDragDropOptions {
    onDropMember: (memberId: string) => void;
}

/**
 * 파트 섹션의 드래그 앤 드롭 로직을 관리하는 훅
 */
export const usePartDragDrop = ({ onDropMember }: UsePartDragDropOptions) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);
            const memberId = event.dataTransfer.getData('memberId') || event.dataTransfer.getData('text/plain');
            if (!memberId) {
                return;
            }
            onDropMember(memberId);
        },
        [onDropMember]
    );

    return {
        isDragOver,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
    };
};
