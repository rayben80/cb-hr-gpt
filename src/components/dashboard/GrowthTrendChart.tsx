import React, { memo, useMemo } from 'react';

interface GrowthTrendChartProps {
    data: { period: string; score: number }[];
}

export const GrowthTrendChart: React.FC<GrowthTrendChartProps> = memo(({ data }) => {
    const maxScore = 100;
    const padding = 30;
    const width = 500;
    const height = 200;

    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    const points = useMemo(() => {
        return data.map((d, i) => {
            const x = padding + (i * (chartWidth / (data.length - 1)));
            const y = height - padding - (d.score / maxScore * chartHeight);
            return { x, y, ...d };
        });
    }, [data, chartWidth, chartHeight]);

    const pathD = useMemo(() => {
        if (points.length === 0) return '';
        const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        return d;
    }, [points]);

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(tick => {
                        const y = height - padding - (tick / maxScore * chartHeight);
                        return (
                            <g key={tick}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" className="text-muted-foreground" />
                                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground">{tick}</text>
                            </g>
                        );
                    })}

                    {/* X Axis Labels */}
                    {points.map((p, i) => (
                        <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="text-xs fill-muted-foreground font-medium">{p.period}</text>
                    ))}

                    {/* Line Path */}
                    <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <g key={i} className="group">
                            <circle cx={p.x} cy={p.y} r="5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" className="transition-all group-hover:r-7" />
                            {/* Tooltip-ish text always visible for now for simplicity */}
                            <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-xs font-bold fill-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                {p.score}점
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
});

GrowthTrendChart.displayName = 'GrowthTrendChart';
