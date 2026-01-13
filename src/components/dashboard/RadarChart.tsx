import React, { memo, useMemo } from 'react';

import { CapabilityRadarData } from '../../types/dashboard';

interface RadarChartProps {
    data: CapabilityRadarData[];
    color?: string;
}

// 폴리곤 포인트 계산 헬퍼 함수
const calculatePolygonPoints = (
    data: CapabilityRadarData[],
    center: number,
    radius: number,
    angleStep: number,
    scale: number = 1
): string => {
    return data
        .map((d, i) => {
            const angle = Math.PI / 2 + i * angleStep;
            const valueRatio = 'value' in d ? d.value / 100 : scale;
            const r = radius * valueRatio * scale;
            const x = center + Math.cos(angle) * r;
            const y = center - Math.sin(angle) * r;
            return `${x},${y}`;
        })
        .join(' ');
};

// 배경 폴리곤 계산 함수
const calculateBackgroundPolygons = (
    dataLength: number,
    center: number,
    radius: number,
    angleStep: number
): string[] => {
    const scales = [1, 0.75, 0.5, 0.25];
    return scales.map((scale) => {
        const points: string[] = [];
        for (let i = 0; i < dataLength; i++) {
            const angle = Math.PI / 2 + i * angleStep;
            const r = radius * scale;
            const x = center + Math.cos(angle) * r;
            const y = center - Math.sin(angle) * r;
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    });
};

export const RadarChart: React.FC<RadarChartProps> = memo(({ data, color = '#1D8ACF' }) => {
    const size = 200;
    const center = size / 2;
    const radius = size / 2 - 30;
    const numPoints = data.length;
    const angleStep = (Math.PI * 2) / numPoints;

    const points = useMemo(
        () => calculatePolygonPoints(data, center, radius, angleStep),
        [data, angleStep, center, radius]
    );
    const bgPolygons = useMemo(
        () => calculateBackgroundPolygons(numPoints, center, radius, angleStep),
        [numPoints, angleStep, center, radius]
    );

    const axisLines = useMemo(
        () =>
            data.map((_, i) => {
                const angle = Math.PI / 2 + i * angleStep;
                return { x: center + Math.cos(angle) * radius, y: center - Math.sin(angle) * radius };
            }),
        [data, angleStep, center, radius]
    );

    const labels = useMemo(
        () =>
            data.map((d, i) => {
                const angle = Math.PI / 2 + i * angleStep;
                const labelRadius = radius + 20;
                return {
                    x: center + Math.cos(angle) * labelRadius,
                    y: center - Math.sin(angle) * labelRadius,
                    label: d.label,
                };
            }),
        [data, angleStep, center, radius]
    );

    return (
        <div className="flex flex-col items-center">
            {}
            <div className="relative w-[200px] h-[200px]">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {bgPolygons.map((pts, i) => (
                        <polygon
                            key={i}
                            points={pts}
                            fill={i % 2 === 0 ? '#f8fafc' : '#ffffff'}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    ))}
                    {axisLines.map((line, i) => (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={line.x}
                            y2={line.y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    ))}
                    <polygon points={points} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" />
                    {labels.map((item, i) => (
                        <text
                            key={i}
                            x={item.x}
                            y={item.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] fill-slate-500 font-medium"
                        >
                            {item.label}
                        </text>
                    ))}
                </svg>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-slate-500">
                {data.map((d) => (
                    <div key={d.label} className="flex flex-col items-center">
                        <span className="font-semibold text-slate-700">{d.value}</span>
                        <span>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

RadarChart.displayName = 'RadarChart';
