import { Warning } from '@phosphor-icons/react';
import { memo } from 'react';
import { LoadingSpinner } from '../feedback/Progress';

interface OrganizationStatusOverlaysProps {
    isOnline: boolean;
    isSaveLoading: boolean;
    isDeleteLoading: boolean;
    isSeedLoading: boolean;
}

export const OrganizationStatusOverlays = memo(
    ({ isOnline, isSaveLoading, isDeleteLoading, isSeedLoading }: OrganizationStatusOverlaysProps) => {
        return (
            <>
                {!isOnline && (
                    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
                        <Warning className="w-4 h-4 inline mr-2" weight="regular" />
                        네트워크 연결이 끊어졌습니다.
                    </div>
                )}

                {(isSaveLoading || isDeleteLoading || isSeedLoading) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <div className="flex items-center space-x-3">
                                <LoadingSpinner size="md" color="blue" />
                                <span className="text-slate-700">
                                    {isSeedLoading && '데이터베이스 초기화 중...'}
                                    {isSaveLoading && '저장 중...'}
                                    {isDeleteLoading && '삭제 중...'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

OrganizationStatusOverlays.displayName = 'OrganizationStatusOverlays';
