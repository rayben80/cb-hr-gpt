import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Member, Team, initialTeamsData } from '../../constants';
import { db } from '../../firebase';

const stripUndefined = (data: Record<string, unknown>) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
            delete data[key];
        }
    });
    return data;
};

const buildMemberUpdatePayload = (data: Partial<Member>) => {
    const payload: Record<string, unknown> = { ...data };
    if (Object.prototype.hasOwnProperty.call(payload, 'id')) {
        delete payload.id;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'roleBeforeLead') && payload.roleBeforeLead === undefined) {
        payload.roleBeforeLead = deleteField();
    }
    return stripUndefined(payload);
};

const stripIdFromPatch = (data: Partial<Member>) => {
    if (!Object.prototype.hasOwnProperty.call(data, 'id')) return data;
    const { id, ...rest } = data;
    void id;
    return rest;
};

const applyMemberPatch = (members: Member[], id: string, patch: Partial<Member>) => {
    const safePatch = stripIdFromPatch(patch);
    return members.map((member) => {
        if (member.id !== id) return member;
        const next = { ...member } as Member;

        Object.entries(safePatch).forEach(([key, value]) => {
            if (value === undefined) {
                if (key === 'roleBeforeLead') {
                    delete (next as any)[key];
                }
                return;
            }
            (next as any)[key] = value;
        });

        return next;
    });
};

const buildMockMembers = (teams: Team[]): Member[] =>
    teams.flatMap((team) => {
        const directMembers = (team.members || []).map((member) => ({
            ...member,
            teamId: team.id,
            teamName: team.name,
            partId: null,
            partName: null,
        }));

        const partMembers = team.parts.flatMap((part) =>
            part.members.map((member) => ({
                ...member,
                teamId: team.id,
                teamName: team.name,
                partId: part.id,
                partName: part.title,
            }))
        );

        return [...directMembers, ...partMembers];
    });

export const useFirestoreMembers = () => {
    const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';
    const [members, setMembers] = useState<Member[]>(() => (isE2EMock ? buildMockMembers(initialTeamsData) : []));
    const [loading, setLoading] = useState(!isE2EMock);

    useEffect(() => {
        if (isE2EMock) {
            setMembers(buildMockMembers(initialTeamsData));
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'members')); // Fetch all members for now

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const membersData = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
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
    }, [isE2EMock]);

    const addMember = async (memberData: Omit<Member, 'id'>) => {
        if (isE2EMock) {
            const newMember = { ...memberData, id: `mock-member-${Date.now()}` } as Member;
            setMembers((prev) => [...prev, newMember]);
            return newMember.id;
        }
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
        let previousMembers: Member[] | null = null;
        setMembers((prev) => {
            previousMembers = prev;
            return applyMemberPatch(prev, id, memberData);
        });
        if (isE2EMock) return;

        try {
            const memberRef = doc(db, 'members', id);
            const payload = buildMemberUpdatePayload(memberData);
            await updateDoc(memberRef, payload);
        } catch (error) {
            if (previousMembers) {
                setMembers(previousMembers);
            }
            console.error('Error updating member:', error);
            throw error;
        }
    };

    const deleteMember = async (id: string) => {
        if (isE2EMock) {
            setMembers((prev) => prev.filter((m) => m.id !== id));
            return;
        }
        try {
            await deleteDoc(doc(db, 'members', id));
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    };

    const updateMemberOrder = async (id: string, newOrder: number) => {
        let previousMembers: Member[] | null = null;
        setMembers((prev) => {
            previousMembers = prev;
            return applyMemberPatch(prev, id, { order: newOrder });
        });
        if (isE2EMock) return;

        try {
            const memberRef = doc(db, 'members', id);
            await updateDoc(memberRef, { order: newOrder });
        } catch (error) {
            if (previousMembers) {
                setMembers(previousMembers);
            }
            console.error('Error updating member order:', error);
            throw error;
        }
    };

    // Helper to filtered members by team purely on client-side or separate query if needed
    const getMembersByTeam = (teamId: string) => {
        return members.filter((m) => m.teamId === teamId);
    };

    return { members, loading, addMember, updateMember, deleteMember, getMembersByTeam, updateMemberOrder };
};
