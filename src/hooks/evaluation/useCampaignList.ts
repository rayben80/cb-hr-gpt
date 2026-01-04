import { useState, useMemo, useCallback } from 'react';
import { Evaluation } from '../../constants';

export type CampaignStatus = 'all' | '진행중' | '예정' | '완료';

export interface UseCampaignListOptions {
    campaigns: Evaluation[];
}

/**
 * 캠페인 목록 조회 및 필터링을 위한 커스텀 훅
 */
export const useCampaignList = ({ campaigns }: UseCampaignListOptions) => {
    const [statusFilter, setStatusFilter] = useState<CampaignStatus>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'endDate' | 'progress'>('startDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filter campaigns by status
    const filteredByStatus = useMemo(() => {
        if (statusFilter === 'all') return campaigns;
        return campaigns.filter(c => c.status === statusFilter);
    }, [campaigns, statusFilter]);

    // Filter by search term
    const filteredBySearch = useMemo(() => {
        if (!searchTerm.trim()) return filteredByStatus;
        const lowerSearch = searchTerm.toLowerCase();
        return filteredByStatus.filter(c =>
            c.name.toLowerCase().includes(lowerSearch) ||
            c.type?.toLowerCase().includes(lowerSearch) ||
            c.period?.toLowerCase().includes(lowerSearch)
        );
    }, [filteredByStatus, searchTerm]);

    // Sort campaigns
    const sortedCampaigns = useMemo(() => {
        const sorted = [...filteredBySearch].sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'startDate':
                    comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                    break;
                case 'endDate':
                    comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
                    break;
                case 'progress':
                    comparison = (a.progress || 0) - (b.progress || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return sorted;
    }, [filteredBySearch, sortBy, sortOrder]);

    // Statistics
    const stats = useMemo(() => ({
        total: campaigns.length,
        active: campaigns.filter(c => c.status === '진행중').length,
        scheduled: campaigns.filter(c => c.status === '예정').length,
        completed: campaigns.filter(c => c.status === '완료').length,
    }), [campaigns]);

    // Toggle sort order
    const toggleSortOrder = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setStatusFilter('all');
        setSearchTerm('');
        setSortBy('startDate');
        setSortOrder('desc');
    }, []);

    return {
        // Filtered & sorted data
        campaigns: sortedCampaigns,
        stats,

        // Filter state
        statusFilter,
        setStatusFilter,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,

        // Actions
        toggleSortOrder,
        clearFilters,
    };
};

export type UseCampaignListReturn = ReturnType<typeof useCampaignList>;
