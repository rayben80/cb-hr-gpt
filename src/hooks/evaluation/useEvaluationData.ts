import { useCallback, useMemo, useState } from 'react';
import { currentUser, Evaluation, EvaluationTemplate, Team, TEAM_LEADER_TEAM_ID } from '../../constants';
import { useRole } from '../../contexts/RoleContext';
import { resolveTeamScope, TeamScope } from '../../utils/teamScope';
import { filterEvaluations, isEvaluationVisibleToTeam, normalizeEvaluationSubjectIds } from './evaluationDataUtils';
import { useEvaluationDataSource } from './useEvaluationDataSource';

interface EvaluationWeights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
    summaryYear: number;
    showMonthlyPartialAverage: boolean;
}

interface UseEvaluationDataReturn {
    // Data
    evaluations: Evaluation[];
    normalizedEvaluations: Evaluation[];
    filteredEvaluations: Evaluation[];
    templates: EvaluationTemplate[];
    teams: Team[];

    // State
    isLoading: boolean;
    error: string | null;
    activeTab: string;
    searchTerm: string;
    evaluationWeights: EvaluationWeights;
    teamFilter: string;
    categoryFilter: string;
    periodStartFilter: string;
    periodEndFilter: string;

    // User View Data
    userMyEvaluations: Evaluation[];
    userCompletedEvaluations: Evaluation[];

    // Actions
    setActiveTab: (tab: string) => void;
    setSearchTerm: (term: string) => void;
    setEvaluationWeights: (weights: EvaluationWeights) => void;
    setTeamFilter: (value: string) => void;
    setCategoryFilter: (value: string) => void;
    setPeriodStartFilter: (value: string) => void;
    setPeriodEndFilter: (value: string) => void;
    resetFilters: () => void;
    addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'status' | 'progress' | 'score' | 'answers'>) => void;
    updateEvaluation: (id: number | string, updates: Partial<Evaluation>) => void;
    refreshEvaluations: () => Promise<void>;

    // Constants
    tabs: string[];
    today: string;
}

export function useEvaluationData(): UseEvaluationDataReturn {
    const { role } = useRole();
    const { evaluations, setEvaluations, templates, teams, isLoading, refreshEvaluations, useMockData } =
        useEvaluationDataSource(role);
    const error: string | null = null;
    const [activeTab, setActiveTab] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('전체');
    const [categoryFilter, setCategoryFilter] = useState('전체');
    const [periodStartFilter, setPeriodStartFilter] = useState('');
    const [periodEndFilter, setPeriodEndFilter] = useState('');
    const [evaluationWeights, setEvaluationWeights] = useState<EvaluationWeights>({
        firstHalf: 40,
        secondHalf: 40,
        peerReview: 20,
        summaryYear: new Date().getFullYear(),
        showMonthlyPartialAverage: false,
    });

    const tabs = useMemo(() => ['전체', '진행중', '완료', '예정'], []);
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const evaluationsWithSubjectIds = useMemo(
        () => normalizeEvaluationSubjectIds(evaluations, teams),
        [evaluations, teams]
    );

    const teamScope = useMemo<TeamScope>(() => {
        if (role !== 'TEAM_LEADER') return {};
        return resolveTeamScope(teams, currentUser.name, { teamId: TEAM_LEADER_TEAM_ID });
    }, [role, teams]);

    const scopedEvaluations = useMemo(() => {
        if (useMockData) return evaluationsWithSubjectIds;
        if (role !== 'TEAM_LEADER') return evaluationsWithSubjectIds;
        const teamId = teamScope.teamId;
        if (!teamId) return [];
        return evaluationsWithSubjectIds.filter((e) => isEvaluationVisibleToTeam(e, teamId));
    }, [evaluationsWithSubjectIds, role, teamScope.teamId, useMockData]);

    const normalizedEvaluations = useMemo(
        () =>
            scopedEvaluations.map((e) => {
                if (e.status === '완료') return e;
                if (e.endDate && e.endDate < today) return { ...e, status: '완료' as const };
                if (e.startDate && e.startDate > today) return { ...e, status: '예정' as const };
                return { ...e, status: '진행중' as const };
            }),
        [scopedEvaluations, today]
    );

    const filteredEvaluations = useMemo(
        () =>
            filterEvaluations({
                normalizedEvaluations,
                role,
                activeTab,
                searchTerm,
                teamId: role === 'TEAM_LEADER' && teamScope.teamId ? teamScope.teamId : undefined,
                filters: {
                    teamFilter,
                    categoryFilter,
                    periodStartFilter,
                    periodEndFilter,
                },
            }),
        [
            normalizedEvaluations,
            role,
            activeTab,
            searchTerm,
            teamScope.teamId,
            teamFilter,
            categoryFilter,
            periodStartFilter,
            periodEndFilter,
        ]
    );

    const userMyEvaluations = useMemo(() => {
        return normalizedEvaluations.filter(
            (e) => (e.status === '진행중' || e.status === '예정') && e.subjectId !== 'campaign'
        );
    }, [normalizedEvaluations]);
    const userCompletedEvaluations = useMemo(() => {
        return normalizedEvaluations.filter((e) => e.status === '완료');
    }, [normalizedEvaluations]);

    const addEvaluation = useCallback(
        (newEvaluationData: Omit<Evaluation, 'id' | 'status' | 'progress' | 'score' | 'answers'>) => {
            const id = Date.now();
            const status = newEvaluationData.startDate <= today ? ('진행중' as const) : ('예정' as const);

            const evaluationToAdd: Evaluation = {
                ...newEvaluationData,
                id,
                status,
                progress: 0,
                score: null,
                answers: [],
                // Ensure required fields for ID-linking are present or have fallbacks
                subjectId: newEvaluationData.subjectId || 'unknown',
                subjectSnapshot: newEvaluationData.subjectSnapshot || {
                    name: newEvaluationData.subject,
                    role: 'Unknown',
                    teamId: 'unknown',
                    teamName: 'Unknown',
                },
            };
            setEvaluations((prev) => [...prev, evaluationToAdd]);
        },
        [setEvaluations, today]
    );

    const updateEvaluation = useCallback(
        (id: number | string, updates: Partial<Evaluation>) => {
            setEvaluations((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
        },
        [setEvaluations]
    );

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setTeamFilter('전체');
        setCategoryFilter('전체');
        setPeriodStartFilter('');
        setPeriodEndFilter('');
    }, []);

    return {
        evaluations: evaluationsWithSubjectIds,
        normalizedEvaluations,
        filteredEvaluations,
        templates,
        teams,
        isLoading,
        error,
        activeTab,
        searchTerm,
        evaluationWeights,
        teamFilter,
        categoryFilter,
        periodStartFilter,
        periodEndFilter,
        userMyEvaluations,
        userCompletedEvaluations,
        setActiveTab,
        setSearchTerm,
        setEvaluationWeights,
        setTeamFilter,
        setCategoryFilter,
        setPeriodStartFilter,
        setPeriodEndFilter,
        resetFilters,
        addEvaluation,
        updateEvaluation,
        refreshEvaluations,
        tabs,
        today,
    };
}
