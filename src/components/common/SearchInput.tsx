import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import React, { memo, useCallback } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    showClearButton?: boolean;
    /** 검색 버튼 표시 여부 */
    showSearchButton?: boolean;
    onSearch?: () => void;
}

/**
 * 통합 검색 입력 컴포넌트
 * 일관된 검색 UI를 제공하며 클리어 버튼과 선택적 검색 버튼을 지원
 */
export const SearchInput: React.FC<SearchInputProps> = memo(
    ({
        value,
        onChange,
        placeholder = '검색...',
        className,
        showClearButton = true,
        showSearchButton = false,
        onSearch,
    }) => {
        const handleClear = useCallback(() => {
            onChange('');
        }, [onChange]);

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && onSearch) {
                    onSearch();
                }
            },
            [onSearch]
        );

        return (
            <div className={cn('flex gap-2', className)}>
                <div className="relative flex-1">
                    <MagnifyingGlass
                        className="w-5 h-5 text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none"
                        weight="regular"
                    />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-12 pr-10"
                    />
                    {showClearButton && value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="검색어 지우기"
                        >
                            <X className="w-5 h-5" weight="regular" />
                        </button>
                    )}
                </div>
                {showSearchButton && (
                    <button
                        type="button"
                        onClick={onSearch}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors shrink-0"
                    >
                        검색
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';
