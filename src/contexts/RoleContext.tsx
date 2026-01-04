import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

interface RoleContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    // ... existing interface ...
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isHeadquarterAdmin: boolean;
    isTeamAdmin: boolean;
    canManageHeadquarterLead: boolean;
    canManageTeamLead: boolean;
    canManageMembers: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [role, setRole] = useState<UserRole>('USER');

    useEffect(() => {
        if (currentUser) {
            // Temporary logic: rayben@forcs.com is SUPER_ADMIN
            if (currentUser.email === 'rayben@forcs.com') {
                setRole('SUPER_ADMIN');
            } else {
                // Default to USER for now
                setRole('USER');
            }
        } else {
            setRole('USER');
        }
    }, [currentUser]);

    const value = {
        role,
        setRole,
        isSuperAdmin: role === 'SUPER_ADMIN',
        isAdmin: role === 'SUPER_ADMIN' || role === 'HQ_LEADER' || role === 'TEAM_LEADER',
        isHeadquarterAdmin: role === 'HQ_LEADER',
        isTeamAdmin: role === 'TEAM_LEADER',
        // Permission helpers
        canManageHeadquarterLead: role === 'SUPER_ADMIN',
        canManageTeamLead: role === 'SUPER_ADMIN' || role === 'HQ_LEADER',
        canManageMembers: role === 'SUPER_ADMIN' || role === 'HQ_LEADER' || role === 'TEAM_LEADER',
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
