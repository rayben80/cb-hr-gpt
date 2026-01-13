import React, { useMemo } from 'react';
import type { EvaluationAnswerDetail } from '../EvaluationResult';

interface EvaluationAnswerDetailsProps {
    answerDetails: EvaluationAnswerDetail[] | undefined;
}

export const EvaluationAnswerDetails: React.FC<EvaluationAnswerDetailsProps> = ({ answerDetails }) => {
    const details = useMemo(() => answerDetails ?? [], [answerDetails]);

    if (details.length === 0) {
        return <p className="text-sm text-slate-500">아직 저장된 응답 상세가 없습니다.</p>;
    }

    return (
        <div className="divide-y divide-slate-200">
            {details.map((detail, index) => {
                const metaParts = [];
                if (detail.type) metaParts.push(detail.type);
                if (detail.weight && detail.weight > 0) metaParts.push(`가중치 ${detail.weight}%`);

                const comment = detail.comment?.trim();
                return (
                    <div key={detail.itemId} className="py-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {index + 1}. {detail.title}
                            </p>
                            {metaParts.length > 0 && (
                                <p className="text-xs text-slate-500 mt-1">{metaParts.join(' · ')}</p>
                            )}
                            <p className="text-sm text-slate-600 mt-3">{comment ? comment : '코멘트가 없습니다.'}</p>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500">점수</p>
                                <p className="text-2xl font-bold text-slate-900">{detail.score}점</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">등급</p>
                                <p className="text-sm font-semibold text-slate-700">{detail.grade ?? '점수형'}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
