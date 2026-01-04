import React, { memo } from 'react';
import { Card } from '../common';

export type StatCardVariant = 'default' | 'success' | 'info' | 'warning' | 'neutral' | 'destructive';

interface OrgStatCardProps {
    icon: React.ElementType;
    title: string;
    value: number;
    variant?: StatCardVariant;
    iconBgColor?: string; // Deprecated, but keeping for backward compat momentarily if needed, though we will remove usage.
    onClick?: () => void;
    isActive?: boolean;
}

export const OrgStatCard: React.FC<OrgStatCardProps> = memo(
    ({ icon: IconComponent, title, value, variant = 'default', iconBgColor, onClick, isActive = false }) => {
        const isInteractive = typeof onClick === 'function';

        // Semantic gradient mapping
        const getGradientClass = (v: StatCardVariant) => {
            switch (v) {
                case 'success':
                    return 'bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(var(--success)/0.8)]';
                case 'info':
                    return 'bg-gradient-to-br from-[hsl(var(--info))] to-[hsl(var(--info)/0.8)]';
                case 'warning':
                    return 'bg-gradient-to-br from-[hsl(var(--warning))] to-[hsl(var(--warning)/0.8)]';
                case 'neutral':
                    return 'bg-gradient-to-br from-[hsl(var(--neutral))] to-[hsl(var(--neutral)/0.8)]';
                case 'destructive':
                    return 'bg-gradient-to-br from-[hsl(var(--destructive))] to-[hsl(var(--destructive)/0.8)]';
                case 'default':
                default:
                    // Default maps to Primary gradient usually, or Slate for Total?
                    // For 'Total' (default), let's use the Primary Theme Gradient to make it prominent and themed.
                    // Or sticky to Slate if it's meant to be neutral.
                    // Given the user wants "Total" to also change, using 'primary' variable is best.
                    return 'bg-gradient-to-br from-primary to-primary/80';
            }
        };

        const gradientClass = iconBgColor || getGradientClass(variant);

        const content = (
            <>
                <div className={`p-3 rounded-full ${gradientClass}`}>
                    <IconComponent className="w-6 h-6 text-white" weight="fill" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}명</p>
                </div>
            </>
        );

        if (isInteractive) {
            return (
                <Card
                    as="button"
                    type="button"
                    className={`p-5 rounded-xl flex items-center space-x-4 w-full text-left transition-all hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary ${isActive ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                    onClick={onClick}
                    aria-pressed={isActive}
                >
                    {content}
                </Card>
            );
        }

        return (
            <Card
                className={`p-5 rounded-xl flex items-center space-x-4 w-full ${isActive ? 'ring-2 ring-primary bg-primary/10' : ''}`}
            >
                {content}
            </Card>
        );
    }
);

OrgStatCard.displayName = 'OrgStatCard';
