import { WarningCircle } from '@phosphor-icons/react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { db } from '../../firebase';
import { AccessRequest, useAccessRequests } from '../../hooks/organization/useAccessRequests';
import { useFirestoreMembers } from '../../hooks/organization/useFirestoreMembers';
import { useFirestoreTeams } from '../../hooks/organization/useFirestoreTeams';
import { normalizeMemberRole } from '../../utils/memberRoleUtils';
import { AccessRequestList } from './components/AccessRequestList';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

const resolveTeamId = (member: ReturnType<typeof useFirestoreMembers>['members'][number] | null, approverTeamId: string | null) =>
    member?.teamId ?? approverTeamId ?? null;

const resolvePartId = (member: ReturnType<typeof useFirestoreMembers>['members'][number] | null) => member?.partId ?? null;

const resolveHqId = (team: ReturnType<typeof useFirestoreTeams>['teams'][number] | null) => team?.headquarterId ?? 'hq-cloud';

const validateApproval = ({
    role,
    teamId,
    approverTeamId,
    isSuperAdmin,
}: {
    role: UserRole;
    teamId: string | null;
    approverTeamId: string | null;
    isSuperAdmin: boolean;
}) => {
    if (!approverTeamId && !isSuperAdmin) {
        return '승인 권한에 팀 정보가 없습니다. 관리자에게 문의해주세요.';
    }
    if (role === 'TEAM_LEADER' && !teamId) {
        return '팀장 권한은 팀 정보가 있는 경우에만 승인할 수 있습니다.';
    }
    return null;
};

const buildApprovalPayload = ({
    role,
    member,
    team,
    approverTeamId,
    isSuperAdmin,
    currentUser,
}: {
    role: UserRole;
    member: ReturnType<typeof useFirestoreMembers>['members'][number] | null;
    team: ReturnType<typeof useFirestoreTeams>['teams'][number] | null;
    approverTeamId: string | null;
    isSuperAdmin: boolean;
    currentUser: ReturnType<typeof useAuth>['currentUser'];
}) => {
    const teamId = resolveTeamId(member, approverTeamId);
    const partId = resolvePartId(member);
    const hqId = resolveHqId(team);
    const error = validateApproval({ role, teamId, approverTeamId, isSuperAdmin });
    if (error) return { error };

    return {
        payload: {
            status: 'approved',
            role,
            teamId,
            partId,
            hqId,
            approvedAt: serverTimestamp(),
            approvedBy: currentUser?.uid ?? null,
            approvedByEmail: currentUser?.email ?? null,
            updatedAt: serverTimestamp(),
        },
    };
};

export const AccessApprovalSettings: React.FC = () => {
    const { currentUser, accessRequest: currentAccessRequest } = useAuth();
    const { canApproveAccess, isSuperAdmin } = useRole();
    const { members } = useFirestoreMembers();
    const { teams } = useFirestoreTeams();
    const { requests, loading, error: fetchError } = useAccessRequests();

    const [actionError, setActionError] = useState<string | null>(null);
    const error = fetchError || actionError;
    const setError = setActionError;

    const [roleOverrides, setRoleOverrides] = useState<Record<string, UserRole>>({});
    const [busy, setBusy] = useState<Record<string, 'approve' | 'reject'>>({});
    const [approverTeamId, setApproverTeamId] = useState<string | null>(null);

    const resolveMatchedInfo = useCallback(
        (email: string) => {
            const normalized = email.trim().toLowerCase();
            const member = members.find((m) => m.email?.trim().toLowerCase() === normalized);
            if (!member) return { member: null, team: null, part: null };
            const team = teams.find((t) => t.id === member.teamId);
            const part = team?.parts.find((p) => p.id === member.partId);
            return { member, team: team || null, part: part || null };
        },
        [members, teams]
    );

    useEffect(() => {
        if (!canApproveAccess) return;
        if (currentAccessRequest?.teamId) {
            setApproverTeamId(currentAccessRequest.teamId);
            return;
        }
        if (!currentUser?.email) {
            setApproverTeamId(null);
            return;
        }
        const { member } = resolveMatchedInfo(currentUser.email);
        setApproverTeamId(member?.teamId ?? null);
    }, [canApproveAccess, currentAccessRequest?.teamId, currentUser?.email, resolveMatchedInfo]);

    const resolveRole = (uid: string, email: string) => {
        if (roleOverrides[uid]) return roleOverrides[uid];
        const { member } = resolveMatchedInfo(email);
        if (!member) return 'USER';
        return normalizeMemberRole(member.role) === '팀장' ? 'TEAM_LEADER' : 'USER';
    };

    const handleApprove = async (request: AccessRequest) => {
        setError(null);
        const { member, team } = resolveMatchedInfo(request.email);
        const role = resolveRole(request.uid, request.email);
        const { payload, error: payloadError } = buildApprovalPayload({
            role,
            member,
            team,
            approverTeamId,
            isSuperAdmin,
            currentUser,
        });
        if (payloadError || !payload) {
            setError(payloadError || '승인 처리 중 오류가 발생했습니다.');
            return;
        }

        setBusy((prev) => ({ ...prev, [request.uid]: 'approve' }));
        try {
            const requestRef = doc(db, 'access_requests', request.uid);
            await updateDoc(requestRef, payload);
        } catch (err) {
            console.error('Failed to approve access request:', err);
            setError('승인 처리 중 오류가 발생했습니다.');
        } finally {
            setBusy((prev) => {
                const next = { ...prev };
                delete next[request.uid];
                return next;
            });
        }
    };

    const handleReject = async (request: AccessRequest) => {
        setError(null);
        setBusy((prev) => ({ ...prev, [request.uid]: 'reject' }));
        try {
            const requestRef = doc(db, 'access_requests', request.uid);
            await updateDoc(requestRef, {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                rejectedBy: currentUser?.uid ?? null,
                rejectedByEmail: currentUser?.email ?? null,
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            console.error('Failed to reject access request:', err);
            setError('거절 처리 중 오류가 발생했습니다.');
        } finally {
            setBusy((prev) => {
                const next = { ...prev };
                delete next[request.uid];
                return next;
            });
        }
    };

    if (!canApproveAccess) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="text-sm text-slate-500">승인 관리는 팀장 또는 최고 관리자만 사용할 수 있습니다.</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">승인 요청 관리</h3>
                <p className="text-sm text-slate-500 mt-1">팀 승인 대기 사용자를 처리합니다.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                    <WarningCircle size={18} weight="fill" />
                    {error}
                </div>
            )}

            {!approverTeamId && !isSuperAdmin && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                    승인 권한에 팀 정보가 없습니다. 관리자에게 팀 정보를 등록받아야 승인할 수 있습니다.
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <AccessRequestList
                    requests={requests}
                    members={members}
                    teams={teams}
                    approverTeamId={approverTeamId}
                    busy={busy}
                    loading={loading}
                    setRoleOverrides={setRoleOverrides}
                    roleOverrides={roleOverrides}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </div>
        </div>
    );
};

