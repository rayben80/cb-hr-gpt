import React from 'react';
import { Member, Team } from '../../constants';

interface MemberFormData {
    teamId: string;
    partId: string;
    status: Member['status'];
}

interface MemberOrganizationInfoProps {
    formData: MemberFormData;
    teams: Team[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onTeamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const MemberOrganizationInfo: React.FC<MemberOrganizationInfoProps> = ({
    formData,
    teams,
    onChange,
    onTeamChange,
}) => {
    const availableParts = teams.find((t) => t.id === formData.teamId)?.parts || [];

    return (
        <>
            <div>
                <label htmlFor="teamId" className="block text-sm font-medium text-slate-700 mb-1">
                    소속 팀
                </label>
                <select
                    id="teamId"
                    name="teamId"
                    value={formData.teamId || ''}
                    onChange={onTeamChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="partId" className="block text-sm font-medium text-slate-700 mb-1">
                    소속 파트
                </label>
                <select
                    id="partId"
                    name="partId"
                    value={formData.partId || ''}
                    onChange={onChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    disabled={!formData.teamId}
                >
                    <option value="">(파트 없음 - 팀 직속)</option>
                    {availableParts.map((part) => (
                        <option key={part.id} value={part.id}>
                            {part.title}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                    상태
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status || 'active'}
                    onChange={onChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    <option value="active">재직</option>
                    <option value="intern">인턴</option>
                    <option value="on_leave">휴직</option>
                    <option value="resigned">퇴사</option>
                </select>
            </div>
        </>
    );
};
