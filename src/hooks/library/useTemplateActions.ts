import { useCallback } from 'react';
import { EvaluationTemplate } from '../../constants';
import { useAsyncOperation } from '../common/useAsyncOperation';
import { useConfirmation } from '../common/useConfirmation';
import { useTemplateArchive } from './useTemplateArchive';
import { useTemplateCrud } from './useTemplateCrud';

interface FirestoreActions {
    addTemplate: (template: Omit<EvaluationTemplate, 'id'>) => Promise<string>;
    updateTemplate: (id: string, data: Partial<EvaluationTemplate>) => Promise<void>;
    deleteTemplate?: (id: string) => Promise<void>;
}

interface UseTemplateActionsProps {
    templates: EvaluationTemplate[];
    editingTemplate: EvaluationTemplate | null;
    setEditingTemplate: React.Dispatch<React.SetStateAction<EvaluationTemplate | null>>;
    setView: React.Dispatch<React.SetStateAction<string>>;
    selectedIds: Set<string | number>;
    deselectAll: () => void;
    setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
    firestoreActions: FirestoreActions;
}

export const useTemplateActions = ({
    templates,
    editingTemplate,
    setEditingTemplate,
    setView,
    selectedIds,
    deselectAll,
    setIsSelectionMode,
    firestoreActions,
}: UseTemplateActionsProps) => {
    const [confirmation, confirmationActions] = useConfirmation();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const [duplicateOperation, duplicateOperationActions] = useAsyncOperation();

    const isBusy = saveOperation.isLoading || deleteOperation.isLoading || duplicateOperation.isLoading;

    const {
        handleSaveTemplate: saveTpl,
        handleEditTemplate,
        handleDuplicateTemplate: dupTpl,
        handleCancel,
    } = useTemplateCrud({ templates, editingTemplate, setEditingTemplate, setView, firestoreActions });
    const {
        handleArchiveTemplate: archiveTpl,
        handleRestoreTemplate,
        handleDeleteTemplate: deleteTpl,
        handleBatchArchive: batchArchive,
        handleRestoreVersion: restoreVer,
    } = useTemplateArchive({ templates, selectedIds, deselectAll, setIsSelectionMode, firestoreActions });

    const handleSaveTemplate = useCallback(
        (data: EvaluationTemplate) => saveTpl(data, saveOperationActions.execute),
        [saveTpl, saveOperationActions.execute]
    );
    const handleDuplicateTemplate = useCallback(
        (id: string | number) => dupTpl(id, duplicateOperationActions.execute),
        [dupTpl, duplicateOperationActions.execute]
    );
    const handleArchiveTemplate = useCallback(
        (
            id: string | number,
            name: string,
            options?: { title?: string; message?: string; confirmButtonText?: string; confirmButtonColor?: string }
        ) => archiveTpl(id, name, confirmationActions, deleteOperationActions.execute, options),
        [archiveTpl, confirmationActions, deleteOperationActions.execute]
    );
    const handleDeleteTemplate = useCallback(
        (id: string | number, name: string) => deleteTpl(id, name, confirmationActions, deleteOperationActions.execute),
        [deleteTpl, confirmationActions, deleteOperationActions.execute]
    );
    const handleBatchArchive = useCallback(
        () => batchArchive(confirmationActions, deleteOperationActions.execute),
        [batchArchive, confirmationActions, deleteOperationActions.execute]
    );
    const handleRestoreVersion = useCallback(
        (id: string | number, version: number, setPreview: (t: any) => void) =>
            restoreVer(id, version, setPreview, confirmationActions),
        [restoreVer, confirmationActions]
    );

    return {
        confirmation,
        confirmationActions,
        isBusy,
        handleSaveTemplate,
        handleEditTemplate,
        handleArchiveTemplate,
        handleRestoreTemplate: (id: string | number, name: string) => handleRestoreTemplate(id, name),
        handleDeleteTemplate,
        handleDuplicateTemplate,
        handleRestoreVersion,
        handleBatchArchive,
        handleCancel,
    };
};
