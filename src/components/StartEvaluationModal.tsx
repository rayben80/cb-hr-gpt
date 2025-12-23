import React, { useState, useCallback, useMemo, memo } from 'react';
import { Icon, InputField, Checkbox } from './common';
import { ICONS, EvaluationTemplate, Team, Part, Member, Evaluation } from '../constants';

interface LaunchData extends Omit<Evaluation, 'id' | 'status' | 'progress' | 'score'> {}

interface StartEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: (data: LaunchData) => void;
    templates: EvaluationTemplate[];
    teams: Team[];
}

const StartEvaluationModal: React.FC<StartEvaluationModalProps> = memo(({ isOpen, onClose, onLaunch, templates, teams }) => {
    const [step, setStep] = useState(1);
    const [newEvaluation, setNewEvaluation] = useState<{
        name: string;
        period: string;
        timing: 'now' | 'scheduled';
        startDate: string;
        endDate: string;
        templateId: string | number | null;
        subjects: string[];
    }>({
        name: '',
        period: '수시',
        timing: 'scheduled',
        startDate: '',
        endDate: '',
        templateId: null,
        subjects: [],
    });
    const [selectedMembers, setSelectedMembers] = useState(new Set<string>());
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const periodOptions = useMemo(() => ['상반기', '하반기', '연간', '수시'], []);
    
    const resetAndClose = useCallback(() => {
        setStep(1);
        setNewEvaluation({ name: '', period: '수시', timing: 'scheduled', startDate: '', endDate: '', templateId: null, subjects: [] });
        setSelectedMembers(new Set());
        onClose();
    }, [onClose]);
    
    const handleLaunch = useCallback(() => {
        const template = templates.find(t => t.id === newEvaluation.templateId);
        if (!template) return;
        onLaunch({
            name: newEvaluation.name,
            type: template.type,
            period: newEvaluation.period,
            subject: `${selectedMembers.size}명`,
            startDate: newEvaluation.timing === 'now' ? today : newEvaluation.startDate,
            endDate: newEvaluation.endDate,
        });
        resetAndClose();
    }, [templates, newEvaluation, selectedMembers.size, onLaunch, resetAndClose, today]);

    const toggleMember = useCallback((memberName: string) => {
        const newSet = new Set(selectedMembers);
        if (newSet.has(memberName)) {
            newSet.delete(memberName);
        } else {
            newSet.add(memberName);
        }
        setSelectedMembers(newSet);
    }, [selectedMembers]);

    const handleTimingChange = useCallback((timing: 'now' | 'scheduled') => {
        setNewEvaluation(prev => ({
            ...prev,
            timing,
            startDate: timing === 'now' ? today : '',
        }));
    }, [today]);

    const handlePeriodChange = useCallback((period: string) => {
        setNewEvaluation(prev => ({ ...prev, period }));
    }, []);

    const getGroupMembers = useCallback((group: Team | Part): Member[] => {
        if ('parts' in group) {
            return group.parts.flatMap(p => p.members)
                .filter(member => member.status === 'active' || member.status === 'intern');
        }
        if ('members' in group) {
            return group.members.filter(member => member.status === 'active' || member.status === 'intern');
        }
        return [];
    }, []);

    const getGroupSelectionState = useCallback((group: Team | Part) => {
        const members = getGroupMembers(group);
        if (members.length === 0) return { checked: false, indeterminate: false, disabled: true };
        const selectedCount = members.filter(m => selectedMembers.has(m.name)).length;
        if (selectedCount === 0) return { checked: false, indeterminate: false, disabled: false };
        if (selectedCount === members.length) return { checked: true, indeterminate: false, disabled: false };
        return { checked: false, indeterminate: true, disabled: false };
    }, [getGroupMembers, selectedMembers]);

    const toggleGroup = useCallback((group: Team | Part) => {
        const members = getGroupMembers(group);
        if (members.length === 0) return;
        const { checked } = getGroupSelectionState(group);
        const newSet = new Set(selectedMembers);
        if (checked) {
            members.forEach(m => newSet.delete(m.name));
        } else {
            members.forEach(m => newSet.add(m.name));
        }
        setSelectedMembers(newSet);
    }, [getGroupMembers, getGroupSelectionState, selectedMembers]);

    const validationStates = useMemo(() => ({
        isStep1Valid: newEvaluation.name && newEvaluation.period && newEvaluation.endDate && (newEvaluation.timing === 'now' || newEvaluation.startDate),
        isStep2Valid: newEvaluation.templateId !== null,
        isStep3Valid: selectedMembers.size > 0
    }), [newEvaluation.name, newEvaluation.period, newEvaluation.timing, newEvaluation.startDate, newEvaluation.endDate, newEvaluation.templateId, selectedMembers.size]);

    const steps = useMemo(() => ['기본 정보', '템플릿 선택', '대상자 지정', '검토 및 시작'], []);

    const sortedSelectedMembers = useMemo(() => Array.from(selectedMembers).sort(), [selectedMembers]);

    if (!isOpen) return null;

    const { isStep1Valid, isStep2Valid, isStep3Valid } = validationStates;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">새 평가 시작</h2>
                    <button onClick={resetAndClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                        <Icon path={ICONS.xMark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 flex-grow overflow-y-auto">
                    <ol className="flex items-center w-full text-sm font-medium text-center text-slate-500 mb-8">
                        {steps.map((s, index) => (
                             <li key={s} className={`flex md:w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-slate-200 after:border-1 after:inline-block" : ""} ${step > index + 1 ? 'text-sky-600' : ''}`}>
                                <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 mr-2 shrink-0 ${step >= index + 1 ? 'bg-sky-100 text-sky-600' : 'bg-slate-100'}`}>
                                    {step > index + 1 ? <Icon path={ICONS.checkCircle} className="w-5 h-5"/> : index + 1}
                                </span>
                                <span className="hidden md:inline-block">{s}</span>
                            </li>
                        ))}
                    </ol>
                    
                    {step === 1 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">평가의 기본 정보를 입력해주세요.</h3>
                            <div className="space-y-6">
                                <InputField label="평가명" id="evalName" name="evalName" type="text" value={newEvaluation.name} onChange={(e) => setNewEvaluation({...newEvaluation, name: e.target.value})} placeholder="예: 2024년 4분기 동료 피드백" />
                                <div>
                                    <p className="block text-sm font-medium text-slate-700 mb-2">평가 기간</p>
                                    <div className="flex flex-wrap gap-2">
                                        {periodOptions.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handlePeriodChange(option)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                                    newEvaluation.period === option
                                                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                                aria-pressed={newEvaluation.period === option}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="block text-sm font-medium text-slate-700 mb-2">시작 방식</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleTimingChange('now')}
                                            className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                                newEvaluation.timing === 'now'
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                            aria-pressed={newEvaluation.timing === 'now'}
                                        >
                                            즉시 시작
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTimingChange('scheduled')}
                                            className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                                                newEvaluation.timing === 'scheduled'
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                            aria-pressed={newEvaluation.timing === 'scheduled'}
                                        >
                                            예약 시작
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">즉시 시작은 시작일을 오늘로 고정합니다.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="평가 시작일"
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={newEvaluation.timing === 'now' ? today : newEvaluation.startDate}
                                        onChange={(e) => setNewEvaluation({...newEvaluation, startDate: e.target.value})}
                                        placeholder=""
                                        disabled={newEvaluation.timing === 'now'}
                                    />
                                    <InputField label="평가 종료일" id="endDate" name="endDate" type="date" value={newEvaluation.endDate} onChange={(e) => setNewEvaluation({...newEvaluation, endDate: e.target.value})} placeholder="" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                           <h3 className="text-lg font-semibold text-slate-800 mb-4">평가에 사용할 템플릿을 선택해주세요.</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 -mx-2">
                               {templates.map(template => (
                                   <div key={template.id} onClick={() => setNewEvaluation({...newEvaluation, templateId: template.id})}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${newEvaluation.templateId === template.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-400'}`}>
                                       <h4 className="font-bold text-slate-800">{template.name}</h4>
                                       <p className="text-sm text-slate-500">{template.type}</p>
                                       <p className="text-xs text-slate-400 mt-2">질문 {template.questions || (template.items && template.items.length) || 0}개</p>
                                   </div>
                               ))}
                           </div>
                        </div>
                    )}

                    {step === 3 && (
                         <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">평가 대상자를 선택해주세요.</h3>
                            <p className="text-sm text-slate-500 mb-4">재직/인턴 구성원만 표시됩니다.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
                                <div className="border border-slate-200 rounded-lg overflow-y-auto p-4">
                                    <div className="space-y-4">
                                        {teams.map(team => {
                                            const teamState = getGroupSelectionState(team);
                                            return (
                                                <div key={team.name}>
                                                    <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50">
                                                        <Checkbox {...teamState} onChange={() => toggleGroup(team)} />
                                                        <span className="font-bold text-slate-800">{team.name}</span>
                                                    </div>
                                                    <div className="pl-6 mt-2 space-y-2">
                                                        {team.parts.map(part => {
                                                            const partState = getGroupSelectionState(part);
                                                            const eligibleMembers = getGroupMembers(part);
                                                            return (
                                                                <div key={part.title}>
                                                                    <div className="flex items-center space-x-3 p-1">
                                                                        <Checkbox {...partState} onChange={() => toggleGroup(part)} />
                                                                        <span className="font-semibold text-slate-700">{part.title}</span>
                                                                    </div>
                                                                    <div className="pl-8 mt-1 space-y-1">
                                                                        {eligibleMembers.length === 0 ? (
                                                                            <p className="text-xs text-slate-400">대상 없음</p>
                                                                        ) : (
                                                                            eligibleMembers.map(member => (
                                                                                <div key={member.name} className="flex items-center space-x-3 p-1">
                                                                                    <Checkbox checked={selectedMembers.has(member.name)} onChange={() => toggleMember(member.name)} indeterminate={false} />
                                                                                    <span className="text-sm text-slate-600">{member.name}</span>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="font-bold text-slate-800 mb-3">선택된 대상자 ({selectedMembers.size}명)</h4>
                                    <div className="overflow-y-auto h-[380px] text-sm text-slate-700 space-y-1">
                                      {sortedSelectedMembers.map(name => <div key={name} className="p-1.5 bg-white rounded">{name}</div>)}
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}


                    {step === 4 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">입력하신 정보를 확인해주세요.</h3>
                            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                                <div><span className="font-semibold text-slate-600">평가명:</span> {newEvaluation.name}</div>
                                <div><span className="font-semibold text-slate-600">평가 구분:</span> {newEvaluation.period}</div>
                                <div><span className="font-semibold text-slate-600">시작 방식:</span> {newEvaluation.timing === 'now' ? '즉시 시작' : '예약 시작'}</div>
                                <div><span className="font-semibold text-slate-600">평가 일정:</span> {(newEvaluation.timing === 'now' ? today : newEvaluation.startDate)} ~ {newEvaluation.endDate}</div>
                                <div><span className="font-semibold text-slate-600">템플릿:</span> {templates.find(t => t.id === newEvaluation.templateId)?.name}</div>
                                <div><span className="font-semibold text-slate-600">대상자:</span> 총 {selectedMembers.size}명</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <div>
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} className="font-bold py-2 px-4 rounded-lg">
                                이전
                            </button>
                        )}
                    </div>
                    <div>
                        {step < 4 && (
                            <button onClick={() => setStep(step + 1)} disabled={ (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid) }
                                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed">
                                다음
                            </button>
                        )}
                        {step === 4 && (
                            <button onClick={handleLaunch} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                                평가 시작
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

StartEvaluationModal.displayName = 'StartEvaluationModal';

export default StartEvaluationModal;
