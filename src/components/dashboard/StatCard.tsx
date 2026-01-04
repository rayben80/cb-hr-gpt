import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import React, { memo } from 'react';

import { Skeleton } from '../common';

export interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    iconBgColor: string;
    isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = memo(
    ({ icon: IconComponent, title, value, change, changeType, iconBgColor, isLoading = false }) => {
        if (isLoading) {
            return (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-[1.5rem] p-6 flex items-center space-x-6">
                    <Skeleton variant="circular" width={56} height={56} />
                    <div className="space-y-2 flex-1">
                        <Skeleton width={60} height={16} />
                        <Skeleton width={100} height={32} />
                        <Skeleton width={120} height={16} />
                    </div>
                </div>
            );
        }

        const isPositive = changeType === 'positive';

        return (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-[1.5rem] p-6 flex items-center space-x-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group">
                {/* Icon with gradient background */}
                <div
                    className={`p-4 rounded-2xl ${iconBgColor} shadow-md transition-transform duration-200 group-hover:scale-105`}
                >
                    <IconComponent className="w-7 h-7 text-white" weight="duotone" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{value}</p>
                    <div className="flex items-center mt-2 text-sm">
                        {isPositive ? (
                            <ArrowUp className="w-4 h-4 mr-1 text-emerald-500" weight="bold" />
                        ) : (
                            <ArrowDown className="w-4 h-4 mr-1 text-red-500" weight="bold" />
                        )}
                        <span className={`${isPositive ? 'text-emerald-500' : 'text-red-500'} font-semibold`}>
                            {change}
                        </span>
                        <span className="text-muted-foreground ml-1.5">지난 분기 대비</span>
                    </div>
                </div>
            </div>
        );
    }
);

StatCard.displayName = 'StatCard';
