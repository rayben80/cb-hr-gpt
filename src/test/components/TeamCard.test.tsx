/**
 * TeamCard 컴포넌트 테스트
 * 팀 카드 컴포넌트의 렌더링 및 상호작용 검증
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from '../../components/organization/TeamCard';
import { Team, Part, Member } from '../../constants';

// Mock dependencies
vi.mock('../../components/common', () => ({
  Icon: ({ path, className }: { path: string; className: string }) => 
    <div data-testid="icon" data-path={path} className={className} />,
  Dropdown: ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => (
    <div data-testid="dropdown">
      {trigger}
      <div data-testid="dropdown-menu">{children}</div>
    </div>
  ),
  DropdownItem: ({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
    <button 
      data-testid="dropdown-item" 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}));

vi.mock('../../components/organization/PartSection', () => ({
  PartSection: ({ part, teamId }: { part: Part; teamId: string }) => (
    <div data-testid="part-section" data-part-id={part.id} data-team-id={teamId}>
      {part.title} ({part.members.length}명)
    </div>
  )
}));

describe('TeamCard Component', () => {
  const mockTeam: Team = {
    id: 'team1',
    name: '개발팀',
    lead: '김팀장',
    originalTotalMemberCount: 5,
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
            avatar: '/avatar1.jpg'
          },
          {
            id: 'member2',
            name: '이개발',
            role: '대리',
            status: 'active',
            email: 'lee@example.com',
            hireDate: '2022-01-01',
            avatar: '/avatar2.jpg'
          }
        ]
      },
      {
        id: 'part2',
        title: '백엔드',
        members: [
          {
            id: 'member3',
            name: '박개발',
            role: '과장',
            status: 'active',
            email: 'park@example.com',
            hireDate: '2021-01-01',
            avatar: '/avatar3.jpg'
          }
        ]
      }
    ]
  };

  const defaultProps = {
    team: mockTeam,
    onAddMember: vi.fn(),
    onEditMember: vi.fn(),
    onDeleteMember: vi.fn(),
    onDropMemberInPart: vi.fn(),
    onAddPart: vi.fn(),
    onEditPart: vi.fn(),
    onDeletePart: vi.fn(),
    onEditTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    onMoveMember: vi.fn(),
    searchTerm: '',
    baseDate: '2024-01-01'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('팀 기본 정보를 올바르게 렌더링해야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    expect(screen.getByText('개발팀 (5명)')).toBeInTheDocument();
    expect(screen.getByText('팀장: 김팀장')).toBeInTheDocument();
  });

  it('팀에 속한 파트들을 렌더링해야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const partSections = screen.getAllByTestId('part-section');
    expect(partSections.length).toBeGreaterThan(0);
    expect(screen.getByText('프론트엔드 (2명)')).toBeInTheDocument();
  });

  it('파트 추가 버튼을 렌더링해야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const addPartButton = screen.getByRole('button', { name: /파트 추가/i });
    expect(addPartButton).toBeInTheDocument();
  });

  it('파트 추가 버튼 클릭 시 onAddPart를 호출해야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const addPartButton = screen.getByRole('button', { name: /파트 추가/i });
    fireEvent.click(addPartButton);

    expect(defaultProps.onAddPart).toHaveBeenCalledWith('team1');
  });

  it('드롭다운 메뉴가 렌더링되어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('팀 편집 메뉴 항목이 있어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const editItems = screen.getAllByTestId('dropdown-item');
    const editTeamItem = editItems.find(item => 
      item.textContent?.includes('팀 정보 수정')
    );
    
    expect(editTeamItem).toBeInTheDocument();
  });

  it('팀 삭제 메뉴 항목이 있어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const deleteItems = screen.getAllByTestId('dropdown-item');
    const deleteTeamItem = deleteItems.find(item => 
      item.textContent?.includes('팀 삭제')
    );
    
    expect(deleteTeamItem).toBeInTheDocument();
  });

  it('팀이 비어있지 않으면 팀 삭제 버튼이 비활성화되어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const deleteItems = screen.getAllByTestId('dropdown-item');
    const deleteTeamItem = deleteItems.find(item => 
      item.textContent?.includes('팀 삭제')
    );
    
    expect(deleteTeamItem).toBeDisabled();
  });

  it('검색어가 있을 때 멤버 수를 올바르게 표시해야 한다', () => {
    const propsWithSearch = {
      ...defaultProps,
      searchTerm: '김'
    };

    render(<TeamCard {...propsWithSearch} />);

    // 검색어가 있을 때는 "필터된 수 / 전체 수" 형식으로 표시
    expect(screen.getByText(/개발팀 \(\d+ \/ \d+명\)/)).toBeInTheDocument();
  });

  it('검색 결과가 없을 때 팀이 렌더링되지 않아야 한다', () => {
    const teamWithNoMatches = {
      ...mockTeam,
      parts: mockTeam.parts.map(part => ({
        ...part,
        members: [] // 검색 결과가 없는 상태
      }))
    };

    const propsWithSearch = {
      ...defaultProps,
      team: teamWithNoMatches,
      searchTerm: '존재하지않는검색어'
    };

    const { container } = render(<TeamCard {...propsWithSearch} />);
    expect(container.firstChild).toBeNull();
  });

  it('빈 팀이고 검색어가 없을 때 렌더링되지 않아야 한다', () => {
    const emptyTeam = {
      ...mockTeam,
      originalTotalMemberCount: 0,
      parts: []
    };

    const { container } = render(<TeamCard {...defaultProps} team={emptyTeam} />);
    expect(container.firstChild).toBeNull();
  });

  it('드래그 상태가 전달되어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const partSections = screen.getAllByTestId('part-section');
    expect(partSections.length).toBeGreaterThan(0);
  });

  it('모든 필수 props가 파트 섹션에 전달되어야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    const partSection = screen.getAllByTestId('part-section')[0];
    expect(partSection).toHaveAttribute('data-part-id', 'part1');
    expect(partSection).toHaveAttribute('data-team-id', 'team1');
  });

  it('accessibility 요구사항을 만족해야 한다', () => {
    render(<TeamCard {...defaultProps} />);

    // 버튼들이 적절한 역할을 가져야 함
    const addPartButton = screen.getByRole('button', { name: /파트 추가/i });
    expect(addPartButton).toBeInTheDocument();

    // 제목이 적절한 계층구조를 가져야 함
    const teamTitle = screen.getByRole('heading', { level: 2 });
    expect(teamTitle).toBeInTheDocument();
  });
});
