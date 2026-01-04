import { ViewMode } from '@/components/common';
import { useCallback, useState } from 'react';
import { EvaluationTemplate } from '../../constants';
// Hooks
import { useImportExport } from '../evaluation/useImportExport';
import { useLibraryFilters } from '../evaluation/useLibraryFilters';
import { useTemplateManagement } from './useTemplateManagement';

export const useEvaluationLibrary = () => {
    // 1. Core State & Management Hook
    const manager = useTemplateManagement();

    // 2. UI State (Modals & Views)
    const [previewTemplate, setPreviewTemplate] = useState<EvaluationTemplate | null>(null);
    const [showStartModal, setShowStartModal] = useState(false);
    const [listViewMode, setListViewMode] = useState<ViewMode>('grid');

    // 3. Filters & Import/Export Hooks
    const filters = useLibraryFilters(manager.templates);

    const importExport = useImportExport(manager.addTemplate);

    // 4. Derived Actions
    const handleCreateNew = useCallback(() => {
        setShowStartModal(true);
        manager.setEditingTemplate(null);
    }, [manager]);

    const handleSelectBlank = useCallback(() => {
        setShowStartModal(false);
        manager.setEditingTemplate(null);
        manager.setView('editor');
    }, [manager]);

    const handleSelectPreset = useCallback(
        (type: string) => {
            setShowStartModal(false);
            manager.setEditingTemplate({
                id: 0,
                name: '',
                type,
                category: '공통',
                items: [],
                description: '',
                questions: 0,
                author: '',
                lastUpdated: '',
                favorite: false,
                archived: false,
                version: 1,
            });
            manager.setView('editor');
        },
        [manager]
    );

    const handleSelectAll = useCallback(() => {
        manager.selectAll(filters.sortedTemplates.map((t) => t.id));
    }, [manager, filters.sortedTemplates]);

    const handleBatchExportAction = useCallback(() => {
        const templatesToExport = manager.templates.filter((t) => manager.selectedIds.has(t.id));
        importExport.handleExport(templatesToExport);
    }, [manager.templates, manager.selectedIds, importExport]);

    return {
        ...manager,
        ...filters,
        ...importExport,
        previewTemplate,
        setPreviewTemplate,
        showStartModal,
        setShowStartModal,
        listViewMode,
        setListViewMode,
        handleCreateNew,
        handleSelectBlank,
        handleSelectPreset,
        handleSelectAll,
        handleBatchExportAction,
    };
};
