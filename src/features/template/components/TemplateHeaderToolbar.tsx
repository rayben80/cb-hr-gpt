import { Archive, ArrowCounterClockwise, ArrowLeft, Star } from '@phosphor-icons/react';
import { memo } from 'react';
import { Button } from '../../../components/common';

interface TemplateHeaderToolbarProps {
    templateId: string | number;
    title: string;
    description: string;
    isFavorite: boolean;
    isArchived: boolean;
    onCancel: () => void;
    onSave: () => void;
    onToggleFavorite: () => void;
    onArchive: () => void;
    onRestore: () => void;
    validationMessages: string[];
}

export const TemplateHeaderToolbar = memo(
    ({
        templateId,
        title,
        description,
        isFavorite,
        isArchived,
        onCancel,
        onSave,
        onToggleFavorite,
        onArchive,
        onRestore,
        validationMessages,
    }: TemplateHeaderToolbarProps) => {
        return (
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        <ArrowLeft className="w-5 h-5" weight="regular" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                        <p className="text-sm text-slate-500 mt-1">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {templateId !== 0 && (
                        <>
                            <Button
                                variant="outline"
                                onClick={onToggleFavorite}
                                className={
                                    isFavorite ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : 'text-slate-400'
                                }
                            >
                                <Star className="w-4 h-4 mr-2" weight={isFavorite ? 'fill' : 'regular'} />
                                {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                            </Button>
                            {isArchived ? (
                                <Button
                                    variant="outline"
                                    onClick={onRestore}
                                    className="text-emerald-600 border-emerald-200 bg-emerald-50"
                                >
                                    <ArrowCounterClockwise className="w-4 h-4 mr-2" weight="regular" />
                                    복구
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={onArchive}
                                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Archive className="w-4 h-4 mr-2" weight="regular" />
                                    보관
                                </Button>
                            )}
                        </>
                    )}
                    <Button variant="outline" onClick={onCancel}>
                        취소
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={validationMessages.length > 0}
                        className={validationMessages.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        저장
                    </Button>
                </div>
            </div>
        );
    }
);
TemplateHeaderToolbar.displayName = 'TemplateHeaderToolbar';
