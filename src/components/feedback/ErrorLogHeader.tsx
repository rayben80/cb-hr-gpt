import { Warning, X } from '@phosphor-icons/react';
import React from 'react';

interface ErrorLogHeaderProps {
    count: number;
    filter: 'all' | 'error' | 'warning' | 'info' | 'success';
    onFilterChange: (filter: 'all' | 'error' | 'warning' | 'info' | 'success') => void;
    onClearAll: () => void;
    onClose: () => void;
}

export const ErrorLogHeader: React.FC<ErrorLogHeaderProps> = ({
    count,
    filter,
    onFilterChange,
    onClearAll,
    onClose,
}) => {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <Warning className="w-6 h-6 text-red-500" weight="regular" />
                <h3 className="text-lg font-bold text-gray-900">에러 로그</h3>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">{count}개의 로그</span>
            </div>
            <div className="flex items-center space-x-2">
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value as any)}
                    aria-label="로그 필터"
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">전체</option>
                    <option value="error">에러</option>
                    <option value="warning">경고</option>
                    <option value="info">정보</option>
                    <option value="success">성공</option>
                </select>
                <button
                    onClick={onClearAll}
                    className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    전체 삭제
                </button>
                <button
                    type="button"
                    className="p-2 text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    <X className="w-5 h-5" weight="regular" />
                </button>
            </div>
        </div>
    );
};
