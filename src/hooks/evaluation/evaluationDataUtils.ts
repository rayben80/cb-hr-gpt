import { Evaluation, Team } from '../../constants';

export interface EvaluationFilters {
    teamFilter: string;
    categoryFilter: string;
    periodStartFilter: string;
    periodEndFilter: string;
}

interface FilterEvaluationsParams {
    normalizedEvaluations: Evaluation[];
    role: string | undefined;
    activeTab: string;
    searchTerm: string;
    teamId?: string | undefined;
    filters?: EvaluationFilters;
}

export const filterEvaluations = ({
    normalizedEvaluations,
    role,
    activeTab,
    searchTerm,
    teamId,
    filters,
}: FilterEvaluationsParams): Evaluation[] => {
    let roleFiltered = normalizedEvaluations;

    if (role === 'TEAM_LEADER') {
        if (!teamId) return [];
        roleFiltered = normalizedEvaluations.filter((evaluation) => isEvaluationVisibleToTeam(evaluation, teamId));
    }

    const statusFiltered = activeTab === '전체' ? roleFiltered : roleFiltered.filter((e) => e.status === activeTab);

    const query = searchTerm.trim().toLowerCase();
    let filtered = statusFiltered;
    if (query) {
        filtered = filtered.filter(
            (e) =>
                e.name.toLowerCase().includes(query) ||
                e.type.toLowerCase().includes(query) ||
                e.subject.toLowerCase().includes(query)
        );
    }

    if (filters) {
        const { teamFilter, categoryFilter, periodStartFilter, periodEndFilter } = filters;

        if (teamFilter && teamFilter !== '전체') {
            filtered = filtered.filter((evaluation) => {
                const teamName = evaluation.subjectSnapshot?.teamName || evaluation.subject;
                return teamName === teamFilter;
            });
        }

        if (categoryFilter && categoryFilter !== '전체') {
            filtered = filtered.filter((evaluation) => {
                const category = evaluation.reportingCategory || evaluation.evaluationType || '';
                return category === categoryFilter;
            });
        }

        if (periodStartFilter || periodEndFilter) {
            const start = periodStartFilter ? new Date(periodStartFilter) : null;
            const end = periodEndFilter ? new Date(periodEndFilter) : null;
            filtered = filtered.filter((evaluation) => {
                if (!evaluation.startDate || !evaluation.endDate) return true;
                const evalStart = new Date(evaluation.startDate);
                const evalEnd = new Date(evaluation.endDate);
                if (start && evalEnd < start) return false;
                if (end && evalStart > end) return false;
                return true;
            });
        }
    }

    return filtered;
};

export const isEvaluationVisibleToTeam = (evaluation: Evaluation, teamId: string): boolean => {
    if (evaluation.subjectId === teamId) return true;
    return evaluation.subjectSnapshot?.teamId === teamId;
};

export const normalizeEvaluationSubjectIds = (evaluations: Evaluation[], teams: Team[]): Evaluation[] => {
    let changed = false;
    const normalized = evaluations.map((evaluation) => {
        if (!isMissingSubjectId(evaluation.subjectId)) return evaluation;
        const resolved = resolveSubjectId(evaluation, teams);
        if (!resolved) return evaluation;
        changed = true;
        return { ...evaluation, subjectId: resolved };
    });

    return changed ? normalized : evaluations;
};

const isMissingSubjectId = (subjectId: string | undefined): boolean => !subjectId || subjectId === 'unknown';

const resolveSubjectId = (evaluation: Evaluation, teams: Team[]): string | null => {
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
};
