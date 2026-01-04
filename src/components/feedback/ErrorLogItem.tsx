import { CheckCircle, Icon, Info, Warning, XCircle } from '@phosphor-icons/react';
import React from 'react';
import { ErrorInfo } from '../../utils/errorUtils';

interface ErrorLogItemProps {
    error: ErrorInfo;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

const getTypeInfo = (type: string): { icon: Icon; color: string; bg: string; border: string } => {
    switch (type) {
        case 'error':
            return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
        case 'warning':
            return { icon: Warning, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
        case 'info':
            return { icon: Info, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' };
        case 'success':
            return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
        default:
            return { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
};

export const ErrorLogItem: React.FC<ErrorLogItemProps> = ({ error, isExpanded, onToggle }) => {
    const typeInfo = getTypeInfo(error.type);
    const TypeIcon = typeInfo.icon;

    return (
        <li className="p-4 hover:bg-gray-50">
            <div className="flex items-start">
                <div
                    className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full ${typeInfo.bg} ${typeInfo.border} border`}
                >
                    <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} weight="regular" />
                </div>
                <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${typeInfo.color}`}>{error.message}</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{formatTimestamp(error.timestamp)}</span>
                            {(error.stack || error.details) && (
                                <button
                                    onClick={() => onToggle(error.id)}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    {isExpanded ? '접기' : '펼치기'}
                                </button>
                            )}
                        </div>
                    </div>
                    {error.details && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{error.details}</p>
                        </div>
                    )}
                    {isExpanded && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            {error.fileName && (
                                <div className="mb-2">
                                    <p className="text-xs font-medium text-gray-500">파일 위치</p>
                                    <p className="text-sm font-mono text-gray-800">
                                        {error.fileName}:{error.lineNumber}:{error.columnNumber}
                                    </p>
                                </div>
                            )}
                            {error.stack && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">스택 트레이스</p>
                                    <pre className="text-xs font-mono text-gray-800 bg-white p-2 rounded border overflow-x-auto whitespace-pre-wrap">
                                        {error.stack}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};
