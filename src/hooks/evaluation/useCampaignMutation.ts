import { useState, useCallback } from 'react';
import { Evaluation } from '../../constants';
import { showSuccess, showError } from '../../utils/toast';

export interface UseCampaignMutationOptions {
    onCampaignCreated?: (campaign: Evaluation) => void;
    onCampaignUpdated?: (campaign: Evaluation) => void;
    onCampaignDeleted?: (campaignId: string) => void;
}

/**
 * 캠페인 생성/수정/삭제를 위한 커스텀 훅
 */
export const useCampaignMutation = (options: UseCampaignMutationOptions = {}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create campaign
    const createCampaign = useCallback(async (
        campaignData: Omit<Evaluation, 'id' | 'status' | 'progress' | 'score'>
    ): Promise<Evaluation | null> => {
        setIsCreating(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));

            const newCampaign: Evaluation = {
                ...campaignData,
                id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: campaignData.startDate <= new Date().toISOString().slice(0, 10) ? '진행중' : '예정',
                progress: 0,
                score: null,
            };

            showSuccess(`'${newCampaign.name}' 캠페인이 생성되었습니다.`);
            options.onCampaignCreated?.(newCampaign);
            return newCampaign;
        } catch (error) {
            showError('캠페인 생성 중 오류가 발생했습니다.');
            console.error('Failed to create campaign:', error);
            return null;
        } finally {
            setIsCreating(false);
        }
    }, [options]);

    // Update campaign
    const updateCampaign = useCallback(async (
        campaignId: string,
        updates: Partial<Evaluation>
    ): Promise<boolean> => {
        setIsUpdating(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));

            // In real app, this would update the campaign via API
            showSuccess('캠페인이 수정되었습니다.');
            options.onCampaignUpdated?.({ id: campaignId, ...updates } as Evaluation);
            return true;
        } catch (error) {
            showError('캠페인 수정 중 오류가 발생했습니다.');
            console.error('Failed to update campaign:', error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [options]);

    // Delete campaign
    const deleteCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
        setIsDeleting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));

            showSuccess('캠페인이 삭제되었습니다.');
            options.onCampaignDeleted?.(campaignId);
            return true;
        } catch (error) {
            showError('캠페인 삭제 중 오류가 발생했습니다.');
            console.error('Failed to delete campaign:', error);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, [options]);

    // Complete campaign (finalize)
    const completeCampaign = useCallback(async (campaignId: string): Promise<boolean> => {
        return updateCampaign(campaignId, { status: '완료' });
    }, [updateCampaign]);

    return {
        // Loading states
        isCreating,
        isUpdating,
        isDeleting,
        isLoading: isCreating || isUpdating || isDeleting,

        // Mutation actions
        createCampaign,
        updateCampaign,
        deleteCampaign,
        completeCampaign,
    };
};

export type UseCampaignMutationReturn = ReturnType<typeof useCampaignMutation>;
