import React, { useState } from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';
import { useError } from '../contexts/ErrorContext';

interface ErrorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorLogModal: React.FC<ErrorLogModalProps> = ({ isOpen, onClose }) => {
  const { errors, clearAllErrors } = useError();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'success'>('all');
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredErrors = filter === 'all' 
    ? errors 
    : errors.filter(error => error.type === filter);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'error':
        return { icon: ICONS.xCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning':
        return { icon: ICONS.warningAlert, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'info':
        return { icon: ICONS.info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'success':
        return { icon: ICONS.checkCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      default:
        return { icon: ICONS.info, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedErrorId(expandedErrorId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={onClose}></div>

        {/* 콘텐츠 영역 */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Icon path={ICONS.warningAlert} className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">에러 로그</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                {filteredErrors.length}개의 로그
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="error">에러</option>
                <option value="warning">경고</option>
                <option value="info">정보</option>
                <option value="success">성공</option>
              </select>
              <button
                onClick={clearAllErrors}
                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                전체 삭제
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <Icon path={ICONS.xCircle} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon path={ICONS.checkCircle} className="w-12 h-12 text-green-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">로그가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' 
                    ? '발생한 에러나 경고가 없습니다.' 
                    : `'${filter}' 유형의 로그가 없습니다.`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredErrors.map((error) => {
                  const typeInfo = getTypeInfo(error.type);
                  const isExpanded = expandedErrorId === error.id;
                  return (
                    <li key={error.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className={`flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full ${typeInfo.bg} ${typeInfo.border} border`}>
                          <Icon path={typeInfo.icon} className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 ml-3">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${typeInfo.color}`}>
                              {error.message}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(error.timestamp)}
                              </span>
                              {(error.stack || error.details) && (
                                <button
                                  onClick={() => toggleExpand(error.id)}
                                  className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                  {isExpanded ? '접기' : '펼치기'}
                                </button>
                              )}
                            </div>
                          </div>
                          {error.details && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {error.details}
                              </p>
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
                })}
              </ul>
            )}
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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