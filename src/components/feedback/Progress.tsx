import React from 'react';

export interface ProgressBarProps {
    progress: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'primary' | 'gradient';
    showPercentage?: boolean;
    label?: string;
    animated?: boolean;
    striped?: boolean;
}

const ProgressBar = React.memo<ProgressBarProps>(
    ({ progress, size = 'md', color = 'blue', showPercentage = false, label, animated = false, striped = false }) => {
        const clampedProgress = Math.min(100, Math.max(0, progress));

        const getSizeClasses = () => {
            switch (size) {
                case 'sm':
                    return 'h-2';
                case 'md':
                    return 'h-3';
                case 'lg':
                    return 'h-4';
                default:
                    return 'h-3';
            }
        };

        const getColorClasses = () => {
            switch (color) {
                case 'blue':
                    return 'bg-primary';
                case 'green':
                    return 'bg-emerald-500';
                case 'red':
                    return 'bg-destructive';
                case 'yellow':
                    return 'bg-amber-500';
                case 'purple':
                    return 'bg-purple-500';
                case 'gray':
                    return 'bg-muted-foreground';
                case 'primary':
                    return 'bg-primary';
                case 'gradient':
                    return 'bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]';
                default:
                    return 'bg-primary';
            }
        };

        return (
            <div className="w-full">
                {(label || showPercentage) && (
                    <div className="flex justify-between items-center mb-2">
                        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
                        {showPercentage && (
                            <span className="text-sm text-slate-500">{Math.round(clampedProgress)}%</span>
                        )}
                    </div>
                )}

                <div
                    className={`
                w-full bg-slate-200 rounded-full overflow-hidden ${getSizeClasses()}
            `}
                >
                    <div
                        className={`
                        h-full transition-all duration-300 ease-out
                        ${getColorClasses()}
                        ${striped ? 'bg-stripe' : ''}
                        ${animated ? 'animate-pulse' : ''}
                        w-[var(--progress-width)]
                    `}
                        style={{ '--progress-width': `${clampedProgress}%` } as React.CSSProperties}
                        role="progressbar"
                        aria-valuenow={Math.round(clampedProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={label || `진행률 ${Math.round(clampedProgress)}%`}
                    />
                </div>
            </div>
        );
    }
);

ProgressBar.displayName = 'ProgressBar';

export interface CircularProgressProps {
    progress: number; // 0-100
    size?: number; // 픽셀 단위
    strokeWidth?: number;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
    showPercentage?: boolean;
    children?: React.ReactNode;
}

const CircularProgress = React.memo<CircularProgressProps>(
    ({ progress, size = 80, strokeWidth = 8, color = 'blue', showPercentage = true, children }) => {
        const clampedProgress = Math.min(100, Math.max(0, progress));
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

        const getColorClasses = () => {
            switch (color) {
                case 'blue':
                    return 'text-primary';
                case 'green':
                    return 'text-green-500';
                case 'red':
                    return 'text-red-500';
                case 'yellow':
                    return 'text-amber-500';
                case 'purple':
                    return 'text-purple-500';
                case 'gray':
                    return 'text-slate-500';
                default:
                    return 'text-primary';
            }
        };

        return (
            <div className="relative inline-flex items-center justify-center">
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                    role="progressbar"
                    aria-valuenow={Math.round(clampedProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    {/* 배경 원 */}
                    <circle fill="none" className="text-slate-200" />

                    {/* 진행률 원 */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${getColorClasses()} transition-all duration-300 ease-out`}
                    />
                </svg>

                {/* 중앙 내용 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {children ? (
                        children
                    ) : showPercentage ? (
                        <span className={`text-sm font-semibold ${getColorClasses()}`}>
                            {Math.round(clampedProgress)}%
                        </span>
                    ) : null}
                </div>
            </div>
        );
    }
);

CircularProgress.displayName = 'CircularProgress';

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'white';
    className?: string;
}

const LoadingSpinner = React.memo<LoadingSpinnerProps>(({ size = 'md', color = 'blue', className = '' }) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'h-4 w-4';
            case 'md':
                return 'h-6 w-6';
            case 'lg':
                return 'h-8 w-8';
            case 'xl':
                return 'h-12 w-12';
            default:
                return 'h-6 w-6';
        }
    };

    const getColorClasses = () => {
        switch (color) {
            case 'blue':
                return 'border-primary';
            case 'green':
                return 'border-green-500';
            case 'red':
                return 'border-red-500';
            case 'yellow':
                return 'border-amber-500';
            case 'purple':
                return 'border-purple-500';
            case 'gray':
                return 'border-slate-500';
            case 'white':
                return 'border-white';
            default:
                return 'border-primary';
        }
    };

    return (
        <div
            className={`
                animate-spin rounded-full border-2 border-transparent
                ${getSizeClasses()} ${getColorClasses()} border-t-transparent
                ${className}
            `}
            role="status"
            aria-label="로딩 중"
        >
            <span className="sr-only">로딩 중...</span>
        </div>
    );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export { CircularProgress, LoadingSpinner, ProgressBar };
