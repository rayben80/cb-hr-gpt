import { ArrowCounterClockwise, Copy, PencilSimple, Star, Trash } from '@phosphor-icons/react';
import React from 'react';

interface TemplateCardActionsProps {
    templateId: string | number;
    templateName: string;
    isFavorite: boolean;
    isArchived: boolean;
    isBusy: boolean;
    onToggleFavorite: (id: string | number) => void;
    onDuplicate: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onRestore: (id: string | number, name: string) => void;
    onArchive: (id: string | number, name: string) => void;
}

export const TemplateCardActions: React.FC<TemplateCardActionsProps> = ({
    templateId,
    templateName,
    isFavorite,
    isArchived,
    isBusy,
    onToggleFavorite,
    onDuplicate,
    onEdit,
    onRestore,
    onArchive,
}) => {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(templateId);
                }}
                disabled={isArchived}
                className={`p-1.5 rounded-full ${isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'} ${isArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            >
                <Star
                    className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                    weight={isFavorite ? 'fill' : 'regular'}
                />
            </button>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                {!isArchived && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(templateId);
                        }}
                        disabled={isBusy}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="복제"
                    >
                        <Copy className="w-5 h-5" weight="regular" />
                    </button>
                )}
                {!isArchived && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(templateId);
                        }}
                        disabled={isBusy}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="수정"
                    >
                        <PencilSimple className="w-5 h-5" weight="regular" />
                    </button>
                )}
                {isArchived ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRestore(templateId, templateName);
                        }}
                        disabled={isBusy}
                        className="p-1.5 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="복원"
                    >
                        <ArrowCounterClockwise className="w-5 h-5" weight="regular" />
                    </button>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onArchive(templateId, templateName);
                        }}
                        disabled={isBusy}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="보관"
                    >
                        <Trash className="w-5 h-5" weight="regular" />
                    </button>
                )}
            </div>
        </div>
    );
};
