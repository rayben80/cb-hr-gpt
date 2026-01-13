const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const getAllowedOrigins = () => {
    const config = functions.config ? functions.config() : {};
    const rawOrigins = process.env.ALLOWED_ORIGINS || config.proxy?.allowed_origins || '';
    return rawOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

const getAllowedHeadquarterIds = () => {
    const config = functions.config ? functions.config() : {};
    const rawIds = process.env.ALLOWED_HQ_IDS || config.proxy?.allowed_hq_ids || 'hq-cloud';
    return rawIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
};

const applyCors = (req, res) => {
    const origin = req.get('origin');
    const allowedOrigins = getAllowedOrigins();

    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
        res.status(403).json({ error: 'Origin not allowed.' });
        return false;
    }

    if (origin) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Vary', 'Origin');
    } else {
        res.set('Access-Control-Allow-Origin', '*');
    }
    res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return true;
};

const parsePayload = (body) => {
    if (!body) return null;
    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch {
            return null;
        }
    }
    return body;
};

const toGoogleChatPayload = (payload) => {
    const icons = {
        evaluation_deadline: '!',
        evaluation_reminder: '!',
        evaluation_complete: '*',
        campaign_start: '*',
        test: '*',
    };

    const typeLabels = {
        evaluation_deadline: '마감 임박',
        evaluation_reminder: '평가 독촉',
        evaluation_complete: '평가 완료',
        campaign_start: '캠페인 시작',
        test: '테스트',
    };

    return {
        cards: [
            {
                header: {
                    title: `${icons[payload.type] || '*'} ${payload.title}`,
                    subtitle: `[${typeLabels[payload.type] || '알림'}] 성과평가 시스템 알림`,
                },
                sections: [
                    {
                        widgets: [
                            {
                                textParagraph: {
                                    text: payload.message,
                                },
                            },
                            ...(payload.dueDate
                                ? [
                                      {
                                          keyValue: {
                                              topLabel: '마감일',
                                              content: payload.dueDate,
                                              icon: 'CLOCK',
                                          },
                                      },
                                  ]
                                : []),
                            ...(payload.targetUsers && payload.targetUsers.length > 0
                                ? [
                                      {
                                          keyValue: {
                                              topLabel: '대상자',
                                              content: `${payload.targetUsers.length}명`,
                                              icon: 'PERSON',
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                ],
            },
        ],
    };
};

const getWebhookUrl = () => {
    if (process.env.GOOGLE_CHAT_WEBHOOK_URL) return process.env.GOOGLE_CHAT_WEBHOOK_URL;
    const config = functions.config ? functions.config() : {};
    return config.googlechat?.webhook_url || null;
};

const requireFirebaseAuth = async (req, res) => {
    const authHeader = req.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing authorization token.' });
        return null;
    }

    const token = authHeader.slice('Bearer '.length);
    let decoded;

    try {
        decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
        console.warn('Token verification failed:', error);
        res.status(401).json({ error: 'Invalid authorization token.' });
        return null;
    }

    if (decoded.approved !== true) {
        res.status(403).json({ error: 'Approval required.' });
        return null;
    }

    const allowedHqIds = getAllowedHeadquarterIds();
    if (allowedHqIds.length > 0) {
        const hqId = decoded.hqId;
        if (!hqId || typeof hqId !== 'string' || !allowedHqIds.includes(hqId)) {
            res.status(403).json({ error: 'Invalid headquarter.' });
            return null;
        }
    }

    return decoded;
};

exports.googleChatProxy = functions.https.onRequest(async (req, res) => {
    if (!applyCors(req, res)) return;

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed.' });
        return;
    }

    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) {
        res.status(500).json({ error: 'GOOGLE_CHAT_WEBHOOK_URL is not configured.' });
        return;
    }

    const decodedToken = await requireFirebaseAuth(req, res);
    if (!decodedToken) {
        return;
    }

    const payload = parsePayload(req.body);
    if (
        !payload ||
        typeof payload.type !== 'string' ||
        typeof payload.title !== 'string' ||
        typeof payload.message !== 'string'
    ) {
        res.status(400).json({ error: 'Invalid payload.' });
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(toGoogleChatPayload(payload)),
        });

        res.status(response.ok ? 200 : 502).json({
            success: response.ok,
            status: response.status,
        });
    } catch (error) {
        console.error('Failed to send Google Chat notification:', error);
        res.status(502).json({ success: false });
    }
});

const APPROVER_ROLES = new Set(['TEAM_LEADER', 'SUPER_ADMIN']);
const APPROVER_TEAM_REQUIRED = new Set(['TEAM_LEADER']);
const ASSIGNABLE_ROLES = new Set(['TEAM_LEADER', 'USER']);

const requireApprover = (context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign-in required.');
    }
    if (context.auth.token?.approved !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Approval required.');
    }
    const role = context.auth.token?.role;
    if (!APPROVER_ROLES.has(role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');
    }
    const teamId = context.auth.token?.teamId;
    if (APPROVER_TEAM_REQUIRED.has(role) && !teamId) {
        throw new functions.https.HttpsError('permission-denied', 'Approver team is missing.');
    }
    return role;
};

const resolveRole = (role, callerRole) => {
    if (callerRole === 'TEAM_LEADER') {
        return role === 'TEAM_LEADER' ? 'TEAM_LEADER' : 'USER';
    }
    return ASSIGNABLE_ROLES.has(role) ? role : 'USER';
};

exports.approveAccessRequest = functions.https.onCall(async (data, context) => {
    const callerRole = requireApprover(context);
    const uid = data?.uid;
    const status = data?.status;
    if (!uid || typeof uid !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'uid is required.');
    }
    if (status !== 'approved' && status !== 'rejected') {
        throw new functions.https.HttpsError('invalid-argument', 'status must be approved or rejected.');
    }

    const requestRef = admin.firestore().doc(`access_requests/${uid}`);
    const requestSnap = await requestRef.get();
    if (!requestSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Access request not found.');
    }

    const requestData = requestSnap.data() || {};
    const approvedByEmail = context.auth?.token?.email || null;
    const approvedByUid = context.auth?.uid || null;

    if (status === 'approved') {
        const approverTeamId = context.auth?.token?.teamId;
        const role = resolveRole(data?.role || requestData.role, callerRole);
        const hqId = typeof data?.hqId === 'string' ? data.hqId : requestData.hqId || 'hq-cloud';
        const requestedTeamId = typeof data?.teamId === 'string' ? data.teamId : requestData.teamId || null;
        const teamId = requestedTeamId || approverTeamId || null;
        const partId = typeof data?.partId === 'string' ? data.partId : requestData.partId || null;

        if (callerRole !== 'SUPER_ADMIN') {
            if (!approverTeamId || (teamId && teamId !== approverTeamId)) {
                throw new functions.https.HttpsError('permission-denied', 'Team leaders can approve only their team.');
            }
        }

        await admin.auth().setCustomUserClaims(uid, {
            approved: true,
            role,
            hqId,
            teamId,
            partId,
        });

        await requestRef.set(
            {
                status: 'approved',
                role,
                hqId,
                teamId,
                partId,
                approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                approvedBy: approvedByUid,
                approvedByEmail,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        return { ok: true };
    }

    await admin.auth().setCustomUserClaims(uid, { approved: false });
    await requestRef.set(
        {
            status: 'rejected',
            rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
            rejectedBy: approvedByUid,
            rejectedByEmail: approvedByEmail,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    return { ok: true };
});
