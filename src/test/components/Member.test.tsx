/**
 * Member 컴포넌트 테스트
 * 멤버 카드 컴포넌트의 렌더링 및 상호작용 검증
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Member } from '../../components/organization/Member';
import { Member as MemberType } from '../../constants';

// Mock dependencies
vi.mock('../../components/common', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Dropdown: ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => (
        <div data-testid="dropdown">
            {trigger}
            <div data-testid="dropdown-menu">{children}</div>
        </div>
    ),
    DropdownItem: ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
        <button data-testid="dropdown-item" onClick={onClick}>
            {children}
        </button>
    ),
}));

describe('Member Component', () => {
    const mockMember: MemberType = {
        id: 'member1',
        name: '김개발',
        role: '주임',
        status: 'active',
        email: 'kim@example.com',
        hireDate: '2023-01-01',
        avatar: '/avatar1.jpg',
    };

    const defaultProps = {
        member: mockMember,
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        baseDate: '2024-01-01',
        isDragging: false,
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('멤버 기본 정보를 올바르게 렌더링해야 한다', () => {
        render(<Member {...defaultProps} />);

        expect(screen.getByText('김개발')).toBeInTheDocument();
        expect(screen.getByText('주임')).toBeInTheDocument();
        expect(screen.getByTitle('kim@example.com')).toBeInTheDocument();
    });

    it('멤버 아바타를 올바르게 렌더링해야 한다', () => {
        render(<Member {...defaultProps} />);

        const avatar = screen.getByRole('img', { name: '김개발 avatar' });
        expect(avatar).toBeInTheDocument();
        // getDisplayAvatarUrl may return a data URL if the avatar is not found or generated locally
        expect(avatar.getAttribute('src')).toBeTruthy();
    });

    it('수정 버튼을 클릭하면 onEdit이 호출되어야 한다', () => {
        render(<Member {...defaultProps} />);

        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const editButton = dropdownItems.find((item) => item.textContent?.includes('수정'));
        expect(editButton).toBeDefined();
        fireEvent.click(editButton!);

        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockMember);
    });

    it('삭제 버튼을 클릭하면 onDelete가 호출되어야 한다', () => {
        render(<Member {...defaultProps} />);

        const dropdownItems = screen.getAllByTestId('dropdown-item');
        const deleteButton = dropdownItems.find((item) => item.textContent?.includes('퇴사 처리'));
        expect(deleteButton).toBeDefined();
        fireEvent.click(deleteButton!);

        expect(defaultProps.onDelete).toHaveBeenCalledWith(mockMember);
    });

    it('active 상태일 때 상태 배지가 렌더링되지 않아야 한다', () => {
        render(<Member {...defaultProps} />);

        expect(screen.queryByText('활성')).not.toBeInTheDocument();
    });

    it('on_leave 상태일 때 휴직중 배지가 렌더링되어야 한다', () => {
        const memberOnLeave = { ...mockMember, status: 'on_leave' as const };
        render(<Member {...defaultProps} member={memberOnLeave} />);

        // 모바일과 데스크톱에서 모두 렌더링되므로 getAllByText 사용
        const badges = screen.getAllByText('휴직중');
        expect(badges.length).toBeGreaterThan(0);
    });

    it('resigned 상태일 때 퇴사 배지가 렌더링되어야 한다', () => {
        const resignedMember = { ...mockMember, status: 'resigned' as const };
        render(<Member {...defaultProps} member={resignedMember} />);

        const badges = screen.getAllByText('퇴사');
        expect(badges.length).toBeGreaterThan(0);
    });

    it('intern 상태일 때 인턴 배지가 렌더링되어야 한다', () => {
        const internMember = { ...mockMember, status: 'active' as const, employmentType: 'intern' as const };
        render(<Member {...defaultProps} member={internMember} />);

        // 모바일과 데스크톱에서 모두 렌더링되므로 getAllByText 사용
        const badges = screen.getAllByText('인턴');
        expect(badges.length).toBeGreaterThan(0);
    });

    it('재직 기간을 올바르게 계산하여 표시해야 한다', () => {
        render(<Member {...defaultProps} />);

        // 2023-01-01부터 2024-01-01까지는 1년 1일 (실제 계산 로직에 따라)
        expect(screen.getByText(/\(1년 1일\)/)).toBeInTheDocument();
    });

    // Native HTML5 Drag and Drop tests are removed as @dnd-kit uses pointer events and
    // internal state that is difficult to test with native drag events in a unit test.
    // E2E or Integration tests should cover actual drag and drop behavior.

    it('activeDragging 상태일 때 시각적 스타일이 적용되어야 한다', () => {
        const { container } = render(<Member {...defaultProps} forceDragging={true} />);

        const memberElement = container.querySelector('.drag-item');
        expect(memberElement).toHaveClass('dragging', 'opacity-50', 'scale-95');
    });

    it('isOverlay 상태일 때 시각적 스타일이 적용되어야 한다', () => {
        const { container } = render(<Member {...defaultProps} isOverlay={true} />);

        const memberElement = container.querySelector('.drag-item');
        expect(memberElement).toHaveClass('bg-white', 'shadow-xl', 'ring-1', 'ring-primary/20', 'scale-105', 'z-50');
    });

    it('드래그 핸들 아이콘이 렌더링되어야 한다', () => {
        render(<Member {...defaultProps} />);

        const dragHandles = screen.getAllByTestId('drag-handle');
        expect(dragHandles.length).toBeGreaterThan(0);
    });

    it('이메일이 없을 때도 오류없이 렌더링되어야 한다', () => {
        const memberWithoutEmail = { ...mockMember, email: '' };
        const { container } = render(<Member {...defaultProps} member={memberWithoutEmail} />);

        // 이름이 렌더링되는지 확인
        expect(container.textContent).toContain('김개발');
        // title 속성을 가진 어떤 요소도 없어야 함
        const emailElements = container.querySelectorAll('[title*="email"]');
        expect(emailElements.length).toBe(0);
    });

    it('입사일이 없을 때 재직 기간이 표시되지 않아야 한다', () => {
        const memberWithoutHireDate = { ...mockMember, hireDate: '' };
        const { container } = render(<Member {...defaultProps} member={memberWithoutHireDate} />);

        // 괄호로 둘러싸인 날짜 정보가 없어야 함
        const durationText = container.textContent;
        expect(durationText).not.toMatch(/\(/); // 괄호가 없어야 함
    });

    it('잘못된 입사일 형식일 때 오류없이 처리되어야 한다', () => {
        const memberWithInvalidDate = { ...mockMember, hireDate: 'invalid-date' };

        expect(() => {
            render(<Member {...defaultProps} member={memberWithInvalidDate} />);
        }).not.toThrow();
    });

    it('accessibility 요구사항을 만족해야 한다', () => {
        const { container } = render(<Member {...defaultProps} />);

        // 액션 메뉴 버튼이 있어야 함
        const menuButton = container.querySelector('[aria-label="김개발님 액션 메뉴"]');

        expect(menuButton).toBeInTheDocument();

        // 이미지가 적절한 alt 텍스트를 가져야 함
        const avatar = container.querySelector('img[alt="김개발 avatar"]');
        expect(avatar).toBeInTheDocument();
    });

    it('onDragStart와 onDragEnd가 undefined일 때도 오류없이 동작해야 한다', () => {
        // Omit the optional props instead of setting them to undefined
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { onDragStart: _, onDragEnd: __, ...propsWithoutDragHandlers } = defaultProps;

        expect(() => {
            render(<Member {...propsWithoutDragHandlers} />);
        }).not.toThrow();

        // 드래그 이벤트는 간단하게 테스트 (실제 드래그 동작은 생략)
        const memberElements = screen.getAllByText('김개발');
        const memberElement = memberElements[0].closest('.drag-item');
        expect(memberElement).toBeInTheDocument();
    });
});
