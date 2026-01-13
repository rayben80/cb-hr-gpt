import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Team, initialTeamsData } from '../../constants';
import { db } from '../../firebase';
// import { useError } from '../../contexts/ErrorContext';

const stripUndefined = (data: Record<string, unknown>) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
            delete data[key];
        }
    });
    return data;
};

export const useFirestoreTeams = () => {
    const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';
    const [teams, setTeams] = useState<Team[]>(() => (isE2EMock ? initialTeamsData : []));
    const [loading, setLoading] = useState(!isE2EMock);
    // const { showError } = useError();

    useEffect(() => {
        if (isE2EMock) {
            setTeams(initialTeamsData);
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'teams'), orderBy('createdAt', 'asc')); // Assuming createdAt exists or order by name

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const teamsData = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                })) as Team[];
                setTeams(teamsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching teams:', error);
                // showError('팀 목록을 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [isE2EMock]);

    const addTeam = async (teamData: Omit<Team, 'id'>) => {
        if (isE2EMock) {
            const newTeam = { ...teamData, id: `mock-team-${Date.now()}` } as Team;
            setTeams((prev) => [...prev, newTeam]);
            return newTeam.id;
        }
        try {
            const docRef = await addDoc(collection(db, 'teams'), {
                ...teamData,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding team:', error);
            throw error;
        }
    };

    const updateTeam = async (id: string, teamData: Partial<Team>) => {
        if (isE2EMock) {
            setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...teamData } : t)));
            return;
        }
        try {
            const teamRef = doc(db, 'teams', id);
            const payload = stripUndefined({ ...teamData });
            await updateDoc(teamRef, payload);
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    };

    const deleteTeam = async (id: string) => {
        if (isE2EMock) {
            setTeams((prev) => prev.filter((t) => t.id !== id));
            return;
        }
        try {
            await deleteDoc(doc(db, 'teams', id));
        } catch (error) {
            console.error('Error deleting team:', error);
            throw error;
        }
    };

    return { teams, loading, addTeam, updateTeam, deleteTeam };
};
