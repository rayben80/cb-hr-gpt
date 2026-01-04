import { memo, RefObject } from 'react';
import { EvaluationTemplate } from '../../constants';
import { LibraryContent } from './LibraryContent';
import { LibraryToolbar } from './LibraryToolbar';
import { SortField, SortOrder, ViewMode } from './toolbar/ToolbarSecondaryRow';

interface LibraryListModeProps {
    // Toolbar Props
    onCreateNew: () => void;
    isBusy: boolean;
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
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedCount: number;
    selectableCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBatchArchive: () => void;
    onBatchExport: () => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortField: SortField;
    onSortFieldChange: (field: SortField) => void;
    sortOrder: SortOrder;
    onToggleSortOrder: () => void;
    fileInputRef: RefObject<HTMLInputElement>;
    onImportClick: () => void;
    onExport: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    canExport: boolean;
    importError: string | null;

    // Data & State
    isLoading: boolean;
    error: string | null;
    sortedTemplates: EvaluationTemplate[];

    // Actions
    handleEditTemplate: (id: string | number) => void;
    handleArchiveTemplate: (id: string | number, name: string) => void;
    handleRestoreTemplate: (id: string | number, name: string) => void;
    handleDuplicateTemplate: (id: string | number) => void;
    setPreviewTemplate: (template: EvaluationTemplate | null) => void;
    handleToggleFavorite: (id: string | number) => void;
    toggleSelectItem: (id: string | number) => void;
    selectedIds: Set<string | number>;

    // Empty State Helpers
    onCreateTemplate: () => void;
}

export const LibraryListMode = memo((props: LibraryListModeProps) => {
    return (
        <>
            <LibraryToolbar {...props} />
            <LibraryContent
                isLoading={props.isLoading}
                error={props.error}
                sortedTemplates={props.sortedTemplates}
                viewMode={props.viewMode}
                searchTerm={props.searchTerm}
                typeFilter={props.typeFilter}
                categoryFilter={props.categoryFilter}
                showArchived={props.showArchived}
                onCreateTemplate={props.onCreateTemplate}
                isBusy={props.isBusy}
                isSelectionMode={props.isSelectionMode}
                selectedIds={props.selectedIds}
                handleEditTemplate={props.handleEditTemplate}
                handleArchiveTemplate={props.handleArchiveTemplate}
                handleRestoreTemplate={props.handleRestoreTemplate}
                handleDuplicateTemplate={props.handleDuplicateTemplate}
                setPreviewTemplate={props.setPreviewTemplate}
                handleToggleFavorite={props.handleToggleFavorite}
                toggleSelectItem={props.toggleSelectItem}
            />
        </>
    );
});

LibraryListMode.displayName = 'LibraryListMode';
