import React, { useState } from 'react';
import { Icon, InputField } from './common';
import { SettingsCard } from './SettingsCard';
import { ICONS, currentUser } from '../constants';

const NotificationToggle = ({ label, description, enabled, setEnabled }: { label: string, description: string, enabled: boolean, setEnabled: (enabled: boolean) => void }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="font-medium text-slate-800">{label}</p>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
        <button
            type="button"
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${enabled ? 'bg-sky-600' : 'bg-slate-200'}`}
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
        >
            <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            ></span>
        </button>
    </div>
);

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.id]: e.target.value });
    };
    
    return (
        <SettingsCard title="프로필 정보" description="기본 개인 정보를 수정합니다.">
            <form className="space-y-6">
                <div className="flex items-center space-x-6">
                    <img className="h-20 w-20 rounded-full object-cover" src={currentUser.avatar} alt="User avatar" />
                    <button className="bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                        사진 변경
                    </button>
                </div>
                 <InputField label="이름" id="name" name="name" type="text" value={profile.name} onChange={handleChange} placeholder="이름 입력" />
                 <InputField label="직책" id="role" name="role" type="text" value={profile.role} onChange={handleChange} placeholder="직책 입력" />
                 <InputField label="이메일 주소" id="email" name="email" type="email" value={profile.email} onChange={handleChange} placeholder="이메일 주소 입력" />
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                        변경사항 저장
                    </button>
                </div>
            </form>
        </SettingsCard>
    );
};

const SecuritySettings = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.id]: e.target.value });
    };

    return (
        <SettingsCard title="비밀번호 변경" description="계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.">
            <form className="space-y-6">
                 <InputField label="현재 비밀번호" id="currentPassword" name="currentPassword" type="password" value={passwords.currentPassword} onChange={handleChange} placeholder="현재 비밀번호 입력" />
                 <InputField label="새 비밀번호" id="newPassword" name="newPassword" type="password" value={passwords.newPassword} onChange={handleChange} placeholder="새 비밀번호 입력" />
                 <InputField label="새 비밀번호 확인" id="confirmPassword" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handleChange} placeholder="새 비밀번호 확인" />
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                        비밀번호 변경
                    </button>
                </div>
            </form>
        </SettingsCard>
    );
};

const NotificationSettings = () => {
    const [notifications, setNotifications] = useState({
        newEvaluation: true,
        feedbackRequest: true,
        deadlineReminder: true,
        systemUpdate: false,
    });
    
    return (
        <SettingsCard title="알림 설정" description="수신할 알림 종류를 선택합니다.">
            <div className="space-y-6">
                <NotificationToggle 
                    label="새 평가 할당" 
                    description="나에게 새로운 평가가 지정되면 알림을 받습니다."
                    enabled={notifications.newEvaluation}
                    setEnabled={(val) => setNotifications(prev => ({...prev, newEvaluation: val}))}
                />
                <NotificationToggle 
                    label="피드백 요청" 
                    description="동료가 나에게 피드백을 요청하면 알림을 받습니다."
                    enabled={notifications.feedbackRequest}
                    setEnabled={(val) => setNotifications(prev => ({...prev, feedbackRequest: val}))}
                />
                <NotificationToggle 
                    label="마감일 알림" 
                    description="평가 마감일이 다가오면 미리 알림을 받습니다."
                    enabled={notifications.deadlineReminder}
                    setEnabled={(val) => setNotifications(prev => ({...prev, deadlineReminder: val}))}
                />
                 <NotificationToggle 
                    label="시스템 및 공지" 
                    description="중요 시스템 업데이트나 공지사항을 수신합니다."
                    enabled={notifications.systemUpdate}
                    setEnabled={(val) => setNotifications(prev => ({...prev, systemUpdate: val}))}
                />
            </div>
        </SettingsCard>
    );
};

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('프로필');
    const settingsTabs = [
        { id: '프로필', label: '프로필', icon: ICONS.userCircle },
        { id: '보안', label: '보안', icon: ICONS.shieldCheck },
        { id: '알림', label: '알림', icon: ICONS.bell },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case '프로필': return <ProfileSettings />;
            case '보안': return <SecuritySettings />;
            case '알림': return <NotificationSettings />;
            default: return <ProfileSettings />;
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">설정</h1>
                <p className="text-lg text-slate-600 mt-1">계정 정보 및 환경 설정을 관리합니다.</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                        <nav className="space-y-1">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-all ${activeTab === tab.id ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <Icon path={tab.icon} className="w-5 h-5 mr-3" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                <div className="w-full lg:w-3/4">
                   {renderContent()}
                </div>
            </div>
        </>
    );
};

export default SettingsPage;