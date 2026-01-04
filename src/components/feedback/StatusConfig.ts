import { CheckCircle, Clock, Info, Spinner, Warning } from '@phosphor-icons/react';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'idle';

export const BADGE_CONFIG = {
    success: {
        bgColor: 'bg-emerald-500/15 dark:bg-emerald-500/20',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        icon: CheckCircle,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        defaultText: '성공',
    },
    error: {
        bgColor: 'bg-rose-500/15 dark:bg-rose-500/20',
        textColor: 'text-rose-700 dark:text-rose-300',
        icon: Warning,
        iconColor: 'text-rose-600 dark:text-rose-400',
        defaultText: '오류',
    },
    warning: {
        bgColor: 'bg-amber-500/15 dark:bg-amber-500/20',
        textColor: 'text-amber-700 dark:text-amber-300',
        icon: Warning,
        iconColor: 'text-amber-600 dark:text-amber-400',
        defaultText: '주의',
    },
    info: {
        bgColor: 'bg-violet-500/15 dark:bg-violet-500/20',
        textColor: 'text-violet-700 dark:text-violet-300',
        icon: Info,
        iconColor: 'text-violet-600 dark:text-violet-400',
        defaultText: '정보',
    },
    loading: {
        bgColor: 'bg-slate-200/50 dark:bg-slate-700/50',
        textColor: 'text-slate-700 dark:text-slate-300',
        icon: Spinner,
        iconColor: 'text-slate-500 dark:text-slate-400',
        defaultText: '로딩 중',
    },
    idle: {
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-600 dark:text-slate-400',
        icon: Clock,
        iconColor: 'text-slate-500 dark:text-slate-400',
        defaultText: '대기 중',
    },
};

export const BADGE_DEFAULT_CONFIG = {
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    icon: Info,
    iconColor: 'text-slate-500 dark:text-slate-400',
    defaultText: '알 수 없음',
};

export const BADGE_SIZE_CLASSES = {
    sm: { container: 'px-2 py-1 text-xs', icon: 'h-3 w-3' },
    md: { container: 'px-2.5 py-1.5 text-sm', icon: 'h-4 w-4' },
    lg: { container: 'px-3 py-2 text-base', icon: 'h-5 w-5' },
};

export const INDICATOR_COLORS = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-primary',
    loading: 'bg-slate-400',
    idle: 'bg-slate-300',
};

export const INDICATOR_DEFAULT_COLOR = 'bg-slate-400';

export const INDICATOR_SIZE_CLASSES = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
};

export const CARD_CONFIG = {
    success: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        titleColor: 'text-green-800',
        descColor: 'text-green-600',
        iconColor: 'text-green-600',
        defaultIcon: CheckCircle,
    },
    error: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        titleColor: 'text-red-800',
        descColor: 'text-red-600',
        iconColor: 'text-red-600',
        defaultIcon: Warning,
    },
    warning: {
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        titleColor: 'text-amber-800',
        descColor: 'text-amber-600',
        iconColor: 'text-amber-600',
        defaultIcon: Warning,
    },
    info: {
        bgColor: 'bg-primary/5',
        borderColor: 'border-primary/20',
        titleColor: 'text-primary',
        descColor: 'text-primary/80',
        iconColor: 'text-primary',
        defaultIcon: Info,
    },
    loading: {
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        titleColor: 'text-slate-800',
        descColor: 'text-slate-600',
        iconColor: 'text-slate-600',
        defaultIcon: Spinner,
    },
    idle: {
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        titleColor: 'text-slate-700',
        descColor: 'text-slate-500',
        iconColor: 'text-slate-500',
        defaultIcon: Clock,
    },
};

export const CARD_DEFAULT_CONFIG = {
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    titleColor: 'text-slate-800',
    descColor: 'text-slate-600',
    iconColor: 'text-slate-600',
    defaultIcon: Info,
};
