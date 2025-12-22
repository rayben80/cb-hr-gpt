/**
 * useWizardState 훅 테스트
 * 조직 재구성 마법사의 상태 관리 훅 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardState } from '../../hooks/useWizardState';

describe('useWizardState Hook', () => {
  const mockCurrentTeams = [
    {
      id: 'team1',
      name: '개발팀',
      lead: '김팀장',
      parts: [
        {
          id: 'part1',
          title: '프론트엔드',
          members: []
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any timers or subscriptions
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));

    const [state] = result.current;
    expect(state.step).toBe(1);
    expect(state.newTeams).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('handleNextStep 함수가 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));

    // 팀을 추가하여 다음 단계로 진행할 수 있도록 함
    act(() => {
      const [, actions] = result.current;
      actions.setNewTeams([{ id: '1', name: '개발팀', lead: '김팀장', parts: [] }]);
    });

    // computed 값을 다시 가져옴
    const [, , computed] = result.current;
    
    // canProceedToStep2가 true인지 확인
    expect(computed.canProceedToStep2).toBe(true);

    // 다음 단계로 진행
    act(() => {
      const [, actions] = result.current;
      actions.handleNextStep();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const [state] = result.current;
    expect(state.step).toBe(2);
  });

  it('handlePreviousStep 함수가 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));

    // 팀을 추가하여 다음 단계로 진행할 수 있도록 함
    act(() => {
      const [, actions] = result.current;
      actions.setNewTeams([{ id: '1', name: '개발팀', lead: '김팀장', parts: [] }]);
    });

    // computed 값을 다시 가져옴
    const [, , computed] = result.current;
    
    // canProceedToStep2가 true인지 확인
    expect(computed.canProceedToStep2).toBe(true);

    // 다음 단계로 진행
    act(() => {
      const [, actions] = result.current;
      actions.handleNextStep();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 이전 단계로 돌아감
    act(() => {
      const [, actions] = result.current;
      actions.handlePreviousStep();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const [state] = result.current;
    expect(state.step).toBe(1);
  });

  it('setNewTeams 함수가 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));
    const [, actions] = result.current;
    const newTeams = [{ id: '1', name: '개발팀', lead: '김팀장', parts: [] }];

    act(() => {
      actions.setNewTeams(newTeams);
    });

    const [state] = result.current;
    expect(state.newTeams).toEqual(newTeams);
  });

  it('resetWizard 함수가 올바르게 동작해야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));
    const [, actions] = result.current;
    
    act(() => {
      actions.setNewTeams([{ id: '1', name: '개발팀', lead: '김팀장', parts: [] }]);
      actions.resetWizard();
    });

    const [state] = result.current;
    expect(state.step).toBe(1);
    expect(state.newTeams).toEqual([]);
  });

  it('isLoading 상태가 올바르게 관리되어야 한다', () => {
    const { result } = renderHook(() => useWizardState(mockCurrentTeams, true));
    const [, actions] = result.current;

    act(() => {
      actions.setIsLoading(true);
    });

    let [state] = result.current;
    expect(state.isLoading).toBe(true);

    act(() => {
      actions.setIsLoading(false);
    });

    [state] = result.current;
    expect(state.isLoading).toBe(false);
  });
});
