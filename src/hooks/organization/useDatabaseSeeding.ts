import { useCallback } from 'react';
import { Headquarter, initialHeadquarters, initialTeamsData } from '../../constants';
import { normalizeTeamsMemberRoles } from '../../utils/memberRoleUtils';
import { AsyncOperationActions } from '../common/useAsyncOperation';
import { removeFromStorage } from '../common/useDebouncedStorage';

const STORAGE_KEYS = {
    TEAMS: 'cb-hr-gpt-teams',
    HEADQUARTERS: 'cb-hr-gpt-headquarters',
} as const;

const clearStorage = (): void => {
    removeFromStorage(STORAGE_KEYS.TEAMS);
    removeFromStorage(STORAGE_KEYS.HEADQUARTERS);
};

interface UseDatabaseSeedingProps {
    firestoreTeams: any[];
    firestoreMembers: any[];
    addTeam: (team: any) => Promise<string>;
    updateTeam: (id: string, data: any) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
    addMember: (member: any) => Promise<string>;
    deleteMember: (id: string) => Promise<void>;
    setHeadquarters: React.Dispatch<React.SetStateAction<Headquarter[]>>;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    seedOperationActions: AsyncOperationActions;
}

export const useDatabaseSeeding = ({
    firestoreTeams,
    firestoreMembers,
    addTeam,
    updateTeam,
    deleteTeam,
    addMember,
    deleteMember,
    setHeadquarters,
    setIsLoading,
    setError,
    seedOperationActions,
}: UseDatabaseSeedingProps) => {
    const executeSeed = useCallback(async () => {
        await seedOperationActions.execute(
            async () => {
                setIsLoading(true);
                setError(null);

                // 1. Clear Storage (Legacy)
                clearStorage();

                // 2. Clear Existing Firestore Data
                const deletePromises = [
                    ...firestoreMembers.map((m) => deleteMember(m.id)),
                    ...firestoreTeams.map((t) => deleteTeam(t.id)),
                ];
                if (deletePromises.length > 0) {
                    await Promise.all(deletePromises);
                }

                // 3. Seed Initial Data
                const { teams: seededTeams } = normalizeTeamsMemberRoles(initialTeamsData);

                for (const team of seededTeams) {
                    const { members, parts, ...teamProps } = team;

                    const newTeamId = await addTeam({
                        name: teamProps.name,
                        lead: teamProps.lead,
                        parts: [],
                        headquarterId: (teamProps as any).headquarterId || 'hq_unassigned',
                    } as any);

                    // Add Direct Members
                    if (members && members.length > 0) {
                        await Promise.all(
                            members.map((m) => {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                const { id, ...memberProps } = m;
                                return addMember({
                                    ...memberProps,
                                    teamId: newTeamId,
                                    partId: null,
                                    teamName: teamProps.name,
                                } as any);
                            })
                        );
                    }

                    // Add Parts and their Members
                    if (parts && parts.length > 0) {
                        const newPartsForTeam: any[] = [];

                        // Process parts sequentially to ensure structure
                        for (const p of parts) {
                            const newPartId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                            newPartsForTeam.push({
                                id: newPartId,
                                title: p.title,
                                members: [],
                            });

                            if (p.members && p.members.length > 0) {
                                await Promise.all(
                                    p.members.map((pm) => {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const { id, ...pmProps } = pm;
                                        return addMember({
                                            ...pmProps,
                                            teamId: newTeamId,
                                            partId: newPartId,
                                            teamName: teamProps.name,
                                            partName: p.title,
                                        } as any);
                                    })
                                );
                            }
                        }
                        await updateTeam(newTeamId, { parts: newPartsForTeam });
                    }
                }

                setHeadquarters(initialHeadquarters);
                setIsLoading(false);
                return 'success';
            },
            {
                successMessage: '조직 데이터가 초기화되었습니다 (Firestore) !',
                errorMessage: '조직 데이터 초기화 중 오류가 발생했습니다.',
            }
        );
    }, [
        firestoreTeams,
        firestoreMembers,
        deleteMember,
        deleteTeam,
        addTeam,
        addMember,
        updateTeam,
        seedOperationActions,
        setIsLoading,
        setError,
        setHeadquarters,
    ]);

    return { executeSeed };
};
