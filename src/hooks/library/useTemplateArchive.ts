import { useCallback } from 'react';
import { EvaluationTemplate, currentUser } from '../../constants';

interface FirestoreActions {
    updateTemplate: (id: string, data: Partial<EvaluationTemplate>) => Promise<void>;
}

interface UseTemplateArchiveProps {
    templates: EvaluationTemplate[];
    selectedIds: Set<string | number>;
    deselectAll: () => void;
    setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
    firestoreActions: FirestoreActions;
}

export const useTemplateArchive = ({
    templates,
    selectedIds,
    deselectAll,
    setIsSelectionMode,
    firestoreActions,
}: UseTemplateArchiveProps) => {
    const handleArchiveTemplate = useCallback(
        (templateId: string | number, templateName: string, confirmationActions: any, deleteOperationExecute: any) => {
            executeArchiveTemplate(
                templateId,
                templateName,
                confirmationActions,
                deleteOperationExecute,
                firestoreActions
            );
        },
        [firestoreActions]
    );

    const handleRestoreTemplate = useCallback(
        async (templateId: string | number, _templateName?: string) => {
            await firestoreActions.updateTemplate(templateId as string, { archived: false });
        },
        [firestoreActions]
    );

    const handleToggleFavorite = useCallback(
        async (templateId: string | number) => {
            const template = templates.find((t) => t.id === templateId);
            if (template) {
                await firestoreActions.updateTemplate(templateId as string, { favorite: !template.favorite });
            }
        },
        [templates, firestoreActions]
    );

    const handleBatchArchive = useCallback(
        (confirmationActions: any, deleteOperationExecute: any) => {
            executeBatchArchive({
                selectedIds,
                confirmationActions,
                deleteOperationExecute,
                deselectAll,
                setIsSelectionMode,
                firestoreActions,
            });
        },
        [selectedIds, deselectAll, setIsSelectionMode, firestoreActions]
    );

    const handleRestoreVersion = useCallback(
        (
            templateId: string | number,
            version: number,
            setPreviewTemplate: (t: any) => void,
            confirmationActions: any
        ) => {
            executeRestoreVersion({
                templateId,
                version,
                templates,
                setPreviewTemplate,
                confirmationActions,
                firestoreActions,
            });
        },
        [templates, firestoreActions]
    );

    return {
        handleArchiveTemplate,
        handleRestoreTemplate,
        handleToggleFavorite,
        handleBatchArchive,
        handleRestoreVersion,
    };
};

function executeArchiveTemplate(
    templateId: string | number,
    templateName: string,
    confirmationActions: any,
    deleteOperationExecute: any,
    firestoreActions: FirestoreActions
) {
    confirmationActions.showConfirmation({
        title: '템플릿 보관',
        message: `'${templateName}' 템플릿을 보관하시겠습니까? 보관된 템플릿은 목록에서 숨겨집니다.`,
        confirmButtonText: '보관',
        confirmButtonColor: 'destructive',
        onConfirm: async () => {
            await deleteOperationExecute(
                async () => {
                    await firestoreActions.updateTemplate(templateId as string, { archived: true, favorite: false });
                    return 'success';
                },
                {
                    successMessage: '템플릿이 보관되었습니다.',
                    errorMessage: '템플릿 보관 중 오류가 발생했습니다.',
                }
            );
        },
    });
}

interface BatchArchiveParams {
    selectedIds: Set<string | number>;
    confirmationActions: any;
    deleteOperationExecute: any;
    deselectAll: () => void;
    setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
    firestoreActions: FirestoreActions;
}

function executeBatchArchive({
    selectedIds,
    confirmationActions,
    deleteOperationExecute,
    deselectAll,
    setIsSelectionMode,
    firestoreActions,
}: BatchArchiveParams) {
    if (selectedIds.size === 0) return;
    confirmationActions.showConfirmation({
        title: '템플릿 일괄 보관',
        message: `선택한 ${selectedIds.size}개의 템플릿을 보관하시겠습니까?`,
        confirmButtonText: '보관',
        confirmButtonColor: 'destructive',
        onConfirm: async () => {
            await deleteOperationExecute(
                async () => {
                    const promises = Array.from(selectedIds).map((id) =>
                        firestoreActions.updateTemplate(id as string, { archived: true, favorite: false })
                    );
                    await Promise.all(promises);
                    deselectAll();
                    setIsSelectionMode(false);
                    return 'success';
                },
                {
                    successMessage: `${selectedIds.size}개의 템플릿이 보관되었습니다.`,
                    errorMessage: '템플릿 보관 중 오류가 발생했습니다.',
                }
            );
        },
    });
}

interface RestoreVersionParams {
    templateId: string | number;
    version: number;
    templates: EvaluationTemplate[];
    setPreviewTemplate: (t: any) => void;
    confirmationActions: any;
    firestoreActions: FirestoreActions;
}

function executeRestoreVersion({
    templateId,
    version,
    templates,
    setPreviewTemplate,
    confirmationActions,
    firestoreActions,
}: RestoreVersionParams) {
    const template = templates.find((t) => t.id === templateId);
    if (!template || !template.versionHistory) return;
    const historyEntry = template.versionHistory.find((h) => h.version === version);
    if (!historyEntry) return;

    confirmationActions.showConfirmation({
        title: '버전 복원',
        message: `v${version}으로 복원하시겠습니까? 현재 버전의 내용은 히스토리에 저장됩니다.`,
        confirmButtonText: '복원',
        confirmButtonColor: 'outline',
        onConfirm: async () => {
            const currentVersion = template.version || 1;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { versionHistory, id, ...currentSnapshotData } = template; // Exclude ID
            const newHistoryEntry = {
                version: currentVersion,
                savedAt: template.lastUpdated,
                savedBy: template.author,
                changeNote: '복원 전 자동 저장',
                snapshot: currentSnapshotData as Omit<EvaluationTemplate, 'versionHistory'>,
            };
            const existingHistory = template.versionHistory || [];

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { version: _v, savedAt: _s, savedBy: _b, ...restSnapshot } = historyEntry.snapshot as any;

            const updatedData = {
                ...restSnapshot, // Apply snapshot data
                version: currentVersion + 1,
                lastUpdated: new Date().toISOString().split('T')[0],
                author: currentUser.name,
                // Preserve or overwrite fav/archived based on logic.
                // Usually restore doesn't auto-archive, assume keeping existing or resetting.
                // Let's keep existing favorite status but reset archived if it was archived?
                // For now, simple restore.
                favorite: template.favorite,
                archived: template.archived,
                versionHistory: [...existingHistory, newHistoryEntry].slice(-10),
            };

            await firestoreActions.updateTemplate(templateId as string, updatedData);
            setPreviewTemplate(null);
        },
    });
}
