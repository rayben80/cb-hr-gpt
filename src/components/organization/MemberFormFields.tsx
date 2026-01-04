import React from 'react';
import { Member, Team } from '../../constants';
import { Checkbox } from '../common';
import { MemberOrganizationInfo } from './MemberOrganizationInfo';
import { MemberPersonalInfo } from './MemberPersonalInfo';

interface MemberFormData {
    id: string;
    name: string;
    role: string;
    avatar: string;
    hireDate: string;
    email: string;
    status: Member['status'];
    teamId: string;
    partId: string;
}

interface MemberFormFieldsProps {
    formData: MemberFormData;
    displayEmail: string;
    teams: Team[];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTeamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onDateChange: (date: Date | null) => void;
    assignTeamLead: boolean;
    onAssignTeamLeadChange: (checked: boolean) => void;
    keepAdding: boolean;
    onKeepAddingChange: (checked: boolean) => void;
    isEditing: boolean;
}

export const MemberFormFields: React.FC<MemberFormFieldsProps> = ({
    formData,
    displayEmail,
    teams,
    onChange,
    onEmailChange,
    onTeamChange,
    onDateChange,
    assignTeamLead,
    onAssignTeamLeadChange,
    keepAdding,
    onKeepAddingChange,
    isEditing,
}) => {
    return (
        <div className="p-8 space-y-6">
            <MemberPersonalInfo
                formData={formData}
                displayEmail={displayEmail}
                onChange={onChange}
                onEmailChange={onEmailChange}
                onDateChange={onDateChange}
            />

            <MemberOrganizationInfo
                formData={formData}
                teams={teams}
                onChange={onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
                onTeamChange={onTeamChange}
            />

            <div className="pt-2 space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                        checked={assignTeamLead}
                        indeterminate={false}
                        onChange={(e) => onAssignTeamLeadChange(e.target.checked)}
                        disabled={formData.status === 'resigned'}
                    />
                    이 멤버를 팀장으로 지정
                </label>
                {!isEditing && (
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <Checkbox
                            checked={keepAdding}
                            indeterminate={false}
                            onChange={(e) => onKeepAddingChange(e.target.checked)}
                        />
                        저장 후 계속 추가
                    </label>
                )}
            </div>
        </div>
    );
};
