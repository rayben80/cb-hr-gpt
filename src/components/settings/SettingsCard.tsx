import React, { ReactNode } from 'react';

interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-slate-900/50">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);