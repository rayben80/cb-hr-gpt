/**
 * useOrganizationFilter 훅 테스트
 * 조직 데이터 필터링 기능을 관리하는 훅 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrganizationFilter } from '../../hooks/useOrganizationFilter';
import { Team } from '../../constants';

describe('useOrganizationFilter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any timers or subscriptions
    vi.clearAllTimers();
  });

  const mockTeams: Team[] = [
    {
      id: '1',
      name: '개발팀',
      lead: '팀장',
      parts: [
        {
          id: 'p1',
          title: '프론트엔드',
          members: [
            {
              id: 'm1',
              name: '김개발',
              role: '주임',
              status: 'active',
              email: 'kim@example.com',
              hireDate: '2023-01-01',
              avatar: '/avatar1.jpg'
            },
            {
              id: 'm2',
              name: '이디자인',
              role: '과장',
              status: 'on_leave',
              email: 'lee@example.com',
              hireDate: '2022-01-01',
              avatar: '/avatar2.jpg'
            }
          ]
        }
      ]
    }
  ];

  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useOrganizationFilter(mockTeams, ''));

    expect(result.current.activeTeams).toBeDefined();
    expect(result.current.onLeaveMembers).toBeDefined();
    expect(result.current.resignedMembers).toBeDefined();
    expect(result.current.filteredInactiveMembers).toBeDefined();
  });

  it('검색어 필터링이 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useOrganizationFilter(mockTeams, '김'));

    expect(result.current.activeTeams[0].parts[0].members).toHaveLength(1);
    expect(result.current.activeTeams[0].parts[0].members[0].name).toBe('김개발');
  });

  it('활성 멤버만 필터링되어야 한다', () => {
    const { result } = renderHook(() => useOrganizationFilter(mockTeams, ''));

    // active 상태의 멤버만 포함되어야 함
    expect(result.current.activeTeams[0].parts[0].members).toHaveLength(1);
    expect(result.current.activeTeams[0].parts[0].members[0].name).toBe('김개발');
    
    // on_leave 상태의 멤버는 별도로 분리되어야 함
    expect(result.current.onLeaveMembers).toHaveLength(1);
    expect(result.current.onLeaveMembers[0].name).toBe('이디자인');
  });

  it('비활성 멤버 필터링이 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useOrganizationFilter(mockTeams, '이'));

    expect(result.current.filteredInactiveMembers.onLeave).toHaveLength(1);
    expect(result.current.filteredInactiveMembers.onLeave[0].name).toBe('이디자인');
  });
});