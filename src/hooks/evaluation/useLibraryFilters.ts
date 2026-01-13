import { useMemo, useState } from 'react';
import { EvaluationTemplate, TEMPLATE_TYPE_OPTIONS } from '../../constants';
import { useFirestoreCategories } from '../settings/useFirestoreCategories';

export const useLibraryFilters = (templates: EvaluationTemplate[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('전체');
    const [categoryFilter, setCategoryFilter] = useState('전체');
    const [showArchived, setShowArchived] = useState(false);
    const [sortField, setSortField] = useState<'name' | 'lastUpdated' | 'author' | 'questions'>('lastUpdated');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Firestore에서 카테고리 목록 가져오기
    const { editorCategoryOptions: firestoreCategories } = useFirestoreCategories();

    const toggleSortOrder = () => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));

    const typeOptions = useMemo(() => {
        const optionSet = new Set<string>(TEMPLATE_TYPE_OPTIONS);
        templates.forEach((t) => {
            if (t.type) optionSet.add(t.type);
        });
        return ['전체', ...Array.from(optionSet)];
    }, [templates]);

    const categoryOptions = useMemo(() => {
        // Firestore 카테고리 + 템플릿에서 추출한 카테고리 병합
        const optionSet = new Set<string>(firestoreCategories);
        templates.forEach((t) => {
            if (t.category) optionSet.add(t.category);
        });
        return ['전체', ...Array.from(optionSet)];
    }, [templates, firestoreCategories]);

    const sortedTemplates = useMemo(() => {
        const result = templates.filter((t) => {
            const isArchived = !!t.archived;
            if (isArchived !== showArchived) return false;

            if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (typeFilter !== '전체' && t.type !== typeFilter) return false;
            if (categoryFilter !== '전체' && t.category !== categoryFilter) return false;
            return true;
        });

        result.sort((a, b) => {
            // 정렬 필드 적용
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'lastUpdated':
                    comparison = a.lastUpdated.localeCompare(b.lastUpdated);
                    break;
                case 'author':
                    comparison = a.author.localeCompare(b.author);
                    break;
                case 'questions':
                    comparison = (a.questions || 0) - (b.questions || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [templates, showArchived, searchTerm, typeFilter, categoryFilter, sortField, sortOrder]);

    return {
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        categoryFilter,
        setCategoryFilter,
        showArchived,
        setShowArchived,
        sortField,
        setSortField,
        sortOrder,
        toggleSortOrder,
        sortedTemplates,
        typeOptions,
        categoryOptions,
    };
};
