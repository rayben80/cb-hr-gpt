import { Desktop, DeviceMobile, ShieldCheck } from '@phosphor-icons/react';
import { SettingsCard } from '../../components/settings/SettingsCard';
import { SectionHeader } from './SettingsComponents';

export const SecuritySettings = () => {
    return (
        <SettingsCard title="보안 및 계정" description="안전한 계정 관리를 위한 설정입니다.">
            <div className="space-y-6">
                <div>
                    <SectionHeader icon={ShieldCheck} title="연동된 계정" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm">
                                <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-bold text-slate-900">Google Workspace</p>
                                <p className="text-xs text-slate-500">Connected since 2024.01.01</p>
                            </div>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            Connected
                        </span>
                    </div>
                </div>

                <div>
                    <SectionHeader icon={Desktop} title="현재 로그인된 기기" />
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="flex items-center">
                                <Desktop className="w-8 h-8 text-slate-400 p-1" weight="regular" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-slate-900">Chrome on Windows</p>
                                    <p className="text-xs text-green-600 font-medium">현재 활동 중</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">Seoul, KR</span>
                        </div>
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors opacity-60">
                            <div className="flex items-center">
                                <DeviceMobile className="w-8 h-8 text-slate-400 p-1" weight="regular" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-slate-900">Safari on iPhone 15</p>
                                    <p className="text-xs text-slate-500">2시간 전</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">Seoul, KR</span>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};
