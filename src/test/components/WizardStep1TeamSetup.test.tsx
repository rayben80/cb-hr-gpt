/**
 * WizardStep1TeamSetup 컴포넌트 테스트
 * 조직 재구성 마법사의 1단계: 팀 설정 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WizardStep1TeamSetup } from '../../components/organization/wizard/WizardStep1TeamSetup';

// Mock dependencies
vi.mock('../../components/common', () => ({
  Icon: ({ path, className }: { path: string; className: string }) => 
    <span data-testid="icon" data-path={path} className={className} />,
  InputField: ({ label, id, value, onChange, placeholder }: { label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
    <label>
      <span>{label}</span>
      <input id={id} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  )
}));

describe('WizardStep1TeamSetup Component', () => {
  const defaultProps = {
    newTeams: [],
    isAddingTeam: false,
    newTeamName: '',
    newTeamLead: '',
    onNewTeamNameChange: vi.fn(),
    onNewTeamLeadChange: vi.fn(),
    onStartAddingTeam: vi.fn(),
    onAddTeam: vi.fn(),
    onCancelAddTeam: vi.fn(),
    onDeleteTeam: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
    render(<WizardStep1TeamSetup {...defaultProps} />);

    expect(screen.getByText('1단계: 새로운 팀 구성하기')).toBeInTheDocument();
    expect(screen.getByText(/첫 번째 팀/)).toBeInTheDocument();
    expect(screen.getByText('새 팀 추가하기')).toBeInTheDocument();
  });

  it('새 팀 추가하기 버튼 클릭 시 onStartAddingTeam이 호출되어야 한다', () => {
    render(<WizardStep1TeamSetup {...defaultProps} />);

    const addButton = screen.getByText('새 팀 추가하기');
    fireEvent.click(addButton);

    expect(defaultProps.onStartAddingTeam).toHaveBeenCalled();
  });

  it('팀 입력 폼에서 값 변경 시 콜백이 호출되어야 한다', () => {
    render(<WizardStep1TeamSetup {...defaultProps} isAddingTeam />);

    const nameInput = screen.getByPlaceholderText('예: 신사업팀');
    const leadInput = screen.getByPlaceholderText('예: 홍길동');
    fireEvent.change(nameInput, { target: { value: '개발팀' } });
    fireEvent.change(leadInput, { target: { value: '김팀장' } });

    expect(defaultProps.onNewTeamNameChange).toHaveBeenCalledWith('개발팀');
    expect(defaultProps.onNewTeamLeadChange).toHaveBeenCalledWith('김팀장');
  });

  it('팀 생성 버튼 클릭 시 onAddTeam이 호출되어야 한다', () => {
    render(
      <WizardStep1TeamSetup
        {...defaultProps}
        isAddingTeam
        newTeamName="개발팀"
        newTeamLead="김팀장"
      />
    );

    const addButton = screen.getByText('팀 생성');
    fireEvent.click(addButton);

    expect(defaultProps.onAddTeam).toHaveBeenCalled();
  });

  it('팀 목록이 있을 때 팀 정보가 표시되어야 한다', () => {
    const teams = [
      { id: '1', name: '개발팀', lead: '김팀장', parts: [] }
    ];

    render(<WizardStep1TeamSetup {...defaultProps} newTeams={teams} />);

    expect(screen.getByText('개발팀')).toBeInTheDocument();
    expect(screen.getByText('팀장: 김팀장')).toBeInTheDocument();
  });

  it('팀 삭제 버튼 클릭 시 onDeleteTeam이 호출되어야 한다', () => {
    const teams = [
      { id: '1', name: '개발팀', lead: '김팀장', parts: [] }
    ];

    render(<WizardStep1TeamSetup {...defaultProps} newTeams={teams} />);

    const deleteButton = screen.getByTitle('팀 삭제');
    fireEvent.click(deleteButton);

    expect(defaultProps.onDeleteTeam).toHaveBeenCalledWith('1');
  });
});
