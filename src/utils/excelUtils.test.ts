/* @vitest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import type { Team } from '../constants';
import { type ExcelMemberRow, exportMembersToExcel, mergeMembersIntoTeams } from './excelUtils';

const tempFileName = path.join(process.cwd(), 'tmp_excel_export_test.xlsx');

afterAll(() => {
    if (fs.existsSync(tempFileName)) {
        fs.rmSync(tempFileName);
    }
});

describe('mergeMembersIntoTeams', () => {
    it('throws when required fields are missing', () => {
        const rows: ExcelMemberRow[] = [
            { 팀: '영업1팀', 이름: '홍길동', 이메일: '' },
            { 팀: '', 이름: '김철수', 이메일: 'kim@example.com' },
            { 팀: '영업2팀', 이름: '', 이메일: 'lee@example.com' },
        ];

        expect(() => mergeMembersIntoTeams([], rows)).toThrow(/입력 오류/);
    });

    it('ignores completely empty rows', () => {
        const rows: ExcelMemberRow[] = [{}];

        expect(() => mergeMembersIntoTeams([], rows)).not.toThrow();
        expect(mergeMembersIntoTeams([], rows)).toEqual([]);
    });

    it('preserves member ids when email matches an existing member', () => {
        const existingTeams: Team[] = [
            {
                id: 'team-1',
                name: '개발팀',
                lead: '',
                members: [
                    {
                        id: 'member-123',
                        name: '홍길동',
                        role: '팀원',
                        avatar: '',
                        status: 'active',
                        employmentType: 'regular',
                        hireDate: '2024-01-01',
                        email: 'hong@example.com',
                        phone: '',
                        teamName: '개발팀',
                        partName: '',
                    },
                ],
                parts: [],
                originalTotalMemberCount: 1,
            },
        ];

        const rows: ExcelMemberRow[] = [
            { 팀: '인프라팀', 이름: '홍길동', 이메일: 'hong@example.com' },
        ];

        const result = mergeMembersIntoTeams(existingTeams, rows);
        const updatedTeam = result.find((team) => team.name === '인프라팀');
        const updatedMember = updatedTeam?.members?.[0];

        expect(updatedMember?.id).toBe('member-123');
    });

    it('marks interns with status intern when employment type is intern', () => {
        const rows: ExcelMemberRow[] = [
            {
                팀: '영업팀',
                이름: '신입인턴',
                이메일: 'intern@example.com',
                고용형태: '인턴',
            },
        ];

        const result = mergeMembersIntoTeams([], rows);
        const member = result[0]?.members?.[0];

        expect(member?.status).toBe('intern');
    });
});

describe('exportMembersToExcel', () => {
    it('sanitizes formula-like values on export', () => {
        const teams: Team[] = [
            {
                id: 'team-1',
                name: '=영업1팀',
                lead: '',
                members: [],
                parts: [
                    {
                        id: 'part-1',
                        title: '@기술영업파트',
                        members: [
                            {
                                id: 'member-1',
                                name: '+홍길동',
                                role: '-팀장',
                                avatar: '',
                                status: 'active',
                                employmentType: 'regular',
                                hireDate: '2024-01-01',
                                email: '=hong@example.com',
                                phone: '',
                                teamName: '=영업1팀',
                                partName: '@기술영업파트',
                            },
                        ],
                    },
                ],
                originalTotalMemberCount: 0,
            },
        ];

        exportMembersToExcel(teams, tempFileName);

        const workbook = XLSX.readFile(tempFileName);
        const sheet = workbook.Sheets.Members;

        expect(String(sheet.A2?.v)).toMatch(/^'/);
        expect(String(sheet.B2?.v)).toMatch(/^'/);
        expect(String(sheet.C2?.v)).toMatch(/^'/);
        expect(String(sheet.D2?.v)).toMatch(/^'/);
        expect(String(sheet.E2?.v)).toMatch(/^'/);
    });
});
