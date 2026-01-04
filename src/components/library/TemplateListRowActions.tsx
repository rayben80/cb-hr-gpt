import { ArrowCounterClockwise, Copy, PencilSimple, Trash } from '@phosphor-icons/react';
import React from 'react';

interface TemplateListRowActionsProps {
    templateId: string | number;
    templateName: string;
    isArchived: boolean;
    isBusy: boolean;
    onDuplicate: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onRestore: (id: string | number, name: string) => void;
    onArchive: (id: string | number, name: string) => void;
}

export const TemplateListRowActions: React.FC<TemplateListRowActionsProps> = ({
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
                className="p-1.5 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="복원"
            >
                <ArrowCounterClockwise className="w-4 h-4" weight="regular" />
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
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="복제"
            >
                <Copy className="w-4 h-4" weight="regular" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(templateId);
                }}
                disabled={isBusy}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="수정"
            >
                <PencilSimple className="w-4 h-4" weight="regular" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onArchive(templateId, templateName);
                }}
                disabled={isBusy}
                className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="보관"
            >
                <Trash className="w-4 h-4" weight="regular" />
            </button>
        </>
    );
};
