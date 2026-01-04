import { Bell, Calendar, Moon } from '@phosphor-icons/react';
import { useState } from 'react';
import { SettingsCard } from '../../components/settings/SettingsCard';
import { ChannelSettingsSection } from './ChannelSettingsSection';
import { SectionHeader, Toggle } from './SettingsComponents';
import { useWebhookTest } from './useWebhookTest';

export const NotificationSettings = () => {
    const [googleSync, setGoogleSync] = useState(true);
    const [dnd, setDnd] = useState(false);
    const { webhookUrl, testStatus, handleWebhookChange, handleTestWebhook, isReadOnly } = useWebhookTest();

    return (
        <SettingsCard title="알림 및 일정" description="다양한 채널로 중요한 알림을 받아보세요.">
            <div className="space-y-8">
                <div>
                    <SectionHeader icon={Calendar} title="일정 동기화" />
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <Toggle
                            label="Google Calendar 동기화"
                            description="평가 마감일, 면담 일정 등을 내 캘린더에 자동으로 등록합니다."
                            enabled={googleSync}
                            setEnabled={setGoogleSync}
                        />
                    </div>
                </div>

                <div>
                    <SectionHeader icon={Bell} title="수신 채널 설정" />
                    <ChannelSettingsSection
                        webhookUrl={webhookUrl}
                        testStatus={testStatus}
                        onWebhookChange={handleWebhookChange}
                        onTestWebhook={handleTestWebhook}
                        webhookReadOnly={isReadOnly}
                    />
                </div>

                <div>
                    <SectionHeader icon={Moon} title="방해 금지 모드" />
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <Toggle
                            label="퇴근 시간 알림 끄기"
                            description="오후 7시 ~ 오전 8시 사이에는 알림을 보내지 않습니다."
                            enabled={dnd}
                            setEnabled={setDnd}
                        />
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};
