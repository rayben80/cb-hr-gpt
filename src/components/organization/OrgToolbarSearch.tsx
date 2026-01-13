import { FileArrowDown, FileArrowUp, UsersThree } from '@phosphor-icons/react';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { memo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Button, DropdownItem, ExcelDropdownButton, SearchInput } from '../common';
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
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                <SearchInput
                    placeholder="구성원 이름, 부서로 검색..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full sm:flex-1"
                    aria-label="구성원 검색"
                />

                <div className="flex items-end gap-3">
                    <div className="flex items-center h-12 rounded-xl bg-secondary/50 px-3 shadow-sm ring-1 ring-border/30">
                        <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">기준일</span>
                        <span className="mx-2 h-4 w-px bg-border/60" />
                        <DatePicker
                            selected={baseDate ? parse(baseDate, 'yyyy-MM-dd', new Date()) : null}
                            onChange={(date: Date | null) => onBaseDateChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            dateFormat="yyyy-MM-dd"
                            locale={ko}
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode="select"
                            placeholderText="YYYY-MM-DD"
                            className="w-[140px] bg-transparent border-0 p-0 text-base text-slate-700 focus:outline-none focus:ring-0"
                            wrapperClassName="w-auto"
                        />
                    </div>

                    {/* Excel Actions */}
                    <ExcelDropdownButton>
                        <DropdownItem onClick={() => setIsExcelModalOpen(true)}>
                            <FileArrowUp className="w-4 h-4 mr-2" />
                            조직원 일괄 등록 (Import)
                        </DropdownItem>
                        <DropdownItem onClick={onExportExcel}>
                            <FileArrowDown className="w-4 h-4 mr-2" />
                            조직도 내보내기 (Export)
                        </DropdownItem>
                    </ExcelDropdownButton>

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
