import { Plus } from '@phosphor-icons/react';
import { memo, RefObject } from 'react';
import { EvaluationTemplate } from '../../constants';
import { Button, PageHeader } from '../common';
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
    toggleSelectItem: (id: string | number) => void;
    selectedIds: Set<string | number>;

    onCreateTemplate: () => void;
    handleLaunch: (id: string | number) => void;
    seedMockData?: () => Promise<void>;
    handleDeleteTemplate: (id: string | number, name: string) => void;
}

export const LibraryListMode = memo((props: LibraryListModeProps) => {
    return (
        <>
            <PageHeader
                title="평가 템플릿"
                description="평가에 사용할 템플릿을 관리하세요."
                action={
                    <Button variant="default" onClick={props.onCreateNew} disabled={props.isBusy}>
                        <Plus className="w-5 h-5 mr-2" weight="bold" />
                        {props.isBusy ? '생성 중...' : '새 템플릿 생성'}
                    </Button>
                }
            />
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
                handleLaunch={props.handleLaunch}
                toggleSelectItem={props.toggleSelectItem}
                onSeedMockData={props.seedMockData}
                handleDeleteTemplate={props.handleDeleteTemplate}
            />
        </>
    );
});

LibraryListMode.displayName = 'LibraryListMode';
