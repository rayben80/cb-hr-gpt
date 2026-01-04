import * as XLSX from 'xlsx';
import { Member, MemberStatus, Team } from '../constants';
import { getAvatarUrl } from './avatarUtils';
import { DEFAULT_MEMBER_ROLE, isAllowedMemberRole, normalizeMemberRole } from './memberRoleUtils';

// 엑셀 컬럼 매핑 (User friendly headers)
export const HEADERS = {
    NAME: '이름',
    TEAM: '팀',
    PART: '파트',
    ROLE: '직책', // '팀장' 여부 식별용
    EMAIL: '이메일',
    HIRE_DATE: '입사일',
    EMPLOYMENT_TYPE: '고용형태', // 정규직, 인턴
    STATUS: '상태', // 재직, 휴직, 퇴사 등
};

export interface ExcelMemberRow {
    [key: string]: string | undefined;
}

const getCellValue = (value: unknown) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

const isRowEmpty = (row: ExcelMemberRow) => Object.values(HEADERS).every((header) => getCellValue(row[header]) === '');

const getMissingRows = (rows: ExcelMemberRow[], header: string) =>
    rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !isRowEmpty(row))
        .filter(({ row }) => !getCellValue(row[header]))
        .map(({ index }) => index + 2);

const getInvalidRoleRows = (rows: ExcelMemberRow[]) =>
    rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => !isRowEmpty(row))
        .map(({ row, index }) => ({ role: getCellValue(row[HEADERS.ROLE]), index }))
        .filter(({ role }) => role !== '' && !isAllowedMemberRole(role))
        .map(({ index }) => index + 2);

const sanitizeExcelCell = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    if ('=+-@'.includes(trimmed[0])) return `'${value}`;
    return value;
};

/**
 * 엑셀 파일에서 멤버 데이터를 파싱합니다.
 */
export const parseMembersFromExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON with headers
                const jsonData = XLSX.utils.sheet_to_json<ExcelMemberRow>(worksheet);
                resolve(jsonData);
            } catch (error) {
                console.error('Excel Parsing Error:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error('File Reading Error:', error);
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Helper to process a member for export
 */
const createExportRow = (teamName: string, partName: string, member: Member) => {
    // Logic to handle legacy data where status might be 'intern'
    const isIntern = member.employmentType === 'intern' || (member.status as any) === 'intern';
    const statusLabel = (member.status as any) === 'intern' ? '재직' : getStatusLabel(member.status);

    return {
        [HEADERS.TEAM]: sanitizeExcelCell(teamName),
        [HEADERS.PART]: sanitizeExcelCell(partName),
        [HEADERS.NAME]: sanitizeExcelCell(member.name),
        [HEADERS.ROLE]: sanitizeExcelCell(member.role),
        [HEADERS.EMAIL]: sanitizeExcelCell(member.email),
        [HEADERS.HIRE_DATE]: sanitizeExcelCell(member.hireDate),
        [HEADERS.EMPLOYMENT_TYPE]: sanitizeExcelCell(isIntern ? '인턴' : '정규직'),
        [HEADERS.STATUS]: sanitizeExcelCell(statusLabel),
    };
};

/**
 * 현재 조직 데이터를 엑셀로 내보냅니다.
 */
export const exportMembersToExcel = (teams: Team[], fileName = '조직도_현황.xlsx') => {
    const rows: any[] = [];

    teams.forEach((team) => {
        // Direct Members
        (team.members || []).forEach((member) => {
            rows.push(createExportRow(team.name, '', member));
        });

        // Part Members
        (team.parts || []).forEach((part) => {
            (part.members || []).forEach((member) => {
                rows.push(createExportRow(team.name, part.title, member));
            });
        });
    });

    // Create Sheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

    // Write File
    XLSX.writeFile(workbook, fileName);
};

// Helper for Status Labels
const getStatusLabel = (status: Member['status']) => {
    switch (status) {
        case 'active':
            return '재직';
        case 'on_leave':
            return '휴직';
        case 'resigned':
            return '퇴사';
        default:
            return status;
    }
};

/**
 * 엑셀 등록용 템플릿 다운로드
 */
export const downloadExcelTemplate = () => {
    const templateData = [
        {
            [HEADERS.TEAM]: '영업1팀',
            [HEADERS.PART]: '',
            [HEADERS.NAME]: '홍길동',
            [HEADERS.ROLE]: '팀장',
            [HEADERS.EMAIL]: 'hong@company.com',
            [HEADERS.HIRE_DATE]: '2024-01-01',
            [HEADERS.EMPLOYMENT_TYPE]: '정규직',
            [HEADERS.STATUS]: '재직',
        },
        {
            [HEADERS.TEAM]: '영업1팀',
            [HEADERS.PART]: '기술영업파트',
            [HEADERS.NAME]: '김철수',
            [HEADERS.ROLE]: '파트장',
            [HEADERS.EMAIL]: 'kim@company.com',
            [HEADERS.HIRE_DATE]: '2024-02-01',
            [HEADERS.EMPLOYMENT_TYPE]: '정규직',
            [HEADERS.STATUS]: '재직',
        },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();

    // 1. Template Sheet
    XLSX.utils.book_append_sheet(workbook, worksheet, '조직원_등록_양식');

    // 2. Guide Sheet
    const guideData = [
        { 항목: '팀', 설명: '소속 팀의 이름을 입력합니다. (필수) 예: Sales팀' },
        { 항목: '파트', 설명: '소속 파트가 있는 경우 입력합니다. (선택) 예: 영업파트' },
        { 항목: '이름', 설명: '조직원의 이름입니다. (필수)' },
        { 항목: '직책', 설명: '팀장, 파트장, 팀원 중 하나를 입력합니다.' },
        { 항목: '이메일', 설명: '고유 식별자로 사용됩니다. 기존 인원 수정 시 필수입니다.' },
        { 항목: '입사일', 설명: 'YYYY-MM-DD 형식으로 입력합니다.' },
        { 항목: '고용형태', 설명: '정규직, 인턴 중 하나를 입력합니다. (기본값: 정규직)' },
        { 항목: '상태', 설명: '재직, 휴직, 퇴사 중 하나를 입력합니다.' },
    ];
    const guideSheet = XLSX.utils.json_to_sheet(guideData);
    // Adjust column widths for guide
    guideSheet['!cols'] = [{ wch: 15 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(workbook, guideSheet, '작성가이드');

    XLSX.writeFile(workbook, '조직원_일괄등록_양식.xlsx');
};

/**
 * Finds or creates a team in the teams array.
 */
const findOrCreateTeam = (teams: Team[], teamName: string): Team => {
    let team = teams.find((t) => t.name === teamName);
    if (!team) {
        team = {
            id: crypto.randomUUID(),
            name: teamName,
            lead: '',
            members: [],
            parts: [],
            originalTotalMemberCount: 0,
        };
        teams.push(team);
    }
    return team;
};

/**
 * Creates a Member object from an Excel row.
 */
export const createMemberFromRow = (
    row: ExcelMemberRow,
    teamName: string,
    partName: string | undefined,
    existingMember?: Member
): Member => {
    const rawStatus = getCellValue(row[HEADERS.STATUS]);
    const rawEmploymentType = getCellValue(row[HEADERS.EMPLOYMENT_TYPE]);
    const name = getCellValue(row[HEADERS.NAME]);
    const roleValue = getCellValue(row[HEADERS.ROLE]);
    const role = normalizeMemberRole(roleValue || DEFAULT_MEMBER_ROLE);

    // Determine employment type
    const isIntern = rawEmploymentType === '인턴' || rawStatus === 'intern' || rawStatus === '인턴';
    const employmentType = isIntern ? 'intern' : 'regular';

    // Determine status
    let status: MemberStatus = 'active';
    if (rawStatus === '휴직') {
        status = 'on_leave';
    } else if (rawStatus === '퇴사' || rawStatus === '퇴직') {
        status = 'resigned';
    } else if (isIntern) {
        status = 'intern';
    }

    const email = getCellValue(row[HEADERS.EMAIL]);

    return {
        id: existingMember?.id || crypto.randomUUID(),
        name: name || 'Unknown',
        role,
        email: email,
        phone: '',
        avatar: getAvatarUrl(name || 'Unknown'),
        employmentType: employmentType,
        status: status,
        hireDate: getCellValue(row[HEADERS.HIRE_DATE]) || new Date().toISOString().split('T')[0],
        teamName: teamName,
        partName: partName,
    };
};

/**
 * Adds or updates a member in the appropriate team/part list.
 */
const addOrUpdateMemberInTeam = (team: Team, partName: string | undefined, member: Member) => {
    if (partName) {
        // Find or Create Part
        let part = team.parts.find((p) => p.title === partName);
        if (!part) {
            part = {
                id: crypto.randomUUID(),
                title: partName,
                members: [],
            };
            team.parts.push(part);
        }

        // Check existing member
        const existingIdx = part.members.findIndex((m) => m.email === member.email && member.email);
        if (existingIdx >= 0) {
            part.members[existingIdx] = { ...part.members[existingIdx], ...member, id: part.members[existingIdx].id };
        } else {
            part.members.push(member);
        }
    } else {
        // Direct Team Member
        if (!team.members) team.members = [];
        const existingIdx = team.members.findIndex((m) => m.email === member.email && member.email);
        if (existingIdx >= 0) {
            team.members[existingIdx] = { ...team.members[existingIdx], ...member, id: team.members[existingIdx].id };
        } else {
            team.members.push(member);
        }
    }
};

const findMemberByEmail = (teams: Team[], email: string): Member | null => {
    if (!email) return null;
    for (const team of teams) {
        const direct = team.members?.find((member) => member.email === email);
        if (direct) return direct;
        for (const part of team.parts) {
            const member = part.members.find((m) => m.email === email);
            if (member) return member;
        }
    }
    return null;
};

/**
 * Remove any existing member with the same email to avoid duplicates across teams/parts.
 */
const removeMemberByEmail = (teams: Team[], email: string) => {
    if (!email) return;
    teams.forEach((team) => {
        let shouldClearLead = false;
        if (team.members?.length) {
            team.members = team.members.filter((member) => {
                if (member.email === email) {
                    if (team.lead === member.name || team.leadId === member.id) {
                        shouldClearLead = true;
                    }
                    return false;
                }
                return true;
            });
        }

        team.parts.forEach((part) => {
            if (!part.members.length) return;
            part.members = part.members.filter((member) => {
                if (member.email === email) {
                    if (team.lead === member.name || team.leadId === member.id) {
                        shouldClearLead = true;
                    }
                    return false;
                }
                return true;
            });
        });

        if (shouldClearLead) {
            team.lead = '';
            delete team.leadId;
        }
    });
};

/**
 * 엑셀 데이터를 기존 팀 구조에 병합합니다.
 */
export const mergeMembersIntoTeams = (currentTeams: Team[], rows: ExcelMemberRow[]): Team[] => {
    const missingTeamRows = getMissingRows(rows, HEADERS.TEAM);
    const missingNameRows = getMissingRows(rows, HEADERS.NAME);
    const missingEmailRows = getMissingRows(rows, HEADERS.EMAIL);
    const invalidRoleRows = getInvalidRoleRows(rows);

    if (
        missingTeamRows.length > 0 ||
        missingNameRows.length > 0 ||
        missingEmailRows.length > 0 ||
        invalidRoleRows.length > 0
    ) {
        const errors: string[] = [];
        if (missingTeamRows.length > 0) errors.push(`팀: ${missingTeamRows.join(', ')}`);
        if (missingNameRows.length > 0) errors.push(`이름: ${missingNameRows.join(', ')}`);
        if (missingEmailRows.length > 0) errors.push(`이메일: ${missingEmailRows.join(', ')}`);
        if (invalidRoleRows.length > 0) errors.push(`직책: ${invalidRoleRows.join(', ')}`);
        throw new Error(`입력 오류가 있습니다. (엑셀 행 번호 - ${errors.join(' / ')})`);
    }

    // Deep clone to avoid mutation
    const newTeams = JSON.parse(JSON.stringify(currentTeams)) as Team[];

    rows.forEach((row) => {
        const teamName = getCellValue(row[HEADERS.TEAM]);
        const name = getCellValue(row[HEADERS.NAME]);
        const email = getCellValue(row[HEADERS.EMAIL]);

        if (!teamName || !name || !email) return; // Skip invalid rows

        const existingMember = findMemberByEmail(newTeams, email);
        removeMemberByEmail(newTeams, email);
        const team = findOrCreateTeam(newTeams, teamName);
        const partNameValue = getCellValue(row[HEADERS.PART]);
        const partName = partNameValue || undefined;
        const member = createMemberFromRow(row, teamName, partName, existingMember ?? undefined);

        // Update Team Lead if applicable
        if (member.role === '팀장') {
            team.lead = member.name;
            team.leadId = member.id;
        }

        addOrUpdateMemberInTeam(team, partName, member);
    });

    return newTeams;
};
