import { FileXls } from '@phosphor-icons/react';
import { memo, ReactNode } from 'react';
import { Button, Dropdown } from './index';

interface ExcelDropdownButtonProps {
    /** 드롭다운 메뉴 아이템들 */
    children: ReactNode;
}

/**
 * 공통 Excel 드롭다운 버튼 컴포넌트
 * 조직 관리, 평가 템플릿 등에서 일관된 스타일로 사용
 *
 * @example
 * <ExcelDropdownButton>
 *   <DropdownItem onClick={handleImport}>가져오기</DropdownItem>
 *   <DropdownItem onClick={handleExport}>내보내기</DropdownItem>
 * </ExcelDropdownButton>
 */
export const ExcelDropdownButton = memo(({ children }: ExcelDropdownButtonProps) => (
    <Dropdown
        trigger={
            <Button
                variant="outline"
                className="gap-2 h-12 px-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800"
                aria-label="Excel"
            >
                <FileXls className="w-5 h-5" weight="fill" />
                <span className="hidden sm:inline font-medium">Excel</span>
            </Button>
        }
    >
        {children}
    </Dropdown>
));

ExcelDropdownButton.displayName = 'ExcelDropdownButton';
