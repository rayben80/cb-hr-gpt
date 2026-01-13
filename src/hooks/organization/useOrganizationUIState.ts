import { ViewMode } from '@/components/common';
import { useMemo, useState } from 'react';
import { StatusFilter } from './organizationLogicHelpers';
import { useOrganizationFilter } from './useOrganizationFilter';

export function useOrganizationUIState(teams: any[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('orgChart');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortOption, setSortOption] = useState<'name_asc' | 'members_desc'>('name_asc');

    const { activeTeams, filteredInactiveMembers } = useOrganizationFilter(teams, searchTerm);

    const tabs = useMemo(
        () => [
            { id: 'orgChart', label: '조직도' },
            {
                id: 'inactive',
                label: `비활성 인원 (${filteredInactiveMembers.onLeave.length + filteredInactiveMembers.resigned.length})`,
            },
        ],
        [filteredInactiveMembers]
    );

    const handleStatusFilterChange = (nextFilter: StatusFilter) => {
        setStatusFilter((prev) => {
            const resolved = prev === nextFilter ? 'all' : nextFilter;
            if (resolved === 'on_leave' || resolved === 'resigned') setActiveTab('inactive');
            else setActiveTab('orgChart');
            return resolved;
        });
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        if (tabId === 'orgChart' && (statusFilter === 'on_leave' || statusFilter === 'resigned'))
            setStatusFilter('all');
        if (tabId === 'inactive' && (statusFilter === 'active' || statusFilter === 'intern')) setStatusFilter('all');
    };

    return {
        searchTerm,
        setSearchTerm,
        baseDate,
        setBaseDate,
        activeTab,
        setActiveTab,
        statusFilter,
        setStatusFilter,
        viewMode,
        setViewMode,
        sortOption,
        setSortOption,
        activeTeams,
        filteredInactiveMembers,
        tabs,
        handleStatusFilterChange,
        handleTabChange,
    };
}
