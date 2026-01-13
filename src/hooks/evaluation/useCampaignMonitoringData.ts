import { useCallback, useEffect, useMemo, useState } from 'react';
import { Evaluation, Team } from '../../constants';
import { loadFromStorage, useDebouncedStorage } from '../common';
import {
    buildAdjustmentsMap,
    buildEvaluateeSummaries,
    buildMembersMap,
    buildParticipants,
    buildStats,
    filterSummaries,
} from './monitoringDataUtils';
import { buildMockMonitoringData } from './monitoringMockData';
import { MonitoringSortKey, MonitoringStatusFilter } from './monitoringTypes';
import { EvaluationAdjustment, useFirestoreEvaluation } from './useFirestoreEvaluation';

interface UseCampaignMonitoringDataParams {
    evaluation: Evaluation;
    teams: Team[];
}

export const useCampaignMonitoringData = ({ evaluation, teams }: UseCampaignMonitoringDataParams) => {
    const { fetchCampaignAssignments, fetchResultsByCampaign, fetchAdjustmentsByCampaign } = useFirestoreEvaluation();
    const useMockData =
        import.meta.env.VITE_USE_MOCK_MONITORING === '1' || import.meta.env.VITE_USE_MOCK_MONITORING === 'true';
    const [assignments, setAssignments] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [adjustments, setAdjustments] = useState<EvaluationAdjustment[]>([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<MonitoringStatusFilter>('all');
    const [sortKey, setSortKey] = useState<MonitoringSortKey>('score_desc');
    const [lowScoreThreshold, setLowScoreThreshold] = useState<number | ''>('');

    const storageKey = useMemo(() => `campaign-monitoring-filters-${evaluation.id}`, [evaluation.id]);
    useEffect(() => {
        const stored = loadFromStorage(storageKey, {
            statusFilter: 'all',
            sortKey: 'score_desc',
            lowScoreThreshold: '',
        });
        setStatusFilter((stored.statusFilter ?? 'all') as MonitoringStatusFilter);
        setSortKey((stored.sortKey ?? 'score_desc') as MonitoringSortKey);
        setLowScoreThreshold((stored.lowScoreThreshold ?? '') as number | '');
    }, [storageKey]);

    useDebouncedStorage(storageKey, {
        statusFilter,
        sortKey,
        lowScoreThreshold,
    });

    const membersMap = useMemo(() => buildMembersMap(teams), [teams]);
    const adjustmentsMap = useMemo(() => buildAdjustmentsMap(adjustments), [adjustments]);

    const loadData = useCallback(async () => {
        setResultsLoading(true);
        if (useMockData) {
            const mockData = buildMockMonitoringData(teams, evaluation);
            setAssignments(mockData.assignments);
            setResults(mockData.results);
            setAdjustments(mockData.adjustments);
            setResultsLoading(false);
            return;
        }
        const [assignmentData, resultData, adjustmentData] = await Promise.all([
            fetchCampaignAssignments(String(evaluation.id)),
            fetchResultsByCampaign(String(evaluation.id)),
            fetchAdjustmentsByCampaign(String(evaluation.id)),
        ]);
        setAssignments(assignmentData);
        setResults(resultData);
        setAdjustments(adjustmentData);
        setResultsLoading(false);
    }, [evaluation, fetchCampaignAssignments, fetchResultsByCampaign, fetchAdjustmentsByCampaign, teams, useMockData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const participants = useMemo(() => buildParticipants(assignments, membersMap), [assignments, membersMap]);
    const stats = useMemo(() => buildStats(participants), [participants]);
    const evaluateeSummaries = useMemo(
        () => buildEvaluateeSummaries(assignments, results, membersMap, adjustmentsMap, evaluation),
        [assignments, results, membersMap, adjustmentsMap, evaluation]
    );
    const filteredEvaluateeSummaries = useMemo(
        () => filterSummaries(evaluateeSummaries, statusFilter, sortKey, lowScoreThreshold),
        [evaluateeSummaries, statusFilter, sortKey, lowScoreThreshold]
    );

    const resetFilters = useCallback(() => {
        setStatusFilter('all');
        setSortKey('score_desc');
        setLowScoreThreshold('');
    }, []);

    return {
        assignments,
        setAssignments,
        results,
        adjustments,
        setAdjustments,
        adjustmentsMap,
        membersMap,
        participants,
        stats,
        evaluateeSummaries,
        filteredEvaluateeSummaries,
        statusFilter,
        setStatusFilter,
        sortKey,
        setSortKey,
        lowScoreThreshold,
        setLowScoreThreshold,
        resultsLoading,
        resetFilters,
    };
};
