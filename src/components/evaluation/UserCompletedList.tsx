import { memo } from 'react';
import { Evaluation } from '../../constants';

interface UserCompletedListProps {
    evaluations: Evaluation[];
    onViewResult: (id: string | number) => void;
}

export const UserCompletedList = memo(({ evaluations, onViewResult }: UserCompletedListProps) => (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">지난 평가 내역</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {evaluations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">완료된 평가가 없습니다.</div>
            ) : (
                evaluations.map((e) => (
                    <div
                        key={e.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div>
                            <p className="font-medium text-slate-900">{e.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {e.endDate} 완료 · {e.type}
                            </p>
                        </div>
                        <button
                            onClick={() => onViewResult(e.id)}
                            className="text-sm text-primary hover:text-primary/80 font-medium px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors"
                        >
                            결과 보기
                        </button>
                    </div>
                ))
            )}
        </div>
    </section>
));

UserCompletedList.displayName = 'UserCompletedList';
