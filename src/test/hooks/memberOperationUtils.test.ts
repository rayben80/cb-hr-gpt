/**
 * memberOperationUtils 테스트
 * 팀장 지정/해임 시 역할 백업/복원 로직 검증
 */

import { describe, expect, it } from 'vitest';
import { Member, Team } from '../../constants';
import { calculateUpdatedTeamsForSave } from '../../hooks/organization/memberOperationUtils';

const createMember = (overrides: Partial<Member> = {}): Member => ({
    id: 'member1',
    name: '홍길동',
    role: '파트장',
    status: 'active',
    email: 'hong@example.com',
    hireDate: '2024-01-01',
    avatar: '/avatar1.jpg',
    ...overrides,
});

const createTeam = (members: Member[], overrides: Partial<Team> = {}): Team => ({
    id: 'team1',
    name: '개발팀',
    lead: '',
    members,
    parts: [],
    ...overrides,
});

describe('calculateUpdatedTeamsForSave', () => {
    it('팀장 지정 시 이전 직책을 저장해야 한다', () => {
        const member = createMember();
        const teams = [createTeam([member])];

        const updatedTeams = calculateUpdatedTeamsForSave({
            teams,
            memberData: member,
            teamId: 'team1',
            partId: '',
            isEditing: true,
            originalRecord: { teamId: 'team1', partId: null, member },
            options: { setTeamLead: true },
        });

        const updatedMember = updatedTeams[0].members?.find((m) => m.id === member.id);
        expect(updatedMember?.role).toBe('팀장');
        expect(updatedMember?.roleBeforeLead).toBe('파트장');
        expect(updatedTeams[0].lead).toBe(member.name);
    });

    it('팀장 해임 시 이전 직책으로 복원해야 한다', () => {
        const leadMember = createMember({ role: '팀장', roleBeforeLead: '파트장' });
        const teams = [createTeam([leadMember], { lead: leadMember.name })];

        const updatedTeams = calculateUpdatedTeamsForSave({
            teams,
            memberData: leadMember,
            teamId: 'team1',
            partId: '',
            isEditing: true,
            originalRecord: { teamId: 'team1', partId: null, member: leadMember },
            options: { clearTeamLead: true },
        });

        const updatedMember = updatedTeams[0].members?.find((m) => m.id === leadMember.id);
        expect(updatedMember?.role).toBe('파트장');
        expect(updatedMember?.roleBeforeLead).toBeUndefined();
        expect(updatedTeams[0].lead).toBe('');
    });
});
