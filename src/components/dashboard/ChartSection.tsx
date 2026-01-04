import React, { lazy, memo, Suspense } from 'react';
import { CapabilityRadarData, DepartmentPerformance, ScoreDistribution } from '../../types/dashboard';
import { Card, ErrorBoundary, Skeleton } from '../common';

// Lazy load chart components for code splitting
const ScoreDistributionChart = lazy(() =>
    import('./ScoreDistributionChart').then((module) => ({ default: module.ScoreDistributionChart }))
);
const DepartmentPerformanceChart = lazy(() =>
    import('./DepartmentPerformanceChart').then((module) => ({ default: module.DepartmentPerformanceChart }))
);
const RadarChart = lazy(() => import('./RadarChart').then((module) => ({ default: module.RadarChart })));

interface ChartSectionProps {
    isTeamLeader: boolean;
    distributionData: ScoreDistribution[];
    deptPerformanceData: DepartmentPerformance[];
    radarData: CapabilityRadarData[];
    isLoading?: boolean;
}

/** Chart loading fallback component */
const ChartLoadingFallback = ({ variant }: { variant: 'circular' | 'rectangular' }) => (
    <div className="flex justify-center items-center h-[250px]">
        <Skeleton
            variant={variant}
            width={variant === 'circular' ? 200 : '100%'}
            height={variant === 'circular' ? 200 : 250}
        />
    </div>
);

export const ChartSection: React.FC<ChartSectionProps> = memo(
    ({ isTeamLeader, distributionData, deptPerformanceData, radarData, isLoading = false }) => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {isTeamLeader ? '팀원 등급 분포' : '평가 등급 분포'}
                    </h2>
                    <button disabled className="text-sm text-muted-foreground cursor-not-allowed opacity-50">
                        더보기
                    </button>
                </div>
                <ErrorBoundary>
                    {isLoading ? (
                        <Skeleton variant="circular" width={200} height={200} className="mx-auto" />
                    ) : (
                        <Suspense fallback={<ChartLoadingFallback variant="circular" />}>
                            <ScoreDistributionChart data={distributionData} />
                        </Suspense>
                    )}
                </ErrorBoundary>
            </Card>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {isTeamLeader ? '팀원별 성과 현황' : '팀별 성과 현황'}
                    </h2>
                    <button disabled className="text-sm text-muted-foreground cursor-not-allowed opacity-50">
                        상세 비교
                    </button>
                </div>
                <ErrorBoundary>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height={250} className="rounded-md" />
                    ) : (
                        <Suspense fallback={<ChartLoadingFallback variant="rectangular" />}>
                            <DepartmentPerformanceChart data={deptPerformanceData} />
                        </Suspense>
                    )}
                </ErrorBoundary>
            </Card>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">
                        {isTeamLeader ? '팀 역량 진단' : '본부 역량 진단'}
                    </h2>
                    <button disabled className="text-sm text-muted-foreground cursor-not-allowed opacity-50">
                        분석 리포트
                    </button>
                </div>
                <ErrorBoundary>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Skeleton variant="circular" width={250} height={250} />
                        </div>
                    ) : (
                        <Suspense fallback={<ChartLoadingFallback variant="circular" />}>
                            <div className="flex justify-center items-center h-[300px]">
                                <RadarChart data={radarData} />
                            </div>
                        </Suspense>
                    )}
                </ErrorBoundary>
            </Card>
        </div>
    )
);
ChartSection.displayName = 'ChartSection';
