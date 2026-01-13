import { AvatarFallback, AvatarImage, Avatar as UiAvatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAvatarInitials } from '@/utils/avatarUtils';
import React, { useState } from 'react';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, className = '', ...props }) => {
    const [hasError, setHasError] = useState(false);
    const showImage = src && !hasError;
    const fallbackText = getAvatarInitials(fallback ?? '');

    return (
        <UiAvatar className={cn('h-6 w-6', className)}>
            {showImage && <AvatarImage src={src} alt={alt} onError={() => setHasError(true)} {...props} />}
            {!showImage && <AvatarFallback>{fallbackText}</AvatarFallback>}
        </UiAvatar>
    );
};

interface AvatarGroupProps {
    children: React.ReactNode;
    limit?: number;
    className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ children, limit = 5, className = '' }) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, limit);
    const remainingCount = childrenArray.length - limit;

    return (
        <div className={cn('flex items-center -space-x-2 overflow-hidden py-1', className)}>
            {visibleChildren}
            {remainingCount > 0 && (
                <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-background bg-muted text-[10px] font-medium text-muted-foreground z-10 relative">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};
