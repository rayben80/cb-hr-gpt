import { cn } from '@/lib/utils';
import { List, SquaresFour } from '@phosphor-icons/react';
import React, { memo } from 'react';

export type ViewMode = 'grid' | 'list' | 'table';

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    className?: string;
    /** Whether to use 'table' instead of 'list' when toggling to list view */
    useTableMode?: boolean;
}

/**
 * 통합 뷰 모드 토글 컴포넌트
 * 그리드/리스트 뷰 전환을 위한 일관된 UI 제공
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = memo(
    ({ viewMode, onViewModeChange, className, useTableMode = false }) => {
        const baseButtonClass = 'flex items-center justify-center w-9 h-9 rounded-md transition-all';
        const activeClass = 'bg-background text-primary shadow-sm ring-1 ring-primary/20';
        const inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-background/50';

        // Treat 'table' as list for display purposes
        const isListActive = viewMode === 'list' || viewMode === 'table';
        const listMode = useTableMode ? 'table' : 'list';

        return (
            <div className={cn('flex items-center gap-1 bg-muted rounded-lg p-1 border border-border', className)}>
                <button
                    type="button"
                    onClick={() => onViewModeChange('grid')}
                    className={cn(baseButtonClass, viewMode === 'grid' ? activeClass : inactiveClass)}
                    title="그리드 뷰"
                    aria-label="그리드 뷰"
                    aria-pressed={viewMode === 'grid' ? 'true' : 'false'}
                >
                    <SquaresFour className="w-5 h-5" weight="regular" />
                </button>
                <button
                    type="button"
                    onClick={() => onViewModeChange(listMode)}
                    className={cn(baseButtonClass, isListActive ? activeClass : inactiveClass)}
                    title="리스트 뷰"
                    aria-label="리스트 뷰"
                    aria-pressed={isListActive ? 'true' : 'false'}
                >
                    <List className="w-5 h-5" weight="regular" />
                </button>
            </div>
        );
    }
);

ViewModeToggle.displayName = 'ViewModeToggle';
