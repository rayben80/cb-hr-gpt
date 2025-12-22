import { useCallback } from 'react';
import { Team, Part, Headquarter, initialHeadquarters, HQ_UNASSIGNED_ID } from '../constants';
import { useModal } from './useModal';
import { useAsyncOperation } from './useAsyncOperation';
import { useConfirmation } from './useConfirmation';
import { useError } from '../contexts/ErrorContext';

/**
 * 팀과 파트 관리 로직을 처리하는 커스텀 훅
 */
export const useTeamPartManagement = (teams: Team[], setTeams: React.Dispatch<React.SetStateAction<Team[]>>, headquarters: Headquarter[] = initialHeadquarters) => {
    const [partModalState, partModalActions] = useModal<{ teamId: string, part?: Part }>();
    const [teamModalState, teamModalActions] = useModal<Team>();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const [confirmation, confirmationActions] = useConfirmation();
    const { showError } = useError();

    // 파트 관련 핸들러
    const openPartModal = useCallback((mode: 'add' | 'edit', data: { teamId: string, part?: Part }) => {
        partModalActions.openModal(mode, data);
    }, [partModalActions]);

    const closePartModal = useCallback(() => {
        partModalActions.closeModal();
    }, [partModalActions]);

    const handleSavePart = useCallback(async (newData: { name: string }) => {
        const { mode, data } = partModalState;
        if (!data) return;
        
        await saveOperationActions.execute(async () => {
            const team = teams.find(t => t.id === data.teamId);
            if (!team) throw new Error('팀을 찾을 수 없습니다.');

            if (mode === 'add') {
                const newPart: Part = { 
                    id: `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
                    title: newData.name, 
                    members: [] 
                };
                team.parts.push(newPart);
            } else if (data.part) {
                const part = team.parts.find(p => p.id === data.part?.id);
                if (!part) throw new Error('파트를 찾을 수 없습니다.');
                part.title = newData.name;
            }
            
            // UI 상태 업데이트
            const updatedTeams = teams.map((t: Team) => 
                t.id === data.teamId 
                    ? { ...team } 
                    : t
            );
            setTeams(updatedTeams);
            
            return 'success';
        }, {
            successMessage: mode === 'add' ? '파트가 성공적으로 추가되었습니다.' : '파트가 성공적으로 수정되었습니다.',
            errorMessage: `파트 ${mode === 'add' ? '추가' : '수정'} 중 오류가 발생했습니다.`,
            onSuccess: () => closePartModal()
        });
    }, [partModalState, saveOperationActions, closePartModal, teams, setTeams]);

    const handleDeletePart = useCallback((teamId: string, partId: string) => {
        const team = teams.find(t => t.id === teamId);
        const part = team?.parts.find(p => p.id === partId);
        
        if (!part || (part.members && part.members.length > 0)) {
            if (part?.members && part.members.length > 0) {
                showError('파트 삭제 불가', '파트에 소속된 멤버가 있어 삭제할 수 없습니다.');
            }
            return;
        }

        confirmationActions.showConfirmation({
            title: '파트 삭제 확인',
            message: `정말로 '${part.title}' 파트를 삭제하시겠습니까?`,
            onConfirm: async () => {
                await deleteOperationActions.execute(async () => {
                    setTeams(prevTeams => {
                        const team = prevTeams.find(t => t.id === teamId);
                        if (!team) {
                            showError('파트 삭제 실패', '팀을 찾을 수 없습니다.');
                            return prevTeams;
                        }

                        return prevTeams.map((t: Team) => {
                            if (t.id !== teamId) return t;
                            return {
                                ...t,
                                parts: t.parts.filter(p => p.id !== partId)
                            };
                        });
                    });
                    
                    return 'success';
                }, {
                    successMessage: '파트가 성공적으로 삭제되었습니다.',
                    errorMessage: '파트 삭제 중 오류가 발생했습니다.'
                });
            },
            confirmButtonText: '삭제',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700'
        });
    }, [teams, showError, confirmationActions, deleteOperationActions, setTeams]);

    // 팀 관련 핸들러
    const openTeamModal = useCallback((mode: 'add' | 'edit', data: Team | null) => {
        teamModalActions.openModal(mode, data || undefined);
    }, [teamModalActions]);

    const closeTeamModal = useCallback(() => {
        teamModalActions.closeModal();
    }, [teamModalActions]);

    const handleSaveTeam = useCallback(async (newData: { name: string; lead: string }) => {
        const { mode, data } = teamModalState;
        
        await saveOperationActions.execute(async () => {
            if (mode === 'add') {
                // 팀명을 기반으로 팀 ID 생성 (특수문자 제거 및 소문자 변환)
                const teamNameForId = newData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9가-힣]/g, '')
                    .substring(0, 50); // 최대 50자 제한
                
                // 팀 이름이 빈 문자열이 되지 않도록 보완
                let newTeamId = teamNameForId || `team_${Date.now()}`;
                
                // 이미 존재하는 팀 ID인지 확인하고, 중복될 경우 타임스탬프 추가
                const existingTeam = teams.find(t => t.id === newTeamId);
                if (existingTeam) {
                    const timestamp = Date.now();
                    newTeamId = `${teamNameForId || 'team'}_${timestamp}`;
                }
                
                // 로컬 상태에 팀 데이터 추가
                const fallbackHeadquarterId = (headquarters && headquarters[0]?.id) ?? initialHeadquarters[0]?.id ?? HQ_UNASSIGNED_ID;
                const newTeam = {
                    id: newTeamId,
                    name: newData.name,
                    lead: newData.lead,
                    parts: [],
                    headquarterId: fallbackHeadquarterId,
                };
                
                if (import.meta.env.DEV) {
                    console.log('Adding new team:', newTeam);
                }
                
                // 팀 목록에 새 팀 추가
                setTeams(prevTeams => {
                    const updatedTeams = [...prevTeams, {...newTeam}];
                    if (import.meta.env.DEV) {
                        console.log('Updated teams in handleSaveTeam:', updatedTeams);
                    }
                    return updatedTeams;
                });
                
                // 추가된 팀 ID 반환
                return newTeamId;
            } else {
                if (!data) throw new Error('팀 데이터가 없습니다.');
                
                // 로컬 상태 업데이트
                setTeams(prevTeams => 
                    prevTeams.map(team => 
                        team.id === data.id 
                            ? { ...team, name: newData.name, lead: newData.lead } 
                            : team
                    )
                );
                
                return 'success';
            }
        }, {
            successMessage: mode === 'add' ? '팀이 성공적으로 추가되었습니다.' : '팀이 성공적으로 수정되었습니다.',
            errorMessage: `팀 ${mode === 'add' ? '추가' : '수정'} 중 오류가 발생했습니다.`,
            onSuccess: () => {
                // 성공 시 모달 닫기
                closeTeamModal();
            }
        });
    }, [teamModalState, saveOperationActions, closeTeamModal, teams, setTeams, headquarters]);

    const handleDeleteTeam = useCallback((teamId: string) => {
        if (import.meta.env.DEV) {
            console.log('handleDeleteTeam called with teamId:', teamId);
        }
        const team = teams.find(t => t.id === teamId);
        if (!team) {
            if (import.meta.env.DEV) {
                console.log('Team not found for deletion:', teamId);
            }
            return;
        }
        
        if (import.meta.env.DEV) {
            console.log('Team found for deletion:', team);
        }
        
        // 팀에 멤버가 있는지 확인
        const hasMembers = team.parts.some(part => part.members && part.members.length > 0);
        if (hasMembers) {
            if (import.meta.env.DEV) {
                console.log('Team has members, cannot delete:', teamId);
            }
            showError('팀 삭제 불가', '팀에 멤버가 있어 삭제할 수 없습니다.');
            return;
        }

        if (import.meta.env.DEV) {
            console.log('Showing confirmation for team deletion:', teamId);
        }
        confirmationActions.showConfirmation({
            title: '팀 삭제 확인',
            message: `정말로 '${team.name}' 팀을 삭제하시겠습니까?`,
            onConfirm: async () => {
                if (import.meta.env.DEV) {
                    console.log('Team deletion confirmed for:', teamId);
                }
                await deleteOperationActions.execute(async () => {
                    setTeams(prevTeams => {
                        const teamToDelete = prevTeams.find((t: Team) => t.id === teamId);
                        if (!teamToDelete) {
                            return prevTeams;
                        }

                        const hasMembersNow = teamToDelete.parts.some(part => part.members && part.members.length > 0);
                        if (hasMembersNow) {
                            showError('팀 삭제 불가', '팀에 멤버가 있어 삭제할 수 없습니다.');
                            return prevTeams;
                        }

                        const updatedTeams = prevTeams.filter((t: Team) => t.id !== teamId);
                        if (import.meta.env.DEV) {
                            console.log('Team deleted, updated teams:', updatedTeams);
                        }
                        return updatedTeams;
                    });
                    
                    return 'success';
                }, {
                    successMessage: '팀이 성공적으로 삭제되었습니다.',
                    errorMessage: '팀 삭제 중 오류가 발생했습니다.'
                });
            },
            confirmButtonText: '삭제',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700'
        });
    }, [teams, showError, confirmationActions, deleteOperationActions, setTeams]);

    return {
        // 파트 관련
        partModalState,
        openPartModal,
        closePartModal,
        handleSavePart,
        handleDeletePart,
        
        // 팀 관련
        teamModalState,
        openTeamModal,
        closeTeamModal,
        handleSaveTeam,
        handleDeleteTeam,
        
        // 공통
        saveOperation,
        deleteOperation,
        confirmation,
        confirmationActions
    };
};

