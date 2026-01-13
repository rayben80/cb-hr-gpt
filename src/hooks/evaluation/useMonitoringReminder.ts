import { useCallback, useState } from 'react';
import { Evaluation } from '../../constants';
import { ParticipantStatus } from './monitoringTypes';
import { isNotificationProxyConfigured, sendEvaluationReminder } from '../../services/notificationService';

type RemindResult = 'idle' | 'success' | 'error' | 'no_webhook';

export const useMonitoringReminder = (participants: ParticipantStatus[], evaluation: Evaluation) => {
    const [remindSending, setRemindSending] = useState(false);
    const [remindResult, setRemindResult] = useState<RemindResult>('idle');

    const handleRemindAll = useCallback(async () => {
        if (!isNotificationProxyConfigured()) {
            setRemindResult('no_webhook');
            setTimeout(() => setRemindResult('idle'), 3000);
            return;
        }
        setRemindSending(true);
        setRemindResult('idle');
        const incompleteUsers = participants
            .filter((p) => p.status === 'not_started' || p.status === 'in_progress' || p.status === 'resubmit_requested')
            .map((p) => p.name);
        const success = await sendEvaluationReminder(evaluation.name, evaluation.endDate || '미정', incompleteUsers);
        setRemindSending(false);
        setRemindResult(success ? 'success' : 'error');
        setTimeout(() => setRemindResult('idle'), 3000);
    }, [participants, evaluation]);

    return {
        remindSending,
        remindResult,
        handleRemindAll,
    };
};
