import { useState, useEffect, useMemo, useCallback } from 'react';
import { Team, Headquarter, initialTeamsData, initialHeadquarters } from '../constants';
import { useNetworkStatus } from './useNetworkStatus';
import { useError } from '../contexts/ErrorContext';
import { useAsyncOperation } from './useAsyncOperation';
import { useConfirmation } from './useConfirmation';

/**
 * 조직 관리 데이터(본부, 팀, 파트, 구성원)를 위한 커스텀 훅
 */
export const useOrganizationData = () => {
    const [teams, setTeams] = useState<Team[]>(initialTeamsData);
    const [headquarters, setHeadquarters] = useState<Headquarter[]>(initialHeadquarters);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [networkState] = useNetworkStatus();
    const { showSuccess } = useError();
    const [seedOperation, seedOperationActions] = useAsyncOperation();
    const [confirmation, confirmationActions] = useConfirmation();

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('Teams state updated:', teams);
        }
    }, [teams]);

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('Headquarters state updated:', headquarters);
        }
    }, [headquarters]);

    const handleSeedDatabase = useCallback(async () => {
        confirmationActions.showConfirmation({
            title: '데이터베이스 초기화',
            message: '현재 조직 데이터를 초기 상태로 되돌립니다. 계속하시겠습니까?',
            confirmButtonText: '초기화 진행',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700',
            onConfirm: async () => {
                await seedOperationActions.execute(async () => {
                    setIsLoading(true);
                    setError(null);
                    setTeams(initialTeamsData);
                    setHeadquarters(initialHeadquarters);
                    setIsLoading(false);
                    return 'success';
                }, {
                    successMessage: '조직 데이터가 초기화되었습니다!',
                    errorMessage: '조직 데이터 초기화 중 오류가 발생했습니다.'
                });
            },
        });
    }, [confirmationActions, seedOperationActions]);

    const stats = useMemo(() => {
        let total = 0;
        let active = 0;
        let intern = 0;
        let onLeave = 0;
        let resigned = 0;

        teams.forEach(team => {
            team.parts.forEach(part => {
                part.members.forEach(member => {
                    total += 1;
                    if (member.status === 'active') active += 1;
                    else if (member.status === 'intern') intern += 1;
                    else if (member.status === 'on_leave') onLeave += 1;
                    else if (member.status === 'resigned') resigned += 1;
                });
            });
        });

        return { total, active, intern, onLeave, resigned };
    }, [teams]);

    const updateHeadquarter = useCallback((updatedHeadquarter: Headquarter) => {
        setHeadquarters(prev => prev.map(hq => (hq.id === updatedHeadquarter.id ? { ...hq, ...updatedHeadquarter } : hq)));
        if (updatedHeadquarter.leader?.name) {
            showSuccess('본부장 정보가 저장되었습니다', `${updatedHeadquarter.leader.name}님으로 변경되었습니다.`);
        }
    }, [showSuccess]);

    return {
        // 상태 값
        teams,
        setTeams,
        headquarters,
        updateHeadquarter,
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
    };
};

