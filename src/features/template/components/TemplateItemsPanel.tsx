import { ArrowDown, ArrowUp, FileText } from '@phosphor-icons/react';
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
    }: TemplateItemsPanelProps) => (
        <SettingsCard
            title={usesWeights ? '평가 항목' : '질문 목록'}
            description={
                usesWeights ? '템플릿에 포함될 질문들을 추가하고 관리합니다.' : '평가에 사용될 질문을 추가해주세요.'
            }
        >
            <div
                className="space-y-4"
                onDragLeave={
                    isDragEnabled
                        ? (event) => {
                              const related = event.relatedTarget as Node | null;
                              if (related && event.currentTarget.contains(related)) return;
                              setDragOver(null);
                          }
                        : undefined
                }
            >
                {items.length > 2 && (
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={toggleCollapseAll}
                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                        >
                            {isAllCollapsed ? (
                                <ArrowDown className="w-3 h-3" weight="regular" />
                            ) : (
                                <ArrowUp className="w-3 h-3" weight="regular" />
                            )}
                            {isAllCollapsed ? '모두 펼치기' : '모두 접기'}
                        </button>
                    </div>
                )}
                {showItemsError && <p className="text-xs text-red-600">평가 항목을 최소 1개 이상 추가해주세요.</p>}

                {items.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-primary/40" weight="regular" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700">아직 항목이 없습니다</h4>
                        <p className="text-sm text-slate-500 mt-2 max-w-xs">
                            아래 버튼을 클릭하여 첫 번째 평가 항목을 추가하거나,
                            <br />
                            <span className="text-purple-600 font-medium">✨ 추천 항목 불러오기</span>를 사용해보세요!
                        </p>
                    </div>
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

                {isDragEnabled && items.length > 1 && (
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
                        {dragOver?.id === 'end' && (
                            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary rounded-full" />
                        )}
                    </div>
                )}

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
            </div>
        </SettingsCard>
    )
);

TemplateItemsPanel.displayName = 'TemplateItemsPanel';
