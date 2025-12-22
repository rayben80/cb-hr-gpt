import React, { memo, useCallback, DragEvent, useState } from 'react';
import { Icon } from '../common';
import { ICONS, Team, Member } from '../../constants';
import { ConfirmationModal } from '../ConfirmationModal';

// Hooks
import { useWizardState } from '../../hooks/useWizardState';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

// Step Components
import { WizardStep1TeamSetup } from './wizard/WizardStep1TeamSetup';
import { WizardStep2PartSetup } from './wizard/WizardStep2PartSetup';
import { WizardStep3MemberAssignment } from './wizard/WizardStep3MemberAssignment';
import { WizardStep4FinalReview } from './wizard/WizardStep4FinalReview';

interface WizardStepProps {
    number: number;
    label: string;
    isActive: boolean;
    isCompleted: boolean;
}

const WizardStep: React.FC<WizardStepProps> = memo(({ number, label, isActive, isCompleted }) => (
    <li className={`flex items-center relative ${isActive ? 'text-sky-600' : isCompleted ? 'text-green-600' : 'text-slate-500'}`}>
        <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mr-2 transition-all ${
            isActive 
                ? 'bg-sky-500 text-white shadow-lg scale-110' 
                : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-200 text-slate-500'
        }`}>
            {isCompleted ? <Icon path={ICONS.checkCircle} className="w-4 h-4" /> : number}
        </span>
        <span className={`font-medium text-xs sm:text-sm ${isActive ? 'font-semibold' : ''}`}>{label}</span>
        {number < 4 && (
            <svg className={`w-3 h-3 ml-2 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 9 4-4-4-4M1 9l4-4-4-4"/>
            </svg>
        )}
    </li>
));

WizardStep.displayName = 'WizardStep';

interface RestructuringWizardOptimizedProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teams: Team[]) => void;
    currentTeams: Team[];
}

export const RestructuringWizardOptimized: React.FC<RestructuringWizardOptimizedProps> = memo(({ 
    isOpen, 
    onClose, 
    onSave, 
    currentTeams 
}) => {
    // 상태 관리 hooks
    const [state, actions, computed] = useWizardState(currentTeams, isOpen);

    // 단계 정의
    const steps = [
        { number: 1, label: '팀 구성' },
        { number: 2, label: '파트 구성' },
        { number: 3, label: '멤버 배치' },
        { number: 4, label: '검토 및 저장' },
    ];

    // 핸들러 함수들
    const handleCloseRequest = useCallback(() => {
        actions.setConfirmation({
            isOpen: true,
            onConfirm: () => {
                actions.resetWizard();
                setTimeout(() => {
                    onClose();
                }, 0);
            }
        });
    }, [actions, onClose]);

    const handleSaveAndClose = useCallback(async () => {
        if (state.isLoading) return;
        
        actions.setIsLoading(true);
        try {
            if (computed.unassignedMembers.length > 0) {
                console.warn(`Saving with ${computed.unassignedMembers.length} unassigned members.`);
            }
            // 저장 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 2000));
            onSave(state.newTeams);
            actions.resetWizard();
            onClose();
        } catch (error) {
            console.error('Error saving teams:', error);
        } finally {
            actions.setIsLoading(false);
        }
    }, [state.isLoading, state.newTeams, computed.unassignedMembers.length, actions, onSave, onClose]);

    // 키보드 네비게이션
    useKeyboardNavigation({
        isOpen,
        confirmationOpen: state.confirmation.isOpen,
        isTransitioning: state.isTransitioning,
        currentStep: state.step,
        canProceedToStep2: computed.canProceedToStep2,
        canProceedToStep3: computed.canProceedToStep3,
        onCloseRequest: handleCloseRequest,
        onPreviousStep: actions.handlePreviousStep,
        onNextStep: actions.handleNextStep,
        onSaveAndClose: handleSaveAndClose
    });

    const [dragOverKey, setDragOverKey] = useState<string | null>(null);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>, targetKey: string) => {
        e.preventDefault();
        setDragOverKey(targetKey);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setDragOverKey(null);
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, targetTeamId: string, targetPartId: string) => {
        e.preventDefault();
        setDragOverKey(null);

        const memberId = e.dataTransfer.getData('memberId');
        if (!memberId) return;

        const sourceInfoRaw = e.dataTransfer.getData('sourceInfo');
        const sourceInfo = sourceInfoRaw ? JSON.parse(sourceInfoRaw) as { teamId: string; partId: string } : null;

        if (sourceInfo && sourceInfo.teamId === targetTeamId && sourceInfo.partId === targetPartId) {
            return;
        }

        const member = computed.allMembers.find(m => m.id === memberId);
        if (!member) return;

        const nextTeams = state.newTeams.map(team => {
            const nextParts = team.parts.map(part => {
                const shouldRemove = sourceInfo && team.id === sourceInfo.teamId && part.id === sourceInfo.partId;
                const shouldAdd = team.id === targetTeamId && part.id === targetPartId;

                let members = part.members;
                if (shouldRemove) {
                    members = members.filter(m => m.id !== memberId);
                }
                if (shouldAdd && !members.some(m => m.id === memberId)) {
                    members = [...members, member];
                }

                return members === part.members ? part : { ...part, members };
            });

            return nextParts === team.parts ? team : { ...team, parts: nextParts };
        });

        actions.setNewTeams(nextTeams);
    }, [actions, computed.allMembers, state.newTeams]);

    const handleDragEnd = useCallback(() => {
        setDragOverKey(null);
    }, []);

    // 단계별 컨텐츠 렌더링
    const renderStepContent = useCallback(() => {
        switch (state.step) {
            case 1:
                return (
                    <WizardStep1TeamSetup
                        newTeams={state.newTeams}
                        isAddingTeam={state.isAddingTeam}
                        newTeamName={state.newTeamName}
                        newTeamLead={state.newTeamLead}
                        onNewTeamNameChange={actions.setNewTeamName}
                        onNewTeamLeadChange={actions.setNewTeamLead}
                        onStartAddingTeam={() => actions.setIsAddingTeam(true)}
                        onAddTeam={actions.handleAddTeam}
                        onCancelAddTeam={actions.cancelAddTeam}
                        onDeleteTeam={actions.deleteTeam}
                    />
                );
            case 2:
                return (
                    <WizardStep2PartSetup
                        newTeams={state.newTeams}
                        addingPartToTeam={state.addingPartToTeam}
                        newPartTitle={state.newPartTitle}
                        onNewPartTitleChange={actions.setNewPartTitle}
                        onStartAddingPart={actions.setAddingPartToTeam}
                        onAddPart={actions.handleAddPart}
                        onCancelAddPart={actions.cancelAddPart}
                        onDeletePart={actions.deletePart}
                    />
                );
            case 3:
                return (
                    <WizardStep3MemberAssignment
                        newTeams={state.newTeams}
                        unassignedMembers={computed.unassignedMembers}
                        memberSearch={state.memberSearch}
                        isDragOver={dragOverKey}
                        onMemberSearchChange={actions.setMemberSearch}
                        onDragStart={(e, member, sourceInfo) => {
                            // 데이터 전송 설정
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('memberId', member.id);
                            if (sourceInfo) {
                                e.dataTransfer.setData('sourceInfo', JSON.stringify(sourceInfo));
                            }
                        }}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    />
                );
            case 4:
                return (
                    <WizardStep4FinalReview
                        newTeams={state.newTeams}
                        unassignedMembers={computed.unassignedMembers}
                        isLoading={state.isLoading}
                    />
                );
            default:
                return null;
        }
    }, [state, computed, dragOverKey, actions.setMemberSearch, handleDragEnd, handleDragLeave, handleDragOver, handleDrop]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[96vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="relative p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-t-2xl">
                    <button 
                        onClick={handleCloseRequest} 
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-all duration-200 z-10"
                        title="닫기 (ESC)"
                    >
                        <Icon path={ICONS.xMark} className="w-6 h-6" />
                    </button>
                    <div className="pr-12">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center mr-3">
                                <Icon path={ICONS.organizationChart} className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">조직 개편 마법사</h2>
                                <p className="text-sm text-slate-600">단계별로 새로운 조직 구조를 만들어보세요</p>
                            </div>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">진행 단계</span>
                                <span className="text-sm text-slate-500">{state.step}/4 단계</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                                <div 
                                    className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${(state.step / 4) * 100}%` }}
                                ></div>
                            </div>
                            <ol className="flex items-center justify-between text-xs sm:text-sm font-medium">
                                {steps.map(s => (
                                    <WizardStep 
                                        key={s.number} 
                                        number={s.number} 
                                        label={s.label} 
                                        isActive={state.step === s.number}
                                        isCompleted={computed.completedSteps[s.number]}
                                    />
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 relative">
                    <div className={`max-w-full mx-auto transition-all duration-300 ${
                        state.isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
                    }`}>
                        {/* 실시간 유효성 검사 메시지 */}
                        {computed.validationMessages.length > 0 && (
                            <div className="mb-6">
                                {computed.validationMessages.map((message, index) => (
                                    <div key={index} className={`flex items-start p-3 rounded-lg mb-2 ${
                                        state.step === 3 && message.includes('미배치') 
                                            ? 'bg-blue-50 border border-blue-200' 
                                            : 'bg-amber-50 border border-amber-200'
                                    }`}>
                                        <Icon 
                                            path={state.step === 3 && message.includes('미배치') ? ICONS.info : ICONS.warningAlert} 
                                            className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                                                state.step === 3 && message.includes('미배치') ? 'text-blue-600' : 'text-amber-600'
                                            }`} 
                                        />
                                        <span className={`text-sm font-medium ${
                                            state.step === 3 && message.includes('미배치') ? 'text-blue-800' : 'text-amber-800'
                                        }`}>
                                            {message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {renderStepContent()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 bg-white border-t border-slate-200 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-500">
                            {state.step === 3 && computed.unassignedMembers.length > 0 && (
                                <div className="flex items-center text-amber-600 mr-4">
                                    <Icon path={ICONS.warningAlert} className="w-4 h-4 mr-1" />
                                    {computed.unassignedMembers.length}명 미배치
                                </div>
                            )}
                            <div className="hidden sm:flex items-center space-x-4 text-xs">
                                <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Ctrl + ←→</kbd> 단계 이동</span>
                                <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">ESC</kbd> 닫기</span>
                                {state.step === 4 && (
                                    <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Ctrl + Enter</kbd> 저장</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {state.step > 1 && (
                                <button 
                                    onClick={actions.handlePreviousStep}
                                    disabled={state.isTransitioning || state.isLoading}
                                    className="flex items-center px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                                >
                                    <Icon path={ICONS.arrowLeftBack} className="w-4 h-4 mr-2" />
                                    이전
                                </button>
                            )}
                            {state.step < 4 && (
                                <button 
                                    onClick={actions.handleNextStep}
                                    disabled={state.isTransitioning || state.isLoading || (state.step === 1 && !computed.canProceedToStep2) || (state.step === 2 && !computed.canProceedToStep3)}
                                    className="flex items-center px-4 py-2 font-medium text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-lg shadow-md transition-all duration-200"
                                >
                                    다음
                                    <Icon path={ICONS.arrowLeft} className="w-4 h-4 ml-2 rotate-180" />
                                </button>
                            )}
                            {state.step === 4 && (
                                <>
                                    <button 
                                        onClick={handleCloseRequest}
                                        disabled={state.isLoading || state.isTransitioning}
                                        className="flex items-center px-4 py-2 font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                                    >
                                        <Icon path={ICONS.xMark} className="w-4 h-4 mr-2" />
                                        취소
                                    </button>
                                    <button 
                                        onClick={handleSaveAndClose}
                                        disabled={state.isLoading || state.isTransitioning}
                                        className="flex items-center px-6 py-2 font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-lg shadow-lg transition-all duration-200"
                                    >
                                        {state.isLoading ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                저장 중...
                                            </>
                                        ) : (
                                            <>
                                                <Icon path={ICONS.save} className="w-4 h-4 mr-2" />
                                                변경사항 저장
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <ConfirmationModal 
                isOpen={state.confirmation.isOpen}
                onClose={() => actions.setConfirmation({ ...state.confirmation, isOpen: false })}
                onConfirm={state.confirmation.onConfirm}
                title="변경사항 취소"
                message="정말 닫으시겠습니까? 조직 개편 마법사에서 변경한 내용은 저장되지 않습니다."
                confirmButtonText="네, 닫습니다"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
});

RestructuringWizardOptimized.displayName = 'RestructuringWizardOptimized';
