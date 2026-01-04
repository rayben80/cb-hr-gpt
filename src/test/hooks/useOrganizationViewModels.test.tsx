import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrganizationViewModels } from '../../hooks/organization/useOrganizationViewModels';
import type { Headquarter, Member, Team } from '../../constants';

const createMember = (overrides: Partial<Member> = {}): Member => ({
    id: overrides.id ?? 'member-1',
    name: overrides.name ?? '홍길동',
    role: overrides.role ?? '팀원',
    avatar: overrides.avatar ?? '',
    status: overrides.status ?? 'active',
    employmentType: overrides.employmentType,
    hireDate: overrides.hireDate ?? '2024-01-01',
    email: overrides.email ?? 'hong@example.com',
    phone: overrides.phone,
    teamName: overrides.teamName,
    partName: overrides.partName,
    teamId: overrides.teamId,
    partId: overrides.partId,
});

const headquarters: Headquarter[] = [
    {
        id: 'hq-1',
        name: '본부',
        description: '',
    },
];

describe('useOrganizationViewModels', () => {
    it('includes direct members when filtering by status', () => {
        const teams: Team[] = [
            {
                id: 'team-1',
                name: '개발팀',
                lead: '',
                members: [createMember({ id: 'member-1', status: 'active' })],
                parts: [],
            },
        ];

        const { result } = renderHook(() =>
            useOrganizationViewModels({
                role: 'ADMIN',
                activeTeams: teams,
                statusFilter: 'active',
                headquarters,
                sortOption: 'name_asc',
                filteredInactiveMembers: { onLeave: [], resigned: [] },
            })
        );

        expect(result.current.visibleActiveTeams).toHaveLength(1);
        expect(result.current.visibleActiveTeams[0].members).toHaveLength(1);
    });

    it('sorts by member count including direct members', () => {
        const teams: Team[] = [
            {
                id: 'team-a',
                name: 'A팀',
                lead: '',
                members: [
                    createMember({ id: 'member-a1' }),
                    createMember({ id: 'member-a2', name: '김민수', email: 'kim@example.com' }),
                ],
                parts: [],
            },
            {
                id: 'team-b',
                name: 'B팀',
                lead: '',
                members: [],
                parts: [
                    {
                        id: 'part-1',
                        title: '파트',
                        members: [createMember({ id: 'member-b1', name: '이영희', email: 'lee@example.com' })],
                    },
                ],
            },
        ];

        const { result } = renderHook(() =>
            useOrganizationViewModels({
                role: 'ADMIN',
                activeTeams: teams,
                statusFilter: 'all',
                headquarters,
                sortOption: 'members_desc',
                filteredInactiveMembers: { onLeave: [], resigned: [] },
            })
        );

        expect(result.current.sortedActiveTeams[0].id).toBe('team-a');
    });
});
