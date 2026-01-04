import React from 'react';
import Toast, { ToastProps } from './Toast';

export interface ToastContainerProps {
    toasts: ToastProps[];
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer = React.memo<ToastContainerProps>(({ 
    toasts, 
    position = 'top-right' 
}) => {
    const getPositionClasses = () => {
        switch (position) {
            case 'top-right':
                return 'top-4 right-4';
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-right':
                return 'bottom-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            default:
                return 'top-4 right-4';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div 
            className={`
                fixed z-50 pointer-events-none
                ${getPositionClasses()}
            `}
            aria-live="assertive"
            aria-label="알림"
        >
            <div className="flex flex-col space-y-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </div>
    );
});

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;