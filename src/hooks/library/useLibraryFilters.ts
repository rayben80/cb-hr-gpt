import { useMemo } from 'react';
import { EvaluationTemplate, TEMPLATE_TYPE_OPTIONS } from '../../constants';

type SortField = 'name' | 'lastUpdated' | 'questions' | 'author';
type SortOrder = 'asc' | 'desc';

interface UseLibraryFiltersOptions {
    templates: EvaluationTemplate[];
    searchTerm: string;
    typeFilter: string;
    categoryFilter: string;
    showArchived: boolean;
    sortField: SortField;
    sortOrder: SortOrder;
}

export function useLibraryFilters({
    templates,
    searchTerm,
    typeFilter,
    categoryFilter,
    showArchived,
    sortField,
    sortOrder,
}: UseLibraryFiltersOptions) {
    const typeOptions = useMemo(() => {
        const typeSet = new Set<string>(TEMPLATE_TYPE_OPTIONS);
        templates.forEach((template) => typeSet.add(template.type));
        return ['전체', ...Array.from(typeSet)];
    }, [templates]);

    const categoryOptions = useMemo(() => {
        const categorySet = new Set<string>();
        templates.forEach((template) => {
            if (template.category) {
                categorySet.add(template.category);
            }
        });
        return ['전체', ...Array.from(categorySet)];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return templates.filter((template) => {
            if (!showArchived && template.archived) return false;
            if (typeFilter !== '전체' && template.type !== typeFilter) return false;
            if (categoryFilter !== '전체' && template.category !== categoryFilter) return false;
            if (!query) return true;
            return (
                template.name.toLowerCase().includes(query) ||
                template.type.toLowerCase().includes(query) ||
                (template.category?.toLowerCase().includes(query) ?? false) ||
                (template.tags || []).some((tag) => tag.toLowerCase().includes(query))
            );
        });
    }, [templates, searchTerm, typeFilter, categoryFilter, showArchived]);

    const sortedTemplates = useMemo(() => {
        const sorted = [...filteredTemplates].sort((a, b) => {
            // Then by selected field
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name, 'ko');
                    break;
                case 'lastUpdated':
                    comparison = a.lastUpdated.localeCompare(b.lastUpdated);
                    break;
                case 'questions': {
                    const aCount = a.items ? a.items.length : a.questions || 0;
                    const bCount = b.items ? b.items.length : b.questions || 0;
                    comparison = aCount - bCount;
                    break;
                }
                case 'author':
                    comparison = a.author.localeCompare(b.author, 'ko');
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [filteredTemplates, sortField, sortOrder]);

    return {
        typeOptions,
        categoryOptions,
        filteredTemplates,
        sortedTemplates,
    };
}
