import React, { memo, useMemo } from 'react';

import { ScoreDistribution } from '../../types/dashboard';

interface ScoreDistributionChartProps {
    data: ScoreDistribution[];
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = memo(({ data }) => {
    const total = useMemo(() => data.reduce((acc, cur) => acc + cur.count, 0), [data]);

    // Calculate donut segments
    const segments = useMemo(() => {
        let accumulatedAngle = 0;
        return data.map((item) => {
            const percentage = item.count / total;
            const angle = percentage * 360;
            const startAngle = accumulatedAngle;
            const endAngle = startAngle + angle;
            accumulatedAngle = endAngle;

            // Calculate SVG arc path
            const x1 = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            return {
                ...item,
                percentage: Math.round(percentage * 100),
                path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
            };
        });
    }, [data, total]);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
                    {segments.map((segment, _) => (
                        <path
                            key={segment.grade}
                            d={segment.path}
                            fill={segment.color}
                            stroke="hsl(var(--card))"
                            strokeWidth="2"
                        />
                    ))}
                    {/* Inner circle for donut effect */}
                    <circle cx="50" cy="50" r="25" fill="hsl(var(--card))" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-foreground">{total}</span>
                    <span className="text-xs text-muted-foreground font-medium">TOTAL</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6 w-full px-4">
                {data.map((item) => (
                    <div key={item.grade} className="flex items-center justify-between">
                        <div className="flex items-center">
                            {}
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                            <span className="text-sm text-muted-foreground font-medium">{item.grade}등급</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm font-bold text-foreground mr-2">{item.count}명</span>
                            <span className="text-xs text-muted-foreground">
                                ({Math.round((item.count / total) * 100)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

ScoreDistributionChart.displayName = 'ScoreDistributionChart';
