/**
 * WizardStep3MemberAssignmentNew 컴포넌트 테스트
 * 조직 재구성 마법사의 3단계: 멤버 할당 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WizardStep3MemberAssignmentNew } from '../../components/organization/wizard/WizardStep3MemberAssignmentNew';

// Mock dependencies
vi.mock('../../components/common', () => ({
  Icon: ({ path, className }: { path: string; className: string }) => 
    <span data-testid="icon" data-path={path} className={className} />,
}));

describe('WizardStep3MemberAssignmentNew Component', () => {
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnDragOver = vi.fn();
  const mockOnDragLeave = vi.fn();
  const mockOnDrop = vi.fn();
  const mockOnMemberSearchChange = vi.fn();

  const defaultProps = {
    newTeams: [
      { 
        id: '1', 
        name: '개발팀',
        lead: '김팀장',
        parts: [
          { id: 'p1', title: '프론트엔드', members: [] },
          { id: 'p2', title: '백엔드', members: [] }
        ],
        originalTotalMemberCount: 0
      }
    ],
    unassignedMembers: [],
    memberSearch: '',
    isDragOver: null,
    onMemberSearchChange: mockOnMemberSearchChange,
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd,
    onDragOver: mockOnDragOver,
    onDragLeave: mockOnDragLeave,
    onDrop: mockOnDrop
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
    render(<WizardStep3MemberAssignmentNew {...defaultProps} />);

    expect(screen.getByText('3단계: 멤버 배치하기')).toBeInTheDocument();
    expect(screen.getByText('왼쪽의 미배치 인원을 드래그하여 오른쪽의 신규 조직에 배치해주세요.')).toBeInTheDocument();
    expect(screen.getByText('미배치 인원 (0)')).toBeInTheDocument();
    expect(screen.getByText('신규 조직도')).toBeInTheDocument();
  });

  it('멤버가 없을 때 안내 메시지가 표시되어야 한다', () => {
    render(<WizardStep3MemberAssignmentNew {...defaultProps} />);

    expect(screen.getByText('모든 인원이 배치되었습니다!')).toBeInTheDocument();
  });

  it('멤버가 있을 때 멤버 목록이 표시되어야 한다', () => {
    const unassignedMembers = [{
      id: 'm1',
      name: '김개발',
      role: '주임',
      status: 'active',
      email: 'kim@example.com',
      hireDate: '2023-01-01',
      avatar: '/avatar1.jpg'
    }];
    
    render(<WizardStep3MemberAssignmentNew {...defaultProps} unassignedMembers={unassignedMembers} />);

    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('주임')).toBeInTheDocument();
    expect(screen.getByText('미배치 인원 (1)')).toBeInTheDocument();
  });

  it('멤버 추가 버튼을 클릭하면 onMemberSearchChange가 호출되어야 한다', () => {
    render(<WizardStep3MemberAssignmentNew {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('이름 검색...');
    fireEvent.change(searchInput, { target: { value: '김' } });

    expect(mockOnMemberSearchChange).toHaveBeenCalledWith('김');
  });

  it('파트에 멤버가 있을 때 멤버 목록이 표시되어야 한다', () => {
    const newTeams = [
      { 
        id: '1', 
        name: '개발팀',
        lead: '김팀장',
        parts: [
          { id: 'p1', title: '프론트엔드', members: [{
            id: 'm1',
            name: '김개발',
            role: '주임',
            status: 'active',
            email: 'kim@example.com',
            hireDate: '2023-01-01',
            avatar: '/avatar1.jpg'
          }] },
          { id: 'p2', title: '백엔드', members: [] }
        ],
        originalTotalMemberCount: 0
      }
    ];
    
    render(<WizardStep3MemberAssignmentNew {...defaultProps} newTeams={newTeams} />);

    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('프론트엔드 (1명)')).toBeInTheDocument();
  });

  it('드래그 이벤트가 올바르게 처리되어야 한다', () => {
    const unassignedMembers = [{
      id: 'm1',
      name: '김개발',
      role: '주임',
      status: 'active',
      email: 'kim@example.com',
      hireDate: '2023-01-01',
      avatar: '/avatar1.jpg'
    }];
    
    render(<WizardStep3MemberAssignmentNew {...defaultProps} unassignedMembers={unassignedMembers} />);

    const draggableMember = screen.getByText('김개발').closest('div[draggable="true"]');
    if (draggableMember) {
      fireEvent.dragStart(draggableMember);
      expect(mockOnDragStart).toHaveBeenCalled();
      
      fireEvent.dragEnd(draggableMember);
      expect(mockOnDragEnd).toHaveBeenCalled();
    }
  });
});
