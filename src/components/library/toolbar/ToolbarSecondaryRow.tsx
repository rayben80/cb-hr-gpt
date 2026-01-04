import { Button, ViewMode, ViewModeToggle } from '@/components/common';
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
}

/**
 * 선택 모드 토글 버튼
 * 디자인 패턴: 활성 상태가 명확하게 구분되는 토글 버튼
 */
const SelectionModeToggle = memo(
    ({ isSelectionMode, onToggle }: { isSelectionMode: boolean; onToggle: () => void }) => (
        <Button
            variant={isSelectionMode ? 'soft' : 'ghost'}
            size="sm"
            onClick={onToggle}
            className="gap-1.5"
            title={isSelectionMode ? '선택 모드 종료' : '선택 모드'}
        >
            <CheckSquare className="w-4 h-4" weight={isSelectionMode ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">{isSelectionMode ? '선택 해제' : '선택'}</span>
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
        <>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">
                <span className="text-primary">{selectedCount}</span>/{selectableCount}개 선택
            </span>
            <Button
                variant="link"
                size="sm"
                onClick={selectedCount === selectableCount ? onDeselectAll : onSelectAll}
                className="px-2"
            >
                {selectedCount === selectableCount ? '전체 해제' : '전체 선택'}
            </Button>
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
        </>
    )
);
SelectionControls.displayName = 'SelectionControls';

const SORT_OPTIONS = [
    { value: 'name' as const, label: '이름순' },
    { value: 'lastUpdated' as const, label: '수정일순' },
    { value: 'questions' as const, label: '항목수순' },
    { value: 'author' as const, label: '작성자순' },
];

/**
 * 가져오기/내보내기 버튼
 * 통일된 Button 컴포넌트 사용
 */
const ImportExportButtons = memo(
    ({
        onImportClick,
        onExport,
        isBusy,
        canExport,
    }: {
        onImportClick: () => void;
        onExport: () => void;
        isBusy: boolean;
        canExport: boolean;
    }) => (
        <>
            <Button variant="ghost" size="sm" onClick={onImportClick} disabled={isBusy} className="gap-1.5">
                <UploadSimple className="w-4 h-4" weight="regular" />
                <span className="hidden sm:inline">가져오기</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport} disabled={isBusy || !canExport} className="gap-1.5">
                <DownloadSimple className="w-4 h-4" weight="regular" />
                <span className="hidden sm:inline">내보내기</span>
            </Button>
        </>
    )
);
ImportExportButtons.displayName = 'ImportExportButtons';

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
    } = props;

    return (
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={onFileChange}
                aria-label="파일 선택"
            />

            {/* Left: Selection Mode Toggle */}
            <SelectionModeToggle isSelectionMode={isSelectionMode} onToggle={onToggleSelectionMode} />

            {/* Selection Controls - visible when selection mode is active */}
            {isSelectionMode && (
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

            {/* Spacer - pushes right items to the right */}
            <div className="flex-1" />

            {/* Right side: Sort + View Toggle + Import/Export */}
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

                {/* Import/Export Buttons - hidden when selection mode is active to avoid duplicate export */}
                {!isSelectionMode && (
                    <ImportExportButtons
                        onImportClick={onImportClick}
                        onExport={onExport}
                        isBusy={isBusy}
                        canExport={canExport}
                    />
                )}
            </div>

            {/* Error message */}
            {importError && (
                <div className="w-full text-sm text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg">
                    {importError}
                </div>
            )}
        </div>
    );
});

ToolbarSecondaryRow.displayName = 'ToolbarSecondaryRow';
