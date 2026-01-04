import { GraduationCap, PauseCircle, UserCheck, UserMinus, Users } from '@phosphor-icons/react';
import { memo } from 'react';
import { OrgStatCard } from './OrgStatCard';

interface OrgStats {
    total: number;
    active: number;
    intern: number;
    onLeave: number;
    resigned: number;
}

interface OrgStatsSectionProps {
    stats: OrgStats;
    statusFilter: 'all' | 'active' | 'intern' | 'on_leave' | 'resigned';
    onStatusFilter: (filter: 'all' | 'active' | 'intern' | 'on_leave' | 'resigned') => void;
}

export const OrgStatsSection = memo(({ stats, statusFilter, onStatusFilter }: OrgStatsSectionProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <OrgStatCard
            icon={Users}
            title="전체 인원"
            value={stats.total}
            variant="default"
            isActive={statusFilter === 'all'}
            onClick={() => onStatusFilter('all')}
        />
        <OrgStatCard
            icon={UserCheck}
            title="재직"
            value={stats.active}
            variant="success"
            isActive={statusFilter === 'active'}
            onClick={() => onStatusFilter('active')}
        />
        <OrgStatCard
            icon={GraduationCap}
            title="인턴"
            value={stats.intern}
            variant="info"
            isActive={statusFilter === 'intern'}
            onClick={() => onStatusFilter('intern')}
        />
        <OrgStatCard
            icon={PauseCircle}
            title="휴직"
            value={stats.onLeave}
            variant="warning"
            isActive={statusFilter === 'on_leave'}
            onClick={() => onStatusFilter('on_leave')}
        />
        <OrgStatCard
            icon={UserMinus}
            title="퇴사"
            value={stats.resigned}
            variant="neutral"
            isActive={statusFilter === 'resigned'}
            onClick={() => onStatusFilter('resigned')}
        />
    </div>
));

OrgStatsSection.displayName = 'OrgStatsSection';
