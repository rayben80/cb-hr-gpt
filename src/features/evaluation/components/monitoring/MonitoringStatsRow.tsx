import React, { memo } from 'react';
import { MonitoringStats } from '@/hooks/evaluation/monitoringTypes';

const StatCard = memo(
    ({ value, label, color = 'text-slate-900' }: { value: number; label: string; color?: string }) => (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{label}</div>
        </div>
    )
);
StatCard.displayName = 'StatCard';

interface MonitoringStatsRowProps {
    stats: MonitoringStats;
}

export const MonitoringStatsRow: React.FC<MonitoringStatsRowProps> = ({ stats }) => (
    <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4">
        <StatCard value={stats.total} label="총 대상자" />
        <StatCard value={stats.completed} label="완료" color="text-green-600" />
        <StatCard value={stats.inProgress} label="진행 중" color="text-primary" />
        <StatCard value={stats.notStarted} label="미시작" color="text-red-500" />
    </div>
);
