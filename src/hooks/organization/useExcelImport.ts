import { Team } from '../../constants';
import * as excelUtils from '../../utils/excelUtils';

interface FirestoreActions {
    addTeam: (team: any) => Promise<string>;
    updateTeam: (id: string, data: any) => Promise<void>;
    addMember: (member: any) => Promise<string>;
    updateMember: (id: string, data: any) => Promise<void>;
}

// Helper to find existing member
const findMember = (email: string, localTeams: Team[]) => {
    if (!email) return null;
    for (const t of localTeams) {
        const direct = t.members?.find((m) => m.email === email);
        if (direct) return direct;
        for (const p of t.parts) {
            const m = p.members.find((mem) => mem.email === email);
            if (m) return m;
        }
    }
    return null;
};

// Helper to find or create team
const findOrCreateTeam = async (
    teamName: string,
    localTeams: Team[],
    firestoreActions: FirestoreActions
): Promise<Team> => {
    let team = localTeams.find((t) => t.name === teamName);
    if (!team) {
        const newTeamData = {
            name: teamName,
            lead: '',
            parts: [],
            headquarterId: localTeams[0]?.headquarterId || 'hq_unassigned',
        };
        const newTeamId = await firestoreActions.addTeam(newTeamData);
        team = { ...newTeamData, id: newTeamId, members: [], parts: [] } as any;
        localTeams.push(team!);
    }
    return team!;
};

// Helper to find or create part
const findOrCreatePart = async (
    team: Team,
    partName: string,
    firestoreActions: FirestoreActions
): Promise<{ partId: string; team: Team }> => {
    let part = team.parts.find((p) => p.title === partName);
    if (!part) {
        const newPartData = {
            id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: partName,
            members: [],
        };
        const updatedParts = [...(team.parts || []), newPartData];
        await firestoreActions.updateTeam(team.id, { parts: updatedParts });
        part = newPartData;
        // Update local team reference to reflect key changes if needed,
        // though strictly 'team' object mutation here is by reference from findOrCreateTeam result
        team.parts = updatedParts;
    }
    return { partId: part.id, team };
};

export const processExcelImport = async (
    file: File,
    initialTeams: Team[],
    firestoreActions: FirestoreActions,
    showSuccess: (title: string, message: string) => void,
    showError: (title: string, message: string) => void
) => {
    try {
        const rows = await excelUtils.parseMembersFromExcel(file);
        const localTeams = JSON.parse(JSON.stringify(initialTeams)) as Team[];
        let processedCount = 0;

        for (const row of rows) {
            const teamName = row[excelUtils.HEADERS.TEAM]?.toString().trim();
            const partName = row[excelUtils.HEADERS.PART]?.toString().trim();
            const name = row[excelUtils.HEADERS.NAME]?.toString().trim();
            const email = row[excelUtils.HEADERS.EMAIL]?.toString().trim();

            if (!teamName || !name || !email) continue;

            // 1. Find or create Team
            const team = await findOrCreateTeam(teamName, localTeams, firestoreActions);

            // 2. Find or create Part (if exists)
            let partId: string | undefined = undefined;
            if (partName) {
                const result = await findOrCreatePart(team, partName, firestoreActions);
                partId = result.partId;
            }

            // 3. Prepare Member Data
            const existingMember = findMember(email, localTeams);
            const memberData = excelUtils.createMemberFromRow(
                row,
                teamName,
                partName,
                existingMember || undefined // Fix type mismatch: Member | null -> Member | undefined
            );

            const finalMemberData = {
                ...memberData,
                teamId: team.id,
                partId: partId ?? null,
            };

            // 4. Update or Add Member
            if (existingMember) {
                await firestoreActions.updateMember(existingMember.id, finalMemberData);
            } else {
                await firestoreActions.addMember(finalMemberData);
                // Update local state for subsequent lookups in this loop (optional but good for consistency)
                if (partId) {
                    const p = team.parts.find((p) => p.id === partId);
                    if (p) p.members.push({ ...finalMemberData, id: 'temp' } as any);
                } else {
                    if (!team.members) team.members = [];
                    team.members.push({ ...finalMemberData, id: 'temp' } as any);
                }
            }

            processedCount++;
        }
        showSuccess('엑셀 등록 완료', `${processedCount}명의 데이터가 처리되었습니다.`);
    } catch (err) {
        console.error(err);
        const message = err instanceof Error && err.message ? err.message : '파일을 읽는 중 오류가 발생했습니다.';
        showError('엑셀 등록 실패', message);
    }
};
