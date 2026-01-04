import { Plus } from '@phosphor-icons/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CloseButton, IconButton } from '../../components/common/IconButton';

describe('IconButton', () => {
    it('children을 올바르게 렌더링해야 한다', () => {
        render(
            <IconButton aria-label="추가">
                <Plus data-testid="plus-icon" />
            </IconButton>
        );
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('클릭 이벤트가 올바르게 동작해야 한다', () => {
        const handleClick = vi.fn();
        render(
            <IconButton onClick={handleClick} aria-label="추가">
                <Plus />
            </IconButton>
        );
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ghost variant가 올바르게 적용되어야 한다', () => {
        render(
            <IconButton variant="ghost" aria-label="추가">
                <Plus />
            </IconButton>
        );
        expect(screen.getByRole('button')).toHaveClass('text-muted-foreground');
    });

    it('muted variant가 올바르게 적용되어야 한다', () => {
        render(
            <IconButton variant="muted" aria-label="추가">
                <Plus />
            </IconButton>
        );
        expect(screen.getByRole('button')).toHaveClass('text-muted-foreground');
    });

    it('size가 올바르게 적용되어야 한다', () => {
        render(
            <IconButton size="sm" aria-label="추가">
                <Plus />
            </IconButton>
        );
        expect(screen.getByRole('button')).toHaveClass('p-2');
    });
});

describe('CloseButton', () => {
    it('X 아이콘이 렌더링되어야 한다', () => {
        render(<CloseButton onClick={vi.fn()} />);
        const button = screen.getByRole('button', { name: /닫기/i });
        expect(button).toBeInTheDocument();
    });

    it('클릭 시 onClick이 호출되어야 한다', () => {
        const handleClick = vi.fn();
        render(<CloseButton onClick={handleClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
