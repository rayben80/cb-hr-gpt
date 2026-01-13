import { Team } from '../../constants';
import * as excelUtils from '../../utils/excelUtils';
import { normalizeMemberRole } from '../../utils/memberRoleUtils';
import { FirestoreActions } from './firestoreActions';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

type ImportOutcome = 'added' | 'updated' | 'skipped';

// Helper to find existing member
const findMember = (email: string, localTeams: Team[]) => {
    if (!email) return null;
    const normalizedEmail = normalizeEmail(email);
    for (const t of localTeams) {
        const direct = t.members?.find((m) => normalizeEmail(m.email || '') === normalizedEmail);
        if (direct) return direct;
        for (const p of t.parts) {
            const m = p.members.find((mem) => normalizeEmail(mem.email || '') === normalizedEmail);
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
        team.parts = updatedParts;
    }
    return { partId: part.id, team };
};

const resolvePartId = async (
    team: Team,
    partName: string | undefined,
    firestoreActions: FirestoreActions
): Promise<string | undefined> => {
    if (!partName) return undefined;
    const result = await findOrCreatePart(team, partName, firestoreActions);
    return result.partId;
};

const updateTeamLeadIfNeeded = async (
    team: Team,
    memberData: ReturnType<typeof excelUtils.createMemberFromRow>,
    memberId: string,
    firestoreActions: FirestoreActions
) => {
    if (memberData.role !== '팀장') return;
    await firestoreActions.updateTeam(team.id, { lead: memberData.name, leadId: memberId });
    team.lead = memberData.name;
    team.leadId = memberId;
};

const addOrUpdateMember = async ({
    existingMember,
    memberData,
    finalMemberData,
    team,
    partId,
    firestoreActions,
}: {
    existingMember: ReturnType<typeof findMember>;
    memberData: ReturnType<typeof excelUtils.createMemberFromRow>;
    finalMemberData: ReturnType<typeof excelUtils.createMemberFromRow> & {
        email: string;
        teamId: string;
        partId: string | null;
        partName: string | null;
    };
    team: Team;
    partId?: string | undefined;
    firestoreActions: FirestoreActions;
}): Promise<ImportOutcome> => {
    if (existingMember) {
        await firestoreActions.updateMember(existingMember.id, finalMemberData);
        await updateTeamLeadIfNeeded(team, memberData, existingMember.id, firestoreActions);
        return 'updated';
    }

    const newMemberId = await firestoreActions.addMember(finalMemberData);
    const storedMember = { ...finalMemberData, id: newMemberId } as any;
    if (partId) {
        const part = team.parts.find((p) => p.id === partId);
        if (part) part.members.push(storedMember);
    } else {
        if (!team.members) team.members = [];
        team.members.push(storedMember);
    }
    await updateTeamLeadIfNeeded(team, memberData, newMemberId, firestoreActions);
    return 'added';
};

const parseImportRow = (row: excelUtils.ExcelMemberRow) => {
    const teamName = row[excelUtils.HEADERS.TEAM]?.toString().trim();
    const name = row[excelUtils.HEADERS.NAME]?.toString().trim();
    const rawEmail = row[excelUtils.HEADERS.EMAIL]?.toString().trim() ?? '';
    const email = normalizeEmail(rawEmail);
    const rawRole = row[excelUtils.HEADERS.ROLE]?.toString().trim() ?? '';
    const role = normalizeMemberRole(rawRole);
    const rawPartName = row[excelUtils.HEADERS.PART]?.toString().trim() ?? '';
    const partName = role === '팀장' ? undefined : rawPartName || undefined;
    const isValid = Boolean(teamName && name && email);

    return {
        teamName,
        name,
        email,
        partName,
        role,
        isValid,
    };
};

// Extracted row processing to reduce complexity and nesting
const processImportRow = async (
    row: excelUtils.ExcelMemberRow,
    localTeams: Team[],
    firestoreActions: FirestoreActions
): Promise<ImportOutcome> => {
    const { teamName, email, partName, isValid } = parseImportRow(row);
    if (!isValid || !teamName || !email) return 'skipped';

    // 1. Find or create Team
    const team = await findOrCreateTeam(teamName!, localTeams, firestoreActions);

    // 2. Find or create Part (if exists)
    const partId = await resolvePartId(team, partName, firestoreActions);

    // 3. Prepare Member Data
    const existingMember = findMember(email!, localTeams);
    const memberData = excelUtils.createMemberFromRow(row, teamName!, partName, existingMember || undefined);

    const finalMemberData = {
        ...memberData,
        email,
        teamId: team.id,
        partId: partId ?? null,
        partName: partName ?? null,
    };

    // 4. Update or Add Member
    return addOrUpdateMember({
        existingMember,
        memberData,
        finalMemberData,
        team,
        partId,
        firestoreActions,
    });
};

const processImportRows = async (
    rows: excelUtils.ExcelMemberRow[],
    localTeams: Team[],
    firestoreActions: FirestoreActions
) => {
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
        const outcome = await processImportRow(row, localTeams, firestoreActions);
        if (outcome === 'added') addedCount++;
        if (outcome === 'updated') updatedCount++;
        if (outcome === 'skipped') skippedCount++;
    }

    return { addedCount, updatedCount, skippedCount };
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
        excelUtils.validateMemberRows(rows);
        const localTeams = JSON.parse(JSON.stringify(initialTeams)) as Team[];
        const { addedCount, updatedCount, skippedCount } = await processImportRows(rows, localTeams, firestoreActions);
        const totalCount = addedCount + updatedCount + skippedCount;
        showSuccess(
            '엑셀 등록 완료',
            `총 ${totalCount}건 처리 (신규 ${addedCount}, 수정 ${updatedCount}, 건너뜀 ${skippedCount})`
        );
    } catch (err) {
        console.error(err);
        let message = err instanceof Error && err.message ? err.message : '파일을 읽는 중 오류가 발생했습니다.';
        if (message.includes('입력 오류가 있습니다.')) {
            message = `${message} 참고: 팀장은 파트를 비워주세요(입력해도 무시됩니다).`;
        }
        showError('엑셀 등록 실패', message);
    }
};
