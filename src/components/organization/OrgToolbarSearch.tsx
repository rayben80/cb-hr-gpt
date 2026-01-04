import { Calendar, FileArrowDown, FileArrowUp, MagnifyingGlass, UsersThree } from '@phosphor-icons/react';
import { memo, useState } from 'react';
import { Button, Dropdown, DropdownItem, SearchInput } from '../common';
import { ExcelImportModal } from './ExcelImportModal';

interface OrgToolbarSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    baseDate: string;
    onBaseDateChange: (value: string) => void;
    onAddTeam: () => void;
    totalCount: number;
    searchResultCount: number;
    onImportExcel: (file: File) => void;
    onExportExcel: () => void;
    onDownloadTemplate: () => void;
}

export const OrgToolbarSearch = memo(
    ({
        searchTerm,
        onSearchChange,
        baseDate,
        onBaseDateChange,
        onAddTeam,
        totalCount: _totalCount,
        searchResultCount: _searchResultCount,
        onImportExcel,
        onExportExcel,
        onDownloadTemplate,
    }: OrgToolbarSearchProps) => {
        // Removed local fileInputRef as it is moved to Modal
        // But wait, OrgToolbarSearch might still need it if we didn't fully move it?
        // Actually the plan is to use the modal's input.
        const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

        return (
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchInput
                        placeholder="구성원 이름, 부서로 검색..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="w-full pl-12 pr-20 py-3 text-base rounded-xl border-input focus:border-primary focus:ring-primary transition-all shadow-sm"
                        aria-label="구성원 검색"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <MagnifyingGlass className="w-5 h-5" weight="bold" />
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-1.5 text-sm font-medium shadow-sm transition-all"
                        >
                            검색
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Calendar
                                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                                weight="regular"
                            />
                        </div>
                        <input
                            type="date"
                            value={baseDate}
                            onChange={(e) => onBaseDateChange(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm hover:border-primary/50 cursor-pointer text-sm w-[160px]"
                            aria-label="기준일 선택"
                            title="기준일 선택"
                        />
                        <span className="absolute -top-2 left-3 px-1 bg-background text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                            기준일
                        </span>
                    </div>

                    {/* Excel Actions */}
                    <Dropdown
                        trigger={
                            <Button
                                variant="outline"
                                className="gap-2 px-3 py-3 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
                                aria-label="엑셀 관리"
                            >
                                <FileArrowUp className="w-5 h-5" weight="fill" />
                                <span className="hidden sm:inline font-medium">엑셀 관리</span>
                            </Button>
                        }
                    >
                        <DropdownItem onClick={() => setIsExcelModalOpen(true)}>
                            <FileArrowUp className="w-4 h-4 mr-2" />
                            조직원 일괄 등록 (Import)
                        </DropdownItem>
                        <DropdownItem onClick={onExportExcel}>
                            <FileArrowDown className="w-4 h-4 mr-2" />
                            조직도 내보내기 (Export)
                        </DropdownItem>
                    </Dropdown>

                    {/* Modal */}
                    <ExcelImportModal
                        isOpen={isExcelModalOpen}
                        onClose={() => setIsExcelModalOpen(false)}
                        onImport={onImportExcel}
                        onDownloadTemplate={onDownloadTemplate}
                    />

                    <Button
                        onClick={onAddTeam}
                        className="gap-2 px-5 py-3 rounded-xl shadow-sm hover:shadow-md active:scale-95 shrink-0 transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <UsersThree className="w-5 h-5" weight="bold" />
                        <span className="hidden sm:inline">팀 추가</span>
                        <span className="sm:hidden">추가</span>
                    </Button>
                </div>
            </div>
        );
    }
);
