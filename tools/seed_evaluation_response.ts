import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initialEvaluationsData } from '../src/constants/mockData';
import { SCORING_TYPE_PRESETS, TEMPLATE_ITEM_PRESETS } from '../src/constants/presets';

type ScoringType = keyof typeof SCORING_TYPE_PRESETS;

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

const normalizeType = (type: string) => type.replace(/\s+/g, '');

const mapEvaluationTypeToPreset = (type: string) => {
    const normalized = normalizeType(type);
    if (normalized === '본인평가') return '역량 평가';
    if (normalized === '다면평가') return '다면 평가';
    if (normalized === '리더십평가') return '리더십 평가';
    if (normalized === '수습평가') return '수습 평가';
    return '역량 평가';
};

const resolveEvaluation = (idArg?: string) => {
    if (idArg) {
        const match = initialEvaluationsData.find((e) => String(e.id) === String(idArg));
        if (match) return match;
    }

    return (
        initialEvaluationsData.find((e) => e.status === '완료') ||
        initialEvaluationsData[0] || {
            id: 1,
            name: 'Mock Evaluation',
            type: '본인평가',
        }
    );
};

const pickRandomOption = <T>(values: T[]) => values[Math.floor(Math.random() * values.length)];

const buildAnswers = (evaluationType: string, scoringType: ScoringType) => {
    const presetKey = mapEvaluationTypeToPreset(evaluationType);
    const presetItems = TEMPLATE_ITEM_PRESETS[presetKey] || TEMPLATE_ITEM_PRESETS['역량 평가'];
    const scoringPreset = SCORING_TYPE_PRESETS[scoringType];
    if (!scoringPreset) {
        throw new Error(`Unknown scoring type: ${scoringType}`);
    }

    return presetItems.map((item, index) => {
        const options = scoringPreset[item.type] || scoringPreset['정성'];
        const selected = pickRandomOption(options);
        return {
            itemId: index + 1,
            score: selected.score ?? 0,
            grade: selected.grade,
            comment: `Mock response for ${item.title}.`,
            weight: item.weight ?? 0,
        };
    });
};

const computeTotalScore = (answers: Array<{ score: number; weight?: number }>) => {
    const hasWeight = answers.some((answer) => (answer.weight ?? 0) > 0);
    if (!answers.length) return 0;

    if (hasWeight) {
        const totalWeight = answers.reduce((sum, answer) => sum + (answer.weight ?? 0), 0) || 1;
        const weightedScore = answers.reduce(
            (sum, answer) => sum + (answer.score ?? 0) * ((answer.weight ?? 0) / totalWeight),
            0
        );
        return Math.round(weightedScore * 10) / 10;
    }

    const average = answers.reduce((sum, answer) => sum + (answer.score ?? 0), 0) / answers.length;
    return Math.round(average * 10) / 10;
};

const main = async () => {
    const email = parseArg('--email') || 'rayben@forcs.com';
    const evaluationIdArg = parseArg('--evaluationId');
    const scoringType = (parseArg('--scoringType') || '5grade') as ScoringType;

    const evaluation = resolveEvaluation(evaluationIdArg);
    const answersWithWeight = buildAnswers(evaluation.type, scoringType);
    const totalScore = computeTotalScore(answersWithWeight);
    const answers = answersWithWeight.map(({ weight, ...answer }) => answer);

    if (!admin.apps.length) {
        const serviceAccount = resolveServiceAccount();
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const user = await admin.auth().getUserByEmail(email);
    const responseRef = admin
        .firestore()
        .collection('evaluations')
        .doc(String(evaluation.id))
        .collection('responses')
        .doc(user.uid);

    await responseRef.set(
        {
            evaluationId: String(evaluation.id),
            evaluatorId: user.uid,
            evaluatorEmail: user.email ?? null,
            evaluatorName: user.displayName ?? null,
            answers,
            totalScore,
            completedAt: new Date().toISOString(),
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            mock: true,
        },
        { merge: true }
    );

    console.log(`Mock response saved for ${user.email || user.uid}.`);
    console.log(`Evaluation ID: ${evaluation.id} (${evaluation.name || 'Unknown'})`);
    console.log(`Answers: ${answers.length}, Total score: ${totalScore}`);
};

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
