import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

const SUPER_ADMIN_EMAIL = 'rayben@forcs.com';

const resolveRoleEnv = (value: unknown): UserRole | null => {
    if (value === 'SUPER_ADMIN' || value === 'HQ_LEADER' || value === 'TEAM_LEADER' || value === 'USER') {
        return value;
    }
    return null;
};

const E2E_ROLE = resolveRoleEnv(import.meta.env.VITE_E2E_ROLE);

const resolveRoleClaim = (claims: Record<string, unknown>): UserRole | null => {
    const role = claims.role;
    if (role === 'SUPER_ADMIN' || role === 'HQ_LEADER' || role === 'TEAM_LEADER' || role === 'USER') {
        return role;
    }
    return null;
};

interface RoleContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    // ... existing interface ...
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isHeadquarterAdmin: boolean;
    isTeamAdmin: boolean;
    canApproveAccess: boolean;
    canManageHeadquarterLead: boolean;
    canManageTeamLead: boolean;
    canManageMembers: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, accessRequest } = useAuth();
    const [role, setRoleState] = useState<UserRole>(() => E2E_ROLE ?? 'USER');
    const [overrideRole, setOverrideRole] = useState<UserRole | null>(null);

    useEffect(() => {
        let isMounted = true;

        const resolveRole = async () => {
            if (E2E_ROLE) {
                if (isMounted) {
                    setRoleState(E2E_ROLE);
                    setOverrideRole(null);
                }
                return;
            }

            if (!currentUser) {
                if (isMounted) {
                    setRoleState('USER');
                    setOverrideRole(null);
                }
                return;
            }

            const roleFromRequest = resolveRoleClaim((accessRequest?.role ? { role: accessRequest.role } : {}) as Record<string, unknown>);
            if (!isMounted) return;

            if (roleFromRequest) {
                setRoleState(roleFromRequest);
                return;
            }

            if (currentUser.email === SUPER_ADMIN_EMAIL) {
                setRoleState('SUPER_ADMIN');
                return;
            }

            setRoleState('USER');
        };

        resolveRole();

        return () => {
            isMounted = false;
        };
    }, [currentUser, accessRequest]);

    const setRole = (nextRole: UserRole) => {
        if (E2E_ROLE) {
            console.warn('Role override is disabled when VITE_E2E_ROLE is set.');
            return;
        }
        if (!import.meta.env.DEV) {
            console.warn('Role override is disabled outside development mode.');
            return;
        }
        setOverrideRole(nextRole);
    };

    const effectiveRole = E2E_ROLE ?? overrideRole ?? role;

    const value = {
        role: effectiveRole,
        setRole,
        isSuperAdmin: effectiveRole === 'SUPER_ADMIN',
        isAdmin: effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'HQ_LEADER' || effectiveRole === 'TEAM_LEADER',
        isHeadquarterAdmin: effectiveRole === 'HQ_LEADER',
        isTeamAdmin: effectiveRole === 'TEAM_LEADER',
        canApproveAccess: effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'TEAM_LEADER',
        // Permission helpers
        canManageHeadquarterLead: effectiveRole === 'SUPER_ADMIN',
        canManageTeamLead: effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'HQ_LEADER',
        canManageMembers: effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'HQ_LEADER' || effectiveRole === 'TEAM_LEADER',
    };

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};

