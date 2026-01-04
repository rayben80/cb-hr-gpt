import { Member, Team } from '../../constants';
import { findMemberLocation } from './memberStateUtils';
import { DEFAULT_MEMBER_ROLE, normalizeMemberRole } from '../../utils/memberRoleUtils';

export interface MemberFormData {
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

export const initialFormState: MemberFormData = {
    id: '',
    name: '',
    role: DEFAULT_MEMBER_ROLE,
    avatar: '',
    hireDate: '',
    email: '',
    status: 'active',
    teamId: '',
    partId: '',
};

export const getDisplayEmail = (email: string): string => {
    return email.endsWith('@forcs.com') ? email.replace('@forcs.com', '') : email;
};

const getMemberFormDataFromExisting = (
    teams: Team[],
    memberData: Member
): { formData: MemberFormData; assignTeamLead: boolean; displayEmail: string } => {
    const location = findMemberLocation(teams, memberData.id);
    const teamLead = teams.find((team) => team.id === location.teamId)?.lead || '';
    const email = memberData.email || '';

    const safeTeamId = location.teamId || (memberData as any).teamId || '';
    const safePartId = location.partId || (memberData as any).partId || '';

    const formData: MemberFormData = {
        id: memberData.id,
        name: memberData.name || '',
        role: normalizeMemberRole(memberData.role),
        avatar: memberData.avatar || '',
        hireDate: memberData.hireDate || '',
        email: email,
        status: memberData.status || 'active',
        teamId: safeTeamId,
        partId: safePartId,
    };

    return {
        formData,
        assignTeamLead: teamLead === memberData.name,
        displayEmail: getDisplayEmail(email),
    };
};

const getMemberFormDataFromContext = (
    teams: Team[],
    context: { teamId: string; partId: string }
): { formData: MemberFormData; assignTeamLead: boolean; displayEmail: string } => {
    const teamLead = teams.find((team) => team.id === context.teamId)?.lead || '';
    const formData: MemberFormData = {
        ...initialFormState,
        teamId: context.teamId,
        partId: context.partId,
    };

    return {
        formData,
        assignTeamLead: !teamLead,
        displayEmail: '',
    };
};

export const getInitialMemberFormData = (
    teams: Team[],
    memberData: Member | null,
    context: { teamId: string; partId: string } | null
): { formData: MemberFormData; assignTeamLead: boolean; displayEmail: string } => {
    if (memberData) {
        return getMemberFormDataFromExisting(teams, memberData);
    } else if (context) {
        return getMemberFormDataFromContext(teams, context);
    }

    return {
        formData: initialFormState,
        assignTeamLead: false,
        displayEmail: '',
    };
};
