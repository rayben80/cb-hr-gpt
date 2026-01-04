import { CheckCircle, Info, Warning, WarningCircle, X } from '@phosphor-icons/react';
import React from 'react';
import { useToastTimer } from '../../hooks/useToastTimer';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string | undefined;
    duration?: number | undefined;
    showProgress?: boolean | undefined;
    onClose: (id: string) => void;
}

const TOAST_STYLES = {
    success: {
        icon: CheckCircle,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        border: 'border-emerald-200 dark:border-emerald-500/20',
        iconColor: 'text-emerald-500',
        progressColor: 'bg-emerald-500',
    },
    error: {
        icon: WarningCircle,
        bg: 'bg-destructive/5 dark:bg-destructive/10',
        border: 'border-destructive/20 dark:border-destructive/20',
        iconColor: 'text-destructive',
        progressColor: 'bg-destructive',
    },
    warning: {
        icon: Warning,
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        border: 'border-amber-200 dark:border-amber-500/20',
        iconColor: 'text-amber-500',
        progressColor: 'bg-amber-500',
    },
    info: {
        icon: Info,
        bg: 'bg-primary/5 dark:bg-primary/10',
        border: 'border-primary/20 dark:border-primary/20',
        iconColor: 'text-primary',
        progressColor: 'bg-primary',
    },
};

const Toast: React.FC<ToastProps> = React.memo(
    ({ id, type, title, message, duration = 5000, showProgress = true, onClose }) => {
        const { progress, isVisible, handleClose } = useToastTimer(duration, onClose, id);
        const style = TOAST_STYLES[type];
        const Icon = style.icon;

        return (
            <div
                className={`
                    relative mb-3 w-full max-w-sm rounded-xl border p-4
                    shadow-lg backdrop-blur-sm
                    transition-all duration-300 transform overflow-hidden
                    ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                    ${style.bg} ${style.border}
                `
                    .trim()
                    .replace(/\s+/g, ' ')}
                role="alert"
            >
                <div className="flex items-start">
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${style.iconColor}`}>
                        <Icon className="h-5 w-5" weight="regular" />
                    </div>

                    {/* Content */}
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
                    </div>

                    {/* Close Button */}
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                            onClick={handleClose}
                            aria-label="닫기"
                        >
                            <X className="h-4 w-4" weight="regular" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                {duration > 0 && showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
                        <div
                            className={`h-full transition-all duration-100 ease-linear ${style.progressColor} w-[var(--toast-progress)]`}
                            style={{ '--toast-progress': `${progress}%` } as React.CSSProperties}
                        />
                    </div>
                )}
            </div>
        );
    }
);

Toast.displayName = 'Toast';

export default Toast;
