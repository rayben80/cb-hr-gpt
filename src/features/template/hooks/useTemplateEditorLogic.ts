import { useCallback, useMemo, useState } from 'react';
import { currentUser, EvaluationTemplate } from '../../../constants';
import { useTemplateDraft } from './useTemplateDraft';
import { useTemplateItems } from './useTemplateItems';
import { useTemplateSave } from './useTemplateSave';
import { useTemplateTags } from './useTemplateTags';

export interface UseTemplateEditorLogicProps {
    onSave: (template: EvaluationTemplate) => void;
    onCancel: () => void;
    initialTemplate?: EvaluationTemplate | null;
    categoryOptions: string[];
    isArchived?: boolean;
    existingTemplates?: EvaluationTemplate[];
}

export function useTemplateEditorLogic({
    onSave,
    onCancel,
    initialTemplate = null,
    categoryOptions,
    isArchived = false,
}: UseTemplateEditorLogicProps) {
    const [template, setTemplate] = useState<EvaluationTemplate>(
        () =>
            initialTemplate || {
                id: 0,
                name: '',
                type: '전사 공통',
                category: categoryOptions[0] || '공통',
                items: [],
                description: '',
                questions: 0,
                lastUpdated: new Date().toISOString(),
                author: currentUser.name,
            }
    );

    const [defaultScoringType] = useState('5grade');
    const [showPreview, setShowPreview] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const tagProps = useTemplateTags(initialTemplate?.tags || []);

    const { handleRestoreDraft, handleDiscardDraft, clearDraftOnSave, draftInfo, isDirty } = useTemplateDraft({
        templateId: initialTemplate?.id,
        template: { ...template, items: template.items || [] },
        setTemplate: setTemplate as any,
        tags: tagProps.tags,
        setTags: tagProps.setTags,
        tagInput: tagProps.tagInput,
        setTagInput: tagProps.setTagInput,
        setShowValidation,
    });

    const itemProps = useTemplateItems({
        template: { ...template, items: template.items || [] },
        setTemplate: setTemplate as any,
        usesWeights: template.type === '전사 공통' || template.type === '팀별',
        defaultScoringType,
        isArchived,
        setConfirmation,
    });

    const usesWeights = template.type === '전사 공통' || template.type === '팀별';
    const totalWeight = useMemo(
        () => (template.items || []).reduce((sum, item) => sum + (item.weight || 0), 0),
        [template.items]
    );

    const { handleSave, validationMessages } = useTemplateSave({
        template,
        initialTemplate,
        isArchived,
        tagProps,
        onSave,
        clearDraftOnSave,
        categoryOptions,
        usesWeights,
        totalWeight,
        setShowValidation,
    });

    const showItemsError = showValidation && (template.items || []).length === 0;

    const handleCancelClick = useCallback(() => {
        if (isDirty) {
            setConfirmation({
                isOpen: true,
                title: '변경사항 취소',
                message: '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?',
                onConfirm: () => {
                    setConfirmation((prev) => ({ ...prev, isOpen: false }));
                    onCancel();
                },
            });
        } else {
            onCancel();
        }
    }, [isDirty, onCancel]);

    const getDropPosition = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    }, []);

    return {
        template,
        setTemplate,
        showPreview,
        setShowPreview,
        showImportModal,
        setShowImportModal,
        showValidation,
        confirmation,
        setConfirmation,
        tagProps,
        draftInfo,
        handleRestoreDraft,
        handleDiscardDraft,
        itemProps,
        usesWeights,
        totalWeight,
        handleSave,
        validationMessages,
        showItemsError,
        handleCancelClick,
        getDropPosition,
    };
}
