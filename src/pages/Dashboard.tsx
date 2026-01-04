import { Button, ErrorBoundary, PageHeader } from '@/components/common';
import { ChartSection, InsightSection, StatCard } from '@/components/dashboard';
import { currentUser } from '@/constants';
import { useDashboardStats } from '@/hooks';
import { exportDashboardToPDF } from '@/services/pdfExportService';
import { DownloadSimple } from '@phosphor-icons/react';
import React, { memo, useRef, useState } from 'react';

const Dashboard: React.FC = memo(() => {
    const { isTeamLeader, teamName, stats, distributionData, deptPerformanceData, radarData, insights, topPerformers } =
        useDashboardStats();

    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const scopeLabel = isTeamLeader ? teamName || '내 팀' : '클라우드사업본부';
    const scopeSubtitle = isTeamLeader ? '팀 성과 현황을 한눈에 확인하세요.' : '본부 성과 현황을 한눈에 확인하세요.';

    const handleExportPDF = async () => {
        if (!dashboardRef.current) return;
        setIsExporting(true);
        try {
            await exportDashboardToPDF(dashboardRef.current, isTeamLeader ? teamName : undefined);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <PageHeader
                title="성과 대시보드"
                badge={
                    isTeamLeader && (
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                            {scopeLabel}
                        </span>
                    )
                }
                description={`${currentUser.name}님, ${scopeSubtitle}`}
                action={
                    <Button variant="default" onClick={handleExportPDF} disabled={isExporting}>
                        <DownloadSimple className="w-5 h-5 mr-2" weight="bold" />
                        {isExporting ? 'PDF 생성 중...' : 'PDF 내보내기'}
                    </Button>
                }
            />
            <div ref={dashboardRef}>
                <ErrorBoundary
                    fallback={<div className="p-8 text-center text-slate-500">주요 지표를 불러올 수 없습니다.</div>}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
                        {stats.map((stat) => (
                            <StatCard key={stat.title} {...stat} isLoading={isLoading} />
                        ))}
                    </div>
                </ErrorBoundary>
                <ErrorBoundary
                    fallback={<div className="p-8 text-center text-slate-500">차트 데이터를 불러올 수 없습니다.</div>}
                >
                    <ChartSection
                        isTeamLeader={isTeamLeader}
                        distributionData={distributionData}
                        deptPerformanceData={deptPerformanceData}
                        radarData={radarData}
                        isLoading={isLoading}
                    />
                </ErrorBoundary>
                <ErrorBoundary
                    fallback={<div className="p-8 text-center text-slate-500">인사이트 정보를 불러올 수 없습니다.</div>}
                >
                    <InsightSection
                        isTeamLeader={isTeamLeader}
                        insights={insights}
                        topPerformers={topPerformers}
                        isLoading={isLoading}
                    />
                </ErrorBoundary>
            </div>
        </>
    );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
