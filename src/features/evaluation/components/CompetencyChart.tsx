import { memo } from 'react';
import { ProgressBar } from '../../../components/feedback/Progress';

export interface CompetencyChartProps {
    name: string;
    selfScore: number;
    peerScore: number;
    finalScore: number;
}

export const CompetencyChart = memo<CompetencyChartProps>(({ name, selfScore, peerScore, finalScore }) => (
    <div className="py-4">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700">{name}</h4>
            <span className="font-bold text-slate-800 text-lg">{finalScore}점</span>
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">본인 평가</span>
                <div className="flex-1">
                    <ProgressBar progress={selfScore} size="lg" color="primary" />
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">동료 평가</span>
                <div className="flex-1">
                    <ProgressBar progress={peerScore} size="lg" color="primary" />
                </div>
            </div>
        </div>
    </div>
));
CompetencyChart.displayName = 'CompetencyChart';
