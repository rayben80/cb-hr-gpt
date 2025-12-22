/**
 * WizardStep4FinalReview 컴포넌트 테스트
 * 조직 재구성 마법사의 4단계: 최종 검토 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { WizardStep4FinalReview } from '../../components/organization/wizard/WizardStep4FinalReview';

// Mock dependencies
vi.mock('../../components/common', () => ({
  Icon: ({ path, className }: { path: string; className: string }) => 
    <div data-testid="icon" data-path={path} className={className} />
}));

describe('WizardStep4FinalReview Component', () => {
  const defaultProps = {
    newTeams: [
      {
        id: '1',
        name: '개발팀',
        lead: '김팀장',
        parts: [
          {
            id: 'p1',
            title: '프론트엔드',
            members: [
              {
                id: 'm1',
                name: '김개발',
                role: '주임',
                status: 'active' as const,
                email: 'kim@example.com',
                hireDate: '2023-01-01',
                avatar: '/avatar1.jpg'
              }
            ]
          }
        ]
      }
    ],
    unassignedMembers: [],
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
    render(<WizardStep4FinalReview {...defaultProps} />);

    expect(screen.getByText('4단계: 최종 검토')).toBeInTheDocument();
    expect(screen.getByText('새로운 조직도 미리보기')).toBeInTheDocument();
  });

  it('팀과 파트, 멤버 정보가 올바르게 표시되어야 한다', () => {
    render(<WizardStep4FinalReview {...defaultProps} />);

    expect(screen.getByText('개발팀')).toBeInTheDocument();
    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
    expect(screen.getByText('김개발')).toBeInTheDocument();
  });

  it('미배치 인원이 있을 때 안내가 표시되어야 한다', () => {
    const propsWithUnassigned = {
      ...defaultProps,
      unassignedMembers: [
        {
          id: 'u1',
          name: '박미배치',
          role: '대리',
          status: 'active' as const,
          email: 'park@example.com',
          hireDate: '2023-01-01',
          avatar: '/avatar2.jpg'
        }
      ]
    };

    render(<WizardStep4FinalReview {...propsWithUnassigned} />);

    expect(screen.getByText(/미배치 인원/)).toBeInTheDocument();
    expect(screen.getByText('박미배치')).toBeInTheDocument();
  });
});
