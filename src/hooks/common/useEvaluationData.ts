/**
 * useEvaluationData Hook
 * 평가 데이터를 관리하는 커스텀 훅
 */

import { useState, useMemo, useCallback } from 'react';
import { Evaluation, initialEvaluationsData } from '../../constants';

interface EvaluationStats {
    total: number;
    completed: number;
    inProgress: number;
    scheduled: number;
}

interface UseEvaluationDataReturn {
    evaluations: Evaluation[];
    setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
    stats: EvaluationStats;
    getEvaluationsByStatus: (status: Evaluation['status']) => Evaluation[];
    getEvaluationsBySubject: (subject: string) => Evaluation[];
    getCompletedWithScores: () => Evaluation[];
}

/**
 * 평가 데이터 관리 훅
 */
export const useEvaluationData = (): UseEvaluationDataReturn => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluationsData);

    // 통계 계산
    const stats = useMemo<EvaluationStats>(() => {
        return {
            total: evaluations.length,
            completed: evaluations.filter(e => e.status === '완료').length,
            inProgress: evaluations.filter(e => e.status === '진행중').length,
            scheduled: evaluations.filter(e => e.status === '예정').length,
        };
    }, [evaluations]);

    // 상태별 필터링
    const getEvaluationsByStatus = useCallback((status: Evaluation['status']) => {
        return evaluations.filter(e => e.status === status);
    }, [evaluations]);

    // 대상별 필터링
    const getEvaluationsBySubject = useCallback((subject: string) => {
        return evaluations.filter(e =>
            e.subject.toLowerCase().includes(subject.toLowerCase())
        );
    }, [evaluations]);

    // 점수가 있는 완료된 평가만 반환
    const getCompletedWithScores = useCallback(() => {
        return evaluations.filter(e => e.status === '완료' && e.score !== null);
    }, [evaluations]);

    return {
        evaluations,
        setEvaluations,
        stats,
        getEvaluationsByStatus,
        getEvaluationsBySubject,
        getCompletedWithScores,
    };
};
