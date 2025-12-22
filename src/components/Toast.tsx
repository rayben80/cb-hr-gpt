import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
    showProgress?: boolean;
}

const Toast = React.memo<ToastProps>(({ 
    id, 
    type, 
    title, 
    message, 
    duration = 5000, 
    onClose, 
    showProgress = true 
}) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    // 토스트 스타일 설정
    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                    icon: ICONS.checkCircle,
                    progressColor: 'bg-green-500'
                };
            case 'error':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-600',
                    icon: ICONS.warning,
                    progressColor: 'bg-red-500'
                };
            case 'warning':
                return {
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    textColor: 'text-amber-800',
                    iconColor: 'text-amber-600',
                    icon: ICONS.warning,
                    progressColor: 'bg-amber-500'
                };
            case 'info':
                return {
                    bgColor: 'bg-sky-50',
                    borderColor: 'border-sky-200',
                    textColor: 'text-sky-800',
                    iconColor: 'text-sky-600',
                    icon: ICONS.info,
                    progressColor: 'bg-sky-500'
                };
            default:
                return {
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    textColor: 'text-slate-800',
                    iconColor: 'text-slate-600',
                    icon: ICONS.info,
                    progressColor: 'bg-slate-500'
                };
        }
    };

    const style = getToastStyle();

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // 애니메이션 완료 후 제거
    }, [id, onClose]);

    // 애니메이션과 자동 닫기 타이머
    useEffect(() => {
        // 진입 애니메이션
        const showTimer = setTimeout(() => setIsVisible(true), 10);
        
        // duration이 0이면 자동으로 닫지 않음
        if (duration <= 0) {
            clearTimeout(showTimer);
            return;
        }

        // 프로그레스 바 애니메이션
        const progressTimer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 100));
                if (newProgress <= 0) {
                    clearInterval(progressTimer);
                    return 0;
                }
                return newProgress;
            });
        }, 100);

        // 자동 닫기 타이머
        const closeTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(closeTimer);
            clearInterval(progressTimer);
        };
    }, [duration, handleClose]);

    return (
        <div
            className={`
                relative max-w-sm w-full ${style.bgColor} ${style.borderColor}
                border rounded-lg shadow-lg p-4 pointer-events-auto
                transform transition-all duration-300 ease-in-out
                ${isVisible 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-full opacity-0'
                }
            `}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon 
                        path={style.icon} 
                        className={`h-5 w-5 ${style.iconColor}`} 
                        aria-hidden="true"
                    />
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${style.textColor}`}>
                        {title}
                    </p>
                    {message && (
                        <p className={`mt-1 text-sm ${style.textColor} opacity-75`}>
                            {message}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        className={`
                            inline-flex ${style.textColor} hover:opacity-75 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-offset-transparent focus:ring-current
                            rounded-md p-1
                        `}
                        onClick={handleClose}
                        aria-label="알림 닫기"
                    >
                        <Icon path={ICONS.xMark} className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            {/* 프로그레스 바 */}
            {showProgress && duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
                    <div 
                        className={`h-full ${style.progressColor} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
});

Toast.displayName = 'Toast';

export default Toast;