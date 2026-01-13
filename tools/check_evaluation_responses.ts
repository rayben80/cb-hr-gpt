import admin from 'firebase-admin';
import { readFileSync } from 'fs';

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

    if (!email && !uid) {
        throw new Error('Provide --email or --uid to filter responses.');
    }

    if (!admin.apps.length) {
        const serviceAccount = resolveServiceAccount();
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const db = admin.firestore();
    const snapshot = await db.collectionGroup('responses').get();
    const filtered = snapshot.docs.filter((docSnap) => {
        const data = docSnap.data();
        if (email && data.evaluatorEmail !== email) return false;
        if (uid && data.evaluatorId !== uid) return false;
        return true;
    });

    console.log(`Found ${filtered.length} response(s).`);

    filtered.slice(0, 5).forEach((docSnap, index) => {
        const data = docSnap.data();
        console.log(`\n#${index + 1} ${docSnap.ref.path}`);
        console.log({
            evaluationId: data.evaluationId,
            evaluatorEmail: data.evaluatorEmail,
            totalScore: data.totalScore,
            completedAt: data.completedAt,
        });
    });
};

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
