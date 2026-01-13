import { ArrowClockwise, SignOut, WarningCircle } from '@phosphor-icons/react';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccessPending: React.FC = () => {
    const { currentUser, accessStatus, accessRequest, refreshAccessStatus, logout } = useAuth();
    const requestStatus = accessRequest?.status ?? 'pending';

    const isRejected = requestStatus === 'rejected';
    const isApprovedButNotApplied = requestStatus === 'approved' && accessStatus !== 'approved';
    const isBlocked = accessStatus === 'blocked';

    const title = isBlocked
        ? '접근 권한이 없습니다'
        : isRejected
        ? '승인이 거절되었습니다'
        : '승인 대기 중입니다';

    const description = isBlocked
        ? '클라우드사업본부 권한이 없어 이용할 수 없습니다. 관리자에게 문의해주세요.'
        : isRejected
        ? '요청이 거절되었습니다. 담당 팀장에게 문의해주세요.'
        : isApprovedButNotApplied
        ? '승인이 완료되었습니다. 새로고침 후 다시 시도해주세요.'
        : '팀장 승인 후 이용할 수 있습니다.';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <WarningCircle size={20} weight="fill" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                    <div className="font-semibold text-slate-700 mb-1">계정 정보</div>
                    <div>{currentUser?.displayName || '이름 없음'}</div>
                    <div className="text-xs text-slate-500 mt-1">{currentUser?.email}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={refreshAccessStatus}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <ArrowClockwise size={16} weight="bold" />
                        승인 상태 새로고침
                    </button>
                    <button
                        onClick={logout}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <SignOut size={16} weight="bold" />
                        로그아웃
                    </button>
                </div>

                {!isRejected && !isBlocked && (
                    <p className="text-xs text-slate-400">
                        승인 완료 후 재로그인이 필요할 수 있습니다.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AccessPending;
