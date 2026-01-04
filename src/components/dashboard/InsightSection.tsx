import React, { memo } from 'react';
import { Insight, Performer } from '../../types/dashboard';

import { Skeleton } from '../common';

interface InsightSectionProps {
    isTeamLeader: boolean;
    insights: Insight[];
    topPerformers: Performer[];
    isLoading?: boolean;
}

export const InsightSection: React.FC<InsightSectionProps> = memo(
    ({ isTeamLeader, insights, topPerformers, isLoading = false }) => (
        <div className="bg-gradient-to-r from-primary to-accent text-white p-8 rounded-2xl shadow-lg shadow-primary/20 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="mb-6 md:mb-0 w-full md:w-auto">
                <h2 className="text-2xl font-bold mb-2">💡 이달의 인사이트</h2>
                <div className="text-white/80 mb-4 max-w-xl space-y-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton width={300} height={20} className="bg-white/20" />
                            <Skeleton width={250} height={20} className="bg-white/20" />
                            <Skeleton width={280} height={20} className="bg-white/20" />
                        </div>
                    ) : insights.length > 0 ? (
                        insights.map((insight: any, idx: number) => (
                            <p
                                key={idx}
                                className={`flex items-start gap-2 ${insight.type === 'warning' ? 'text-yellow-300' : ''}`}
                            >
                                <span>{insight.type === 'positive' ? '✅' : '⚠️'}</span>
                                <span>{insight.message}</span>
                            </p>
                        ))
                    ) : (
                        <p>분석 데이터가 부족합니다.</p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/10 transition-colors">
                        상세 리포트 보기
                    </button>
                </div>
            </div>
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm min-w-[250px] w-full md:w-auto">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide mb-3">
                    {isTeamLeader ? 'Top Performer (팀원)' : 'Top Performer (팀)'}
                </h3>
                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton width={200} height={24} className="bg-white/20" />
                        <Skeleton width={200} height={24} className="bg-white/20" />
                        <Skeleton width={200} height={24} className="bg-white/20" />
                    </div>
                ) : (
                    topPerformers.slice(0, 3).map((performer: any, idx: number) => (
                        <div key={performer.name} className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                                {idx + 1}. {performer.name}
                            </span>
                            <span className="font-bold text-green-400">{performer.score.toFixed(1)}점</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
);
InsightSection.displayName = 'InsightSection';
