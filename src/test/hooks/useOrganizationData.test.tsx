/**
 * useOrganizationData Hook 테스트
 * 조직 데이터 관리 로직 검증
 */

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialTeamsData } from '../../constants';
import { normalizeTeamsMemberRoles } from '../../utils/memberRoleUtils';
import { useOrganizationData } from '../../hooks/organization/useOrganizationData';

// Mock dependencies
vi.mock('../../hooks/common/useNetworkStatus', () => ({
    useNetworkStatus: () => [{ isOnline: true }],
}));

vi.mock('../../contexts/ErrorContext', () => ({
    useError: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
    }),
}));

vi.mock('../../hooks/common/useAsyncOperation', () => ({
    useAsyncOperation: () => [{ isLoading: false }, { execute: vi.fn() }],
}));

vi.mock('../../hooks/common/useConfirmation', () => ({
    useConfirmation: () => [{ isOpen: false }, { showConfirmation: vi.fn() }],
}));

vi.mock('../../utils/logger', () => ({
    logger: {
        developmentMode: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useOrganizationData Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('초기 상태가 올바르게 설정되어야 한다', async () => {
        const { result } = renderHook(() => useOrganizationData());

        // useEffect가 비동기로 실행되므로 로딩 완료 대기
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // 로컬 데이터가 로드되어야 함 (초기 데이터)
        expect(result.current.teams).toEqual(normalizeTeamsMemberRoles(initialTeamsData).teams);
        expect(result.current.error).toBe(null);
    });

    it('연결이 없을 때 로컬 데이터를 로드해야 한다', async () => {
        const { result } = renderHook(() => useOrganizationData());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.teams).toEqual(normalizeTeamsMemberRoles(initialTeamsData).teams);
        expect(result.current.error).toBe(null);
    });

    it('팀 데이터와 설정 함수가 제공되어야 한다', async () => {
        const { result } = renderHook(() => useOrganizationData());

        // 초기 로딩 완료 대기
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // setTeams 함수가 제공되는지 확인
        expect(typeof result.current.setTeams).toBe('function');
        expect(Array.isArray(result.current.teams)).toBe(true);
        expect(result.current.teams.length).toBeGreaterThan(0);
    });

    it('통계 계산 기능이 제공되어야 한다', async () => {
        const { result } = renderHook(() => useOrganizationData());

        // 초기 로딩 완료 대기
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // stats 객체가 올바른 구조를 가지고 있는지 확인
        expect(result.current.stats).toHaveProperty('total');
        expect(result.current.stats).toHaveProperty('active');
        expect(result.current.stats).toHaveProperty('intern');
        expect(result.current.stats).toHaveProperty('onLeave');
        expect(result.current.stats).toHaveProperty('resigned');

        // 숫자 값인지 확인
        expect(typeof result.current.stats.total).toBe('number');
        expect(typeof result.current.stats.active).toBe('number');
        expect(typeof result.current.stats.intern).toBe('number');
        expect(typeof result.current.stats.onLeave).toBe('number');
        expect(typeof result.current.stats.resigned).toBe('number');

        // 논리적으로 올바른지 확인 (total은 다른 모든 수의 합이어야 함)
        const calculatedTotal =
            result.current.stats.active +
            result.current.stats.intern +
            result.current.stats.onLeave +
            result.current.stats.resigned;
        expect(result.current.stats.total).toBe(calculatedTotal);
    });

    it('handleSeedDatabase 함수가 제공되어야 한다', () => {
        const { result } = renderHook(() => useOrganizationData());

        expect(typeof result.current.handleSeedDatabase).toBe('function');
    });

    it('네트워크 상태가 포함되어야 한다', () => {
        const { result } = renderHook(() => useOrganizationData());

        expect(result.current.networkState).toBeDefined();
        expect(result.current.networkState.isOnline).toBe(true);
    });

    it('비동기 작업 상태가 포함되어야 한다', () => {
        const { result } = renderHook(() => useOrganizationData());

        expect(result.current.seedOperation).toBeDefined();
        expect(result.current.seedOperation.isLoading).toBe(false);
    });

    it('확인 다이얼로그 상태가 포함되어야 한다', () => {
        const { result } = renderHook(() => useOrganizationData());

        expect(result.current.confirmation).toBeDefined();
        expect(result.current.confirmation.isOpen).toBe(false);
    });

    it('적절한 액션 함수들을 제공해야 한다', () => {
        const { result } = renderHook(() => useOrganizationData());

        expect(typeof result.current.handleSeedDatabase).toBe('function');
        expect(typeof result.current.confirmationActions).toBe('object');
        expect(typeof result.current.seedOperationActions).toBe('object');
    });
});
