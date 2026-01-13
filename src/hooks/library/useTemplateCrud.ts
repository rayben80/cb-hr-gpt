import { useCallback } from 'react';
import { EvaluationTemplate, currentUser } from '../../constants';

interface FirestoreActions {
    addTemplate: (template: Omit<EvaluationTemplate, 'id'>) => Promise<string>;
    updateTemplate: (id: string, data: Partial<EvaluationTemplate>) => Promise<void>;
}

interface UseTemplateCrudProps {
    templates: EvaluationTemplate[];
    editingTemplate: EvaluationTemplate | null;
    setEditingTemplate: React.Dispatch<React.SetStateAction<EvaluationTemplate | null>>;
    setView: React.Dispatch<React.SetStateAction<string>>;
    firestoreActions: FirestoreActions;
}

const createVersionHistoryEntry = (template: EvaluationTemplate) => {
    const prevVersion = template.version || 1;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { versionHistory, ...snapshotData } = template;
    return {
        version: prevVersion,
        savedAt: template.lastUpdated,
        savedBy: template.author,
        snapshot: snapshotData as Omit<EvaluationTemplate, 'versionHistory'>,
    };
};

// Extracted Helper: Update Logic
async function updateExistingTemplate(
    editingTemplate: EvaluationTemplate,
    newTemplateData: EvaluationTemplate,
    firestoreActions: FirestoreActions
) {
    const newHistoryEntry = createVersionHistoryEntry(editingTemplate);
    const existingHistory = editingTemplate.versionHistory || [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataToUpdate } = newTemplateData;

    const updatedData = {
        ...dataToUpdate,
        version: (editingTemplate.version || 1) + 1,

        archived: editingTemplate.archived,
        versionHistory: [...existingHistory, newHistoryEntry].slice(-10),
        lastUpdated: new Date().toISOString().split('T')[0],
        author: currentUser.name,
    };

    await firestoreActions.updateTemplate(editingTemplate.id as string, updatedData);
}

// Extracted Helper: Create Logic
async function createNewTemplate(newTemplateData: EvaluationTemplate, firestoreActions: FirestoreActions) {
    const newTemplate = {
        ...newTemplateData,

        archived: false,
        version: 1,
        author: currentUser.name,
        lastUpdated: new Date().toISOString().split('T')[0],
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...templateToAdd } = newTemplate;
    await firestoreActions.addTemplate(templateToAdd);
}

export const useTemplateCrud = ({
    templates,
    editingTemplate,
    setEditingTemplate,
    setView,
    firestoreActions,
}: UseTemplateCrudProps) => {
    const handleSaveTemplate = useCallback(
        async (newTemplateData: EvaluationTemplate, saveOperationExecute: any) => {
            await saveOperationExecute(
                async () => {
                    if (editingTemplate) {
                        await updateExistingTemplate(editingTemplate, newTemplateData, firestoreActions);
                    } else {
                        await createNewTemplate(newTemplateData, firestoreActions);
                    }
                    return 'success';
                },
                {
                    successMessage: editingTemplate
                        ? '템플릿이 성공적으로 수정되었습니다.'
                        : '템플릿이 성공적으로 추가되었습니다.',
                    errorMessage: `템플릿 ${editingTemplate ? '수정' : '추가'} 중 오류가 발생했습니다.`,
                    onSuccess: () => {
                        setView('list');
                        setEditingTemplate(null);
                    },
                }
            );
        },
        [editingTemplate, setView, setEditingTemplate, firestoreActions]
    );

    const handleEditTemplate = useCallback(
        (templateId: string | number) => {
            const templateToEdit = templates.find((t) => t.id === templateId);
            if (templateToEdit && !templateToEdit.archived) {
                setEditingTemplate(templateToEdit);
                setView('editor');
            }
        },
        [templates, setEditingTemplate, setView]
    );

    const handleDuplicateTemplate = useCallback(
        async (templateId: string | number, duplicateOperationExecute: any) => {
            executeDuplicateTemplate(templateId, templates, duplicateOperationExecute, firestoreActions);
        },
        [templates, firestoreActions]
    );

    const handleCancel = useCallback(() => {
        setView('list');
        setEditingTemplate(null);
    }, [setView, setEditingTemplate]);

    return { handleSaveTemplate, handleEditTemplate, handleDuplicateTemplate, handleCancel };
};

async function executeDuplicateTemplate(
    templateId: string | number,
    templates: EvaluationTemplate[],
    duplicateOperationExecute: any,
    firestoreActions: FirestoreActions
) {
    const templateToDuplicate = templates.find((t) => t.id === templateId);
    if (!templateToDuplicate) return;
    await duplicateOperationExecute(
        async () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...dataToDuplicate } = templateToDuplicate;
            const baseName = templateToDuplicate.name.replace(/\s*\(복사본(?:\s*\d+)?\)\s*$/, '');
            const existingNames = templates.map((t) => t.name);
            let newName = `${baseName} (복사본)`;
            let counter = 2;
            while (existingNames.includes(newName)) {
                newName = `${baseName} (복사본 ${counter})`;
                counter++;
            }
            const newTemplate = {
                ...dataToDuplicate,
                name: newName,
                author: currentUser.name,
                lastUpdated: new Date().toISOString().split('T')[0],
                version: 1,

                archived: false,
            };

            await firestoreActions.addTemplate(newTemplate);
            return 'success';
        },
        {
            successMessage: '템플릿이 성공적으로 복사되었습니다.',
            errorMessage: '템플릿 복사 중 오류가 발생했습니다.',
        }
    );
}
