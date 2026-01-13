import { SearchInput } from '@/components/common';
import { memo, useState } from 'react';
import { CategoryManagementModal } from '../../../features/settings/CategoryManagementModal';

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
    compact?: boolean;
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
        compact = false,
    }: ToolbarFilterRowProps) => {
        const [showCategoryModal, setShowCategoryModal] = useState(false);
        const manageCategoryValue = '__manage_category__';

        return (
            <>
                <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${compact ? '' : 'mt-4'}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-1 min-w-0">
                        <SearchInput
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder="템플릿 검색 (이름/태그)"
                            className="w-full min-w-[220px] md:flex-1"
                            showSearchButton={false}
                        />
                        <select
                            value={typeFilter}
                            onChange={(e) => onTypeFilterChange(e.target.value)}
                            aria-label="평가 유형 필터"
                            className="w-full md:w-44 h-12 rounded-xl bg-secondary/50 px-4 text-base text-slate-700 shadow-sm ring-1 ring-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:bg-background"
                        >
                            {typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === '전체' ? '평가 유형: 전체' : option}
                                </option>
                            ))}
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                const nextValue = e.target.value;
                                if (nextValue === manageCategoryValue) {
                                    setShowCategoryModal(true);
                                    return;
                                }
                                onCategoryFilterChange(nextValue);
                            }}
                            aria-label="카테고리 필터"
                            className="w-full md:w-56 h-12 rounded-xl bg-secondary/50 px-4 text-base text-slate-700 shadow-sm ring-1 ring-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:bg-background"
                        >
                            {categoryOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option === '전체' ? '카테고리: 전체' : option}
                                </option>
                            ))}
                            <option disabled value="__divider__">
                                --------------
                            </option>
                            <option value={manageCategoryValue}>카테고리 관리...</option>
                        </select>
                    </div>
                    <label className="inline-flex items-center gap-2 h-12 rounded-xl bg-secondary/50 px-4 text-sm text-slate-600 shadow-sm ring-1 ring-border/30 md:ml-4">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => onShowArchivedChange(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        보관 포함
                    </label>
                </div>
                <CategoryManagementModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
            </>
        );
    }
);

ToolbarFilterRow.displayName = 'ToolbarFilterRow';
