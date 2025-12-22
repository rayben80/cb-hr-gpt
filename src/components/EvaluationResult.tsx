import React, { memo, useMemo } from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';

interface CompetencyChartProps {
    name: string;
    selfScore: number;
    peerScore: number;
    finalScore: number;
}

const CompetencyChart: React.FC<CompetencyChartProps> = memo(({ name, selfScore, peerScore, finalScore }) => (
    <div className="py-4">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-slate-700">{name}</h4>
            <span className="font-bold text-slate-800 text-lg">{finalScore}점</span>
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">본인 평가</span>
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                    <div className="bg-sky-500 h-4 rounded-full" style={{ width: `${selfScore}%` }}></div>
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-sm text-slate-500 w-20">동료 평가</span>
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                    <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${peerScore}%` }}></div>
                </div>
            </div>
        </div>
    </div>
));

CompetencyChart.displayName = 'CompetencyChart';

interface EvaluationResultData {
    subject: { name: string; role: string; avatar: string; };
    evaluationName: string;
    period: string;
    finalScore: number;
    finalGrade: string;
    summary: string;
    competencies: CompetencyChartProps[];
    strengths: string[];
    areasForImprovement: string[];
    peerFeedback: { from: string; comment: string; }[];
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
        peerFeedback
    } = resultData;

    const strengthsList = useMemo(() => 
        strengths.map((item, i) => <li key={i}>{item}</li>), 
        [strengths]
    );

    const improvementsList = useMemo(() => 
        areasForImprovement.map((item, i) => <li key={i}>{item}</li>), 
        [areasForImprovement]
    );

    const feedbackList = useMemo(() => 
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
            <div className="mb-8">
                 <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors mb-4">
                    <Icon path={ICONS.arrowLeft} className="w-4 h-4 mr-2" />
                    평가 목록으로 돌아가기
                </button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{evaluationName} 결과</h1>
                        <p className="text-lg text-slate-600 mt-1">{subject.name} ({subject.role})</p>
                    </div>
                     <div className="mt-4 md:mt-0 text-md text-slate-500 font-medium">
                        평가 기간: {period}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
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

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">역량별 상세 결과</h2>
                        <div className="divide-y divide-slate-200">
                            {competencies.map(c => <CompetencyChart key={c.name} {...c} />)}
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                               <Icon path={ICONS.arrowUp} className="w-5 h-5 mr-2 text-green-500" />
                               주요 강점
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-600">
                                {strengthsList}
                            </ul>
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm">
                             <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                                <Icon path={ICONS.arrowDown} className="w-5 h-5 mr-2 text-red-500" />
                                개선 제안
                            </h3>
                            <ul className="list-disc list-inside space-y-2 text-slate-600">
                                {improvementsList}
                            </ul>
                        </div>
                    </div>

                </div>

                <div className="space-y-8">
                     <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">동료 피드백</h2>
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                           {feedbackList}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

EvaluationResult.displayName = 'EvaluationResult';

export default EvaluationResult;