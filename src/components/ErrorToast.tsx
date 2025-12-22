import React from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';
import { useError } from '../contexts/ErrorContext';

const ErrorToast: React.FC = () => {
  const { errors, dismissError } = useError();

  if (errors.length === 0) return null;

  const getIconAndColors = (type: string) => {
    switch (type) {
      case 'error':
        return {
          icon: ICONS.xCircle,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          borderColor: 'border-red-600',
        };
      case 'warning':
        return {
          icon: ICONS.warning,
          bgColor: 'bg-amber-500',
          textColor: 'text-white',
          borderColor: 'border-amber-600',
        };
      case 'info':
        return {
          icon: ICONS.checkCircle,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
          borderColor: 'border-blue-600',
        };
      case 'success':
        return {
          icon: ICONS.checkCircle,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          borderColor: 'border-green-600',
        };
      default:
        return {
          icon: ICONS.checkCircle,
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          borderColor: 'border-gray-600',
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {errors.map((error) => {
        const { icon, bgColor, textColor, borderColor } = getIconAndColors(error.type);
        
        return (
          <div
            key={error.id}
            className={`${bgColor} ${textColor} ${borderColor} border-l-4 p-4 rounded-r-lg shadow-lg animate-fade-in`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon path={icon} className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{error.message}</p>
                {error.details && (
                  <p className="text-xs mt-1 opacity-90">{error.details}</p>
                )}
                <p className="text-xs mt-1 opacity-75">
                  {new Date(error.timestamp).toLocaleTimeString('ko-KR')}
                </p>
              </div>
              <button
                onClick={() => dismissError(error.id)}
                className="ml-2 flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
              >
                <Icon path={ICONS.xMark} className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ErrorToast;