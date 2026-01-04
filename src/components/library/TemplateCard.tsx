import { Gear, GraduationCap, IconProps, Medal, UserCheck, Users } from '@phosphor-icons/react';
import React, { memo, useMemo } from 'react';
import { EvaluationTemplate } from '../../constants';
import { HighlightedText } from '../common/HighlightedText';
import { TemplateCardActions } from './TemplateCardActions';

interface TemplateCardProps {
    template: EvaluationTemplate;
    onEdit: (id: string | number) => void;
    onArchive: (id: string | number, name: string) => void;
    onRestore: (id: string | number, name: string) => void;
    onDuplicate: (id: string | number) => void;
    onPreview: (template: EvaluationTemplate) => void;
    onToggleFavorite: (id: string | number) => void;
    isBusy: boolean;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: string | number) => void;
    searchTerm?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType<IconProps>> = {
    본인평가: UserCheck,
    역량평가: UserCheck,
    수습평가: GraduationCap,
    다면평가: Users,
    리더십평가: Medal,
    기타: Gear,
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
    본인평가: { color: 'text-[hsl(var(--chart-1))]', bg: 'bg-[hsl(var(--chart-1))]/10' },
    역량평가: { color: 'text-[hsl(var(--chart-1))]', bg: 'bg-[hsl(var(--chart-1))]/10' },
    수습평가: { color: 'text-[hsl(var(--chart-4))]', bg: 'bg-[hsl(var(--chart-4))]/10' },
    다면평가: { color: 'text-[hsl(var(--chart-3))]', bg: 'bg-[hsl(var(--chart-3))]/10' },
    리더십평가: { color: 'text-[hsl(var(--chart-5))]', bg: 'bg-[hsl(var(--chart-5))]/10' },
    기타: { color: 'text-muted-foreground', bg: 'bg-muted' },
};

function useTemplateCardLogic(props: TemplateCardProps) {
    const { template, onPreview, isSelectionMode, onToggleSelect } = props;

    const normalizedType = useMemo(() => template.type.replace(/\s+/g, ''), [template.type]);
    const style = useMemo(() => CATEGORY_STYLES[normalizedType] || CATEGORY_STYLES['기타'], [normalizedType]);
    const Icon = CATEGORY_ICONS[normalizedType] || CATEGORY_ICONS['기타'];

    const itemCount = useMemo(
        () => (template.items ? template.items.length : template.questions || 0),
        [template.items, template.questions]
    );

    const versionLabel = `v${template.version ?? 1}`;
    const tags = template.tags?.slice(0, 3) || [];
    const isArchived = Boolean(template.archived);
    const isFavorite = Boolean(template.favorite);

    const handleClick = (_e: React.MouseEvent | React.KeyboardEvent) => {
        if (isSelectionMode && !isArchived && onToggleSelect) {
            onToggleSelect(template.id);
        } else {
            onPreview(template);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
    };

    return {
        style,
        Icon,
        itemCount,
        versionLabel,
        tags,
        isArchived,
        isFavorite,
        handleClick,
        handleKeyDown,
    };
}

export const TemplateCard = memo((props: TemplateCardProps) => {
    const {
        template,
        onEdit,
        onArchive,
        onRestore,
        onDuplicate,
        onToggleFavorite,
        isBusy,
        isSelectionMode = false,
        isSelected = false,
        onToggleSelect,
        searchTerm = '',
    } = props;

    const { style, Icon, itemCount, versionLabel, tags, isArchived, isFavorite, handleClick, handleKeyDown } =
        useTemplateCardLogic(props);

    const cardClassName = `bg-card rounded-xl shadow-sm hover:shadow-lg transition-all flex flex-col group relative ${
        isArchived ? 'opacity-60' : ''
    } ${isSelected ? 'ring-2 ring-primary' : ''}`;

    return (
        <div className={cardClassName}>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        {/* Selection mode checkbox */}
                        {isSelectionMode && !isArchived && (
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect?.(template.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer"
                                aria-label="템플릿 선택"
                            />
                        )}
                        <div className={`p-2 rounded-lg ${style.bg}`}>
                            <Icon className={`w-6 h-6 ${style.color}`} weight="fill" />
                        </div>
                    </div>

                    <TemplateCardActions
                        templateId={template.id}
                        templateName={template.name}
                        isFavorite={isFavorite}
                        isArchived={isArchived}
                        isBusy={isBusy}
                        onToggleFavorite={onToggleFavorite}
                        onDuplicate={onDuplicate}
                        onEdit={onEdit}
                        onRestore={onRestore}
                        onArchive={onArchive}
                    />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 relative">
                    <button
                        type="button"
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        className="text-left w-full focus:outline-none before:absolute before:inset-0 before:z-0 before:rounded-xl"
                        aria-label={`${template.name} 상세보기`}
                    >
                        <HighlightedText text={template.name} searchTerm={searchTerm} />
                    </button>
                </h3>

                <p className="mt-1 text-sm text-slate-500 relative z-0 pointer-events-none">
                    {template.type} · {template.category || '미지정'}
                </p>
                {isArchived && (
                    <span className="mt-2 inline-flex text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full relative z-0 pointer-events-none w-fit">
                        보관됨
                    </span>
                )}
                {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 relative z-0 pointer-events-none">
                        {tags.map((tag) => (
                            <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center relative z-0 pointer-events-none">
                <span>항목 {itemCount}개</span>
                <span>
                    {versionLabel} · {template.lastUpdated}
                </span>
            </div>
        </div>
    );
});

TemplateCard.displayName = 'TemplateCard';
