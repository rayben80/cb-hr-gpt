import React, { memo } from 'react';
import { Headquarter, Team } from '../../constants';
import { LoadingSpinner } from '../feedback/Progress';
import { StatusCard } from '../feedback/Status';
import { OrganizationContent, OrganizationContentProps } from './OrganizationContent';

interface OrganizationMainContentProps extends OrganizationContentProps {
    isLoading: boolean;
    error: any;
    handleSeedDatabase: () => void;
    handleContainerDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleContainerDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    // Data Props
    teams: Team[];
    headquarters: Headquarter[];
}

export const OrganizationMainContent = memo((props: OrganizationMainContentProps) => {
    const {
        isLoading,
        error,
        handleSeedDatabase,
        handleContainerDragOver,
        handleContainerDrop,
        // teams, headquarters intentionally unused (passed for potential future use or legacy)
        ...contentProps
    } = props;

    return (
        <div className="space-y-8" onDragOver={handleContainerDragOver} onDrop={handleContainerDrop}>
            {isLoading && (
                <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <LoadingSpinner size="lg" color="blue" />
                        <p className="text-slate-500 mt-4">조직도 데이터를 불러오는 중...</p>
                    </div>
                </div>
            )}
            {error && (
                <StatusCard
                    status="error"
                    title="데이터 로드 실패"
                    description={error}
                    className="max-w-4xl mx-auto my-8"
                    action={
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                            >
                                새로고침
                            </button>
                            <button
                                onClick={handleSeedDatabase}
                                className="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors"
                            >
                                샘플 데이터 로드
                            </button>
                        </div>
                    }
                />
            )}

            {/* Active Content */}
            {!isLoading && !error && <OrganizationContent {...contentProps} />}
        </div>
    );
});

OrganizationMainContent.displayName = 'OrganizationMainContent';
