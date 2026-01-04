import { SearchInput } from '@/components/common';
import { memo } from 'react';

interface ToolbarFilterRowProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    typeFilter: string;
    onTypeFilterChange: (value: string) => void;
    typeOptions: string[];
    categoryFilter: string;
    onCategoryFilterChange: (value: string) => void;
    categoryOptions: string[];
    showArchived: boolean;
    onShowArchivedChange: (value: boolean) => void;
}

export const ToolbarFilterRow = memo(
    ({
        searchTerm,
        onSearchChange,
        typeFilter,
        onTypeFilterChange,
        typeOptions,
        categoryFilter,
        onCategoryFilterChange,
        categoryOptions,
        showArchived,
        onShowArchivedChange,
    }: ToolbarFilterRowProps) => {
        return (
            <div className="mt-4 flex flex-col md:flex-row gap-3">
                {/* Search Input - Using common component */}
                <SearchInput
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="템플릿 이름/태그 검색..."
                    className="w-full md:w-64"
                    showSearchButton={false}
                />
                <select
                    value={typeFilter}
                    onChange={(e) => onTypeFilterChange(e.target.value)}
                    aria-label="타입 필터"
                    className="w-full md:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {typeOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                    aria-label="카테고리 필터"
                    className="w-full md:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={showArchived}
                        onChange={(e) => onShowArchivedChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    보관 포함
                </label>
            </div>
        );
    }
);

ToolbarFilterRow.displayName = 'ToolbarFilterRow';
