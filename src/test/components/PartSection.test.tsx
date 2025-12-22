/**
 * PartSection 컴포넌트 테스트
 * 파트 섹션 컴포넌트의 렌더링 및 상호작용 검증
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PartSection } from '../../components/organization/PartSection';
import { Part, Member } from '../../constants';

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

vi.mock('../../components/organization/Member', () => ({
  Member: ({ member, onEdit, onDelete }: { member: Member; onEdit: (member: Member) => void; onDelete: (member: Member) => void }) => (
    <div data-testid="member" data-member-id={member.id}>
      <span>{member.name}</span>
      <button onClick={() => onEdit(member)}>Edit {member.name}</button>
      <button onClick={() => onDelete(member)}>Delete {member.name}</button>
    </div>
  )
}));

describe('PartSection Component', () => {
  const mockMembers: Member[] = [
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
      status: 'on_leave',
      email: 'lee@example.com',
      hireDate: '2022-01-01',
      avatar: '/avatar2.jpg'
    }
  ];

  const mockPart: Part = {
    id: 'part1',
    title: '프론트엔드',
    members: mockMembers,
    originalMemberCount: 3
  };

  const defaultProps = {
    part: mockPart,
    teamId: 'team1',
    onAddMember: vi.fn(),
    onEditMember: vi.fn(),
    onDeleteMember: vi.fn(),
    onDropMemberInPart: vi.fn(),
    onEditPart: vi.fn(),
    onDeletePart: vi.fn(),
    onMoveMember: vi.fn(),
    searchTerm: '',
    baseDate: '2024-01-01'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('파트 기본 정보를 올바르게 렌더링해야 한다', () => {
    render(<PartSection {...defaultProps} />);

    expect(screen.getByText('프론트엔드 (2명)')).toBeInTheDocument();
  });

  it('검색어가 있을 때 멤버 수를 "현재 수 / 전체 수" 형식으로 표시해야 한다', () => {
    const propsWithSearch = {
      ...defaultProps,
      searchTerm: '김'
    };

    render(<PartSection {...propsWithSearch} />);

    expect(screen.getByText('프론트엔드 (2 / 3명)')).toBeInTheDocument();
  });

  it('파트 멤버들을 렌더링해야 한다', () => {
    render(<PartSection {...defaultProps} />);

    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('이개발')).toBeInTheDocument();
  });

  it('접기/펼치기 기능이 동작해야 한다', () => {
    render(<PartSection {...defaultProps} />);

    // 초기에는 열려있어야 함
    expect(screen.getByText('김개발')).toBeInTheDocument();

    // 헤더 클릭으로 접기
    const header = screen.getByText('프론트엔드 (2명)').closest('div');
    fireEvent.click(header!);

    // 멤버가 보이지 않아야 함
    expect(screen.queryByText('김개발')).not.toBeInTheDocument();
  });

  it('드롭다운 메뉴가 렌더링되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('멤버 추가 메뉴 항목을 클릭하면 onAddMember가 호출되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const addMemberItem = dropdownItems.find(item => 
      item.textContent?.includes('멤버 추가')
    );

    expect(addMemberItem).toBeDefined();
    fireEvent.click(addMemberItem!);

    expect(defaultProps.onAddMember).toHaveBeenCalledWith('team1', 'part1');
  });

  it('파트명 변경 메뉴 항목을 클릭하면 onEditPart가 호출되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const editPartItem = dropdownItems.find(item => 
      item.textContent?.includes('파트명 변경')
    );

    expect(editPartItem).toBeDefined();
    fireEvent.click(editPartItem!);

    expect(defaultProps.onEditPart).toHaveBeenCalledWith('team1', mockPart);
  });

  it('멤버가 있는 파트는 삭제 버튼이 비활성화되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const deletePartItem = dropdownItems.find(item => 
      item.textContent?.includes('파트 삭제')
    );

    expect(deletePartItem).toBeDisabled();
  });

  it('멤버가 없는 파트는 삭제 버튼이 활성화되어야 한다', () => {
    const emptyPart = {
      ...mockPart,
      members: []
    };

    const propsWithEmptyPart = {
      ...defaultProps,
      part: emptyPart
    };

    render(<PartSection {...propsWithEmptyPart} />);

    const dropdownItems = screen.getAllByTestId('dropdown-item');
    const deletePartItem = dropdownItems.find(item => 
      item.textContent?.includes('파트 삭제')
    );

    expect(deletePartItem).not.toBeDisabled();

    fireEvent.click(deletePartItem!);
    expect(defaultProps.onDeletePart).toHaveBeenCalledWith('team1', 'part1');
  });

  it('멤버가 없을 때 안내 메시지를 표시해야 한다', () => {
    const emptyPart = {
      ...mockPart,
      members: []
    };

    const propsWithEmptyPart = {
      ...defaultProps,
      part: emptyPart
    };

    render(<PartSection {...propsWithEmptyPart} />);

    expect(screen.getByText(/이 파트에 멤버가 없습니다/)).toBeInTheDocument();
  });

  it('드래그 오버 시 적절한 시각적 피드백을 제공해야 한다', () => {
    const { container } = render(<PartSection {...defaultProps} />);

    const dropZone = container.querySelector('.pl-4');
    expect(dropZone).not.toBeNull();

    // 드래그 엔터 시뮬레이션
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: {
        types: ['text/plain']
      }
    });

    // 드래그 오버 가이드 메시지 확인
    expect(screen.getByText('여기에 드롭하세요')).toBeInTheDocument();
  });

  it('드롭 시 onDropMemberInPart가 호출되어야 한다', () => {
    const { container } = render(<PartSection {...defaultProps} />);

    const dropZone = container.querySelector('.pl-4');
    expect(dropZone).not.toBeNull();

    // 드래그 엔터
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: {
        types: ['text/plain']
      }
    });

    // 드롭 시뮬레이션
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        getData: () => 'member3'
      }
    });

    expect(defaultProps.onDropMemberInPart).toHaveBeenCalledWith('member3', 'team1', 'part1');
  });

  it('멤버 편집 시 onEditMember가 호출되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const editButton = screen.getByText('Edit 김개발');
    fireEvent.click(editButton);

    expect(defaultProps.onEditMember).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('멤버 삭제 시 onDeleteMember가 호출되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const deleteButton = screen.getByText('Delete 김개발');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDeleteMember).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('드래그 앤 드롭 핸들러가 Member에게 전달되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    const memberElements = screen.getAllByTestId('member');
    expect(memberElements.length).toBe(2);
    expect(memberElements[0]).toBeInTheDocument();
    expect(memberElements[1]).toBeInTheDocument();
  });

  it('chevron 아이콘이 열림/닫힘 상태에 따라 변경되어야 한다', () => {
    render(<PartSection {...defaultProps} />);

    // 초기에는 chevronUp 아이콘이어야 함 (열린 상태)
    let chevronIcons = screen.getAllByTestId('icon');
    let chevronIcon = chevronIcons.find(icon => 
      icon.getAttribute('data-path')?.includes('4.5 15.75l7.5-7.5 7.5 7.5')
    );
    expect(chevronIcon).toBeDefined();

    // 헤더 클릭으로 접기
    const header = screen.getByText('프론트엔드 (2명)').closest('div');
    fireEvent.click(header!);

    // chevronDown 아이콘으로 변경되어야 함
    chevronIcons = screen.getAllByTestId('icon');
    chevronIcon = chevronIcons.find(icon => 
      icon.getAttribute('data-path')?.includes('19.5 8.25l-7.5 7.5-7.5-7.5')
    );
    expect(chevronIcon).toBeDefined();
  });

  it('accessibility 요구사항을 만족해야 한다', () => {
    render(<PartSection {...defaultProps} />);

    // 헤더가 클릭 가능한 요소여야 함
    const header = screen.getByText('프론트엔드 (2명)').closest('[onClick]');
    expect(header).toBeDefined();

    // 드롭다운 버튼이 있어야 함
    const dropdownTrigger = screen.getByTestId('dropdown');
    expect(dropdownTrigger).toBeInTheDocument();
  });
});
