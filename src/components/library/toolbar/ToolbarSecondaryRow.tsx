import { Button, DropdownItem, ExcelDropdownButton, ViewMode, ViewModeToggle } from '@/components/common';
import { SortDropdown, SortOrder } from '@/components/common/SortDropdown';
import { CheckSquare, DownloadSimple, Trash, UploadSimple } from '@phosphor-icons/react';
import { memo, RefObject } from 'react';

export type { ViewMode };
export type SortField = 'name' | 'lastUpdated' | 'questions' | 'author';
export type { SortOrder };

interface ToolbarSecondaryRowProps {
    fileInputRef: RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedCount: number;
    selectableCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBatchArchive: () => void;
    onBatchExport: () => void;
    isBusy: boolean;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortField: SortField;
    onSortFieldChange: (field: SortField) => void;
    sortOrder: SortOrder;
    onToggleSortOrder: () => void;
    onImportClick: () => void;
    onExport: () => void;
    canExport: boolean;
    importError: string | null;
    compact?: boolean;
}

/**
 * 선택 모드 토글 버튼
 * 디자인 패턴: 활성 상태가 명확하게 구분되는 토글 버튼
 */
const SelectionModeToggle = memo(
    ({ isSelectionMode, onToggle }: { isSelectionMode: boolean; onToggle: () => void }) => (
        <Button
            variant={isSelectionMode ? 'soft' : 'outline'}
            size="default"
            onClick={onToggle}
            className="gap-1.5 h-12 font-medium"
            title={isSelectionMode ? '선택 모드 종료' : '선택 모드'}
        >
            <CheckSquare className="w-4 h-4" weight={isSelectionMode ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">{isSelectionMode ? '선택 모드 종료' : '선택 모드'}</span>
        </Button>
    )
);
SelectionModeToggle.displayName = 'SelectionModeToggle';

/**
 * 선택 모드 활성화 시 표시되는 컨트롤들
 * 디자인 패턴: 선택된 항목 개수 표시 + 전체 선택/해제 + 일괄 작업
 */
const SelectionControls = memo(
    ({
        selectedCount,
        selectableCount,
        onSelectAll,
        onDeselectAll,
        onBatchArchive,
        onBatchExport,
        isBusy,
    }: {
        selectedCount: number;
        selectableCount: number;
        onSelectAll: () => void;
        onDeselectAll: () => void;
        onBatchArchive: () => void;
        onBatchExport: () => void;
        isBusy: boolean;
    }) => (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-white px-3 py-2">
            <span className="text-sm font-semibold text-slate-700">{selectedCount}개 선택됨</span>
            <Button
                variant="link"
                size="sm"
                onClick={selectedCount === selectableCount ? onDeselectAll : onSelectAll}
                className="px-2 text-primary"
            >
                {selectedCount === selectableCount ? '전체 해제' : '전체 선택'}
            </Button>
            <div className="h-4 w-px bg-border/60" />
            <Button
                variant="ghost"
                size="sm"
                onClick={onBatchArchive}
                disabled={selectedCount === 0 || isBusy}
                className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
                <Trash className="w-4 h-4" weight="regular" />
                <span className="hidden sm:inline">보관</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onBatchExport} disabled={selectedCount === 0} className="gap-1">
                <DownloadSimple className="w-4 h-4" weight="regular" />
                <span className="hidden sm:inline">내보내기</span>
            </Button>
        </div>
    )
);
SelectionControls.displayName = 'SelectionControls';

const SORT_OPTIONS = [
    { value: 'name' as const, label: '이름순' },
    { value: 'lastUpdated' as const, label: '수정일순' },
    { value: 'questions' as const, label: '항목수순' },
    { value: 'author' as const, label: '작성자순' },
];

export const ToolbarSecondaryRow = memo((props: ToolbarSecondaryRowProps) => {
    const {
        fileInputRef,
        onFileChange,
        isSelectionMode,
        onToggleSelectionMode,
        selectedCount,
        selectableCount,
        onSelectAll,
        onDeselectAll,
        onBatchArchive,
        onBatchExport,
        isBusy,
        viewMode,
        onViewModeChange,
        sortField,
        onSortFieldChange,
        sortOrder,
        onToggleSortOrder,
        onImportClick,
        onExport,
        canExport,
        importError,
        compact = false,
    } = props;

    const hasSelection = isSelectionMode && selectedCount > 0;
    const showSelectionHint = isSelectionMode && selectedCount === 0;

    return (
        <div className={`flex flex-wrap items-center gap-3 ${compact ? '' : 'mt-4 pt-4 border-t border-border'} ${compact ? 'justify-end' : ''}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onFileChange}
                aria-label="파일 선택"
            />

            {/* Selection Controls - visible when selection mode has selections */}
            {hasSelection && (
                <SelectionControls
                    selectedCount={selectedCount}
                    selectableCount={selectableCount}
                    onSelectAll={onSelectAll}
                    onDeselectAll={onDeselectAll}
                    onBatchArchive={onBatchArchive}
                    onBatchExport={onBatchExport}
                    isBusy={isBusy}
                />
            )}

            {showSelectionHint && (
                <span className="text-xs text-slate-500">선택 모드에서 항목을 선택하세요.</span>
            )}

            {/* Spacer - pushes right items to the right */}
            {!compact && <div className="flex-1" />}

            {/* Right side: Sort + View Toggle + Import/Export + Selection toggle */}
            <div className="flex items-center gap-2">
                {/* Sort Controls */}
                <SortDropdown
                    options={SORT_OPTIONS}
                    value={sortField}
                    onChange={onSortFieldChange}
                    sortOrder={sortOrder}
                    onSortOrderChange={(order) => {
                        if (order !== sortOrder) onToggleSortOrder();
                    }}
                />

                {/* View Toggle */}
                <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} useTableMode={true} />

                <SelectionModeToggle isSelectionMode={isSelectionMode} onToggle={onToggleSelectionMode} />

                {/* Excel Dropdown - hidden when selection mode is active to avoid duplicate export */}
                {!isSelectionMode && (
                    <ExcelDropdownButton>
                        <DropdownItem onClick={onImportClick} disabled={isBusy}>
                            <UploadSimple className="w-4 h-4 mr-2" />
                            가져오기 (Import)
                        </DropdownItem>
                        <DropdownItem onClick={onExport} disabled={isBusy || !canExport}>
                            <DownloadSimple className="w-4 h-4 mr-2" />
                            내보내기 (Export)
                        </DropdownItem>
                    </ExcelDropdownButton>
                )}
            </div>

            {/* Error message */}
            {importError && !compact && (
                <div className="w-full text-sm text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                    {importError}
                </div>
            )}
        </div>
    );
});

ToolbarSecondaryRow.displayName = 'ToolbarSecondaryRow';
