import { Sparkle } from '@phosphor-icons/react';
import React, { memo, useMemo, useRef, useState } from 'react';
import { GrowthTrendChart } from '../../components/dashboard/GrowthTrendChart';
import { exportEvaluationResultToPDF } from '../../services/pdfExportService';
import { CompetencyChart, CompetencyChartProps } from './components/CompetencyChart';
import { FeedbackSidePanel } from './components/FeedbackSidePanel';
import { ResultHeader } from './components/ResultHeader';
import { StrengthsWeaknesses } from './components/StrengthsWeaknesses';
import { SummaryCard } from './components/SummaryCard';

export interface EvaluationResultData {
    subject: { name: string; role: string; avatar: string };
    evaluationName: string;
    period: string;
    finalScore: number;
    finalGrade: string;
    summary: string;
    competencies: CompetencyChartProps[];
    strengths: string[];
    areasForImprovement: string[];
    peerFeedback: { from: string; comment: string }[];
}

interface EvaluationResultProps {
    resultData: EvaluationResultData;
    onBack: () => void;
}

const EvaluationResult: React.FC<EvaluationResultProps> = memo(({ resultData, onBack }) => {
    const {
        subject,
        evaluationName,
        period,
        finalScore,
        finalGrade,
        summary,
        competencies,
        strengths,
        areasForImprovement,
        peerFeedback,
    } = resultData;
    const resultRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!resultRef.current) return;
        setIsExporting(true);
        try {
            await exportEvaluationResultToPDF(resultRef.current, subject.name, evaluationName);
        } finally {
            setIsExporting(false);
        }
    };

    const growthData = useMemo(
        () => [
            { period: '22년 상반기', score: 82 },
            { period: '22년 하반기', score: 85 },
            { period: '23년 상반기', score: 84 },
            { period: '23년 하반기', score: 89 },
            { period: '24년 상반기', score: 95 },
        ],
        []
    );
    const wordCloudData = useMemo(
        () => [
            { text: '책임감', value: 90 },
            { text: '소통', value: 85 },
            { text: '리더십', value: 70 },
            { text: '협업', value: 80 },
            { text: '전문성', value: 75 },
            { text: '적극성', value: 65 },
            { text: '배려', value: 60 },
            { text: '성실', value: 55 },
            { text: '아이디어', value: 50 },
        ],
        []
    );
    const strengthsList = useMemo(() => strengths.map((item, i) => <li key={i}>{item}</li>), [strengths]);
    const improvementsList = useMemo(
        () => areasForImprovement.map((item, i) => <li key={i}>{item}</li>),
        [areasForImprovement]
    );
    const feedbackList = useMemo(
        () =>
            peerFeedback.map((fb, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-800 leading-relaxed">"{fb.comment}"</p>
                    <p className="text-right text-xs font-semibold text-slate-500 mt-2">- {fb.from}</p>
                </div>
            )),
        [peerFeedback]
    );

    return (
        <div className="animate-fade-in">
            <ResultHeader
                evaluationName={evaluationName}
                subject={subject}
                period={period}
                onExport={handleExportPDF}
                isExporting={isExporting}
                onBack={onBack}
            />
            <div ref={resultRef}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <SummaryCard finalScore={finalScore} finalGrade={finalGrade} summary={summary} />
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <Sparkle className="w-5 h-5 mr-2 text-primary" weight="regular" />
                                성장 추이 (최근 5회)
                            </h2>
                            <GrowthTrendChart data={growthData} />
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">역량별 상세 결과</h2>
                            <div className="divide-y divide-slate-200">
                                {competencies.map((c) => (
                                    <CompetencyChart key={c.name} {...c} />
                                ))}
                            </div>
                        </div>
                        <StrengthsWeaknesses strengthsList={strengthsList} improvementsList={improvementsList} />
                    </div>
                    <FeedbackSidePanel wordCloudData={wordCloudData} feedbackList={feedbackList} />
                </div>
            </div>
        </div>
    );
});

EvaluationResult.displayName = 'EvaluationResult';
export default EvaluationResult;
