import { X } from '@phosphor-icons/react';
import { ButtonHTMLAttributes, memo } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'ghost' | 'muted' | 'primary';
    size?: 'sm' | 'md' | 'lg';
}

/**
 * 아이콘 전용 버튼 (닫기 버튼 등)
 * 터치 타겟 44px 보장
 *
 * @example
 * <IconButton onClick={onClose} aria-label="닫기">
 *   <X className="w-5 h-5" />
 * </IconButton>
 */
export const IconButton = memo(
    ({ children, variant = 'ghost', size = 'md', className = '', ...props }: IconButtonProps) => {
        // 터치 타겟 44px 보장
        const sizes = {
            sm: 'min-w-[36px] min-h-[36px] p-2',
            md: 'min-w-[44px] min-h-[44px] p-2.5',
            lg: 'min-w-[52px] min-h-[52px] p-3',
        };

        const variants = {
            ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent',
            muted: 'text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted/80',
            primary: 'text-primary hover:bg-primary/10 active:bg-primary/20',
        };

        return (
            <button
                type="button"
                className={`
                inline-flex items-center justify-center
                rounded-full transition-all duration-200
                hover:scale-105 active:scale-95
                focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:opacity-50 disabled:pointer-events-none
                ${sizes[size]}
                ${variants[variant]}
                ${className}
            `
                    .trim()
                    .replace(/\s+/g, ' ')}
                {...props}
            >
                {children}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';

/**
 * 모달 닫기 버튼 (X 아이콘 미리 포함)
 */
export const CloseButton = memo(
    ({ onClick, className = '', size = 'md', ...props }: Omit<IconButtonProps, 'children'>) => (
        <IconButton onClick={onClick} aria-label="닫기" size={size} className={className} {...props}>
            <X className="w-5 h-5" weight="regular" />
        </IconButton>
    )
);

CloseButton.displayName = 'CloseButton';
