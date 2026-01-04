import { Gear } from '@phosphor-icons/react';
import { memo } from 'react';
import { Evaluation } from '../../constants';
import { ProgressBar } from '../feedback/Progress';
import { StatusBadge as BaseStatusBadge } from '../feedback/Status';

const StatusBadge = memo(({ status }: { status: '진행중' | '완료' | '예정' }) => {
    const statusType = (() => {
        const statusMap = {
            진행중: 'info' as const,
            완료: 'success' as const,
            예정: 'idle' as const,
        };
        return statusMap[status];
    })();
    return <BaseStatusBadge status={statusType} text={status} size="sm" />;
});
StatusBadge.displayName = 'StatusBadge';

interface EvaluationTableBodyProps {
    evaluations: Evaluation[];
    onOpenMonitoring: (evaluation: Evaluation) => void;
    activeTab: string;
    searchTerm: string;
}

export const EvaluationTableBody = memo(
    ({ evaluations, onOpenMonitoring, activeTab, searchTerm }: EvaluationTableBodyProps) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            평가명
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            구분
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            상태
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            대상자
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            평가 기간
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                        >
                            진행률
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {evaluations.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                                {searchTerm.trim()
                                    ? '검색 결과가 없습니다.'
                                    : activeTab === '완료'
                                      ? '완료된 평가가 없습니다.'
                                      : '표시할 평가가 없습니다.'}
                            </td>
                        </tr>
                    ) : (
                        evaluations.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    {e.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={e.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {e.startDate} ~ {e.endDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <ProgressBar progress={e.progress} />
                                        <span className="text-sm text-slate-600">{e.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onOpenMonitoring(e)}
                                        className="text-slate-400 hover:text-primary transition-colors"
                                        title="모니터링 및 관리"
                                    >
                                        <Gear className="w-5 h-5" weight="regular" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
);
EvaluationTableBody.displayName = 'EvaluationTableBody';
