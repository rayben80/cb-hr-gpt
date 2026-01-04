import { Skeleton as UiSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, variant = 'text' }) => {
    const variantClasses = cn(
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-md',
        variant === 'text' && 'rounded', // Default
        className
    );

    return <UiSkeleton className={variantClasses} style={{ width, height }} />;
};
