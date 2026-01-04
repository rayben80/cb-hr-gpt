import { PencilSimple } from '@phosphor-icons/react';
import { memo } from 'react';
import { Evaluation } from '../../constants';
import { ProgressBar } from '../feedback/Progress';
import { StatusCard } from '../feedback/Status';

interface UserEvaluationCardsProps {
    evaluations: Evaluation[];
    onRunEvaluation: (id: string | number) => void;
}

export const UserEvaluationCards = memo(({ evaluations, onRunEvaluation }: UserEvaluationCardsProps) => (
    <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="bg-primary/10 text-primary p-1.5 rounded-lg mr-2">
                    <PencilSimple className="w-5 h-5" weight="regular" />
                </span>
                나의 할 일 (평가 수행)
            </h2>
        </div>
        {evaluations.length === 0 ? (
            <StatusCard
                status="success"
                title="모든 평가를 완료했습니다!"
                description="현재 예정되어 있거나 진행 중인 평가가 없습니다."
            />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evaluations.map((e) => (
                    <div
                        key={e.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${e.status === '진행중' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}
                                >
                                    {e.status}
                                </span>
                                <span className="text-xs text-slate-500">{e.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{e.name}</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                {e.startDate} ~ {e.endDate}
                            </p>
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>진행률</span>
                                    <span>{e.progress}%</span>
                                </div>
                                <ProgressBar progress={e.progress} />
                            </div>
                        </div>
                        <button
                            onClick={() => onRunEvaluation(e.id)}
                            disabled={e.status === '예정'}
                            className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                                e.status === '예정'
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                            }`}
                        >
                            {e.status === '예정' ? '평가 기간 아님' : '평가하기'}
                        </button>
                    </div>
                ))}
            </div>
        )}
    </section>
));

UserEvaluationCards.displayName = 'UserEvaluationCards';
