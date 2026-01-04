import { SearchInput } from '../common';

interface AdminEvaluationToolbarProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export const AdminEvaluationToolbar = ({
    tabs,
    activeTab,
    onTabChange,
    searchTerm,
    onSearchChange,
}: AdminEvaluationToolbarProps) => (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
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
        {/* Search Input - Using common component */}
        <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="평가명/구분 검색..."
            className="w-full md:w-64"
            showSearchButton={false}
        />
    </div>
);
