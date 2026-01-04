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
import { Team } from '../../constants';
import { db } from '../../firebase';
// import { useError } from '../../contexts/ErrorContext';

export const useFirestoreTeams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    // const { showError } = useError();

    useEffect(() => {
        const q = query(collection(db, 'teams'), orderBy('createdAt', 'asc')); // Assuming createdAt exists or order by name

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const teamsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
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
    }, []);

    const addTeam = async (teamData: Omit<Team, 'id'>) => {
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
        try {
            const teamRef = doc(db, 'teams', id);
            await updateDoc(teamRef, teamData);
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    };

    const deleteTeam = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'teams', id));
        } catch (error) {
            console.error('Error deleting team:', error);
            throw error;
        }
    };

    return { teams, loading, addTeam, updateTeam, deleteTeam };
};
