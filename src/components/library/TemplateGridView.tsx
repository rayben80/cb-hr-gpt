import { memo } from 'react';
import { EvaluationTemplate } from '../../constants';
import { TemplateCard } from './TemplateCard';

interface TemplateGridViewProps {
    templates: EvaluationTemplate[];
    onEdit: (id: string | number) => void;
    onArchive: (id: string | number, name: string) => void;
    onRestore: (id: string | number, name: string) => void;
    onDuplicate: (id: string | number) => void;
    onPreview: (template: EvaluationTemplate) => void;
    onLaunch: (id: string | number) => void;
    isBusy: boolean;
    isSelectionMode: boolean;
    selectedIds: Set<string | number>;
    onToggleSelect: (id: string | number) => void;
    onDelete: (id: string | number, name: string) => void;
}

export const TemplateGridView = memo(
    ({
        templates,
        onEdit,
        onArchive,
        onRestore,
        onDuplicate,
        onPreview,
        onLaunch,
        isBusy,
        isSelectionMode,
        selectedIds,
        onToggleSelect,
        onDelete,
    }: TemplateGridViewProps) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <TemplateCard
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
        );
    }
);

TemplateGridView.displayName = 'TemplateGridView';
