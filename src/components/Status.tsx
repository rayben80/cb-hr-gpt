import React from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'idle';

export interface StatusBadgeProps {
    status: StatusType;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    pulse?: boolean;
    className?: string;
}

const StatusBadge = React.memo<StatusBadgeProps>(({
    status,
    text,
    size = 'md',
    showIcon = true,
    pulse = false,
    className = ''
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    icon: ICONS.checkCircle,
                    iconColor: 'text-green-600',
                    defaultText: '성공'
                };
            case 'error':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    icon: ICONS.warning,
                    iconColor: 'text-red-600',
                    defaultText: '오류'
                };
            case 'warning':
                return {
                    bgColor: 'bg-amber-100',
                    textColor: 'text-amber-800',
                    icon: ICONS.warning,
                    iconColor: 'text-amber-600',
                    defaultText: '주의'
                };
            case 'info':
                return {
                    bgColor: 'bg-sky-100',
                    textColor: 'text-sky-800',
                    icon: ICONS.info,
                    iconColor: 'text-sky-600',
                    defaultText: '정보'
                };
            case 'loading':
                return {
                    bgColor: 'bg-slate-100',
                    textColor: 'text-slate-800',
                    icon: ICONS.clock,
                    iconColor: 'text-slate-600',
                    defaultText: '로딩 중'
                };
            case 'idle':
                return {
                    bgColor: 'bg-slate-100',
                    textColor: 'text-slate-600',
                    icon: ICONS.clock,
                    iconColor: 'text-slate-500',
                    defaultText: '대기 중'
                };
            default:
                return {
                    bgColor: 'bg-slate-100',
                    textColor: 'text-slate-800',
                    icon: ICONS.info,
                    iconColor: 'text-slate-600',
                    defaultText: '알 수 없음'
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'px-2 py-1 text-xs',
                    icon: 'h-3 w-3'
                };
            case 'md':
                return {
                    container: 'px-2.5 py-1.5 text-sm',
                    icon: 'h-4 w-4'
                };
            case 'lg':
                return {
                    container: 'px-3 py-2 text-base',
                    icon: 'h-5 w-5'
                };
            default:
                return {
                    container: 'px-2.5 py-1.5 text-sm',
                    icon: 'h-4 w-4'
                };
        }
    };

    const config = getStatusConfig();
    const sizeClasses = getSizeClasses();

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
                <Icon
                    path={config.icon}
                    className={`${sizeClasses.icon} ${config.iconColor} ${status === 'loading' ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                />
            )}
            {text || config.defaultText}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

export interface StatusIndicatorProps {
    status: StatusType;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
}

const StatusIndicator = React.memo<StatusIndicatorProps>(({
    status,
    size = 'md',
    pulse = false,
    className = ''
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-amber-500';
            case 'info':
                return 'bg-sky-500';
            case 'loading':
                return 'bg-slate-400';
            case 'idle':
                return 'bg-slate-300';
            default:
                return 'bg-slate-400';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'h-2 w-2';
            case 'md':
                return 'h-3 w-3';
            case 'lg':
                return 'h-4 w-4';
            default:
                return 'h-3 w-3';
        }
    };

    return (
        <div
            className={`
                inline-block rounded-full
                ${getStatusColor()} ${getSizeClasses()}
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
    icon?: string;
    className?: string;
}

const StatusCard = React.memo<StatusCardProps>(({
    status,
    title,
    description,
    action,
    icon,
    className = ''
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    titleColor: 'text-green-800',
                    descColor: 'text-green-600',
                    iconColor: 'text-green-600',
                    defaultIcon: ICONS.checkCircle
                };
            case 'error':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    titleColor: 'text-red-800',
                    descColor: 'text-red-600',
                    iconColor: 'text-red-600',
                    defaultIcon: ICONS.warning
                };
            case 'warning':
                return {
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    titleColor: 'text-amber-800',
                    descColor: 'text-amber-600',
                    iconColor: 'text-amber-600',
                    defaultIcon: ICONS.warning
                };
            case 'info':
                return {
                    bgColor: 'bg-sky-50',
                    borderColor: 'border-sky-200',
                    titleColor: 'text-sky-800',
                    descColor: 'text-sky-600',
                    iconColor: 'text-sky-600',
                    defaultIcon: ICONS.info
                };
            case 'loading':
                return {
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    titleColor: 'text-slate-800',
                    descColor: 'text-slate-600',
                    iconColor: 'text-slate-600',
                    defaultIcon: ICONS.clock
                };
            case 'idle':
                return {
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    titleColor: 'text-slate-700',
                    descColor: 'text-slate-500',
                    iconColor: 'text-slate-500',
                    defaultIcon: ICONS.clock
                };
            default:
                return {
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    titleColor: 'text-slate-800',
                    descColor: 'text-slate-600',
                    iconColor: 'text-slate-600',
                    defaultIcon: ICONS.info
                };
        }
    };

    const config = getStatusConfig();

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
                    <Icon
                        path={icon || config.defaultIcon}
                        className={`h-6 w-6 ${config.iconColor} ${status === 'loading' ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${config.titleColor}`}>
                        {title}
                    </h3>
                    {description && (
                        <div className={`mt-1 text-sm ${config.descColor}`}>
                            {description}
                        </div>
                    )}
                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

StatusCard.displayName = 'StatusCard';

export { StatusBadge, StatusIndicator, StatusCard };