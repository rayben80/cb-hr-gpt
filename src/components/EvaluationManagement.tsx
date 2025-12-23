import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Icon } from './common';
import { ICONS, evaluationResultData, Evaluation, EvaluationTemplate, Team, initialEvaluationsData, initialLibraryData, initialTeamsData } from '../constants';
import StartEvaluationModal from './StartEvaluationModal';
import EvaluationResult from './EvaluationResult';
import AnnualEvaluationSettingsModal from './AnnualEvaluationSettingsModal';
import { ProgressBar, LoadingSpinner } from './Progress';
import { StatusBadge as NewStatusBadge, StatusCard } from './Status';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useError } from '../contexts/ErrorContext';

const StatusBadge = memo(({ status }: { status: Evaluation['status'] }) => {
    const statusType = useMemo(() => {
        const statusMap = {
            '진행중': 'info' as const,
            '완료': 'success' as const,
            '예정': 'idle' as const,
        };
        return statusMap[status];
    }, [status]);
    
    return <NewStatusBadge status={statusType} text={status} size="sm" />;
});

StatusBadge.displayName = 'StatusBadge';

const NoResultView = memo(({ onBack }: { onBack: () => void }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm">
        <StatusCard
            status="info"
            title="평가 결과가 아직 준비되지 않았습니다."
            description="평가가 완료된 후 결과 산출이 완료되면 확인할 수 있습니다."
            action={
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                    목록으로 돌아가기
                </button>
            }
        />
    </div>
));

NoResultView.displayName = 'NoResultView';


const ScorePill = memo(({ label, score, weight, color }: { label: string, score: number, weight: number, color: { border: string, text: string } }) => (
    <div className="flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${score > 0 ? color.border : 'border-slate-200'}`}>
            <span className={`text-2xl font-bold ${score > 0 ? color.text : 'text-slate-400'}`}>{score > 0 ? score : '-'}<span className="text-base">{score > 0 ? '%' : ''}</span></span>
            <span className="text-xs text-slate-500">가중치 {weight}%</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">{label}</p>
    </div>
));

ScorePill.displayName = 'ScorePill';

const AnnualScoreSummary = memo(({ evaluations, weights, onOpenSettings }: { evaluations: Evaluation[], weights: { firstHalf: number, secondHalf: number, peerReview: number }, onOpenSettings: () => void }) => {
    // 성능 최적화: 평가 결과 계산 메모이제이션
    const { selfFirstHalf, selfSecondHalf, peerReviews, peerReviewAvgScore, firstHalfScore, secondHalfScore, totalScore } = useMemo(() => {
        const firstHalf = evaluations.find(e => e.type === '본인평가' && e.period === '상반기' && e.status === '완료');
        const secondHalf = evaluations.find(e => e.type === '본인평가' && e.period === '하반기' && e.status === '완료');
        const peer = evaluations.filter(e => e.type === '다면평가' && e.status === '완료');
        
        const peerAvg = peer.length > 0 
            ? Math.round(peer.reduce((acc, cur) => acc + (cur.score ?? 0), 0) / peer.length)
            : 0;

        const score1 = firstHalf?.score ?? 0;
        const score2 = secondHalf?.score ?? 0;

        const weightedScore1 = (score1 * (weights.firstHalf / 100));
        const weightedScore2 = (score2 * (weights.secondHalf / 100));
        const weightedScore3 = (peerAvg * (weights.peerReview / 100));
        
        const total = Math.round(weightedScore1 + weightedScore2 + weightedScore3);

        return {
            selfFirstHalf: firstHalf,
            selfSecondHalf: secondHalf,
            peerReviews: peer,
            peerReviewAvgScore: peerAvg,
            firstHalfScore: score1,
            secondHalfScore: score2,
            totalScore: total
        };
    }, [evaluations, weights]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-900">연간 종합 평가 요약</h2>
                 <button 
                    onClick={onOpenSettings} 
                    className="flex items-center text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm transition-colors" 
                    aria-label="종합 평가 기준 설정"
                 >
                     <Icon path={ICONS.settingsModern} className="w-5 h-5 mr-2" />
                     <span>기준 설정</span>
                 </button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-around gap-y-6">
                <ScorePill label="상반기 평가" score={firstHalfScore} weight={weights.firstHalf} color={{border: 'border-sky-500', text: 'text-sky-600'}} />
                <div className="text-3xl font-light text-slate-300">+</div>
                <ScorePill label="하반기 평가" score={secondHalfScore} weight={weights.secondHalf} color={{border: 'border-indigo-500', text: 'text-indigo-600'}} />
                <div className="text-3xl font-light text-slate-300">+</div>
                <ScorePill label="다면 평가" score={peerReviewAvgScore} weight={weights.peerReview} color={{border: 'border-teal-500', text: 'text-teal-600'}} />
                <div className="text-3xl font-light text-slate-300 mx-4 hidden md:block">=</div>
                 <div className="w-full md:w-auto border-t md:border-none pt-6 md:pt-0 mt-6 md:mt-0 flex justify-center">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-slate-800 text-white flex flex-col items-center justify-center shadow-lg">
                             <span className="text-xs font-medium tracking-wide">최종 점수</span>
                             <span className="text-4xl font-bold tracking-tight">{totalScore > 0 ? totalScore : '-'}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-700">2024년 종합 점수</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

AnnualScoreSummary.displayName = 'AnnualScoreSummary';

const EvaluationManagement = memo(() => {
    const [activeTab, setActiveTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | string | null>(null);
    const [resultUnavailable, setResultUnavailable] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [evaluationWeights, setEvaluationWeights] = useState({
        firstHalf: 40,
        secondHalf: 40,
        peerReview: 20,
    });
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    const [networkState] = useNetworkStatus();
    const { showSuccess } = useError();
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const normalizedEvaluations = useMemo(() => (
        evaluations.map(e => {
            if (e.status === '완료') return e;
            if (e.endDate && e.endDate < today) return { ...e, status: '완료' as const };
            if (e.startDate && e.startDate > today) return { ...e, status: '예정' as const };
            return { ...e, status: '진행중' as const };
        })
    ), [evaluations, today]);

    // 성능 최적화: 필터링 로직 메모이제이션
    const filteredEvaluations = useMemo(() => {
        const baseEvaluations = activeTab === '전체'
            ? normalizedEvaluations
            : normalizedEvaluations.filter(e => e.status === activeTab);

        const query = searchTerm.trim().toLowerCase();
        if (!query) return baseEvaluations;

        return baseEvaluations.filter(e => (
            e.name.toLowerCase().includes(query)
            || e.type.toLowerCase().includes(query)
            || e.subject.toLowerCase().includes(query)
        ));
    }, [activeTab, normalizedEvaluations, searchTerm]);

    // 성능 최적화: 콜백 함수 메모이제이션
    const handleLaunchEvaluation = useCallback(async (newEvaluationData: Omit<Evaluation, 'id' | 'status' | 'progress' | 'score'>) => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            const status = newEvaluationData.startDate <= today ? '진행중' as const : '예정' as const;
            const evaluationToAdd = {
                ...newEvaluationData,
                id: Date.now() + Math.random(), // 임시 ID 생성
                status,
                progress: 0,
                score: null,
            };
            
            // 로컬 상태 업데이트
            setEvaluations(prev => [...prev, evaluationToAdd as Evaluation]);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error launching new evaluation: ", err);
            alert("평가 시작 중 오류가 발생했습니다.");
        }
    }, []);
    
    const handleViewResult = useCallback((evaluationId: string | number) => {
        const hasResult = String(evaluationId) === String(evaluationResultData.evaluationId);
        setResultUnavailable(!hasResult);
        setSelectedEvaluationId(evaluationId);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedEvaluationId(null);
        setResultUnavailable(false);
    }, []);

    const handleSaveWeights = useCallback((newWeights: { firstHalf: number, secondHalf: number, peerReview: number }) => {
        setEvaluationWeights(newWeights);
        setIsSettingsModalOpen(false);
    }, []);

    const handleOpenSettings = useCallback(() => {
        setIsSettingsModalOpen(true);
    }, []);

    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            
            try {
                // 항상 로컬 데이터 사용
                if (import.meta.env.DEV) {
                    console.log('🛠️ 개발 모드: 로컬 데이터를 사용합니다.');
                }
                setEvaluations(initialEvaluationsData);
                setTemplates(initialLibraryData);
                setTeams(initialTeamsData);
                setIsLoading(false);
                showSuccess('개발 모드로 실행 중입니다', '로컬 샘플 데이터를 사용합니다.');
            } catch (error) {
                console.error('데이터 로드 중 오류:', error);
                if (import.meta.env.DEV) {
                    console.log('오류 발생, 로컬 데이터로 fallback');
                }
                setEvaluations(initialEvaluationsData);
                setTemplates(initialLibraryData);
                setTeams(initialTeamsData);
                setIsLoading(false);
                showSuccess('개발 모드로 실행 중입니다', '로컬 샘플 데이터를 사용합니다.');
            }
        };

        loadData();
    }, [showSuccess]);

    const tabs = useMemo(() => ['전체', '진행중', '완료', '예정'], []);

    if (selectedEvaluationId) {
        if (resultUnavailable) {
            return <NoResultView onBack={handleBackToList} />;
        }
        return <EvaluationResult resultData={evaluationResultData} onBack={handleBackToList} />;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">평가 관리</h1>
                    <p className="text-lg text-slate-600 mt-1">진행중이거나 예정된 평가를 관리합니다.</p>
                </div>
                <button onClick={handleOpenModal} className="mt-4 sm:mt-0 flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                    <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                    새 평가 시작
                </button>
            </div>
            
            <AnnualScoreSummary 
                evaluations={normalizedEvaluations} 
                weights={evaluationWeights} 
                onOpenSettings={handleOpenSettings} 
            />

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="w-full md:w-auto">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {tabs.map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`${
                                            activeTab === tab 
                                            ? 'border-sky-500 text-sky-600' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                         <Icon path={ICONS.search} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="평가명/구분 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                    </div>
                </div>
                 {isLoading ? (
                    <div className="text-center py-12">
                        <div className="flex flex-col items-center">
                            <LoadingSpinner size="lg" color="blue" />
                            <p className="text-slate-500 mt-4">평가 목록을 불러오는 중...</p>
                        </div>
                    </div>
                ) : error ? (
                    <StatusCard 
                        status="error"
                        title="데이터 로드 실패"
                        description={error}
                        className="max-w-2xl mx-auto my-8"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">평가명</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">구분</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">상태</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">대상자</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">평가 기간</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">진행률</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredEvaluations.length === 0 ? (
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
                                    filteredEvaluations.map(e => (
                                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{e.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={e.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.startDate} ~ {e.endDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <ProgressBar progress={e.progress} />
                                                    <span className="text-sm text-slate-600">{e.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {e.status === '완료' && (
                                                    <button 
                                                        onClick={() => handleViewResult(e.id)}
                                                        className="text-sky-600 hover:text-sky-900 mr-3"
                                                    >
                                                        결과 보기
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {isModalOpen && (
                <StartEvaluationModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onLaunch={handleLaunchEvaluation}
                    templates={templates}
                    teams={teams}
                />
            )}
            
            {isSettingsModalOpen && (
                <AnnualEvaluationSettingsModal 
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    weights={evaluationWeights}
                    onSave={handleSaveWeights}
                />
            )}
        </>
    );
});

EvaluationManagement.displayName = 'EvaluationManagement';

export default EvaluationManagement;
