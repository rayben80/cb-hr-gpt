import { Button } from '@/components/ui/button';
import { Plus } from '@phosphor-icons/react';
import { memo, RefObject } from 'react';
import { ToolbarFilterRow } from './toolbar/ToolbarFilterRow';
import { SortField, SortOrder, ToolbarSecondaryRow, ViewMode } from './toolbar/ToolbarSecondaryRow';

interface LibraryToolbarProps {
    // Header
    onCreateNew: () => void;
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
    selectableCount: number;
    onSelectAll: () => void;
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
}

export const LibraryToolbar = memo(
    ({
        onCreateNew,
        isBusy,
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
        isSelectionMode,
        onToggleSelectionMode,
        selectedCount,
        selectableCount,
        onSelectAll,
        onDeselectAll,
        onBatchArchive,
        onBatchExport,
        viewMode,
        onViewModeChange,
        sortField,
        onSortFieldChange,
        sortOrder,
        onToggleSortOrder,
        fileInputRef,
        onImportClick,
        onExport,
        onFileChange,
        canExport,
        importError,
    }: LibraryToolbarProps) => (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">템플릿 목록</h2>
                    <p className="text-slate-600 mt-1">평가에 사용할 템플릿을 관리하세요</p>
                </div>
                <Button onClick={onCreateNew} isLoading={isBusy} variant="default" className="mobile-button">
                    {!isBusy && <Plus className="w-5 h-5 mr-2" weight="bold" />}새 템플릿 생성
                </Button>
            </div>

            <ToolbarFilterRow
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                typeFilter={typeFilter}
                onTypeFilterChange={onTypeFilterChange}
                typeOptions={typeOptions}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={onCategoryFilterChange}
                categoryOptions={categoryOptions}
                showArchived={showArchived}
                onShowArchivedChange={onShowArchivedChange}
            />

            <ToolbarSecondaryRow
                fileInputRef={fileInputRef}
                onFileChange={onFileChange}
                isSelectionMode={isSelectionMode}
                onToggleSelectionMode={onToggleSelectionMode}
                selectedCount={selectedCount}
                selectableCount={selectableCount}
                onSelectAll={onSelectAll}
                onDeselectAll={onDeselectAll}
                onBatchArchive={onBatchArchive}
                onBatchExport={onBatchExport}
                isBusy={isBusy}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                sortField={sortField}
                onSortFieldChange={onSortFieldChange}
                sortOrder={sortOrder}
                onToggleSortOrder={onToggleSortOrder}
                onImportClick={onImportClick}
                onExport={onExport}
                canExport={canExport}
                importError={importError}
            />
        </div>
    )
);

LibraryToolbar.displayName = 'LibraryToolbar';
