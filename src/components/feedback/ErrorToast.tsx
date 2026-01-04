import { useError } from '@/contexts/ErrorContext';
import { CheckCircle, Icon, Warning, X, XCircle } from '@phosphor-icons/react';
import React from 'react';

const ErrorToast: React.FC = () => {
    const { errors, dismissError } = useError();

    if (errors.length === 0) return null;

    const getIconAndColors = (
        type: string
    ): { icon: Icon; bgColor: string; textColor: string; borderColor: string } => {
        switch (type) {
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-500',
                    textColor: 'text-white',
                    borderColor: 'border-red-600',
                };
            case 'warning':
                return {
                    icon: Warning,
                    bgColor: 'bg-amber-500',
                    textColor: 'text-white',
                    borderColor: 'border-amber-600',
                };
            case 'info':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-primary',
                    textColor: 'text-white',
                    borderColor: 'border-primary',
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-500',
                    textColor: 'text-white',
                    borderColor: 'border-green-600',
                };
            default:
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-gray-500',
                    textColor: 'text-white',
                    borderColor: 'border-gray-600',
                };
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {errors.map((error) => {
                const { icon: IconComponent, bgColor, textColor, borderColor } = getIconAndColors(error.type);

                return (
                    <div
                        key={error.id}
                        className={`${bgColor} ${textColor} ${borderColor} border-l-4 p-4 rounded-r-lg shadow-lg animate-fade-in`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <IconComponent className="w-5 h-5" weight="regular" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium">{error.message}</p>
                                {error.details && <p className="text-xs mt-1 opacity-90">{error.details}</p>}
                                <p className="text-xs mt-1 opacity-75">
                                    {new Date(error.timestamp).toLocaleTimeString('ko-KR')}
                                </p>
                            </div>
                            <button
                                onClick={() => dismissError(error.id)}
                                className="ml-2 flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
                                aria-label="알림 닫기"
                            >
                                <X className="w-4 h-4" weight="regular" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ErrorToast;
