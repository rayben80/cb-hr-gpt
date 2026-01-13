import admin from 'firebase-admin';
import { readFileSync } from 'fs';

type UserRole = 'SUPER_ADMIN' | 'HQ_LEADER' | 'TEAM_LEADER' | 'USER';

const parseArg = (name: string): string | undefined => {
    const index = process.argv.indexOf(name);
    if (index === -1) return undefined;
    return process.argv[index + 1];
};

const resolveServiceAccount = (): admin.ServiceAccount => {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (rawKey) {
        return JSON.parse(rawKey) as admin.ServiceAccount;
    }

    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!path) {
        throw new Error(
            'Missing service account credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS.'
        );
    }
    const contents = readFileSync(path, 'utf8');
    return JSON.parse(contents) as admin.ServiceAccount;
};

const main = async () => {
    const email = parseArg('--email');
    const uid = parseArg('--uid');
    const role = (parseArg('--role') || 'USER') as UserRole;
    const hqId = parseArg('--hqId') || parseArg('--hq-id');
    const teamId = parseArg('--teamId') || parseArg('--team-id');
    const partId = parseArg('--partId') || parseArg('--part-id');
    const approvedRaw = parseArg('--approved');
    const approved =
        approvedRaw === undefined
            ? undefined
            : approvedRaw === 'false' || approvedRaw === '0'
            ? false
            : true;

    const allowedRoles: UserRole[] = ['SUPER_ADMIN', 'HQ_LEADER', 'TEAM_LEADER', 'USER'];
    if (!allowedRoles.includes(role)) {
        throw new Error(`Invalid role. Use one of: ${allowedRoles.join(', ')}`);
    }

    if (!email && !uid) {
        throw new Error('Provide --email or --uid.');
    }

    if (!admin.apps.length) {
        const serviceAccount = resolveServiceAccount();
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const user = uid ? await admin.auth().getUser(uid) : await admin.auth().getUserByEmail(email!);
    const claims: { role: UserRole; hqId?: string; teamId?: string; partId?: string; approved?: boolean } = { role };
    if (hqId) {
        claims.hqId = hqId;
    } else {
        console.warn('No --hqId provided; users without hqId will be blocked by app rules.');
    }
    if (teamId) {
        claims.teamId = teamId;
    }
    if (partId) {
        claims.partId = partId;
    }
    if (approved !== undefined) {
        claims.approved = approved;
    }
    await admin.auth().setCustomUserClaims(user.uid, claims);

    console.log(
        `Updated custom claims for ${user.email || user.uid}: role=${role}${hqId ? ` hqId=${hqId}` : ''}${
            teamId ? ` teamId=${teamId}` : ''
        }${partId ? ` partId=${partId}` : ''}${approved !== undefined ? ` approved=${approved}` : ''}`
    );
    console.log('Users must re-login to refresh ID token claims.');
};

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
