import { Button, DropdownItem, ExcelDropdownButton, SearchInput, ViewMode, ViewModeToggle } from '@/components/common';
import { SortDropdown, SortOrder } from '@/components/common/SortDropdown';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    Archive,
    CaretDown,
    Check,
    CheckSquare,
    DownloadSimple,
    FileXls,
    FunnelSimple,
    UploadSimple,
    X,
} from '@phosphor-icons/react';
import { memo, RefObject, useMemo, useState } from 'react';

// --- Types ---

export type SortField = 'name' | 'lastUpdated' | 'questions' | 'author';
export type { ViewMode } from '@/components/common';

export interface UnifiedLibraryToolbarProps {
    isBusy: boolean;
    // Search & Filters
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
    // Selection mode
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedCount: number;
    selectableCount: number; // For "Select All" future features
    onSelectAll: () => void; // Placeholder if not used yet
    onDeselectAll: () => void;
    onBatchArchive: () => void;
    onBatchExport: () => void;
    // View mode
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    // Sorting
    sortField: SortField;
    onSortFieldChange: (field: SortField) => void;
    sortOrder: SortOrder;
    onToggleSortOrder: () => void;
    // Import/Export
    fileInputRef: RefObject<HTMLInputElement>;
    onImportClick: () => void;
    onExport: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    canExport: boolean;
    importError: string | null;
    // Actions
    onManageCategories: () => void;
}

// --- Sub-components ---

interface FilterPopoverProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    onManage?: () => void;
    manageLabel?: string;
}

const FilterPopover = memo(({ label, value, options, onChange, onManage, manageLabel }: FilterPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filteredOptions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return options;
        return options.filter((option) => option.toLowerCase().includes(normalized));
    }, [options, query]);
    const isActive = value && value !== '전체';

    const handleSelect = (nextValue: string) => {
        onChange(nextValue);
        setOpen(false);
        setQuery('');
    };

    const handleManage = () => {
        if (onManage) {
            onManage();
            setOpen(false);
            setQuery('');
        }
    };

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) setQuery('');
            }}
        >
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'inline-flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-all ring-1',
                        isActive
                            ? 'bg-primary/10 text-primary ring-primary/30'
                            : 'bg-white text-slate-600 ring-slate-200 hover:ring-primary/20 hover:bg-slate-50'
                    )}
                    aria-label={`${label} 필터`}
                >
                    <FunnelSimple className="w-4 h-4" weight={isActive ? 'fill' : 'regular'} />
                    <span className="max-w-[120px] truncate">
                        {label}: {value || '전체'}
                    </span>
                    <CaretDown className="w-3.5 h-3.5 opacity-50" weight="regular" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2" align="start">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`${label} 검색...`}
                    className="h-9 text-sm rounded-md px-3 mb-2"
                />
                <div className="max-h-60 overflow-auto space-y-1">
                    {filteredOptions.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-slate-500 text-center">검색 결과가 없습니다.</div>
                    ) : (
                        filteredOptions.map((option) => {
                            const isSelected = option === value;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
                                        isSelected
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    )}
                                >
                                    <span>{option}</span>
                                    {isSelected && <Check className="w-4 h-4" weight="bold" />}
                                </button>
                            );
                        })
                    )}
                </div>
                {onManage && (
                    <button
                        type="button"
                        onClick={handleManage}
                        className="mt-2 w-full border-t border-border/60 pt-2 text-sm text-slate-500 hover:text-primary transition-colors text-left px-1"
                    >
                        {manageLabel ?? `${label} 관리...`}
                    </button>
                )}
            </PopoverContent>
        </Popover>
    );
});
FilterPopover.displayName = 'FilterPopover';

const ToggleChip = memo(
    ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) => (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                'inline-flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-all ring-1',
                checked
                    ? 'bg-primary/10 text-primary ring-primary/30'
                    : 'bg-white text-slate-600 ring-slate-200 hover:ring-primary/20 hover:bg-slate-50'
            )}
            aria-pressed={checked ? 'true' : 'false'}
        >
            <CheckSquare className="w-4 h-4" weight={checked ? 'fill' : 'regular'} />
            {label}
        </button>
    )
);
ToggleChip.displayName = 'ToggleChip';

const SORT_OPTIONS = [
    { value: 'name' as const, label: '이름순' },
    { value: 'lastUpdated' as const, label: '수정일순' },
    { value: 'questions' as const, label: '항목수순' },
    { value: 'author' as const, label: '작성자순' },
];

// --- Contextual Action Bar ---

const ContextualActionBar = memo((props: UnifiedLibraryToolbarProps) => {
    const { selectedCount, onBatchExport, onBatchArchive, onDeselectAll, onToggleSelectionMode, isBusy } = props;

    const handleCancel = () => {
        onDeselectAll();
        onToggleSelectionMode();
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-lg">
                    <CheckSquare size={20} weight="fill" />
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-800">{selectedCount}개 선택됨</div>
                    <div className="text-xs text-slate-500">일괄 작업을 수행할 수 있습니다.</div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    className="h-10 bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    onClick={onBatchExport}
                    disabled={selectedCount === 0}
                >
                    <FileXls className="w-4 h-4 mr-2 text-green-600" weight="fill" />
                    Excel 내보내기
                </Button>
                <Button
                    variant="outline"
                    className="h-10 bg-white hover:bg-red-50 border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200"
                    onClick={onBatchArchive}
                    disabled={selectedCount === 0 || isBusy}
                >
                    <Archive className="w-4 h-4 mr-2" weight="regular" />
                    보관
                </Button>
                <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />
                <Button variant="ghost" className="h-10 text-slate-500 hover:text-slate-800" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" weight="regular" />
                    취소
                </Button>
            </div>
        </div>
    );
});
ContextualActionBar.displayName = 'ContextualActionBar';

// --- Default Nav Bar ---

const DefaultNavBar = memo((props: UnifiedLibraryToolbarProps) => {
    const {
        searchTerm,
        onSearchChange,
        typeFilter,
        onTypeFilterChange,
        typeOptions,
        categoryFilter,
        onCategoryFilterChange,
        categoryOptions,
        onManageCategories,
        showArchived,
        onShowArchivedChange,
        sortField,
        onSortFieldChange,
        sortOrder,
        onToggleSortOrder,
        viewMode,
        onViewModeChange,
        isBusy,
        canExport,
        onImportClick,
        onExport,
    } = props;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Top Row: Search & Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <SearchInput
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder="템플릿 이름, 태그 검색..."
                    className="w-full xl:flex-1 h-10"
                    showSearchButton={false}
                />

                <div className="flex flex-wrap items-center gap-2">
                    <FilterPopover
                        label="유형"
                        value={typeFilter}
                        options={typeOptions}
                        onChange={onTypeFilterChange}
                    />
                    <FilterPopover
                        label="카테고리"
                        value={categoryFilter}
                        options={categoryOptions}
                        onChange={onCategoryFilterChange}
                        onManage={onManageCategories}
                        manageLabel="카테고리 관리"
                    />
                    <ToggleChip label="보관된 항목" checked={showArchived} onChange={onShowArchivedChange} />
                </div>
            </div>

            {/* Bottom Row: View Options & Global Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <SortDropdown
                        options={SORT_OPTIONS}
                        value={sortField}
                        onChange={onSortFieldChange}
                        sortOrder={sortOrder}
                        onSortOrderChange={(order) => {
                            if (order !== sortOrder) onToggleSortOrder();
                        }}
                    />
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} useTableMode />
                </div>

                <div className="flex items-center gap-2">
                    <ExcelDropdownButton>
                        <DropdownItem onClick={onImportClick} disabled={isBusy}>
                            <UploadSimple className="w-4 h-4 mr-2" />
                            가져오기 (Import)
                        </DropdownItem>
                        <DropdownItem onClick={onExport} disabled={isBusy || !canExport}>
                            <DownloadSimple className="w-4 h-4 mr-2" />
                            내보내기 (Export)
                        </DropdownItem>
                    </ExcelDropdownButton>
                </div>
            </div>
        </div>
    );
});
DefaultNavBar.displayName = 'DefaultNavBar';

// --- Main Component ---

export const UnifiedLibraryToolbar = memo((props: UnifiedLibraryToolbarProps) => {
    const { isSelectionMode, fileInputRef, onFileChange, importError } = props;

    return (
        <div
            className={cn(
                'rounded-xl p-4 shadow-sm transition-all duration-300 border',
                isSelectionMode ? 'bg-primary/5 border-primary/20 shadow-md' : 'bg-white border-slate-200/60'
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onFileChange}
                aria-label="파일 선택"
            />

            {isSelectionMode ? <ContextualActionBar {...props} /> : <DefaultNavBar {...props} />}

            {importError && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg flex items-center animate-in slide-in-from-top-1">
                    <X className="w-4 h-4 mr-2" />
                    {importError}
                </div>
            )}
        </div>
    );
});

UnifiedLibraryToolbar.displayName = 'UnifiedLibraryToolbar';
