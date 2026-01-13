import { CaretDown, SortAscending, SortDescending } from '@phosphor-icons/react';
import React from 'react';
import { Button, ViewMode, ViewModeToggle } from '../common';

interface Tab {
    id: string;
    label: string;
}

interface OrgToolbarActionsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    sortOption: 'name_asc' | 'members_desc';
    onSortChange: (option: 'name_asc' | 'members_desc') => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export const OrgToolbarActions: React.FC<OrgToolbarActionsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    sortOption,
    onSortChange,
    viewMode,
    onViewModeChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4 mt-2">
            {/* Left: Tabs */}
            <nav className="flex space-x-1 bg-muted p-1 rounded-lg" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`${
                            activeTab === tab.id
                                ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        } whitespace-nowrap px-4 py-2 rounded-md font-medium text-sm transition-all`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Right: Actions Group */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Sort Dropdown */}
                <div className="relative group">
                    <Button
                        variant="outline"
                        className="gap-2 h-12 px-4 text-sm font-medium shadow-sm hover:border-primary/50 hover:text-primary group-hover:ring-1 group-hover:ring-primary/20 bg-background text-foreground"
                    >
                        {sortOption === 'name_asc' ? (
                            <SortAscending
                                className="w-4 h-4 text-muted-foreground group-hover:text-primary"
                                weight="regular"
                            />
                        ) : (
                            <SortDescending
                                className="w-4 h-4 text-muted-foreground group-hover:text-primary"
                                weight="regular"
                            />
                        )}
                        <span>{sortOption === 'name_asc' ? '이름순' : '인원순'}</span>
                        <CaretDown
                            className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary"
                            weight="regular"
                        />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-32 z-10 hidden group-hover:block">
                        <div className="absolute -top-2 left-0 w-full h-2 bg-transparent"></div>
                        <div className="bg-popover border border-border rounded-lg shadow-lg py-1">
                            <button
                                onClick={() => onSortChange('name_asc')}
                                className={`w-full text-left px-3 py-2 text-sm ${sortOption === 'name_asc' ? 'text-primary bg-primary/10 font-bold' : 'text-foreground hover:bg-muted'}`}
                            >
                                이름순
                            </button>
                            <button
                                onClick={() => onSortChange('members_desc')}
                                className={`w-full text-left px-3 py-2 text-sm ${sortOption === 'members_desc' ? 'text-primary bg-primary/10 font-bold' : 'text-foreground hover:bg-muted'}`}
                            >
                                인원순
                            </button>
                        </div>
                    </div>
                </div>

                {/* View Toggle - Using common component */}
                <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
        </div>
    );
};
