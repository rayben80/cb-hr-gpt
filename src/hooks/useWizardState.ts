import { useState, useCallback, useMemo } from 'react';
import { Team, Member, Part } from '../constants';

export interface WizardState {
    // 네비게이션 상태
    step: number;
    isTransitioning: boolean;
    isLoading: boolean;
    
    // 팀 데이터
    newTeams: Team[];
    memberSearch: string;
    
    // UI 상태
    confirmation: { isOpen: boolean; onConfirm: () => void };
    
    // 팀 추가 상태
    isAddingTeam: boolean;
    newTeamName: string;
    newTeamLead: string;
    
    // 파트 추가 상태
    addingPartToTeam: string | null;
    newPartTitle: string;
}

export interface WizardActions {
    // 네비게이션
    setStep: (step: number) => void;
    setIsTransitioning: (isTransitioning: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    handlePreviousStep: () => void;
    handleNextStep: () => void;
    
    // 팀 관리
    setNewTeams: (teams: Team[]) => void;
    setMemberSearch: (search: string) => void;
    
    // 팀 추가
    setIsAddingTeam: (isAdding: boolean) => void;
    setNewTeamName: (name: string) => void;
    setNewTeamLead: (lead: string) => void;
    handleAddTeam: () => void;
    cancelAddTeam: () => void;
    deleteTeam: (teamId: string) => void;
    
    // 파트 추가
    setAddingPartToTeam: (teamId: string | null) => void;
    setNewPartTitle: (title: string) => void;
    handleAddPart: (teamId: string) => void;
    cancelAddPart: () => void;
    deletePart: (teamId: string, partId: string) => void;
    
    // 확인 모달
    setConfirmation: (confirmation: { isOpen: boolean; onConfirm: () => void }) => void;
    
    // 초기화
    resetWizard: () => void;
}

export interface WizardComputedValues {
    canProceedToStep2: boolean;
    canProceedToStep3: boolean;
    canProceedToStep4: boolean;
    completedSteps: Record<number, boolean>;
    allMembers: Member[];
    unassignedMembers: Member[];
    validationMessages: string[];
}

export const useWizardState = (
    currentTeams: Team[], 
    isOpen: boolean
): [WizardState, WizardActions, WizardComputedValues] => {
    // 상태 정의
    const [step, setStep] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [newTeams, setNewTeams] = useState<Team[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    
    const [confirmation, setConfirmation] = useState({ isOpen: false, onConfirm: () => {} });
    
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLead, setNewTeamLead] = useState('');
    
    const [addingPartToTeam, setAddingPartToTeam] = useState<string | null>(null);
    const [newPartTitle, setNewPartTitle] = useState('');

    // 계산된 값들
    const allMembers: Member[] = useMemo(() => {
        if (!isOpen) return [];
        return currentTeams.flatMap(t => t.parts.flatMap((p: Part) => p.members));
    }, [currentTeams, isOpen]);

    const unassignedMembers = useMemo(() => {
        const assignedMemberIds = new Set(newTeams.flatMap(t => t.parts.flatMap((p: Part) => p.members.map((m: Member) => m.id))));
        return allMembers
            .filter(m => !assignedMemberIds.has(m.id))
            .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()));
    }, [newTeams, allMembers, memberSearch]);

    const canProceedToStep2 = useMemo(() => newTeams.length > 0, [newTeams]);
    const canProceedToStep3 = useMemo(() => newTeams.length > 0 && newTeams.every(t => t.parts.length > 0), [newTeams]);
    const canProceedToStep4 = canProceedToStep3;

    const completedSteps = useMemo(() => {
        return {
            1: canProceedToStep2,
            2: canProceedToStep3,
            3: canProceedToStep4,
            4: false
        };
    }, [canProceedToStep2, canProceedToStep3, canProceedToStep4]);

    const validationMessages = useMemo(() => {
        const messages: string[] = [];
        
        if (step === 1) {
            if (newTeams.length === 0) {
                messages.push('최소 1개의 팀을 생성해야 다음 단계로 진행할 수 있습니다.');
            }
        } else if (step === 2) {
            const teamsWithoutParts = newTeams.filter(t => t.parts.length === 0);
            if (teamsWithoutParts.length > 0) {
                messages.push(`${teamsWithoutParts.map(t => t.name).join(', ')} 팀에 파트를 추가해주세요.`);
            }
        } else if (step === 3) {
            if (unassignedMembers.length > 0) {
                messages.push(`${unassignedMembers.length}명의 미배치 인원이 있습니다. 모든 인원을 배치하지 않아도 다음 단계로 진행할 수 있습니다.`);
            }
        }
        
        return messages;
    }, [step, newTeams, unassignedMembers]);

    // 액션 함수들
    const handlePreviousStep = useCallback(() => {
        if (isTransitioning || step <= 1) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setStep(s => s - 1);
            setIsTransitioning(false);
        }, 150);
    }, [step, isTransitioning]);

    const handleNextStep = useCallback(() => {
        if (isTransitioning) return;
        
        if (step === 1 && !canProceedToStep2) return;
        if (step === 2 && !canProceedToStep3) return;
        if (step >= 4) return;
        
        setIsTransitioning(true);
        setTimeout(() => {
            setStep(s => s + 1);
            setIsTransitioning(false);
        }, 150);
    }, [step, isTransitioning, canProceedToStep2, canProceedToStep3]);

    const handleAddTeam = useCallback(() => {
        if (newTeamName && newTeamLead) {
            const newTeam: Team = { 
                id: `team_${Date.now()}`, 
                name: newTeamName, 
                lead: newTeamLead, 
                parts: [] 
            };
            setNewTeams(prev => [...prev, newTeam]);
            setNewTeamName('');
            setNewTeamLead('');
            setIsAddingTeam(false);
        }
    }, [newTeamName, newTeamLead]);

    const cancelAddTeam = useCallback(() => {
        setNewTeamName('');
        setNewTeamLead('');
        setIsAddingTeam(false);
    }, []);

    const deleteTeam = useCallback((teamId: string) => {
        const team = newTeams.find(t => t.id === teamId);
        if (team && team.parts.some((p: Part) => p.members.length > 0)) {
            alert("멤버가 배치된 팀은 삭제할 수 없습니다. 먼저 멤버를 다른 곳으로 이동시켜주세요.");
            return;
        }
        setNewTeams(prev => prev.filter(t => t.id !== teamId));
    }, [newTeams]);

    const handleAddPart = useCallback((teamId: string) => {
        if (newPartTitle.trim()) {
            setNewTeams(currentTeams => currentTeams.map(t =>
                t.id === teamId 
                    ? { ...t, parts: [...t.parts, { id: `part_${Date.now()}`, title: newPartTitle.trim(), members: [] }] } 
                    : t
            ));
            setNewPartTitle('');
            setAddingPartToTeam(null);
        }
    }, [newPartTitle]);

    const cancelAddPart = useCallback(() => {
        setNewPartTitle('');
        setAddingPartToTeam(null);
    }, []);

    const deletePart = useCallback((teamId: string, partId: string) => {
        const team = newTeams.find(t => t.id === teamId);
        const part = team?.parts.find((p: Part) => p.id === partId);
        if (part && part.members.length > 0) {
            alert("멤버가 있는 파트는 삭제할 수 없습니다. 먼저 멤버를 다른 곳으로 이동시켜주세요.");
            return;
        }
        setNewTeams(prev => prev.map(t => 
            t.id === teamId ? { ...t, parts: t.parts.filter((p: Part) => p.id !== partId) } : t
        ));
    }, [newTeams]);

    const resetWizard = useCallback(() => {
        setStep(1);
        setNewTeams([]);
        setMemberSearch('');
        setIsAddingTeam(false);
        setNewTeamName('');
        setNewTeamLead('');
        setAddingPartToTeam(null);
        setNewPartTitle('');
        setConfirmation({ isOpen: false, onConfirm: () => {} });
        setIsTransitioning(false);
        setIsLoading(false);
    }, []);

    // 상태 객체
    const state: WizardState = {
        step,
        isTransitioning,
        isLoading,
        newTeams,
        memberSearch,
        confirmation,
        isAddingTeam,
        newTeamName,
        newTeamLead,
        addingPartToTeam,
        newPartTitle
    };

    // 액션 객체
    const actions: WizardActions = {
        setStep,
        setIsTransitioning,
        setIsLoading,
        handlePreviousStep,
        handleNextStep,
        setNewTeams,
        setMemberSearch,
        setIsAddingTeam,
        setNewTeamName,
        setNewTeamLead,
        handleAddTeam,
        cancelAddTeam,
        deleteTeam,
        setAddingPartToTeam,
        setNewPartTitle,
        handleAddPart,
        cancelAddPart,
        deletePart,
        setConfirmation,
        resetWizard
    };

    // 계산된 값 객체
    const computed: WizardComputedValues = {
        canProceedToStep2,
        canProceedToStep3,
        canProceedToStep4,
        completedSteps,
        allMembers,
        unassignedMembers,
        validationMessages
    };

    return [state, actions, computed];
};