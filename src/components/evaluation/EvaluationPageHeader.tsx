import { Plus } from '@phosphor-icons/react';
import { memo } from 'react';
import { Button } from '../common';

interface EvaluationPageHeaderProps {
    isAdminMode: boolean;
    isAdmin: boolean;
    viewMode: 'user' | 'admin';
    setViewMode: (mode: 'user' | 'admin') => void;
    onCreateNew: () => void;
}

export const EvaluationPageHeader = memo(
    ({ isAdminMode, isAdmin, viewMode, setViewMode, onCreateNew }: EvaluationPageHeaderProps) => (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {isAdminMode ? '평가 관리 (HR)' : '나의 평가'}
                    </h1>
                    <div className="bg-slate-200 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('user')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'user' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            사용자
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setViewMode('admin')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'admin' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                관리자
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-lg text-slate-600 mt-1">
                    {isAdminMode
                        ? '본부 전체 평가 일정을 계획하고 현황을 모니터링합니다.'
                        : '할당된 평가를 수행하고 나의 결과를 확인합니다.'}
                </p>
            </div>
            {isAdminMode && (
                <Button variant="primary" size="lg" onClick={onCreateNew} className="gap-2 whitespace-nowrap">
                    <Plus className="w-5 h-5" weight="bold" />새 평가 캠페인 생성
                </Button>
            )}
        </div>
    )
);

EvaluationPageHeader.displayName = 'EvaluationPageHeader';
