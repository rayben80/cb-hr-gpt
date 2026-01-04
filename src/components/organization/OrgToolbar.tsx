import { memo } from 'react';
import { ViewMode } from '../common';
import { OrgToolbarActions } from './OrgToolbarActions';
import { OrgToolbarSearch } from './OrgToolbarSearch';

interface Tab {
    id: string;
    label: string;
}

interface OrgToolbarProps {
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Date
    baseDate: string;
    onBaseDateChange: (value: string) => void;
    // Tabs
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    // Sort
    sortOption: 'name_asc' | 'members_desc';
    onSortChange: (option: 'name_asc' | 'members_desc') => void;
    // View
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    // Actions
    onAddTeam: () => void;
    // Stats
    totalCount: number;
    searchResultCount: number;
    // Excel
    onImportExcel: (file: File) => void;
    onExportExcel: () => void;
    onDownloadTemplate: () => void;
}

export const OrgToolbar = memo(
    ({
        searchTerm,
        onSearchChange,
        baseDate,
        onBaseDateChange,
        tabs,
        activeTab,
        onTabChange,
        sortOption,
        onSortChange,
        viewMode,
        onViewModeChange,
        onAddTeam,
        totalCount,
        searchResultCount,
        onImportExcel,
        onExportExcel,
        onDownloadTemplate,
    }: OrgToolbarProps) => (
        <div className="card-premium p-4 sm:p-6 mb-6 space-y-6 transition-all">
            <OrgToolbarSearch
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                baseDate={baseDate}
                onBaseDateChange={onBaseDateChange}
                onAddTeam={onAddTeam}
                totalCount={totalCount}
                searchResultCount={searchResultCount}
                onImportExcel={onImportExcel}
                onExportExcel={onExportExcel}
                onDownloadTemplate={onDownloadTemplate}
            />
            <OrgToolbarActions
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                sortOption={sortOption}
                onSortChange={onSortChange}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    )
);

OrgToolbar.displayName = 'OrgToolbar';
