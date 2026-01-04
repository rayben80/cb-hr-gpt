import { Card as UiCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'default' | 'solid' | 'gradient-border';
    hoverEffect?: boolean;
    as?: React.ElementType;
    type?: 'button' | 'submit' | 'reset';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'default',
    hoverEffect = false,
    as: Component = 'div', // Note: We only support div in standard shadcn Card usually, but will try to accommodate
    type,
    ...props
}) => {
    // We treat all variants as standard cards now for consistency, possibly adding subtle classes.
    // 'gradient-border' is deprecated visually but we keep the API valid.

    const finalClassName = cn(
        hoverEffect && 'hover:shadow-md transition-all cursor-pointer',
        variant === 'gradient-border' && 'border-primary/20', // Simple translation
        className
    );

    // If 'as' is provided and not 'div', we might need to render that component deeply,
    // but shadcn Card is just a div. If it's a button, we render a button with card classes.
    if (Component === 'button') {
        return (
            <button
                className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', finalClassName)}
                type={type}
                {...(props as any)}
            >
                {children}
            </button>
        );
    }

    return (
        <UiCard className={finalClassName} {...props}>
            {children}
        </UiCard>
    );
};
