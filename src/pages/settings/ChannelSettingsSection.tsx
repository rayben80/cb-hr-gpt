import { ChatCircle, Envelope } from '@phosphor-icons/react';

interface ChannelSettingsSectionProps {
    webhookUrl: string;
    testStatus: 'idle' | 'sending' | 'success' | 'error';
    onWebhookChange: (url: string) => void;
    onTestWebhook: () => void;
    webhookReadOnly?: boolean;
}

export const ChannelSettingsSection = ({
    webhookUrl,
    testStatus,
    onWebhookChange,
    onTestWebhook,
    webhookReadOnly = false,
}: ChannelSettingsSectionProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
            <input
                type="checkbox"
                className="h-5 w-5 text-primary rounded focus:ring-primary"
                defaultChecked
                aria-label="이메일 알림"
            />
            <div className="ml-3 flex-1">
                <span className="text-sm font-bold text-slate-900 flex items-center">
                    <Envelope className="w-4 h-4 mr-2" weight="regular" /> 이메일
                </span>
                <span className="text-xs text-slate-500 mt-0.5">주요 공지 및 주간 리포트</span>
            </div>
        </label>
        <div className="bg-slate-50 rounded-xl border border-slate-200 transition-colors">
            <label className="flex items-center p-4 cursor-pointer hover:bg-slate-100 rounded-t-xl transition-colors">
                <input
                    type="checkbox"
                    className="h-5 w-5 text-primary rounded focus:ring-primary"
                    defaultChecked
                    aria-label="Google Chat 알림"
                />
                <div className="ml-3 flex-1">
                    <span className="text-sm font-bold text-slate-900 flex items-center">
                        <ChatCircle className="w-4 h-4 mr-2" weight="regular" /> Google Chat
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">실시간 알림 (Webhook)</span>
                </div>
            </label>
            <div className="px-4 pb-4 space-y-2">
                <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => onWebhookChange(e.target.value)}
                    placeholder="https://chat.googleapis.com/v1/spaces/..."
                    className="w-full text-xs border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                    aria-label="Webhook URL"
                    disabled={webhookReadOnly}
                />
                {webhookReadOnly && (
                    <p className="text-[10px] text-slate-400">* 서버 프록시로 관리 중이라 브라우저에서 수정할 수 없습니다.</p>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">* Google Chat Space → Manage webhooks에서 URL 복사</p>
                    <button
                        onClick={onTestWebhook}
                        disabled={testStatus === 'sending'}
                        className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                            testStatus === 'success'
                                ? 'bg-green-100 text-green-700'
                                : testStatus === 'error'
                                  ? 'bg-red-100 text-red-700'
                                  : testStatus === 'sending'
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                    >
                        {testStatus === 'sending'
                            ? '전송 중...'
                            : testStatus === 'success'
                              ? '✓ 성공!'
                              : testStatus === 'error'
                                ? '✗ 실패'
                                : '테스트 발송'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
