import { cn } from '@/lib/utils';
import { CaretDown, SortAscending, SortDescending } from '@phosphor-icons/react';
import React, { memo, useEffect, useRef, useState } from 'react';

export type SortOrder = 'asc' | 'desc';

interface SortOption<T extends string = string> {
    value: T;
    label: string;
}

interface SortDropdownProps<T extends string = string> {
    options: SortOption<T>[];
    value: T;
    onChange: (value: T) => void;
    sortOrder?: SortOrder;
    onSortOrderChange?: (order: SortOrder) => void;
    className?: string;
}

/**
 * 통합 정렬 드롭다운 컴포넌트
 * 정렬 순서 아이콘이 버튼 내부에 포함된 일관된 UI 제공
 */
export const SortDropdown = memo(
    <T extends string = string>({
        options,
        value,
        onChange,
        sortOrder = 'asc',
        onSortOrderChange,
        className,
    }: SortDropdownProps<T>) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const currentOption = options.find((opt) => opt.value === value);

        // Close dropdown on outside click
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleOptionClick = (optionValue: T) => {
            onChange(optionValue);
            setIsOpen(false);
        };

        const toggleSortOrder = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent dropdown from opening
            if (onSortOrderChange) {
                onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
            }
        };

        const SortIcon = sortOrder === 'asc' ? SortAscending : SortDescending;

        return (
            <div className={cn('relative', className)} ref={dropdownRef}>
                {/* Dropdown Button - with sort icon inside */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 h-12 px-4 text-sm font-medium bg-secondary/50 rounded-xl shadow-sm ring-1 ring-border/30 hover:ring-primary/30 hover:text-primary transition-all group whitespace-nowrap min-w-[110px]"
                >
                    {/* Sort order icon - clickable to toggle */}
                    {onSortOrderChange && (
                        <span
                            onClick={toggleSortOrder}
                            className="text-muted-foreground group-hover:text-primary cursor-pointer"
                            title={sortOrder === 'asc' ? '오름차순 (클릭하여 변경)' : '내림차순 (클릭하여 변경)'}
                        >
                            <SortIcon className="w-4 h-4" weight="regular" />
                        </span>
                    )}
                    <span>{currentOption?.label || '정렬'}</span>
                    <CaretDown
                        className={cn(
                            'w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-transform',
                            isOpen && 'rotate-180'
                        )}
                        weight="regular"
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 z-10 bg-popover border border-border rounded-lg shadow-lg py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleOptionClick(option.value as T)}
                                className={cn(
                                    'w-full text-left px-3 py-2 text-sm transition-colors',
                                    value === option.value
                                        ? 'text-primary bg-primary/10 font-bold'
                                        : 'text-foreground hover:bg-muted'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
) as <T extends string = string>(props: SortDropdownProps<T>) => React.ReactElement;

(SortDropdown as React.FC).displayName = 'SortDropdown';
