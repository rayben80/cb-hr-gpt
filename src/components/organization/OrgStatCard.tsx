import React, { memo } from 'react';
import { Icon } from '../common';

interface OrgStatCardProps {
    icon: string;
    title: string;
    value: number;
    iconBgColor: string;
    onClick?: () => void;
    isActive?: boolean;
}

export const OrgStatCard: React.FC<OrgStatCardProps> = memo(({ icon, title, value, iconBgColor, onClick, isActive = false }) => {
    const isInteractive = typeof onClick === 'function';
    const baseClass = `bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4 w-full text-left transition-all ${
        isInteractive ? 'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500' : ''
    } ${isActive ? 'ring-2 ring-sky-500' : ''}`;

    const content = (
        <>
            <div className={`p-3 rounded-full ${iconBgColor}`}>
                <Icon path={icon} className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}명</p>
            </div>
        </>
    );

    if (isInteractive) {
        return (
            <button type="button" className={baseClass} onClick={onClick} aria-pressed={isActive}>
                {content}
            </button>
        );
    }

    return (
        <div className={baseClass}>
            {content}
        </div>
    );
});

OrgStatCard.displayName = 'OrgStatCard';
