import { DatePicker } from '@/components/common/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { REPORTING_CATEGORY_OPTIONS } from '@/constants';
import { format, isValid, parseISO } from 'date-fns';
import { SearchInput } from '../common';

interface AdminEvaluationToolbarProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    teamFilter: string;
    categoryFilter: string;
    periodStartFilter: string;
    periodEndFilter: string;
    teamOptions: string[];
    onTeamFilterChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    onPeriodStartChange: (value: string) => void;
    onPeriodEndChange: (value: string) => void;
    onResetFilters: () => void;
}

export const AdminEvaluationToolbar = ({
    tabs,
    activeTab,
    onTabChange,
    searchTerm,
    onSearchChange,
    teamFilter,
    categoryFilter,
    periodStartFilter,
    periodEndFilter,
    teamOptions,
    onTeamFilterChange,
    onCategoryFilterChange,
    onPeriodStartChange,
    onPeriodEndChange,
    onResetFilters,
}: AdminEvaluationToolbarProps) => (
    <div className="space-y-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-auto">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab)}
                                className={`${
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <SearchInput
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="평가명/대상자 검색..."
                className="w-full md:w-64"
                showSearchButton={false}
            />
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-700">팀</span>
                <Select value={teamFilter} onValueChange={onTeamFilterChange}>
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="전체">전체</SelectItem>
                        {teamOptions.map((team) => (
                            <SelectItem key={team} value={team}>
                                {team}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-700">분류</span>
                <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="전체">전체</SelectItem>
                        {REPORTING_CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-700">기간</span>
                <div className="w-[140px]">
                    <DatePicker
                        selected={periodStartFilter ? parseISO(periodStartFilter) : null}
                        onChange={(date) =>
                            onPeriodStartChange(date && isValid(date) ? format(date, 'yyyy-MM-dd') : '')
                        }
                        placeholderText="시작일"
                        dateFormat="yyyy-MM-dd"
                    />
                </div>
                <span className="text-slate-400">~</span>
                <div className="w-[140px]">
                    <DatePicker
                        selected={periodEndFilter ? parseISO(periodEndFilter) : null}
                        onChange={(date) => onPeriodEndChange(date && isValid(date) ? format(date, 'yyyy-MM-dd') : '')}
                        placeholderText="종료일"
                        dateFormat="yyyy-MM-dd"
                        minDate={periodStartFilter ? parseISO(periodStartFilter) : undefined}
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={onResetFilters}
                className="ml-auto text-sm text-slate-500 hover:text-primary transition-colors"
            >
                초기화
            </button>
        </div>
    </div>
);
