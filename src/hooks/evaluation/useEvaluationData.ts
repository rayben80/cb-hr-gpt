import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Evaluation,
    EvaluationTemplate,
    Team,
    currentUser,
    initialEvaluationsData,
    initialLibraryData,
    initialTeamsData,
    TEAM_LEADER_TEAM_ID,
} from '../../constants';
import { useRole } from '../../contexts/RoleContext';
import { resolveTeamScope, TeamScope } from '../../utils/teamScope';
import { normalizeTeamsMemberRoles } from '../../utils/memberRoleUtils';

interface EvaluationWeights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
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

    // User View Data
    userMyEvaluations: Evaluation[];
    userCompletedEvaluations: Evaluation[];

    // Actions
    setActiveTab: (tab: string) => void;
    setSearchTerm: (term: string) => void;
    setEvaluationWeights: (weights: EvaluationWeights) => void;
    addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'status' | 'progress' | 'score' | 'answers'>) => void;
    updateEvaluation: (id: number | string, updates: Partial<Evaluation>) => void;

    // Constants
    tabs: string[];
    today: string;
}

export function useEvaluationData(): UseEvaluationDataReturn {
    const { role } = useRole();

    // Core State
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState<string | null>(null);

    // Filter State
    const [activeTab, setActiveTab] = useState('전체');
    const [searchTerm, setSearchTerm] = useState('');

    // Settings
    const [evaluationWeights, setEvaluationWeights] = useState<EvaluationWeights>({
        firstHalf: 40,
        secondHalf: 40,
        peerReview: 20,
    });

    // Constants
    const tabs = useMemo(() => ['전체', '진행중', '완료', '예정'], []);
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // Data Fetching (mock data until backend integration)
    useEffect(() => {
        setEvaluations(initialEvaluationsData);
        setTemplates(initialLibraryData);
        setTeams(normalizeTeamsMemberRoles(initialTeamsData).teams);
        setIsLoading(false);
    }, []);

    const evaluationsWithSubjectIds = useMemo(
        () => normalizeEvaluationSubjectIds(evaluations, teams),
        [evaluations, teams]
    );

    const teamScope = useMemo<TeamScope>(() => {
        if (role !== 'TEAM_LEADER') return {};
        return resolveTeamScope(teams, currentUser.name, { teamId: TEAM_LEADER_TEAM_ID });
    }, [role, teams]);

    const scopedEvaluations = useMemo(() => {
        if (role !== 'TEAM_LEADER') return evaluationsWithSubjectIds;
        const teamId = teamScope.teamId;
        if (!teamId) return [];
        return evaluationsWithSubjectIds.filter((e) => isEvaluationVisibleToTeam(e, teamId));
    }, [evaluationsWithSubjectIds, role, teamScope.teamId]);

    // Normalize evaluations (compute status based on dates)
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

    // Filter evaluations by role, tab, and search
    const filteredEvaluations = useMemo(
        () =>
            filterEvaluations(
                normalizedEvaluations,
                role,
                activeTab,
                searchTerm,
                role === 'TEAM_LEADER' ? teamScope.teamId : undefined
            ),
        [normalizedEvaluations, role, activeTab, searchTerm, teamScope.teamId]
    );

    // User View Filters
    const userMyEvaluations = useMemo(() => {
        return normalizedEvaluations.filter((e) => e.status === '진행중' || e.status === '예정');
    }, [normalizedEvaluations]);

    const userCompletedEvaluations = useMemo(() => {
        return normalizedEvaluations.filter((e) => e.status === '완료');
    }, [normalizedEvaluations]);

    // Actions
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
        [today]
    );

    const updateEvaluation = useCallback((id: number | string, updates: Partial<Evaluation>) => {
        setEvaluations((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
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
        userMyEvaluations,
        userCompletedEvaluations,
        setActiveTab,
        setSearchTerm,
        setEvaluationWeights,
        addEvaluation,
        updateEvaluation,
        tabs,
        today,
    };
}

function filterEvaluations(
    normalizedEvaluations: Evaluation[],
    role: string | undefined, // RoleContext uses string | undefined
    activeTab: string,
    searchTerm: string,
    teamId?: string
): Evaluation[] {
    let roleFiltered = normalizedEvaluations;

    if (role === 'TEAM_LEADER') {
        if (!teamId) return [];
        roleFiltered = normalizedEvaluations.filter((e) => {
            return isEvaluationVisibleToTeam(e, teamId);
        });
    }

    const statusFiltered = activeTab === '전체' ? roleFiltered : roleFiltered.filter((e) => e.status === activeTab);

    const query = searchTerm.trim().toLowerCase();
    if (!query) return statusFiltered;

    return statusFiltered.filter(
        (e) =>
            e.name.toLowerCase().includes(query) ||
            e.type.toLowerCase().includes(query) ||
            e.subject.toLowerCase().includes(query)
    );
}

function isEvaluationVisibleToTeam(evaluation: Evaluation, teamId: string): boolean {
    if (evaluation.subjectId === teamId) return true;
    return evaluation.subjectSnapshot?.teamId === teamId;
}

function normalizeEvaluationSubjectIds(evaluations: Evaluation[], teams: Team[]): Evaluation[] {
    let changed = false;
    const normalized = evaluations.map((evaluation) => {
        if (!isMissingSubjectId(evaluation.subjectId)) return evaluation;
        const resolved = resolveSubjectId(evaluation, teams);
        if (!resolved) return evaluation;
        changed = true;
        return { ...evaluation, subjectId: resolved };
    });

    return changed ? normalized : evaluations;
}

function isMissingSubjectId(subjectId: string | undefined): boolean {
    return !subjectId || subjectId === 'unknown';
}

function resolveSubjectId(evaluation: Evaluation, teams: Team[]): string | null {
    const snapshot = evaluation.subjectSnapshot;
    const subjectName = snapshot?.name || evaluation.subject;

    if (snapshot?.teamId && snapshot?.teamName) {
        const isTeamLevel = snapshot.name === snapshot.teamName || evaluation.subject === snapshot.teamName;
        if (isTeamLevel) return snapshot.teamId;
    }

    const candidateTeams = snapshot?.teamId ? teams.filter((team) => team.id === snapshot.teamId) : teams;
    const matches = new Set<string>();

    candidateTeams.forEach((team) => {
        if (snapshot?.partId) {
            const targetPart = team.parts.find((part) => part.id === snapshot.partId);
            targetPart?.members.forEach((member) => {
                if (member.name === subjectName) matches.add(member.id);
            });
        } else {
            (team.members || []).forEach((member) => {
                if (member.name === subjectName) matches.add(member.id);
            });
            team.parts.forEach((part) => {
                part.members.forEach((member) => {
                    if (member.name === subjectName) matches.add(member.id);
                });
            });
        }
    });

    return matches.size === 1 ? Array.from(matches)[0] : null;
}
