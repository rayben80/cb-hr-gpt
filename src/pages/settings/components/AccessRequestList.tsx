import React, { useCallback, useMemo } from 'react';
import { Member, Team } from '../../../constants';
import { AccessRequest } from '../../../hooks/organization/useAccessRequests';
import { normalizeMemberRole } from '../../../utils/memberRoleUtils';
import { AccessRequestItem } from './AccessRequestItem';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

interface AccessRequestListProps {
    requests: AccessRequest[];
    members: Member[];
    teams: Team[];
    approverTeamId: string | null;
    busy: Record<string, 'approve' | 'reject'>;
    loading: boolean;
    setRoleOverrides: React.Dispatch<React.SetStateAction<Record<string, UserRole>>>;
    roleOverrides: Record<string, UserRole>;
    onApprove: (request: AccessRequest) => void;
    onReject: (request: AccessRequest) => void;
}

export const AccessRequestList: React.FC<AccessRequestListProps> = ({
    requests,
    members,
    teams,
    approverTeamId,
    busy,
    loading,
    setRoleOverrides,
    roleOverrides,
    onApprove,
    onReject,
}) => {
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

    const pendingRequests = useMemo(() => {
        const filtered = requests.filter((request) => request.status === 'pending');
        if (!approverTeamId) return filtered;
        return filtered.filter((request) => {
            const { member } = resolveMatchedInfo(request.email);
            if (!member) return true;
            return member.teamId === approverTeamId;
        });
    }, [requests, approverTeamId, resolveMatchedInfo]);

    const resolveRole = (uid: string, email: string) => {
        if (roleOverrides[uid]) return roleOverrides[uid];
        const { member } = resolveMatchedInfo(email);
        if (!member) return 'USER';
        return normalizeMemberRole(member.role) === '팀장' ? 'TEAM_LEADER' : 'USER';
    };

    if (loading) {
        return <div className="text-sm text-slate-500">불러오는 중...</div>;
    }

    if (pendingRequests.length === 0) {
        return <div className="text-sm text-slate-500">승인 대기 요청이 없습니다.</div>;
    }

    return (
        <div className="space-y-4">
            {pendingRequests.map((request) => {
                const { member, team, part } = resolveMatchedInfo(request.email);
                const role = resolveRole(request.uid, request.email);
                const isBusy = Boolean(busy[request.uid]);

                return (
                    <AccessRequestItem
                        key={request.uid}
                        request={request}
                        teamName={team?.name || '미등록'}
                        partTitle={part?.title || '없음'}
                        memberName={member ? member.name : '미등록'}
                        role={role}
                        isBusy={isBusy}
                        onRoleChange={(uid, newRole) =>
                            setRoleOverrides((prev) => ({
                                ...prev,
                                [uid]: newRole,
                            }))
                        }
                        onApprove={onApprove}
                        onReject={onReject}
                    />
                );
            })}
        </div>
    );
};
