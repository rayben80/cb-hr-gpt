import { ArrowCounterClockwise, Copy, PencilSimple, Trash } from '@phosphor-icons/react';
import React from 'react';

interface TemplateListRowMobileActionsProps {
    templateId: string | number;
    templateName: string;
    isArchived: boolean;
    isBusy: boolean;
    onDuplicate: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onRestore: (id: string | number, name: string) => void;
    onArchive: (id: string | number, name: string) => void;
}

export const TemplateListRowMobileActions: React.FC<TemplateListRowMobileActionsProps> = ({
    templateId,
    templateName,
    isArchived,
    isBusy,
    onDuplicate,
    onEdit,
    onRestore,
    onArchive,
}) => {
    if (isArchived) {
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRestore(templateId, templateName);
                }}
                disabled={isBusy}
                className="p-2 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-100"
                title="복원"
            >
                <ArrowCounterClockwise className="w-5 h-5" weight="regular" />
            </button>
        );
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(templateId);
                }}
                disabled={isBusy}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                title="복제"
            >
                <Copy className="w-5 h-5" weight="regular" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(templateId);
                }}
                disabled={isBusy}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                title="수정"
            >
                <PencilSimple className="w-5 h-5" weight="regular" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onArchive(templateId, templateName);
                }}
                disabled={isBusy}
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                title="보관"
            >
                <Trash className="w-5 h-5" weight="regular" />
            </button>
        </>
    );
};
