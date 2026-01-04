const functions = require('firebase-functions');

const getAllowedOrigins = () => {
    const config = functions.config ? functions.config() : {};
    const rawOrigins = process.env.ALLOWED_ORIGINS || config.proxy?.allowed_origins || '';
    return rawOrigins
        .split(',')
        .map((origin) => origin.trim())
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

    const payload = parsePayload(req.body);
    if (!payload || typeof payload.type !== 'string' || typeof payload.title !== 'string' || typeof payload.message !== 'string') {
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
