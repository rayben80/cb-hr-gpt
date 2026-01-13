import React, { memo, useMemo } from 'react';
import { TemplateListRow } from '../../components/library/TemplateListRow';
import { EvaluationTemplate } from '../../constants';

interface TemplateListViewProps {
    templates: EvaluationTemplate[];
    onEdit: (id: string | number) => void;
    onArchive: (id: string | number, name: string) => void;
    onRestore: (id: string | number, name: string) => void;
    onDuplicate: (id: string | number) => void;
    onPreview: (template: EvaluationTemplate) => void;
    onLaunch: (id: string | number) => void;
    isBusy: boolean;
    isSelectionMode?: boolean;
    selectedIds?: Set<string | number>;
    onToggleSelect?: (id: string | number) => void;
    onDelete: (id: string | number, name: string) => void; // Added
}

const TemplateListView: React.FC<TemplateListViewProps> = memo(
    ({
        templates,
        onEdit,
        onArchive,
        onRestore,
        onDuplicate,
        onPreview,
        onLaunch,
        isBusy,
        isSelectionMode = false,
        selectedIds = new Set(),
        onToggleSelect,
        onDelete,
    }) => {
        const columns = useMemo(
            () => [
                ...(isSelectionMode ? [{ key: 'select', label: '', width: 'w-10' }] : []),
                { key: 'name', label: '템플릿 이름', width: 'flex-1' },
                { key: 'type', label: '유형', width: 'w-28' },
                { key: 'category', label: '카테고리', width: 'w-24' },
                { key: 'questions', label: '항목 수', width: 'w-20 text-center' },
                { key: 'author', label: '작성자', width: 'w-24' },
                { key: 'lastUpdated', label: '수정일', width: 'w-28' },
                { key: 'actions', label: '', width: 'w-32' },
            ],
            [isSelectionMode]
        );

        if (templates.length === 0) {
            return null;
        }

        return (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* 테이블 헤더 */}
                <div className="hidden md:flex items-center px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {columns.map((col) => (
                        <div key={col.key} className={col.width}>
                            {col.label}
                        </div>
                    ))}
                </div>

                {/* 테이블 바디 */}
                <div className="divide-y divide-slate-100">
                    {templates.map((template) => (
                        <TemplateListRow
                            key={template.id}
                            template={template}
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onRestore={onRestore}
                            onDuplicate={onDuplicate}
                            onPreview={onPreview}
                            onLaunch={onLaunch}
                            isBusy={isBusy}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedIds.has(template.id)}
                            onToggleSelect={onToggleSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </div>
        );
    }
);

TemplateListView.displayName = 'TemplateListView';

export default TemplateListView;
