/**
 * WizardStep2PartSetup 컴포넌트 테스트
 * 조직 재구성 마법사의 2단계: 파트 설정 컴포넌트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { WizardStep2PartSetup } from '../../components/organization/wizard/WizardStep2PartSetup';

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

describe('WizardStep2PartSetup Component', () => {
  const defaultProps = {
    newTeams: [
      { id: '1', name: '개발팀', lead: '김팀장', parts: [] }
    ],
    addingPartToTeam: null,
    newPartTitle: '',
    onNewPartTitleChange: vi.fn(),
    onStartAddingPart: vi.fn(),
    onAddPart: vi.fn(),
    onCancelAddPart: vi.fn(),
    onDeletePart: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 UI 요소들이 올바르게 렌더링되어야 한다', () => {
    render(<WizardStep2PartSetup {...defaultProps} />);

    expect(screen.getByText('2단계: 팀에 파트 추가하기')).toBeInTheDocument();
    expect(screen.getByText(/최소 1개의 파트/)).toBeInTheDocument();
    expect(screen.getByText('파트 추가하기')).toBeInTheDocument();
  });

  it('파트가 없는 팀이 있을 때 경고 메시지가 표시되어야 한다', () => {
    render(<WizardStep2PartSetup {...defaultProps} />);

    expect(screen.getByText(/파트가 만들어지지 않은 팀/)).toBeInTheDocument();
  });

  it('파트 추가 버튼 클릭 시 onStartAddingPart가 호출되어야 한다', () => {
    render(<WizardStep2PartSetup {...defaultProps} />);

    const addButton = screen.getByText('파트 추가하기');
    fireEvent.click(addButton);

    expect(defaultProps.onStartAddingPart).toHaveBeenCalledWith('1');
  });

  it('파트 입력 폼에서 값 변경 시 콜백이 호출되어야 한다', () => {
    render(
      <WizardStep2PartSetup
        {...defaultProps}
        addingPartToTeam="1"
      />
    );

    const input = screen.getByPlaceholderText('예: 기술지원파트');
    fireEvent.change(input, { target: { value: '프론트엔드' } });

    expect(defaultProps.onNewPartTitleChange).toHaveBeenCalledWith('프론트엔드');
  });

  it('파트 생성 버튼 클릭 시 onAddPart가 호출되어야 한다', () => {
    render(
      <WizardStep2PartSetup
        {...defaultProps}
        addingPartToTeam="1"
        newPartTitle="프론트엔드"
      />
    );

    const addButton = screen.getByText('파트 생성');
    fireEvent.click(addButton);

    expect(defaultProps.onAddPart).toHaveBeenCalledWith('1');
  });

  it('파트가 있을 때 파트 목록이 표시되어야 한다', () => {
    const teamsWithParts = [
      { id: '1', name: '개발팀', lead: '김팀장', parts: [{ id: 'p1', title: '프론트엔드', members: [] }] }
    ];

    render(<WizardStep2PartSetup {...defaultProps} newTeams={teamsWithParts} />);

    expect(screen.getByText('프론트엔드')).toBeInTheDocument();
  });
});
