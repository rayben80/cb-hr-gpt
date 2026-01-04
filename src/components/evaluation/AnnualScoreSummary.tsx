import { Gear } from '@phosphor-icons/react';
import { memo, useMemo } from 'react';
import { Evaluation } from '../../constants';
import { Button } from '../common';

interface ScorePillProps {
    label: string;
    score: number;
    weight: number;
    color: { border: string; text: string };
}

const ScorePill = memo(({ label, score, weight, color }: ScorePillProps) => (
    <div className="flex flex-col items-center text-center">
        <div
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${score > 0 ? color.border : 'border-slate-200'}`}
        >
            <span className={`text-2xl font-bold ${score > 0 ? color.text : 'text-slate-400'}`}>
                {score > 0 ? score : '-'}
                <span className="text-base">{score > 0 ? '%' : ''}</span>
            </span>
            <span className="text-xs text-slate-500">가중치 {weight}%</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">{label}</p>
    </div>
));

ScorePill.displayName = 'ScorePill';

interface EvaluationWeights {
    firstHalf: number;
    secondHalf: number;
    peerReview: number;
}

interface AnnualScoreSummaryProps {
    evaluations: Evaluation[];
    weights: EvaluationWeights;
    onOpenSettings?: () => void;
    showSettingsButton?: boolean;
}

export const AnnualScoreSummary = memo(
    ({ evaluations, weights, onOpenSettings, showSettingsButton = true }: AnnualScoreSummaryProps) => {
        const { peerReviewAvgScore, firstHalfScore, secondHalfScore, totalScore } = useMemo(() => {
            const firstHalf = evaluations.find(
                (e) => e.type === '본인평가' && e.period === '상반기' && e.status === '완료'
            );
            const secondHalf = evaluations.find(
                (e) => e.type === '본인평가' && e.period === '하반기' && e.status === '완료'
            );
            const peer = evaluations.filter((e) => e.type === '다면평가' && e.status === '완료');

            const peerAvg =
                peer.length > 0 ? Math.round(peer.reduce((acc, cur) => acc + (cur.score ?? 0), 0) / peer.length) : 0;

            const score1 = firstHalf?.score ?? 0;
            const score2 = secondHalf?.score ?? 0;

            const weightedScore1 = score1 * (weights.firstHalf / 100);
            const weightedScore2 = score2 * (weights.secondHalf / 100);
            const weightedScore3 = peerAvg * (weights.peerReview / 100);

            const total = Math.round(weightedScore1 + weightedScore2 + weightedScore3);

            return {
                peerReviewAvgScore: peerAvg,
                firstHalfScore: score1,
                secondHalfScore: score2,
                totalScore: total,
            };
        }, [evaluations, weights]);

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">연간 종합 평가 요약</h2>
                    {showSettingsButton && onOpenSettings && (
                        <Button variant="outline" size="sm" onClick={onOpenSettings} className="gap-2">
                            <Gear className="w-4 h-4" weight="regular" />
                            기준 설정
                        </Button>
                    )}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-around gap-y-6">
                    <ScorePill
                        label="상반기 평가"
                        score={firstHalfScore}
                        weight={weights.firstHalf}
                        color={{ border: 'border-primary', text: 'text-primary' }}
                    />
                    <div className="text-3xl font-light text-slate-300">+</div>
                    <ScorePill
                        label="하반기 평가"
                        score={secondHalfScore}
                        weight={weights.secondHalf}
                        color={{ border: 'border-primary', text: 'text-primary' }}
                    />
                    <div className="text-3xl font-light text-slate-300">+</div>
                    <ScorePill
                        label="다면 평가"
                        score={peerReviewAvgScore}
                        weight={weights.peerReview}
                        color={{ border: 'border-teal-500', text: 'text-teal-600' }}
                    />
                    <div className="text-3xl font-light text-slate-300 mx-4 hidden md:block">=</div>
                    <div className="w-full md:w-auto border-t md:border-none pt-6 md:pt-0 mt-6 md:mt-0 flex justify-center">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-slate-800 text-white flex flex-col items-center justify-center shadow-lg">
                                <span className="text-xs font-medium tracking-wide">최종 점수</span>
                                <span className="text-4xl font-bold tracking-tight">
                                    {totalScore > 0 ? totalScore : '-'}
                                </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-700">2024년 종합 점수</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

AnnualScoreSummary.displayName = 'AnnualScoreSummary';
