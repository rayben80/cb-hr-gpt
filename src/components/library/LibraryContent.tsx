import { memo } from 'react';
import { EvaluationTemplate } from '../../constants';
import TemplateListView from '../../features/template/TemplateListView';
import { LoadingSpinner } from '../feedback/Progress';
import { StatusCard } from '../feedback/Status';
import { LibraryEmptyState } from './LibraryEmptyState';
import { TemplateGridView } from './TemplateGridView';
import { ViewMode } from './toolbar/ToolbarSecondaryRow';

interface LibraryContentProps {
    isLoading: boolean;
    error: string | null;
    sortedTemplates: EvaluationTemplate[];
    viewMode: ViewMode;
    searchTerm: string;
    typeFilter: string;
    categoryFilter: string;
    showArchived: boolean;
    onCreateTemplate: () => void;
    isBusy: boolean;
    isSelectionMode: boolean;
    selectedIds: Set<string | number>;
    handleEditTemplate: (id: string | number) => void;
    handleArchiveTemplate: (id: string | number, name: string) => void;
    handleRestoreTemplate: (id: string | number, name: string) => void;
    handleDuplicateTemplate: (id: string | number) => void;
    setPreviewTemplate: (template: EvaluationTemplate | null) => void;
    handleLaunch: (id: string | number) => void;
    toggleSelectItem: (id: string | number) => void;
    onSeedMockData?: (() => Promise<void>) | undefined;
    handleDeleteTemplate: (id: string | number, name: string) => void;
}

export const LibraryContent = memo((props: LibraryContentProps) => {
    const {
        isLoading,
        error,
        sortedTemplates,
        viewMode,
        searchTerm,
        typeFilter,
        categoryFilter,
        showArchived,
        onCreateTemplate,
        isBusy,
        isSelectionMode,
        selectedIds,
        handleEditTemplate,
        handleArchiveTemplate,
        handleRestoreTemplate,
        handleDuplicateTemplate,
        setPreviewTemplate,
        handleLaunch,
        toggleSelectItem,
        onSeedMockData,
        handleDeleteTemplate,
    } = props;

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="flex flex-col items-center">
                    <LoadingSpinner size="lg" color="blue" />
                    <p className="text-slate-500 mt-4">템플릿 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <StatusCard
                status="error"
                title="데이터 로드 실패"
                description={error}
                className="max-w-4xl mx-auto my-8"
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
                }
            />
        );
    }

    if (sortedTemplates.length === 0) {
        return (
            <LibraryEmptyState
                searchTerm={searchTerm}
                typeFilter={typeFilter}
                categoryFilter={categoryFilter}
                showArchived={showArchived}
                onCreateTemplate={onCreateTemplate}
                onSeedMockData={onSeedMockData}
            />
        );
    }

    return viewMode === 'grid' ? (
        <TemplateGridView
            templates={sortedTemplates}
            onEdit={handleEditTemplate}
            onArchive={handleArchiveTemplate}
            onRestore={handleRestoreTemplate}
            onDuplicate={handleDuplicateTemplate}
            onPreview={setPreviewTemplate}
            onLaunch={handleLaunch}
            isBusy={isBusy}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectItem}
            onDelete={handleDeleteTemplate}
        />
    ) : (
        <TemplateListView
            templates={sortedTemplates}
            onEdit={handleEditTemplate}
            onArchive={handleArchiveTemplate}
            onRestore={handleRestoreTemplate}
            onDuplicate={handleDuplicateTemplate}
            onPreview={setPreviewTemplate}
            onLaunch={handleLaunch}
            isBusy={isBusy}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectItem}
            onDelete={handleDeleteTemplate}
        />
    );
});

LibraryContent.displayName = 'LibraryContent';
