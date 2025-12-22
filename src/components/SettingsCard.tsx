import React, { ReactNode } from 'react';

interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children }) => (
    <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);