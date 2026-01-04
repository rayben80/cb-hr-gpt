import { memo } from 'react';

interface SummaryCardProps {
    finalScore: number;
    finalGrade: string;
    summary: string;
}

export const SummaryCard = memo<SummaryCardProps>(({ finalScore, finalGrade, summary }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
            <div className="w-36 h-36 rounded-full bg-slate-800 text-white flex flex-col items-center justify-center shadow-lg border-4 border-white">
                <span className="text-xs font-medium tracking-wide">최종 점수</span>
                <span className="text-5xl font-bold tracking-tight">{finalScore}</span>
                <span className="text-xl font-semibold">({finalGrade} 등급)</span>
            </div>
        </div>
        <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-900 mb-2">종합의견</h2>
            <p className="text-slate-600 leading-relaxed">{summary}</p>
        </div>
    </div>
));
SummaryCard.displayName = 'SummaryCard';
