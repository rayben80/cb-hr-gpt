import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, type DocumentSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';

const ALLOWED_EMAIL_DOMAIN = '@forcs.com';
const SUPER_ADMIN_EMAIL = 'rayben@forcs.com';
const rawAllowedHqIds =
    typeof import.meta.env?.VITE_ALLOWED_HQ_IDS === 'string' ? import.meta.env.VITE_ALLOWED_HQ_IDS : '';
const ALLOWED_HQ_IDS = (rawAllowedHqIds || 'hq-cloud')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
const DEFAULT_HQ_ID = ALLOWED_HQ_IDS[0] || 'hq-cloud';

const hasAllowedEmailDomain = (email: string | null | undefined) =>
    Boolean(email && email.endsWith(ALLOWED_EMAIL_DOMAIN));

const hasAllowedHeadquarterId = (hqId: string | null | undefined) =>
    typeof hqId === 'string' && ALLOWED_HQ_IDS.includes(hqId);

type AccessRequestStatus = 'pending' | 'approved' | 'rejected';
type AccessStatus = 'approved' | 'pending' | 'rejected' | 'blocked';

interface AccessRequest {
    uid: string;
    email: string;
    displayName: string;
    status: AccessRequestStatus;
    role?: string | undefined;
    hqId?: string | undefined;
    teamId?: string | null | undefined;
    partId?: string | null | undefined;
    createdAt?: unknown;
    updatedAt?: unknown;
}

const resolveAccessStatusFromRequest = (request: AccessRequest | null): AccessStatus => {
    if (!request) return 'pending';
    if (request.status === 'approved') {
        return hasAllowedHeadquarterId(request.hqId) ? 'approved' : 'blocked';
    }
    if (request.status === 'rejected') return 'rejected';
    return 'pending';
};

const buildExistingRequest = (snapshot: DocumentSnapshot, user: User): AccessRequest => {
    const data = snapshot.data() as Partial<AccessRequest>;
    return {
        uid: snapshot.id,
        email: data.email || user.email || '',
        displayName: data.displayName || user.displayName || '',
        status: (data.status as AccessRequestStatus) || 'pending',
        role: data.role,
        hqId: data.hqId,
        teamId: data.teamId ?? null,
        partId: data.partId ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    };
};

const upgradeAccessRequest = async (
    requestRef: ReturnType<typeof doc>,
    existing: AccessRequest
): Promise<AccessRequest> => {
    const upgraded: AccessRequest = {
        ...existing,
        status: 'approved',
        role: 'SUPER_ADMIN',
        hqId: DEFAULT_HQ_ID,
    };
    await setDoc(
        requestRef,
        {
            status: upgraded.status,
            role: upgraded.role,
            hqId: upgraded.hqId,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
    return upgraded;
};

const buildNewRequest = (user: User, isBootstrapSuperAdmin: boolean): AccessRequest => ({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    status: isBootstrapSuperAdmin ? 'approved' : 'pending',
    role: isBootstrapSuperAdmin ? 'SUPER_ADMIN' : undefined,
    hqId: isBootstrapSuperAdmin ? DEFAULT_HQ_ID : undefined,
});

const ensureAccessRequest = async (user: User): Promise<AccessRequest> => {
    const requestRef = doc(db, 'access_requests', user.uid);
    const snapshot = await getDoc(requestRef);
    const isBootstrapSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
    if (snapshot.exists()) {
        const existing = buildExistingRequest(snapshot, user);
        if (isBootstrapSuperAdmin && existing.status !== 'approved') {
            return upgradeAccessRequest(requestRef, existing);
        }
        return existing;
    }

    const payload = buildNewRequest(user, isBootstrapSuperAdmin);

    await setDoc(
        requestRef,
        {
            ...payload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    return payload;
};

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    accessStatus: AccessStatus;
    accessRequest: AccessRequest | null;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshAccessStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isE2EBypass = import.meta.env.VITE_E2E_BYPASS_AUTH === 'true';
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(!isE2EBypass);
    const [accessStatus, setAccessStatus] = useState<AccessStatus>('pending');
    const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);

    const resolveAccessState = useCallback(
        async (user: User) => {
            if (isE2EBypass) {
                setAccessRequest({
                    uid: user.uid,
                    email: user.email || '',
                    displayName: user.displayName || '',
                    status: 'approved',
                    role: 'SUPER_ADMIN',
                    hqId: 'hq-cloud',
                });
                setAccessStatus('approved');
                setCurrentUser(user);
                return;
            }

            if (!hasAllowedEmailDomain(user.email)) {
                await signOut(auth);
                setCurrentUser(null);
                setAccessStatus('blocked');
                setAccessRequest(null);
                return;
            }

            const request = await ensureAccessRequest(user);
            setAccessRequest(request);
            setAccessStatus(resolveAccessStatusFromRequest(request));
            setCurrentUser(user);
        },
        [isE2EBypass]
    );

    useEffect(() => {
        if (isE2EBypass) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (!user) {
                setCurrentUser(null);
                setAccessStatus('pending');
                setAccessRequest(null);
                setLoading(false);
                return;
            }
            try {
                await resolveAccessState(user);
            } catch (error) {
                console.error('Failed to resolve access state:', error);
                setCurrentUser(user);
                setAccessStatus('pending');
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [isE2EBypass, resolveAccessState]);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (!hasAllowedEmailDomain(user.email)) {
                await signOut(auth);
                throw new Error('Only @forcs.com email addresses are allowed.');
            }
        } catch (error) {
            console.error('Error signing in with Google', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out', error);
            throw error;
        }
    };

    const refreshAccessStatus = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setLoading(true);
        try {
            await resolveAccessState(user);
        } catch (error) {
            console.error('Failed to refresh access status:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        currentUser,
        loading,
        accessStatus,
        accessRequest,
        signInWithGoogle,
        logout,
        refreshAccessStatus,
    };

    return <AuthContext.Provider value={value}>{(isE2EBypass || !loading) && children}</AuthContext.Provider>;
};
