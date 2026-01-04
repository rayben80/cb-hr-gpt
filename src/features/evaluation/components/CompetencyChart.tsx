import { memo, useEffect, useRef } from 'react';

export interface CompetencyChartProps {
    name: string;
    selfScore: number;
    peerScore: number;
    finalScore: number;
}

const ProgressBar = memo(({ progress, className }: { progress: number; className: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.width = `${progress}%`;
        }
    }, [progress]);
    return <div ref={ref} className={className} />;
});
ProgressBar.displayName = 'ProgressBar';

export const CompetencyChart = memo<CompetencyChartProps>(({ name, selfScore, peerScore, finalScore }) => (
    <div className="py-4">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700">{name}</h4>
            <span className="font-bold text-slate-800 text-lg">{finalScore}점</span>
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">본인 평가</span>
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                    <ProgressBar progress={selfScore} className="bg-primary h-4 rounded-full" />
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">동료 평가</span>
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                    <ProgressBar progress={peerScore} className="bg-primary h-4 rounded-full" />
                </div>
            </div>
        </div>
    </div>
));
CompetencyChart.displayName = 'CompetencyChart';
