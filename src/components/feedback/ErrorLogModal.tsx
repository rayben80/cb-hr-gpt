import { useError } from '@/contexts/ErrorContext';
import { CheckCircle } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { ErrorLogHeader } from './ErrorLogHeader';
import { ErrorLogItem } from './ErrorLogItem';

interface ErrorLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ErrorLogModal: React.FC<ErrorLogModalProps> = ({ isOpen, onClose }) => {
    const { errors, clearAllErrors } = useError();
    const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'success'>('all');
    const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredErrors = filter === 'all' ? errors : errors.filter((error) => error.type === filter);

    const toggleExpand = (id: string) => {
        setExpandedErrorId(expandedErrorId === id ? null : id);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <ErrorLogHeader
                        count={filteredErrors.length}
                        filter={filter}
                        onFilterChange={setFilter}
                        onClearAll={clearAllErrors}
                        onClose={onClose}
                    />

                    <div className="max-h-[60vh] overflow-y-auto">
                        {filteredErrors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500" weight="regular" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">로그가 없습니다</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {filter === 'all'
                                        ? '발생한 에러나 경고가 없습니다.'
                                        : `'${filter}' 유형의 로그가 없습니다.`}
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {filteredErrors.map((error) => (
                                    <ErrorLogItem
                                        key={error.id}
                                        error={error}
                                        isExpanded={expandedErrorId === error.id}
                                        onToggle={toggleExpand}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                onClick={onClose}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
