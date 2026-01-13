import React, { memo, useCallback, useMemo } from 'react';
import { EvaluationTemplate } from '../../constants';
import { TemplateListRowActions } from './TemplateListRowActions';
import { TemplateListRowContent } from './TemplateListRowContent';
import { TemplateListRowInfo } from './TemplateListRowInfo';
import { TemplateListRowMobileActions } from './TemplateListRowMobileActions';

interface TemplateListRowProps {
    template: EvaluationTemplate;
    onEdit: (id: string | number) => void;
    onArchive: (id: string | number, name: string) => void;
    onRestore: (id: string | number, name: string) => void;
    onDuplicate: (id: string | number) => void;
    onPreview: (template: EvaluationTemplate) => void;
    onLaunch: (id: string | number) => void;
    onDelete: (id: string | number, name: string) => void;
    isBusy: boolean;
    isSelectionMode?: boolean;
    isSelected: boolean;
    onToggleSelect?: ((id: string | number) => void) | undefined;
}

function useTemplateListRowLogic(
    template: EvaluationTemplate,
    isSelectionMode: boolean,
    onToggleSelect: ((id: string | number) => void) | undefined,
    onPreview: (template: EvaluationTemplate) => void
) {
    const isArchived = Boolean(template.archived);
    const itemCount = template.items ? template.items.length : template.questions || 0;

    const handleClick = useCallback(() => {
        if (isSelectionMode && !isArchived && onToggleSelect) {
            onToggleSelect(template.id);
        } else {
            onPreview(template);
        }
    }, [isSelectionMode, isArchived, onToggleSelect, onPreview, template]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        },
        [handleClick]
    );

    return { isArchived, itemCount, handleClick, handleKeyDown };
}

const TemplateListRowCheckbox = memo(
    ({
        isArchived,
        isSelected,
        onToggleSelect,
        templateId,
    }: {
        isArchived: boolean;
        isSelected: boolean;
        onToggleSelect?: ((id: string | number) => void) | undefined;
        templateId: string | number;
    }) => (
        <div className="hidden md:flex w-10 items-center">
            {!isArchived && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(templateId);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    aria-label="템플릿 선택"
                />
            )}
        </div>
    )
);
TemplateListRowCheckbox.displayName = 'TemplateListRowCheckbox';

export const TemplateListRow = memo(
    ({
        template,
        onEdit,
        onArchive,
        onRestore,
        onDuplicate,
        onPreview,
        onLaunch,
        isBusy,
        isSelectionMode = false,
        isSelected,
        onToggleSelect,
        onDelete,
    }: TemplateListRowProps) => {
        const { isArchived, itemCount, handleClick, handleKeyDown } = useTemplateListRowLogic(
            template,
            isSelectionMode,
            onToggleSelect,
            onPreview
        );

        const rowClassName = useMemo(
            () =>
                `flex flex-col md:flex-row md:items-center px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group ${isArchived ? 'opacity-60' : ''} ${isSelected ? 'bg-primary/5' : ''}`,
            [isArchived, isSelected]
        );

        return (
            <div onClick={handleClick} className={rowClassName} role="button" tabIndex={0} onKeyDown={handleKeyDown}>
                {isSelectionMode && (
                    <TemplateListRowCheckbox
                        isArchived={isArchived}
                        isSelected={isSelected}
                        onToggleSelect={onToggleSelect}
                        templateId={template.id}
                    />
                )}

                <TemplateListRowContent template={template} itemCount={itemCount} isArchived={isArchived} />
                <TemplateListRowInfo template={template} itemCount={itemCount} />
                <div className="hidden md:flex w-32 items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TemplateListRowActions
                        templateId={template.id}
                        templateName={template.name}
                        isArchived={isArchived}
                        isBusy={isBusy}
                        onDuplicate={onDuplicate}
                        onEdit={onEdit}
                        onRestore={onRestore}
                        onArchive={onArchive}
                        onLaunch={onLaunch}
                        onDelete={onDelete}
                    />
                </div>
                <div className="md:hidden flex items-center justify-end gap-2 mt-2">
                    <TemplateListRowMobileActions
                        templateId={template.id}
                        templateName={template.name}
                        isArchived={isArchived}
                        isBusy={isBusy}
                        onDuplicate={onDuplicate}
                        onEdit={onEdit}
                        onRestore={onRestore}
                        onArchive={onArchive}
                        onLaunch={onLaunch}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        );
    }
);

TemplateListRow.displayName = 'TemplateListRow';
