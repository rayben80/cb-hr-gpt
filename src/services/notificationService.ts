/**
 * Notification Service
 * Handles sending notifications via Google Chat Webhook and other channels
 */
import { auth } from '../firebase';

export type NotificationType =
    | 'evaluation_deadline'     // 평가 마감 임박 알림
    | 'evaluation_reminder'     // 미참여자 독촉 알림
    | 'evaluation_complete'     // 평가 완료 알림
    | 'campaign_start'          // 캠페인 시작 알림
    | 'test';                   // 테스트 알림

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    targetUsers?: string[];     // 대상 사용자 목록
    evaluationId?: string;      // 관련 평가 ID
    dueDate?: string;           // 마감일
}

export interface NotificationLog {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    sentAt: string;
    channel: 'google_chat' | 'email' | 'both';
    success: boolean;
    targetCount?: number | undefined;
}

// Storage keys
const NOTIFICATION_LOGS_KEY = 'notificationLogs';

const isValidProxyUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
};

export const getNotificationProxyUrl = (): string | null => {
    const envValue = import.meta.env?.VITE_NOTIFICATION_PROXY_URL;
    if (typeof envValue !== 'string') return null;
    const trimmed = envValue.trim();
    if (!trimmed) return null;
    return isValidProxyUrl(trimmed) ? trimmed : null;
};

const safeStorageGet = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`localStorage getItem failed for ${key}:`, error);
        return null;
    }
};

const safeStorageSet = (key: string, value: string): boolean => {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn(`localStorage setItem failed for ${key}:`, error);
        return false;
    }
};

const safeStorageRemove = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`localStorage removeItem failed for ${key}:`, error);
    }
};

export function isValidGoogleChatWebhookUrl(url: string): boolean {
    const trimmed = url.trim();
    if (!trimmed) return false;
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:') return false;
        if (parsed.hostname !== 'chat.googleapis.com') return false;
        if (!parsed.pathname.startsWith('/v1/spaces/')) return false;
        if (!parsed.pathname.includes('/messages')) return false;
        const hasKey = parsed.searchParams.has('key');
        const hasToken = parsed.searchParams.has('token');
        return hasKey && hasToken;
    } catch {
        return false;
    }
}

/**
 * Webhook URLs are not stored client-side. Kept for compatibility.
 */
export function getWebhookUrl(): string | null {
    return null;
}

const getAuthToken = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    const user = auth.currentUser;
    if (!user) return null;
    try {
        return await user.getIdToken();
    } catch (error) {
        console.warn('Failed to get auth token for notifications:', error);
        return null;
    }
};

/**
 * Webhook URL saving is disabled. Use the notification proxy instead.
 */
export function saveWebhookUrl(url: string): boolean {
    if (url.trim()) {
        console.warn('Webhook URL saving is disabled. Use the notification proxy instead.');
    }
    return false;
}

export function isWebhookUrlManagedByEnv(): boolean {
    return !!getNotificationProxyUrl();
}

export function isNotificationProxyConfigured(): boolean {
    return !!getNotificationProxyUrl();
}

/**
 * Get notification logs from localStorage
 */
export function getNotificationLogs(): NotificationLog[] {
    if (typeof window === 'undefined') return [];
    const logs = safeStorageGet(NOTIFICATION_LOGS_KEY);
    if (!logs) return [];
    try {
        return JSON.parse(logs) as NotificationLog[];
    } catch (error) {
        console.warn('Failed to parse notification logs:', error);
        safeStorageRemove(NOTIFICATION_LOGS_KEY);
        return [];
    }
}

/**
 * Save notification log
 */
function saveNotificationLog(log: NotificationLog): void {
    const logs = getNotificationLogs();
    logs.unshift(log); // Add to beginning
    if (logs.length > 50) logs.pop(); // Keep max 50 logs
    safeStorageSet(NOTIFICATION_LOGS_KEY, JSON.stringify(logs));
}


/**
 * Send notification via configured proxy
 */
export async function sendGoogleChatNotification(payload: NotificationPayload): Promise<boolean> {
    const proxyUrl = getNotificationProxyUrl();
    if (!proxyUrl) {
        console.warn('Notification proxy URL이 설정되지 않았습니다.');
        return false;
    }
    const token = await getAuthToken();
    if (!token) {
        console.warn('Notification auth token is missing.');
        return false;
    }
    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const success = response.ok;

        // Log the notification
        saveNotificationLog({
            id: `notif_${Date.now()}`,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            sentAt: new Date().toISOString(),
            channel: 'google_chat',
            success,
            targetCount: payload.targetUsers?.length
        });

        return success;
    } catch (error) {
        console.error('Google Chat 알림 전송 실패:', error);

        // Log failed attempt
        saveNotificationLog({
            id: `notif_${Date.now()}`,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            sentAt: new Date().toISOString(),
            channel: 'google_chat',
            success: false,
            targetCount: payload.targetUsers?.length
        });

        return false;
    }
}

/**
 * Send test notification
 */
export async function sendTestNotification(): Promise<boolean> {
    return sendGoogleChatNotification({
        type: 'test',
        title: '연결 테스트',
        message: '성과평가 시스템과 Google Chat이 성공적으로 연결되었습니다! 🎉'
    });
}

/**
 * Send evaluation reminder to specific users
 */
export async function sendEvaluationReminder(
    evaluationTitle: string,
    dueDate: string,
    targetUsers: string[]
): Promise<boolean> {
    return sendGoogleChatNotification({
        type: 'evaluation_reminder',
        title: `평가 참여 요청: ${evaluationTitle}`,
        message: `아직 평가에 참여하지 않은 ${targetUsers.length}명에게 알림을 보냅니다.\n마감일이 얼마 남지 않았습니다. 서둘러 평가를 완료해주세요!`,
        targetUsers,
        dueDate
    });
}

/**
 * Send deadline warning
 */
export async function sendDeadlineWarning(
    evaluationTitle: string,
    daysRemaining: number,
    dueDate: string
): Promise<boolean> {
    return sendGoogleChatNotification({
        type: 'evaluation_deadline',
        title: `마감 D-${daysRemaining}: ${evaluationTitle}`,
        message: `평가 마감이 ${daysRemaining}일 남았습니다. 아직 완료하지 않은 평가가 있다면 서둘러 제출해주세요.`,
        dueDate
    });
}

/**
 * Mock: Simulate reminder for demo purposes
 * In production, this would be triggered by a backend scheduler
 * Caller must invoke the returned cleanup function to avoid leaking intervals.
 */
export function scheduleAutoReminder(
    _evaluationId: string,
    _evaluationTitle: string,
    dueDate: Date,
    onRemind: (daysRemaining: number) => void
): () => void {
    const checkReminder = () => {
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

        // Trigger reminders at D-3 and D-1
        if (daysRemaining === 3 || daysRemaining === 1) {
            onRemind(daysRemaining);
        }
    };

    // Check daily (in production, this would be a cron job)
    const intervalId = setInterval(checkReminder, 24 * 60 * 60 * 1000);

    // Initial check
    checkReminder();

    // Return cleanup function
    return () => clearInterval(intervalId);
}
