import React, { memo } from 'react';
import { LibraryListMode } from '../../components/library/LibraryListMode';
import TemplateEditor from '../../features/template/TemplateEditor';
import { useEvaluationLibrary } from '../../hooks/library/useEvaluationLibrary';
import { LibraryModals } from './LibraryModals';

type LibraryLogic = ReturnType<typeof useEvaluationLibrary>;

const LibraryViews: React.FC<LibraryLogic> = memo((props) => {
    const {
        view,

        editingTemplate,
        templates,
        handleCreateNew,
        isBusy,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        typeOptions,
        categoryFilter,
        setCategoryFilter,
        categoryOptions,
        showArchived,
        setShowArchived,
        isSelectionMode,
        toggleSelectionMode,
        selectedIds,
        sortedTemplates,
        handleSelectAll,
        deselectAll,
        handleBatchArchive,
        handleBatchExportAction,
        listViewMode,
        setListViewMode,
        sortField,
        setSortField,
        sortOrder,
        toggleSortOrder,
        fileInputRef,
        handleImportClick,
        handleExport,
        handleFileChange,
        importError,
        isLoading,
        error,
        handleEditTemplate,
        handleArchiveTemplate,
        handleRestoreTemplate,
        handleDuplicateTemplate,
        setPreviewTemplate,
        handleToggleFavorite,
        toggleSelectItem,
        handleSaveTemplate,
        handleCancel,
        handleSelectBlank,
        handleSelectPreset,
        handleRestoreVersion,
        previewTemplate,
        showStartModal,
        setShowStartModal,
        confirmation,
        confirmationActions,
    } = props;

    return (
        <div className="space-y-6">
            {view === 'list' && (
                <LibraryListMode
                    onCreateNew={handleCreateNew}
                    isBusy={isBusy}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    typeFilter={typeFilter}
                    onTypeFilterChange={setTypeFilter}
                    typeOptions={typeOptions}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    categoryOptions={categoryOptions}
                    showArchived={showArchived}
                    onShowArchivedChange={setShowArchived}
                    isSelectionMode={isSelectionMode}
                    onToggleSelectionMode={toggleSelectionMode}
                    selectedCount={selectedIds.size}
                    selectableCount={sortedTemplates.length}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={deselectAll}
                    onBatchArchive={handleBatchArchive}
                    onBatchExport={handleBatchExportAction}
                    viewMode={listViewMode}
                    onViewModeChange={setListViewMode}
                    sortField={sortField}
                    onSortFieldChange={setSortField}
                    sortOrder={sortOrder}
                    onToggleSortOrder={toggleSortOrder}
                    fileInputRef={fileInputRef}
                    onImportClick={handleImportClick}
                    onExport={() => handleExport(sortedTemplates)}
                    onFileChange={handleFileChange}
                    canExport={sortedTemplates.length > 0}
                    importError={importError}
                    isLoading={isLoading}
                    error={error}
                    sortedTemplates={sortedTemplates}
                    handleEditTemplate={handleEditTemplate}
                    handleArchiveTemplate={handleArchiveTemplate}
                    handleRestoreTemplate={handleRestoreTemplate}
                    handleDuplicateTemplate={handleDuplicateTemplate}
                    setPreviewTemplate={setPreviewTemplate}
                    handleToggleFavorite={handleToggleFavorite}
                    toggleSelectItem={toggleSelectItem}
                    selectedIds={selectedIds}
                    onCreateTemplate={handleCreateNew}
                />
            )}
            {view === 'editor' && (
                <TemplateEditor
                    initialTemplate={
                        editingTemplate?.id === 0 ? ({ ...editingTemplate, id: undefined } as any) : editingTemplate
                    }
                    onSave={handleSaveTemplate}
                    onCancel={handleCancel}
                    categoryOptions={categoryOptions}
                    onToggleFavorite={() => editingTemplate && handleToggleFavorite(editingTemplate.id)}
                    onArchive={() => editingTemplate && handleArchiveTemplate(editingTemplate.id, editingTemplate.name)}
                    onRestore={() => editingTemplate && handleRestoreTemplate(editingTemplate.id, editingTemplate.name)}
                    isFavorite={!!editingTemplate?.favorite}
                    isArchived={!!editingTemplate?.archived}
                    existingTemplates={templates}
                />
            )}
            <LibraryModals
                previewTemplate={previewTemplate}
                showStartModal={showStartModal}
                confirmation={confirmation}
                confirmationActions={confirmationActions}
                handleEditTemplate={handleEditTemplate}
                handleDuplicateTemplate={handleDuplicateTemplate}
                handleRestoreVersion={handleRestoreVersion}
                setPreviewTemplate={setPreviewTemplate}
                setShowStartModal={setShowStartModal}
                handleSelectBlank={handleSelectBlank}
                handleSelectPreset={handleSelectPreset}
            />
        </div>
    );
});

LibraryViews.displayName = 'LibraryViews';
export default LibraryViews;
