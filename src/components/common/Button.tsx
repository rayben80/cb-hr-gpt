import React from 'react';
import { Icon } from '../common';
import { ICONS } from '../../constants';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    children: React.ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
    primary: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 focus:ring-slate-500 text-slate-900 border border-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-sm',
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 focus:ring-slate-500 text-slate-700 border border-transparent hover:border-slate-300'
};

const buttonSizes: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    className = '',
    children,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];
    const widthClass = fullWidth ? 'w-full' : '';

    const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    const renderIcon = (position: 'left' | 'right') => {
        if (loading && position === 'left') {
            return (
                <svg className={`animate-spin -ml-1 mr-2 ${iconSize}`} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        }
        
        if (icon && iconPosition === position) {
            const marginClass = position === 'left' ? 'mr-2' : 'ml-2';
            return <Icon path={icon} className={`${iconSize} ${marginClass}`} />;
        }
        
        return null;
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {renderIcon('left')}
            {children}
            {renderIcon('right')}
        </button>
    );
};

// 모달 액션 버튼들을 위한 컴포넌트
interface ModalActionsProps {
    onCancel?: () => void;
    onConfirm?: () => void;
    cancelText?: string;
    confirmText?: string;
    confirmVariant?: ButtonVariant;
    loading?: boolean;
    cancelDisabled?: boolean;
    confirmDisabled?: boolean;
    showCancel?: boolean;
    className?: string;
}

export const ModalActions: React.FC<ModalActionsProps> = ({
    onCancel,
    onConfirm,
    cancelText = '취소',
    confirmText = '확인',
    confirmVariant = 'primary',
    loading = false,
    cancelDisabled = false,
    confirmDisabled = false,
    showCancel = true,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-end space-x-3 ${className}`}>
            {showCancel && onCancel && (
                <Button
                    variant="secondary"
                    onClick={onCancel}
                    disabled={cancelDisabled}
                    type="button"
                    data-focus-first={confirmVariant === 'danger'} // 위험한 액션일 때 취소 버튼에 첫 포커스
                >
                    {cancelText}
                </Button>
            )}
            {onConfirm && (
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    loading={loading}
                    disabled={confirmDisabled}
                    type="submit"
                    data-focus-first={confirmVariant !== 'danger'} // 일반 액션일 때 확인 버튼에 첫 포커스
                >
                    {confirmText}
                </Button>
            )}
        </div>
    );
};