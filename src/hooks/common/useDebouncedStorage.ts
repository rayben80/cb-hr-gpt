import { useEffect, useRef } from 'react';
import { STORAGE_WRITE_DEBOUNCE_MS } from '../../constants';

/**
 * localStorage에서 데이터를 로드하는 헬퍼 함수
 */
export const loadFromStorage = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = window.localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored) as T;
        }
    } catch (error) {
        console.warn(`Failed to load ${key} from storage:`, error);
    }
    return fallback;
};

/**
 * localStorage에 데이터를 저장하는 헬퍼 함수
 */
export const saveToStorage = <T>(key: string, data: T): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn(`Failed to save ${key} to storage:`, error);
    }
};

/**
 * localStorage 키를 삭제하는 함수
 */
export const removeFromStorage = (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Failed to remove ${key} from storage:`, error);
    }
};

interface UseDebouncedStorageOptions {
    /** 개발 환경에서 저장 시 로그 출력 */
    enableDevLog?: boolean;
    /** 로그 레이블 */
    logLabel?: string;
}

/**
 * 상태를 localStorage에 debounce 저장하는 커스텀 훅
 * @param key - localStorage 키
 * @param value - 저장할 값
 * @param options - 옵션
 */
export const useDebouncedStorage = <T>(key: string, value: T, options: UseDebouncedStorageOptions = {}): void => {
    const { enableDevLog = true, logLabel } = options;
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            saveToStorage(key, value);
            if (enableDevLog && import.meta.env.DEV) {
                console.log(`${logLabel || key} saved to localStorage:`, value);
            }
        }, STORAGE_WRITE_DEBOUNCE_MS);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, value, enableDevLog, logLabel]);
};
