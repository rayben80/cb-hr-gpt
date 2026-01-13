/**
 * useMemberManagement Hook 테스트
 * 멤버 관리 로직 검증
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Team } from '../../constants';
import { useMemberManagement } from '../../hooks/organization/useMemberManagement';

// Mock dependencies
vi.mock('../../hooks/common/useConfirmation', () => ({
    useConfirmation: () => [{ isOpen: false }, { showConfirmation: vi.fn() }],
}));

vi.mock('../../hooks/common/useAsyncOperation', () => ({
    useAsyncOperation: () => [{ isLoading: false }, { execute: vi.fn() }],
}));

vi.mock('../../contexts/ErrorContext', () => ({
    useError: () => ({
        showError: vi.fn(),
        showSuccess: vi.fn(),
    }),
}));

vi.mock('../../utils/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('useMemberManagement Hook', () => {
    const mockTeams: Team[] = [
        {
            id: 'team1',
            name: '개발팀',
            lead: '팀장',
            parts: [
                {
                    id: 'part1',
                    title: '프론트엔드',
                    members: [
                        {
                            id: 'member1',
                            name: '김개발',
                            role: '주임',
                            status: 'active',
                            email: 'kim@example.com',
                            hireDate: '2023-01-01',
                            avatar: '/avatar1.jpg',
                        },
                        {
                            id: 'member2',
                            name: '이퇴사',
                            role: '대리',
                            status: 'resigned',
                            email: 'lee@example.com',
                            hireDate: '2022-01-01',
                            avatar: '/avatar2.jpg',
                        },
                    ],
                },
            ],
        },
    ];

    const mockFirestoreActions = {
        addTeam: vi.fn(),
        updateTeam: vi.fn(),
        deleteTeam: vi.fn(),
        addMember: vi.fn(),
        updateMember: vi.fn(),
        deleteMember: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('초기 상태가 올바르게 설정되어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.editingMember).toBe(null);
        expect(result.current.modalContext).toBe(null);
    });

    it('멤버 추가 모달을 올바르게 열어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        act(() => {
            result.current.handleAddMember('team1', 'part1');
        });

        expect(result.current.isModalOpen).toBe(true);
        expect(result.current.editingMember).toBe(null);
        expect(result.current.modalContext).toEqual({
            teamId: 'team1',
            partId: 'part1',
        });
    });

    it('멤버 편집 모달을 올바르게 열어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        const testMember = mockTeams[0].parts[0].members[0];

        act(() => {
            result.current.handleEditMember(testMember);
        });

        expect(result.current.isModalOpen).toBe(true);
        expect(result.current.editingMember).toEqual(testMember);
        expect(result.current.modalContext).toBe(null);
    });

    it('모달을 올바르게 닫을 수 있어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        // 먼저 모달을 열고
        act(() => {
            result.current.handleAddMember('team1', 'part1');
        });

        expect(result.current.isModalOpen).toBe(true);

        // 모달을 닫기
        act(() => {
            result.current.setIsModalOpen(false);
        });

        expect(result.current.isModalOpen).toBe(false);
    });

    it('멤버의 위치를 올바르게 찾아야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        const testMember = mockTeams[0].parts[0].members[0];

        // handleDeleteMember를 호출하여 findMemberLocation 로직 테스트
        act(() => {
            result.current.handleDeleteMember(testMember);
        });

        // confirmationActions.showConfirmation이 호출되었는지 확인
        // (멤버를 찾을 수 있었다는 의미)
        expect(result.current.confirmationActions.showConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '퇴사 처리 확인',
                message: expect.stringContaining('김개발님을 퇴사 처리하시겠습니까?'),
            })
        );
    });

    it('삭제 확인 다이얼로그를 올바르게 표시해야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        const testMember = mockTeams[0].parts[0].members[0];

        act(() => {
            result.current.handleDeleteMember(testMember);
        });

        expect(result.current.confirmationActions.showConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '퇴사 처리 확인',
                message: expect.stringContaining('김개발님을 퇴사 처리하시겠습니까?'),
                confirmButtonText: '퇴사 처리',
                confirmButtonColor: 'destructive',
            })
        );
    });

    it('복직 확인 다이얼로그를 올바르게 표시해야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        const resignedMember = {
            ...mockTeams[0].parts[0].members[1],
            teamId: 'team1',
            partId: 'part1',
        };

        act(() => {
            result.current.handleReinstateMember(resignedMember);
        });

        expect(result.current.confirmationActions.showConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '복직 처리 확인',
                message: expect.stringContaining('이퇴사님을 복직 처리하시겠습니까?'),
                confirmButtonText: '복직 처리',
                confirmButtonColor: 'primary',
            })
        );
    });

    it('퇴사자 영구 삭제 확인 다이얼로그를 올바르게 표시해야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        const resignedMember = mockTeams[0].parts[0].members[1];

        act(() => {
            result.current.handleDeleteResignedMember(resignedMember);
        });

        expect(result.current.confirmationActions.showConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({
                title: '기록 영구 삭제',
                message: expect.stringContaining('이퇴사님의 퇴사 기록을 영구적으로 삭제하시겠습니까?'),
                confirmButtonText: '영구 삭제',
                confirmButtonColor: 'destructive',
            })
        );
    });

    it('필요한 액션 함수들을 제공해야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        expect(typeof result.current.handleAddMember).toBe('function');
        expect(typeof result.current.handleEditMember).toBe('function');
        expect(typeof result.current.handleDeleteMember).toBe('function');
        expect(typeof result.current.handleDeleteResignedMember).toBe('function');
        expect(typeof result.current.handleReinstateMember).toBe('function');
        expect(typeof result.current.handleSaveMember).toBe('function');
    });

    it('비동기 작업 상태가 포함되어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        expect(result.current.saveOperation).toBeDefined();
        expect(result.current.deleteOperation).toBeDefined();
        expect(result.current.saveOperation.isLoading).toBe(false);
        expect(result.current.deleteOperation.isLoading).toBe(false);
    });

    it('확인 다이얼로그 상태가 포함되어야 한다', () => {
        const { result } = renderHook(() => useMemberManagement(mockTeams, mockFirestoreActions));

        expect(result.current.confirmation).toBeDefined();
        expect(result.current.confirmation.isOpen).toBe(false);
        expect(typeof result.current.confirmationActions).toBe('object');
    });

    it('멤버 데이터가 변경될 때 Hook이 업데이트되어야 한다', () => {
        const { result, rerender } = renderHook(({ teams }) => useMemberManagement(teams, mockFirestoreActions), {
            initialProps: { teams: mockTeams },
        });

        // 초기 상태 확인
        expect(result.current.editingMember).toBe(null);

        // 새로운 팀 데이터로 리렌더링
        const updatedTeams = [
            {
                ...mockTeams[0],
                parts: [
                    {
                        ...mockTeams[0].parts[0],
                        members: [
                            ...mockTeams[0].parts[0].members,
                            {
                                id: 'member3',
                                name: '박신입',
                                role: '사원',
                                status: 'active' as const,
                                email: 'park@example.com',
                                hireDate: '2024-01-01',
                                avatar: '/avatar3.jpg',
                            },
                        ],
                    },
                ],
            },
        ];

        rerender({ teams: updatedTeams });

        // Hook이 새로운 데이터로 업데이트되었는지 확인
        // (삭제 함수 호출 시 새로운 멤버를 찾을 수 있는지 테스트)
        const newMember = updatedTeams[0].parts[0].members[2];

        act(() => {
            result.current.handleDeleteMember(newMember);
        });

        expect(result.current.confirmationActions.showConfirmation).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('박신입님을 퇴사 처리하시겠습니까?'),
            })
        );
    });
});
