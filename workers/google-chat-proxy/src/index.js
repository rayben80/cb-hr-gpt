import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const getAllowedOrigins = (env) =>
    (env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const getAllowedHeadquarterIds = (env) =>
    (env.ALLOWED_HQ_IDS || 'hq-cloud')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

const buildCorsHeaders = (origin, allowedOrigins) => {
    const headers = new Headers();
    if (origin) {
        if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
            return null;
        }
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Vary', 'Origin');
    } else {
        headers.set('Access-Control-Allow-Origin', '*');
    }
    headers.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return headers;
};

const jsonResponse = (body, status, corsHeaders) => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (corsHeaders) {
        corsHeaders.forEach((value, key) => headers.set(key, value));
    }
    return new Response(JSON.stringify(body), { status, headers });
};

const isValidPayload = (payload) => {
    if (!payload || typeof payload !== 'object') return false;
    if (typeof payload.type !== 'string') return false;
    if (typeof payload.title !== 'string') return false;
    if (typeof payload.message !== 'string') return false;
    if (payload.targetUsers !== undefined && !Array.isArray(payload.targetUsers)) return false;
    if (payload.dueDate !== undefined && typeof payload.dueDate !== 'string') return false;
    return true;
};

const buildChatPayload = (payload) => {
    const icons = {
        evaluation_deadline: '!',
        evaluation_reminder: '!',
        evaluation_complete: '*',
        campaign_start: '*',
        test: '*',
    };

    const typeLabels = {
        evaluation_deadline: 'Deadline Soon',
        evaluation_reminder: 'Reminder',
        evaluation_complete: 'Completed',
        campaign_start: 'Campaign Start',
        test: 'Test',
    };

    return {
        cards: [
            {
                header: {
                    title: `${icons[payload.type] || '*'} ${payload.title}`,
                    subtitle: `[${typeLabels[payload.type] || 'Notification'}] Performance Evaluation`,
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
                                              topLabel: 'Due date',
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
                                              topLabel: 'Targets',
                                              content: `${payload.targetUsers.length}`,
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

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        const allowedOrigins = getAllowedOrigins(env);
        const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

        if (!corsHeaders) {
            return jsonResponse({ error: 'Origin not allowed.' }, 403, null);
        }

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed.' }, 405, corsHeaders);
        }

        if (!env.GOOGLE_CHAT_WEBHOOK_URL) {
            return jsonResponse({ error: 'GOOGLE_CHAT_WEBHOOK_URL is not configured.' }, 500, corsHeaders);
        }

        if (!env.FIREBASE_PROJECT_ID) {
            return jsonResponse({ error: 'FIREBASE_PROJECT_ID is not configured.' }, 500, corsHeaders);
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return jsonResponse({ error: 'Missing authorization token.' }, 401, corsHeaders);
        }

        const token = authHeader.slice('Bearer '.length);
        const issuer = `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`;
        const allowedHqIds = getAllowedHeadquarterIds(env);

        try {
            const { payload } = await jwtVerify(token, JWKS, {
                issuer,
                audience: env.FIREBASE_PROJECT_ID,
            });
            if (payload.approved !== true) {
                return jsonResponse({ error: 'Approval required.' }, 403, corsHeaders);
            }
            const hqId = payload.hqId;
            if (allowedHqIds.length > 0 && (!hqId || typeof hqId !== 'string' || !allowedHqIds.includes(hqId))) {
                return jsonResponse({ error: 'Invalid headquarter.' }, 403, corsHeaders);
            }
        } catch (error) {
            console.warn('Token verification failed:', error);
            return jsonResponse({ error: 'Invalid token.' }, 401, corsHeaders);
        }

        let payload;
        try {
            payload = await request.json();
        } catch {
            return jsonResponse({ error: 'Invalid JSON payload.' }, 400, corsHeaders);
        }

        if (!isValidPayload(payload)) {
            return jsonResponse({ error: 'Invalid payload.' }, 400, corsHeaders);
        }

        try {
            const response = await fetch(env.GOOGLE_CHAT_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildChatPayload(payload)),
            });

            const success = response.ok;
            return jsonResponse(
                { success, status: response.status },
                success ? 200 : 502,
                corsHeaders
            );
        } catch (error) {
            console.error('Failed to send Google Chat notification:', error);
            return jsonResponse({ success: false }, 502, corsHeaders);
        }
    },
};
