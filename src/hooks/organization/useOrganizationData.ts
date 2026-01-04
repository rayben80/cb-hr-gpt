/* eslint-disable max-nested-callbacks */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Headquarter, initialHeadquarters } from '../../constants';
import { useError } from '../../contexts/ErrorContext';
import { useAsyncOperation } from '../common/useAsyncOperation';
import { useConfirmation } from '../common/useConfirmation';
import { loadFromStorage } from '../common/useDebouncedStorage';
import { useNetworkStatus } from '../common/useNetworkStatus';
import { useDatabaseSeeding } from './useDatabaseSeeding';
import { useFirestoreMembers } from './useFirestoreMembers';
import { useFirestoreTeams } from './useFirestoreTeams';

/**
 * localStorage 키 상수
 */
const STORAGE_KEYS = {
    HEADQUARTERS: 'cb-hr-gpt-headquarters',
} as const;

/**
 * 조직 관리 데이터(본부, 팀, 파트, 구성원)를 위한 커스텀 훅
 */
export const useOrganizationData = () => {
    // Firestore Hooks
    const { teams: firestoreTeams, addTeam, updateTeam, deleteTeam, loading: teamsLoading } = useFirestoreTeams();

    const { showSuccess } = useError();
    const [confirmation, confirmationActions] = useConfirmation();
    const [seedOperation, seedOperationActions] = useAsyncOperation();
    const networkState = useNetworkStatus();

    const {
        members: firestoreMembers,
        addMember,
        updateMember,
        deleteMember,
        loading: membersLoading,
    } = useFirestoreMembers();

    // Derived state: Join Teams and Members
    const teams = useMemo(() => {
        if (!firestoreTeams || !firestoreMembers) return [];
        return firestoreTeams.map((team) => ({
            ...team,
            members: firestoreMembers.filter((m) => m.teamId === team.id && !m.partId), // Direct members
            parts: team.parts.map((part) => ({
                ...part,
                members: firestoreMembers.filter((m) => m.partId === part.id),
            })),
        }));
    }, [firestoreTeams, firestoreMembers]);

    // Backward compatibility for setTeams - DO NOT USE FOR LOGIC ANYMORE
    // We need to refactor consumers to use atomic operations.
    // For now, we provide a warning.
    const setTeams = useCallback((..._args: any[]) => {
        console.warn('setTeams is deprecated in favor of Firestore actions. Please update the consumer.');
    }, []);

    const [headquarters, setHeadquarters] = useState<Headquarter[]>(() =>
        loadFromStorage(STORAGE_KEYS.HEADQUARTERS, initialHeadquarters)
    );

    const [isLoading, setIsLoading] = useState(teamsLoading || membersLoading);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(teamsLoading || membersLoading);
    }, [teamsLoading, membersLoading]);

    const { executeSeed } = useDatabaseSeeding({
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
    });

    const handleSeedDatabase = useCallback(async () => {
        confirmationActions.showConfirmation({
            title: '데이터베이스 초기화',
            message: '현재 조직 데이터를 초기 상태로 되돌립니다. 계속하시겠습니까?',
            confirmButtonText: '초기화 진행',
            confirmButtonColor: 'destructive',
            onConfirm: executeSeed,
        });
    }, [executeSeed, confirmationActions]);

    const stats = useMemo(() => {
        const allMembers = teams.flatMap((team) => [
            ...(team.members || []),
            ...team.parts.flatMap((part) => part.members),
        ]);

        return allMembers.reduce(
            (acc, member) => {
                acc.total += 1;
                const isIntern = member.status === 'intern' || member.employmentType === 'intern';
                if (isIntern) acc.intern += 1;
                else if (member.status === 'active') acc.active += 1;
                else if (member.status === 'on_leave') acc.onLeave += 1;
                else if (member.status === 'resigned') acc.resigned += 1;
                return acc;
            },
            { total: 0, active: 0, intern: 0, onLeave: 0, resigned: 0 }
        );
    }, [teams]);

    const updateHeadquarter = useCallback(
        (updatedHeadquarter: Headquarter) => {
            setHeadquarters((prev) =>
                prev.map((hq) => (hq.id === updatedHeadquarter.id ? { ...hq, ...updatedHeadquarter } : hq))
            );
            if (updatedHeadquarter.leader?.name) {
                showSuccess('본부장 정보가 저장되었습니다', `${updatedHeadquarter.leader.name}님으로 변경되었습니다.`);
            }
        },
        [showSuccess]
    );

    const addHeadquarter = useCallback(
        (newHeadquarter: Headquarter) => {
            setHeadquarters((prev) => [...prev, newHeadquarter]);
            showSuccess('본부가 추가되었습니다', `${newHeadquarter.name} 본부가 생성되었습니다.`);
        },
        [showSuccess]
    );

    return {
        // 상태 값
        teams,
        setTeams, // Deprecated but kept for type compatibility
        headquarters,
        updateHeadquarter,
        addHeadquarter,
        isLoading,
        setIsLoading,
        error,
        setError,
        stats,
        seedOperation,
        confirmation,

        // 유틸
        handleSeedDatabase,
        confirmationActions,
        seedOperationActions,

        // 네트워크 상태
        networkState,

        // Firestore Actions (New)
        firestoreActions: {
            addTeam,
            updateTeam,
            deleteTeam,
            addMember,
            updateMember,
            deleteMember,
        },
    };
};
