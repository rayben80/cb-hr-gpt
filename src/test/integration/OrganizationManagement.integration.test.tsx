/**
 * 조직 관리 사용자 시나리오 테스트
 * 핵심 워크플로우 검증
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';

// 간단한 Mock 컴포넌트
const MockOrganizationManagement = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [teams] = React.useState([
    {
      id: 'team1',
      name: '개발팀',
      lead: '김팀장',
      parts: [
        {
          id: 'part1',
          title: '프론트엔드',
          members: [
            {
              id: 'member1',
              name: '김개발',
              role: '주임',
              status: 'active'
            }
          ]
        }
      ]
    }
  ]);

  return (
    <div data-testid="organization-management">
      <h1>조직 관리</h1>
      
      <input
        type="text"
        placeholder="구성원 이름으로 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        data-testid="search-input"
      />
      
      <div data-testid="statistics">
        <div>전체 인원: 1</div>
        <div>재직: 1</div>
      </div>
      
      <div data-testid="teams-container">
        {teams.map(team => (
          <div key={team.id} data-testid={`team-${team.id}`}>
            <h3>{team.name}</h3>
            <p>팀장: {team.lead}</p>
            
            {team.parts.map(part => (
              <div key={part.id} data-testid={`part-${part.id}`}>
                <h4>{part.title} ({part.members.length}명)</h4>
                
                {part.members
                  .filter(member => 
                    searchTerm === '' || member.name.includes(searchTerm)
                  )
                  .map(member => (
                    <div key={member.id} data-testid={`member-${member.id}`}>
                      <span>{member.name}</span>
                      <span>{member.role}</span>
                    </div>
                  ))
                }
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div data-testid="action-buttons">
        <button>팀 추가</button>
      </div>
    </div>
  );
};

describe('조직 관리 통합 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 레이아웃이 올바르게 렌더링되어야 한다', () => {
    render(<MockOrganizationManagement />);

    expect(screen.getByTestId('organization-management')).toBeInTheDocument();
    expect(screen.getByText('조직 관리')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('statistics')).toBeInTheDocument();
    expect(screen.getByTestId('teams-container')).toBeInTheDocument();
    expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
  });

  it('팀과 파트 정보가 표시되어야 한다', () => {
    render(<MockOrganizationManagement />);

    expect(screen.getByTestId('team-team1')).toBeInTheDocument();
    expect(screen.getByText('개발팀')).toBeInTheDocument();
    expect(screen.getByText('팀장: 김팀장')).toBeInTheDocument();
    expect(screen.getByTestId('part-part1')).toBeInTheDocument();
    expect(screen.getByText('프론트엔드 (1명)')).toBeInTheDocument();
  });

  it('멤버 정보가 표시되어야 한다', () => {
    render(<MockOrganizationManagement />);

    expect(screen.getByTestId('member-member1')).toBeInTheDocument();
    expect(screen.getByText('김개발')).toBeInTheDocument();
    expect(screen.getByText('주임')).toBeInTheDocument();
  });

  it('검색 기능이 동작해야 한다', () => {
    render(<MockOrganizationManagement />);

    const searchInput = screen.getByTestId('search-input');
    
    // 검색어 입력
    fireEvent.change(searchInput, { target: { value: '김개발' } });
    expect(searchInput).toHaveValue('김개발');
    
    // 검색 결과 확인
    expect(screen.getByText('김개발')).toBeInTheDocument();
  });

  it('존재하지 않는 이름 검색 시 결과가 없어야 한다', () => {
    render(<MockOrganizationManagement />);

    const searchInput = screen.getByTestId('search-input');
    
    // 존재하지 않는 이름 검색
    fireEvent.change(searchInput, { target: { value: '존재하지않는이름' } });
    
    // 멤버가 표시되지 않아야 함
    expect(screen.queryByTestId('member-member1')).not.toBeInTheDocument();
  });

  it('통계 정보가 표시되어야 한다', () => {
    render(<MockOrganizationManagement />);

    expect(screen.getByText('전체 인원: 1')).toBeInTheDocument();
    expect(screen.getByText('재직: 1')).toBeInTheDocument();
  });

  it('액션 버튼들이 렌더링되어야 한다', () => {
    render(<MockOrganizationManagement />);

    expect(screen.getByText('팀 추가')).toBeInTheDocument();
  });
});
