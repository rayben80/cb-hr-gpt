import { useCallback, useState } from 'react';
import { EvaluationTemplate, initialLibraryData } from '../../constants';
// It's better to import from specific files to avoid circular dependency issues if any
import { useFirestoreTemplates } from './useFirestoreTemplates';
import { useTemplateActions } from './useTemplateActions';
import { useTemplateSelection } from './useTemplateSelection';

export const useTemplateManagement = () => {
    const [view, setView] = useState('list');
    // Removed local state initialization since we fetch from Firestore
    // const [templates, setTemplates] = useState<EvaluationTemplate[]>(initialLibraryData);
    const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);

    // Use extracted hooks
    const { templates, loading: isLoading, addTemplate, updateTemplate, deleteTemplate } = useFirestoreTemplates();
    const selection = useTemplateSelection();

    // Create firestoreActions object to pass down
    const firestoreActions = {
        addTemplate,
        updateTemplate,
        deleteTemplate,
    };

    const actions = useTemplateActions({
        templates,
        editingTemplate,
        setEditingTemplate,
        setView,
        selectedIds: selection.selectedIds,
        deselectAll: selection.deselectAll,
        setIsSelectionMode: selection.setIsSelectionMode,
        firestoreActions, // Pass firestoreActions
    });

    // ... (useEffect remains same)

    return {
        view,
        setView,
        templates,
        // setTemplates, // Removed
        addTemplate, // Exporting for useImportExport etc.
        updateTemplate, // Exporting for useImportExport etc.
        editingTemplate,
        setEditingTemplate,

        // Selection State & Handlers
        selectedIds: selection.selectedIds,
        isSelectionMode: selection.isSelectionMode,
        toggleSelectionMode: selection.toggleSelectionMode,
        toggleSelectItem: selection.toggleSelectItem,
        selectAll: selection.selectAll,
        deselectAll: selection.deselectAll,

        // Actions
        confirmation: actions.confirmation,
        confirmationActions: actions.confirmationActions,
        isBusy: actions.isBusy,
        isLoading,
        error: null,

        handleSaveTemplate: actions.handleSaveTemplate,
        handleEditTemplate: actions.handleEditTemplate,
        handleArchiveTemplate: actions.handleArchiveTemplate,
        handleRestoreTemplate: actions.handleRestoreTemplate,
        handleDeleteTemplate: actions.handleDeleteTemplate, // New Action
        handleDuplicateTemplate: actions.handleDuplicateTemplate,
        handleRestoreVersion: actions.handleRestoreVersion,
        handleBatchArchive: actions.handleBatchArchive,
        handleCancel: actions.handleCancel,

        // Seed Mock Data
        seedMockData: useCallback(async () => {
            for (const template of initialLibraryData) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: _id, ...rest } = template;
                await addTemplate({ ...rest, lastUpdated: new Date().toISOString().split('T')[0] });
            }
        }, [addTemplate]),
    };
};
