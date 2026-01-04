import { useCallback, useMemo } from 'react';
import { EvaluationTemplate, currentUser } from '../../../constants';

interface UseTemplateSaveOptions {
    template: EvaluationTemplate;
    initialTemplate: EvaluationTemplate | null;
    isArchived: boolean;
    tagProps: { tags: string[]; tagInput: string };
    onSave: (template: EvaluationTemplate) => void;
    clearDraftOnSave: () => void;
    categoryOptions: string[];
    usesWeights: boolean;
    totalWeight: number;
}

export function useTemplateSave({
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
}: UseTemplateSaveOptions & {
    setShowValidation: (show: boolean) => void;
}) {
    const itemsLength = template.items?.length || 0;
    const validationMessages = useMemo(() => {
        const messages: string[] = [];
        if (!template.name.trim()) messages.push('템플릿 이름');
        if (!template.category.trim()) messages.push('카테고리');
        if (itemsLength === 0) messages.push('평가 항목');
        if (usesWeights && totalWeight !== 100) messages.push('총 가중치 100%');
        return messages;
    }, [template.name, template.category, itemsLength, usesWeights, totalWeight]);

    const handleSave = useCallback(() => {
        if (isArchived) return;
        if (validationMessages.length > 0) {
            setShowValidation(true);
            return;
        }

        const finalTemplate = prepareFinalTemplate(template, initialTemplate, tagProps, categoryOptions);

        clearDraftOnSave();
        setShowValidation(false);
        onSave(finalTemplate);
    }, [
        isArchived,
        validationMessages,
        template,
        initialTemplate,
        tagProps,
        categoryOptions,
        onSave,
        clearDraftOnSave,
        setShowValidation,
    ]);

    return {
        handleSave,
        validationMessages,
    };
}

function prepareFinalTemplate(
    template: EvaluationTemplate,
    initialTemplate: EvaluationTemplate | null,
    tagProps: { tags: string[]; tagInput: string },
    categoryOptions: string[]
): EvaluationTemplate {
    const pendingTags = tagProps.tagInput.trim() ? [tagProps.tagInput.trim()] : [];
    const finalTags = [...tagProps.tags, ...pendingTags]
        .filter(Boolean)
        .filter((tag, index, self) => self.findIndex((t) => t.toLowerCase() === tag.toLowerCase()) === index)
        .slice(0, 6);

    const nextVersion = initialTemplate?.version ? initialTemplate.version + 1 : 1;
    return {
        ...template,
        tags: finalTags,
        version: nextVersion,
        id: initialTemplate?.id || Date.now(),
        category: template.category || categoryOptions[0] || '공통',
        lastUpdated: new Date().toISOString().split('T')[0],
        author: currentUser.name,
    };
}
