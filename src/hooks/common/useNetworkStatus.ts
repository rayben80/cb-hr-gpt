import { useState, useEffect, useCallback } from 'react';

export interface NetworkState {
    isOnline: boolean;
    lastChecked: Date | null;
}

export interface NetworkActions {
    checkConnection: () => Promise<void>;
    refreshConnection: () => Promise<void>;
}

/**
 * 네트워크 연결 상태를 모니터링하는 커스텀 훅
 */
export const useNetworkStatus = (): [NetworkState, NetworkActions] => {
    const [state, setState] = useState<NetworkState>({
        isOnline: navigator.onLine,
        lastChecked: null,
    });

    const checkConnection = useCallback(async () => {
        const isOnline = navigator.onLine;

        setState(prev => ({
            ...prev,
            isOnline,
            lastChecked: new Date(),
        }));
    }, []);

    const refreshConnection = useCallback(async () => {
        await checkConnection();
    }, [checkConnection]);

    // 온라인/오프라인 이벤트 리스너
    useEffect(() => {
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true }));
            // 온라인 상태가 되면 연결 상태 확인
            setTimeout(() => checkConnection(), 1000);
        };

        const handleOffline = () => {
            setState(prev => ({ 
                ...prev, 
                isOnline: false
            }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 초기 연결 상태 확인
        checkConnection();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [checkConnection]);

    const actions: NetworkActions = {
        checkConnection,
        refreshConnection,
    };

    return [state, actions];
};