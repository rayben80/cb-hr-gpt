import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { db } from '../../firebase';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccessRequest {
    uid: string;
    email: string;
    displayName?: string | undefined;
    status: RequestStatus;
    role?: string | undefined;
    hqId?: string | undefined;
    teamId?: string | null | undefined;
    partId?: string | null | undefined;
    createdAt?: Timestamp | undefined;
    updatedAt?: Timestamp | undefined;
}

export const useAccessRequests = () => {
    const { canApproveAccess } = useRole();
    const isE2EMock = import.meta.env.VITE_E2E_MOCK_DATA === 'true';
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(!isE2EMock);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isE2EMock) {
            setLoading(false);
            setRequests([]);
            return;
        }
        if (!canApproveAccess) return;
        const q = query(collection(db, 'access_requests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const next = snapshot.docs.map((doc) => {
                    const data = doc.data() as Partial<AccessRequest>;
                    return {
                        uid: doc.id,
                        email: data.email || '',
                        displayName: data.displayName,
                        status: (data.status as RequestStatus) || 'pending',
                        role: data.role,
                        hqId: data.hqId,
                        teamId: data.teamId ?? null,
                        partId: data.partId ?? null,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    };
                });
                setRequests(next);
                setLoading(false);
            },
            (err) => {
                console.error('Failed to load access requests:', err);
                setError('승인 요청을 불러오는 중 오류가 발생했습니다.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [canApproveAccess, isE2EMock]);

    return { requests, loading, error };
};
