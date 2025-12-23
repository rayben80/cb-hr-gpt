/**
 * 테스트 유틸리티 함수들
 * 재사용 가능한 테스트 헬퍼 함수와 목 데이터
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi, expect } from 'vitest';
import { Team, Member, Part, EvaluationTemplate } from '../constants';

// 컨텍스트가 필요한 컴포넌트를 위한 래퍼
interface ProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: ProvidersProps) => {
  return <>{children}</>;
};

// 커스텀 렌더 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// 테스트용 목 데이터
export const mockMember: Member = {
  id: 'test-member-1',
  name: '김테스트',
  role: '선임연구원',
  email: 'test@example.com',
  avatar: 'https://ui-avatars.com/api/?name=김테스트&background=random&color=fff',
  hireDate: '2023-01-15',
  status: 'active',
};

export const mockPart: Part = {
  id: 'test-part-1',
  title: '테스트파트',
  members: [mockMember],
};

export const mockTeam: Team = {
  id: 'test-team-1',
  name: '테스트팀',
  lead: '박팀장',
  parts: [mockPart],
  originalTotalMemberCount: 1,
};

export const mockEvaluationTemplate: EvaluationTemplate = {
  id: 'test-template-1',
  name: '테스트 평가 템플릿',
  type: '역량 평가',
  category: '공통',
  tags: ['테스트'],
  version: 1,
  favorite: false,
  archived: false,
  lastUpdated: '2024-01-01',
  author: '테스트 관리자',
  items: [],
  questions: 5,
};

// 이벤트 핸들러 모킹
export const mockHandlers = {
  onAddMember: vi.fn(),
  onEditMember: vi.fn(),
  onDeleteMember: vi.fn(),
  onDropMemberInPart: vi.fn(),
  onAddPart: vi.fn(),
  onEditPart: vi.fn(),
  onDeletePart: vi.fn(),
  onEditTeam: vi.fn(),
  onDeleteTeam: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
};

// 드래그 앤 드롭 이벤트 모킹
export const createMockDragEvent = (type: string, data?: Record<string, string>) => {
  const dataTransfer = {
    getData: vi.fn((format: string) => data?.[format] || ''),
    setData: vi.fn(),
    setDragImage: vi.fn(),
    effectAllowed: 'move',
    dropEffect: 'move',
  };

  return {
    type,
    dataTransfer,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    currentTarget: document.createElement('div'),
    target: document.createElement('div'),
  } as any;
};

// 로컬 스토리지 헬퍼
export const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// 네트워크 상태 모킹
export const mockNetworkState = {
  isOnline: true,
  lastChecked: new Date(),
};

// 테스트용 에러 생성
export const createTestError = (message: string) => new Error(message);

// 비동기 테스트 헬퍼
export const waitForMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 컴포넌트 props 검증 헬퍼
export const expectPropsToMatch = (component: any, expectedProps: Record<string, any>) => {
  Object.entries(expectedProps).forEach(([key, value]) => {
    expect(component.props[key]).toEqual(value);
  });
};

// re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
