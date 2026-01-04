import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Member } from '../../constants';
import { db } from '../../firebase';

export const useFirestoreMembers = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'members')); // Fetch all members for now

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const membersData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Member[];
                setMembers(membersData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching members:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addMember = async (memberData: Omit<Member, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, 'members'), {
                ...memberData,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    };

    const updateMember = async (id: string, memberData: Partial<Member>) => {
        try {
            const memberRef = doc(db, 'members', id);
            await updateDoc(memberRef, memberData);
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    };

    const deleteMember = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'members', id));
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    };

    // Helper to filtered members by team purely on client-side or separate query if needed
    const getMembersByTeam = (teamId: string) => {
        return members.filter((m) => m.teamId === teamId);
    };

    return { members, loading, addMember, updateMember, deleteMember, getMembersByTeam };
};
