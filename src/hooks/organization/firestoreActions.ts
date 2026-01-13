import { Member, Team } from '../../constants';

export interface FirestoreActions {
    addTeam: (team: Omit<Team, 'id'>) => Promise<string>;
    updateTeam: (id: string, data: Partial<Team>) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
    addMember: (member: Omit<Member, 'id'>) => Promise<string>;
    updateMember: (id: string, data: Partial<Member>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
}
