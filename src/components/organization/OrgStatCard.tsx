import React, { memo } from 'react';
import { Icon } from '../common';

interface OrgStatCardProps {
    icon: string;
    title: string;
    value: number;
    iconBgColor: string;
}

export const OrgStatCard: React.FC<OrgStatCardProps> = memo(({ icon, title, value, iconBgColor }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-full ${iconBgColor}`}>
                <Icon path={icon} className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}명</p>
            </div>
        </div>
    );
});

OrgStatCard.displayName = 'OrgStatCard';