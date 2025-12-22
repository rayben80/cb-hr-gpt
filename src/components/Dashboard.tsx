import React, { memo, useMemo } from 'react';
import { Icon } from './common';
import { ICONS, currentUser } from '../constants';
import { TestErrorComponent } from './TestErrorComponent';

interface StatCardProps {
    icon: string;
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = memo(({ icon, title, value, change, changeType, iconBgColor }) => {
    const isPositive = changeType === 'positive';
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-6">
            <div className={`p-4 rounded-full ${iconBgColor}`}>
                <Icon path={icon} className="w-7 h-7 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                <div className="flex items-center mt-2 text-sm">
                    <Icon path={isPositive ? ICONS.arrowUp : ICONS.arrowDown} className={`w-4 h-4 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} font-semibold`}>{change}</span>
                    <span className="text-slate-500 ml-1">지난 분기 대비</span>
                </div>
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';

interface ActivityItemProps {
    avatar: string;
    name: string;
    action: string;
    target: string;
    time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = memo(({ avatar, name, action, target, time }) => (
    <div className="flex items-start space-x-4 py-4">
        <img className="h-10 w-10 rounded-full object-cover" src={avatar} alt={`${name} avatar`} />
        <div className="flex-1">
            <p className="text-sm text-slate-800">
                <span className="font-semibold">{name}</span>
                {`님이 '${target}'${action}`}
            </p>
            <p className="text-xs text-slate-400 mt-1">{time}</p>
        </div>
    </div>
));

ActivityItem.displayName = 'ActivityItem';

const Dashboard: React.FC = memo(() => {
    const stats: StatCardProps[] = useMemo(() => [
        { icon: ICONS.users, title: '총 팀원', value: '15명', change: '2명', changeType: 'positive', iconBgColor: 'bg-blue-500' },
        { icon: ICONS.shieldCheck, title: '완료된 평가', value: '76건', change: '5건', changeType: 'positive', iconBgColor: 'bg-green-500' },
        { icon: ICONS.clock, title: '진행중 평가', value: '8건', change: '3건', changeType: 'negative', iconBgColor: 'bg-yellow-500' },
        { icon: ICONS.briefcase, title: '평가 참여율', value: '95%', change: '5%', changeType: 'positive', iconBgColor: 'bg-indigo-500' }
    ], []);

    const activities = useMemo(() => [
        { avatar: 'https://ui-avatars.com/api/?name=장주휘&background=0D8ABC&color=fff', name: '장주휘', action: '님의 2분기 목표를 승인했습니다.', target: '최민', time: '2시간 전' },
        { avatar: 'https://ui-avatars.com/api/?name=정현옥&background=random&color=fff', name: '정현옥', action: '에 새 멤버를 추가했습니다.', target: '기술지원파트', time: '어제' },
        { avatar: 'https://ui-avatars.com/api/?name=조병철&background=random&color=fff', name: '조병철', action: '님께 동료 피드백을 요청했습니다.', target: '김다민', time: '3일 전' },
        { avatar: 'https://ui-avatars.com/api/?name=Sys&background=64748b&color=fff', name: '시스템', action: ' : 새로운 평가 사이클이 시작되었습니다.', target: '3분기 성과 평가', time: '지난 주' },
    ], []);

    return (
      <>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
            <p className="text-lg text-slate-600 mt-1">{currentUser.name}님, 환영합니다! 👋</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
        </div>
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">최근 활동</h2>
            <div className="divide-y divide-slate-200">
                {activities.map((activity, index) => <ActivityItem key={index} {...activity} />)}
            </div>
        </div>
        {import.meta.env.DEV && (
          <div className="mt-8">
            <TestErrorComponent />
          </div>
        )}
      </>
    );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
