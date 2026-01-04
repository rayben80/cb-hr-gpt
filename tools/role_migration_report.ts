import fs from 'node:fs';
import path from 'node:path';
import { initialTeamsData } from '../src/constants';
import type { Team } from '../src/constants';
import { buildRoleNormalizationReport } from '../src/utils/memberRoleUtils';

const args = process.argv.slice(2);

const readArgValue = (name: string): string | null => {
    const direct = args.find((arg) => arg.startsWith(`${name}=`));
    if (direct) return direct.split('=').slice(1).join('=');
    const index = args.findIndex((arg) => arg === name);
    if (index >= 0 && args[index + 1]) return args[index + 1];
    return null;
};

const inputPath = readArgValue('--input');
const outputPath = readArgValue('--output') || path.join(process.cwd(), 'role_migration_report.json');

const loadTeams = (): Team[] => {
    if (!inputPath) return initialTeamsData;
    const resolved = path.resolve(inputPath);
    if (!fs.existsSync(resolved)) {
        throw new Error(`Input file not found: ${resolved}`);
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    const parsed = JSON.parse(content) as Team[];
    if (!Array.isArray(parsed)) {
        throw new Error('Input JSON must be an array of teams.');
    }
    return parsed;
};

const teams = loadTeams();
const report = buildRoleNormalizationReport(teams);

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(`Role normalization report written to ${outputPath}`);
console.log(`Total members: ${report.totalMembers}`);
console.log(`Changed members: ${report.changedMembers}`);
