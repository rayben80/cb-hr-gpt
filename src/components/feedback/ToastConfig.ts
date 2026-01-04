import { CheckCircle, Info, Warning } from '@phosphor-icons/react';

export const TOAST_STYLES = {
    success: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        icon: CheckCircle,
        progressColor: 'bg-green-500',
    },
    error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: Warning,
        progressColor: 'bg-red-500',
    },
    warning: {
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        icon: Warning,
        progressColor: 'bg-amber-500',
    },
    info: {
        bgColor: 'bg-primary/5',
        borderColor: 'border-primary/20',
        textColor: 'text-primary',
        iconColor: 'text-primary',
        icon: Info,
        progressColor: 'bg-primary',
    },
};

export const DEFAULT_TOAST_STYLE = {
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-800',
    iconColor: 'text-slate-600',
    icon: Info,
    progressColor: 'bg-slate-500',
};
