import React from 'react';
import {
    BADGE_CONFIG,
    BADGE_DEFAULT_CONFIG,
    BADGE_SIZE_CLASSES,
    CARD_CONFIG,
    CARD_DEFAULT_CONFIG,
    INDICATOR_COLORS,
    INDICATOR_DEFAULT_COLOR,
    INDICATOR_SIZE_CLASSES,
    StatusType,
} from './StatusConfig';

export { type StatusType };

export interface StatusBadgeProps {
    status: StatusType;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    pulse?: boolean;
    className?: string;
}

const StatusBadge = React.memo<StatusBadgeProps>(
    ({ status, text, size = 'md', showIcon = true, pulse = false, className = '' }) => {
        const config = BADGE_CONFIG[status] || BADGE_DEFAULT_CONFIG;
        const sizeClasses = BADGE_SIZE_CLASSES[size] || BADGE_SIZE_CLASSES.md;
        const IconComponent = config.icon;

        return (
            <span
                className={`
                inline-flex items-center gap-1.5 font-medium rounded-full
                ${config.bgColor} ${config.textColor} ${sizeClasses.container}
                ${pulse ? 'animate-pulse' : ''}
                ${className}
            `}
                role="status"
                aria-label={text || config.defaultText}
            >
                {showIcon && (
                    <IconComponent
                        className={`${sizeClasses.icon} ${config.iconColor} ${status === 'loading' ? 'animate-spin' : ''}`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                )}
                {text || config.defaultText}
            </span>
        );
    }
);

StatusBadge.displayName = 'StatusBadge';

export interface StatusIndicatorProps {
    status: StatusType;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
}

const StatusIndicator = React.memo<StatusIndicatorProps>(({ status, size = 'md', pulse = false, className = '' }) => {
    const statusColor = INDICATOR_COLORS[status] || INDICATOR_DEFAULT_COLOR;
    const sizeClass = INDICATOR_SIZE_CLASSES[size] || INDICATOR_SIZE_CLASSES.md;

    return (
        <div
            className={`
                inline-block rounded-full
                ${statusColor} ${sizeClass}
                ${pulse ? 'animate-pulse' : ''}
                ${className}
            `}
            role="status"
            aria-label={`상태: ${status}`}
        />
    );
});

StatusIndicator.displayName = 'StatusIndicator';

export interface StatusCardProps {
    status: StatusType;
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ElementType;
    className?: string;
}

const StatusCard = React.memo<StatusCardProps>(({ status, title, description, action, icon, className = '' }) => {
    const config = CARD_CONFIG[status] || CARD_DEFAULT_CONFIG;
    const IconComponent = icon || config.defaultIcon;

    return (
        <div
            className={`
                rounded-lg border p-4
                ${config.bgColor} ${config.borderColor}
                ${className}
            `}
            role="status"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <IconComponent
                        className={`h-6 w-6 ${config.iconColor} ${status === 'loading' ? 'animate-spin' : ''}`}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${config.titleColor}`}>{title}</h3>
                    {description && <div className={`mt-1 text-sm ${config.descColor}`}>{description}</div>}
                    {action && <div className="mt-3">{action}</div>}
                </div>
            </div>
        </div>
    );
});

StatusCard.displayName = 'StatusCard';

export { StatusBadge, StatusCard, StatusIndicator };
