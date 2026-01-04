import { Badge as UiBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    // Map legacy variants to shadcn variants
    const mapVariant = (v: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'soft' => {
        switch (v) {
            case 'primary':
                return 'default';
            case 'secondary':
                return 'secondary';
            case 'destructive':
                return 'destructive';
            case 'outline':
                return 'outline';
            case 'info':
                return 'soft';
            default:
                return 'outline'; // Fallback for success/warning to outline for now
        }
    };

    // Additional classes for variants not natively supported by basic shadcn themes
    const extraClasses = cn(
        variant === 'success' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        variant === 'warning' && 'bg-amber-50 text-amber-700 border-amber-200',
        size === 'sm' && 'text-[10px] px-2 py-0.5',
        className
    );

    return (
        <UiBadge variant={mapVariant(variant)} className={extraClasses} {...props}>
            {children}
        </UiBadge>
    );
};
