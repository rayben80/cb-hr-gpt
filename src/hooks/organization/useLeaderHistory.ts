import { useCallback, useState } from 'react';
import { LeaderHistory, initialLeaderHistory } from '../../constants';

interface UseLeaderHistoryReturn {
    history: LeaderHistory[];
    addHistoryEntry: (entry: Omit<LeaderHistory, 'id' | 'timestamp'>) => void;
    getHistoryByHeadquarter: (headquarterId: string) => LeaderHistory[];
}

export function useLeaderHistory(): UseLeaderHistoryReturn {
    const [history, setHistory] = useState<LeaderHistory[]>(initialLeaderHistory);

    const addHistoryEntry = useCallback((entry: Omit<LeaderHistory, 'id' | 'timestamp'>) => {
        const newEntry: LeaderHistory = {
            ...entry,
            id: `hist_${crypto.randomUUID()}`,
            timestamp: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };
        setHistory((prev) => [newEntry, ...prev]);
    }, []);

    const getHistoryByHeadquarter = useCallback(
        (headquarterId: string) => {
            return history.filter((entry) => entry.headquarterId === headquarterId);
        },
        [history]
    );

    return {
        history,
        addHistoryEntry,
        getHistoryByHeadquarter,
    };
}
