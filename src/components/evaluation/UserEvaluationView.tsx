import { ChartBar } from '@phosphor-icons/react';
import { memo } from 'react';
import { Evaluation } from '../../constants';
import { AnnualScoreSummary } from './AnnualScoreSummary';
import { UserCompletedList } from './UserCompletedList';
import { UserEvaluationCards } from './UserEvaluationCards';

interface UserEvaluationViewProps {
    userMyEvaluations: Evaluation[];
    userCompletedEvaluations: Evaluation[];
    evaluationWeights: any;
    onRunEvaluation: (id: string | number) => void;
    onViewResult: (id: string | number) => void;
}

export const UserEvaluationView = memo(
    ({
        userMyEvaluations,
        userCompletedEvaluations,
        evaluationWeights,
        onRunEvaluation,
        onViewResult,
    }: UserEvaluationViewProps) => (
        <div className="space-y-8">
            <UserEvaluationCards evaluations={userMyEvaluations} onRunEvaluation={onRunEvaluation} />
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <span className="bg-teal-100 text-teal-700 p-1.5 rounded-lg mr-2">
                            <ChartBar className="w-5 h-5" weight="regular" />
                        </span>
                        나의 평가 결과
                    </h2>
                </div>
                <AnnualScoreSummary
                    evaluations={userCompletedEvaluations}
                    weights={evaluationWeights}
                    showSettingsButton={false}
                />
            </section>
            <UserCompletedList evaluations={userCompletedEvaluations} onViewResult={onViewResult} />
        </div>
    )
);

UserEvaluationView.displayName = 'UserEvaluationView';
