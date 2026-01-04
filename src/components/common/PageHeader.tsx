import React, { memo } from 'react';

interface PageHeaderProps {
    title: string;
    description?: React.ReactNode;
    badge?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = memo(({ title, description, badge, action, className = '' }) => {
    return (
        <div className={`mb-8 flex items-center justify-between ${className}`}>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        {title}
                    </h1>
                    {badge}
                </div>
                {description && <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">{description}</p>}
            </div>
            {action}
        </div>
    );
});

PageHeader.displayName = 'PageHeader';
