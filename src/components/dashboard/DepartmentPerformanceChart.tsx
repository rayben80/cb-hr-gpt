import React, { memo } from 'react';

import { DepartmentPerformance } from '../../types/dashboard';

interface DepartmentPerformanceChartProps {
    data: DepartmentPerformance[];
}

export const DepartmentPerformanceChart: React.FC<DepartmentPerformanceChartProps> = memo(({ data }) => {
    const maxScore = 100;

    return (
        <div className="space-y-4">
            {data.map((item, _) => (
                <div key={item.department} className="relative">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700">{item.department}</span>
                        <div className="flex items-end">
                            <span className="text-lg font-bold text-primary mr-1">{item.score}</span>
                            <span className="text-xs text-slate-400 mb-1">/ 100</span>
                        </div>
                    </div>
                    {/* Background Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        {/* Score Bar */}
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${(item.score / maxScore) * 100}%` }}
                        >
                            {/* Marker for average if needed, but keeping it simple for now */}
                        </div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>본부 평균: {item.average}</span>
                        <span>
                            {item.score > item.average
                                ? `+${(item.score - item.average).toFixed(1)}`
                                : (item.score - item.average).toFixed(1)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
});

DepartmentPerformanceChart.displayName = 'DepartmentPerformanceChart';
