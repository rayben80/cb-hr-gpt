import { useCallback, useEffect, useState } from 'react';
import { isNotificationProxyConfigured, sendTestNotification } from '../../services/notificationService';
import { showWarning } from '../../utils/toast';

type TestStatus = 'idle' | 'sending' | 'success' | 'error';

export const useWebhookTest = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [isReadOnly, setIsReadOnly] = useState(true);

    useEffect(() => {
        setIsReadOnly(true);
        setWebhookUrl('');
    }, []);

    const handleWebhookChange = useCallback((url: string) => {
        if (isReadOnly) return;
        setWebhookUrl(url);
    }, [isReadOnly]);

    const handleTestWebhook = useCallback(async () => {
        if (!isNotificationProxyConfigured()) {
            showWarning('알림 프록시가 설정되지 않았습니다.');
            return;
        }

        setTestStatus('sending');
        try {
            const success = await sendTestNotification();
            setTestStatus(success ? 'success' : 'error');
            setTimeout(() => setTestStatus('idle'), 3000);
        } catch {
            setTestStatus('error');
            setTimeout(() => setTestStatus('idle'), 3000);
        }
    }, []);

    return { webhookUrl, testStatus, handleWebhookChange, handleTestWebhook, isReadOnly };
};
