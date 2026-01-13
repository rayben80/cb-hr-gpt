import { ArrowDown, ArrowUp, FileText, Plus, Sparkle } from '@phosphor-icons/react';
import { memo } from 'react';
import { SettingsCard } from '../../../components/settings/SettingsCard';
import { EvaluationItem } from '../../../constants';
import { TemplateItemActionButtons } from './TemplateItemActionButtons';
import { TemplateItemRow } from './TemplateItemRow';

interface TemplateItemsPanelProps {
    items: EvaluationItem[];
    usesWeights: boolean;
    activeItemId: number | null;
    draggedItemId: number | null;
    dragOver: { id: number | 'end'; position: 'before' | 'after' } | null;
    copiedItem: EvaluationItem | null;
    isAllCollapsed: boolean;
    isDragEnabled: boolean;
    hasPresets: boolean;
    isArchived: boolean;
    existingTemplatesCount: number;
    showItemsError: boolean;
    setActiveItemId: (id: number | null) => void;
    setDragOver: (value: { id: number | 'end'; position: 'before' | 'after' } | null) => void;
    getDropPosition: (event: React.DragEvent<HTMLDivElement>) => 'before' | 'after';
    handleItemChange: (item: EvaluationItem) => void;
    addItem: (type: '정량' | '정성') => void;
    removeItem: (id: number) => void;
    handleCopyItem: (item: EvaluationItem) => void;
    handlePasteItem: () => void;
    handleLoadPresets: () => void;
    handleDistributeWeights: () => void;
    handleDragStart: (e: React.DragEvent<HTMLButtonElement>, id: number) => void;
    handleDragEnd: () => void;
    handleDropAt: (e: React.DragEvent<HTMLDivElement>, targetId: number, position: 'before' | 'after') => void;
    handleDropAtEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    handleMoveItem: (id: number, direction: 'up' | 'down') => void;
    toggleCollapseAll: () => void;
    onShowImportModal: () => void;
}

interface EmptyStateProps {
    usesWeights: boolean;
    hasPresets: boolean;
    isArchived: boolean;
    existingTemplatesCount: number;
    addItem: (type: '정량' | '정성') => void;
    handleLoadPresets: () => void;
    onShowImportModal: () => void;
}

const TemplateItemsEmptyState = memo(
    ({
        usesWeights,
        hasPresets,
        isArchived,
        existingTemplatesCount,
        addItem,
        handleLoadPresets,
        onShowImportModal,
    }: EmptyStateProps) => (
        <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-primary/40" weight="regular" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700">아직 항목이 없습니다</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
                {usesWeights
                    ? '권장 구성: 정량 3~5개 + 정성 2~4개로 시작하면 비교 가능성이 높아집니다.'
                    : '질문 3~8개로 시작하면 평가자가 부담 없이 답할 수 있습니다.'}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
                    {hasPresets && (
                        <button
                            onClick={handleLoadPresets}
                            disabled={isArchived}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Sparkle className="w-4 h-4" weight="fill" />
                            추천 템플릿으로 시작
                        </button>
                    )}
                    {usesWeights ? (
                        <>
                            <button
                                onClick={() => addItem('정량')}
                                disabled={isArchived}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" weight="bold" />
                                정량(KPI) 항목 추가
                            </button>
                            <button
                                onClick={() => addItem('정성')}
                                disabled={isArchived}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" weight="bold" />
                                정성(서술) 항목 추가
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => addItem('정성')}
                            disabled={isArchived}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" weight="bold" />
                            질문 추가
                        </button>
                    )}
                </div>
                {existingTemplatesCount > 0 && (
                    <button
                        onClick={onShowImportModal}
                        disabled={isArchived}
                        className="text-sm text-slate-500 hover:text-primary transition-colors"
                    >
                        기존 템플릿에서 가져오기
                    </button>
                )}
            </div>
        </div>
    )
);

TemplateItemsEmptyState.displayName = 'TemplateItemsEmptyState';

const CollapseToggle = memo(({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => (
    <div className="flex justify-end mb-2">
        <button onClick={onToggle} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
            {isCollapsed ? <ArrowDown className="w-3 h-3" weight="regular" /> : <ArrowUp className="w-3 h-3" weight="regular" />}
            {isCollapsed ? '모두 펼치기' : '모두 접기'}
        </button>
    </div>
));

CollapseToggle.displayName = 'CollapseToggle';

interface DragEndZoneProps {
    isDragEnabled: boolean;
    itemsLength: number;
    dragOver: TemplateItemsPanelProps['dragOver'];
    setDragOver: TemplateItemsPanelProps['setDragOver'];
    handleDropAtEnd: TemplateItemsPanelProps['handleDropAtEnd'];
}

const DragEndZone = memo(({ isDragEnabled, itemsLength, dragOver, setDragOver, handleDropAtEnd }: DragEndZoneProps) => {
    if (!isDragEnabled || itemsLength <= 1) return null;

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOver({ id: 'end', position: 'after' });
            }}
            onDrop={(e) => {
                e.preventDefault();
                handleDropAtEnd(e);
            }}
            className="relative h-4"
        >
            {dragOver?.id === 'end' && <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary rounded-full" />}
        </div>
    );
});

DragEndZone.displayName = 'DragEndZone';

export const TemplateItemsPanel = memo(
    ({
        items,
        usesWeights,
        activeItemId,
        draggedItemId,
        dragOver,
        copiedItem,
        isAllCollapsed,
        isDragEnabled,
        hasPresets,
        isArchived,
        existingTemplatesCount,
        showItemsError,
        setActiveItemId,
        setDragOver,
        getDropPosition,
        handleItemChange,
        addItem,
        removeItem,
        handleCopyItem,
        handlePasteItem,
        handleLoadPresets,
        handleDistributeWeights,
        handleDragStart,
        handleDragEnd,
        handleDropAt,
        handleDropAtEnd,
        handleMoveItem,
        toggleCollapseAll,
        onShowImportModal,
    }: TemplateItemsPanelProps) => {
        const onDragLeave = isDragEnabled
            ? (event: React.DragEvent<HTMLDivElement>) => {
                  const related = event.relatedTarget as Node | null;
                  if (related && event.currentTarget.contains(related)) return;
                  setDragOver(null);
              }
            : undefined;

        return (
            <SettingsCard
                title={usesWeights ? '평가 항목' : '질문 목록'}
                description={
                    usesWeights ? '템플릿에 포함될 질문들을 추가하고 관리합니다.' : '평가에 사용될 질문을 추가해주세요.'
                }
            >
                <div className="space-y-4" onDragLeave={onDragLeave}>
                    {items.length > 2 && <CollapseToggle isCollapsed={isAllCollapsed} onToggle={toggleCollapseAll} />}
                    {showItemsError && <p className="text-xs text-red-600">평가 항목을 최소 1개 이상 추가해주세요.</p>}

                    {items.length === 0 && (
                        <TemplateItemsEmptyState
                            usesWeights={usesWeights}
                            hasPresets={hasPresets}
                            isArchived={isArchived}
                            existingTemplatesCount={existingTemplatesCount}
                            addItem={addItem}
                            handleLoadPresets={handleLoadPresets}
                            onShowImportModal={onShowImportModal}
                        />
                    )}

                    {items.map((item, index) => (
                        <TemplateItemRow
                            key={item.id}
                            item={item}
                            index={index}
                            totalItems={items.length}
                            isActive={activeItemId === item.id}
                            dragOver={dragOver}
                            draggedItemId={draggedItemId}
                            isDragEnabled={isDragEnabled}
                            usesWeights={usesWeights}
                            setDragOver={setDragOver}
                            getDropPosition={getDropPosition}
                            handleDropAt={handleDropAt}
                            handleItemChange={handleItemChange}
                            setActiveItemId={setActiveItemId}
                            removeItem={removeItem}
                            handleCopyItem={handleCopyItem}
                            handleMoveItem={handleMoveItem}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                        />
                    ))}

                    <DragEndZone
                        isDragEnabled={isDragEnabled}
                        itemsLength={items.length}
                        dragOver={dragOver}
                        setDragOver={setDragOver}
                        handleDropAtEnd={handleDropAtEnd}
                    />

                    {items.length > 0 && (
                        <TemplateItemActionButtons
                            usesWeights={usesWeights}
                            hasPresets={hasPresets}
                            isArchived={isArchived}
                            existingTemplatesCount={existingTemplatesCount}
                            itemsLength={items.length}
                            copiedItem={copiedItem}
                            addItem={addItem}
                            handlePasteItem={handlePasteItem}
                            handleLoadPresets={handleLoadPresets}
                            onShowImportModal={onShowImportModal}
                            handleDistributeWeights={handleDistributeWeights}
                        />
                    )}
                </div>
            </SettingsCard>
        );
    }
);

TemplateItemsPanel.displayName = 'TemplateItemsPanel';
