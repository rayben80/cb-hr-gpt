import { Archive, ArrowCounterClockwise, Copy, PencilSimple, RocketLaunch, Trash } from '@phosphor-icons/react';

interface TemplateCardActionsProps {
    templateId: string | number;
    templateName: string;
    isArchived: boolean;
    isBusy: boolean;
    onDuplicate: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onRestore: (id: string | number, name: string) => void;
    onArchive: (id: string | number, name: string) => void;
    onLaunch: (id: string | number) => void;
    onDelete?: (id: string | number, name: string) => void;
}

export const TemplateCardActions: React.FC<TemplateCardActionsProps> = ({
    templateId,
    templateName,
    isArchived,
    isBusy,
    onDuplicate,
    onEdit,
    onRestore,
    onArchive,
    onLaunch,
    onDelete,
}) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {!isArchived && (
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
                            <Copy className="w-5 h-5" weight="regular" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLaunch(templateId);
                            }}
                            disabled={isBusy}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="이 템플릿으로 시작"
                        >
                            <RocketLaunch className="w-5 h-5" weight="regular" />
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
                            <PencilSimple className="w-5 h-5" weight="regular" />
                        </button>
                    </>
                )}
                {isArchived ? (
                    <>
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
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(templateId, templateName);
                                }}
                                disabled={isBusy}
                                className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="영구 삭제"
                            >
                                <Trash className="w-5 h-5" weight="regular" />
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchive(templateId, templateName);
                            }}
                            disabled={isBusy}
                            className="p-1.5 text-slate-500 hover:text-orange-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="보관"
                        >
                            <Archive className="w-5 h-5" weight="regular" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(templateId, templateName);
                                }}
                                disabled={isBusy}
                                className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="영구 삭제"
                            >
                                <Trash className="w-5 h-5" weight="regular" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
