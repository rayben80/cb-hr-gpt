// Validating UI library used: Radix + Tailwind based on package.json and previous files.
// Previous file used: CheckCircle, WarningCircle from @phosphor-icons/react
// It used <div> with tailwind classes.
// I should match that style.

import { CheckCircle } from '@phosphor-icons/react';
import { Timestamp } from 'firebase/firestore';
import React from 'react';

import { AccessRequest } from '../../../hooks/organization/useAccessRequests';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

// Removed local AccessRequest interface to use shared type

interface AccessRequestItemProps {
    request: AccessRequest;
    teamName: string;
    partTitle: string;
    memberName: string;
    role: UserRole;
    isBusy: boolean;
    onRoleChange: (uid: string, role: UserRole) => void;
    onApprove: (request: AccessRequest) => void;
    onReject: (request: AccessRequest) => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'USER', label: '일반' },
    { value: 'TEAM_LEADER', label: '팀장' },
];

const formatTimestamp = (value?: Timestamp) => {
    if (!value) return '-';
    try {
        return value.toDate().toLocaleString('ko-KR');
    } catch {
        return '-';
    }
};

export const AccessRequestItem: React.FC<AccessRequestItemProps> = ({
    request,
    teamName,
    partTitle,
    memberName,
    role,
    isBusy,
    onRoleChange,
    onApprove,
    onReject,
}) => {
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {request.displayName || '이름 없음'}
                    </div>
                    <div className="text-xs text-slate-500">{request.email}</div>
                    <div className="text-xs text-slate-400 mt-1">요청 시간: {formatTimestamp(request.createdAt)}</div>
                </div>
                <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" />
                    승인 대기
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div>
                    <div className="text-slate-400 mb-1">매칭 팀</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{teamName}</div>
                </div>
                <div>
                    <div className="text-slate-400 mb-1">매칭 파트</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{partTitle}</div>
                </div>
                <div>
                    <div className="text-slate-400 mb-1">매칭 멤버</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{memberName}</div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-xs text-slate-500 font-semibold">권한</label>
                <select
                    aria-label="권한 선택"
                    className="border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700"
                    value={role}
                    onChange={(event) => onRoleChange(request.uid, event.target.value as UserRole)}
                    disabled={isBusy}
                >
                    {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="flex flex-1 gap-2 justify-end">
                    <button
                        onClick={() => onReject(request)}
                        disabled={isBusy}
                        className="px-3 py-2 text-sm font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        거절
                    </button>
                    <button
                        onClick={() => onApprove(request)}
                        disabled={isBusy}
                        className="px-3 py-2 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        승인
                    </button>
                </div>
            </div>
        </div>
    );
};
