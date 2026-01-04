import { Bell, Info, ShieldCheck, Sun, User } from '@phosphor-icons/react';
import { useState } from 'react';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { ProfileSettings } from './settings/ProfileSettings';
import { SecuritySettings } from './settings/SecuritySettings';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('프로필');
    const settingsTabs: { id: string; label: string; icon: React.ElementType }[] = [
        { id: '프로필', label: '프로필', icon: User },
        { id: '알림', label: '알림 및 일정', icon: Bell },
        { id: '화면', label: '화면 설정', icon: Sun },
        { id: '보안', label: '보안 및 계정', icon: ShieldCheck },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case '프로필':
                return <ProfileSettings />;
            case '보안':
                return <SecuritySettings />;
            case '알림':
                return <NotificationSettings />;
            case '화면':
                return <AppearanceSettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">설정</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">계정 정보 및 환경 설정을 관리합니다.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/4">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 sticky top-8">
                        <nav className="space-y-1">
                            {settingsTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-lg text-left transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                >
                                    <tab.icon
                                        className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-primary' : 'text-slate-400'}`}
                                        weight={activeTab === tab.id ? 'fill' : 'regular'}
                                    />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 px-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Support</p>
                            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary flex items-center mb-2">
                                <Info className="w-4 h-4 mr-2" weight="regular" /> 도움말 센터
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-3/4">{renderContent()}</div>
            </div>
        </>
    );
};

export default SettingsPage;
