import { useState, useCallback, useMemo } from 'react';
import { Team, Member as MemberType, Part } from '../constants';
import { useConfirmation } from './useConfirmation';
import { useAsyncOperation } from './useAsyncOperation';
import { useError } from '../contexts/ErrorContext';

/**
 * 멤버 관리 로직을 처리하는 커스텀 훅
 */
export const useMemberManagement = (teams: Team[], setTeams: (teams: Team[]) => void) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<MemberType | null>(null);
    const [modalContext, setModalContext] = useState<{ teamId: string, partId: string } | null>(null);
    
    const [confirmation, confirmationActions] = useConfirmation();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const { showError, showSuccess } = useError();

    // 멤버 추가 모달 열기
    const handleAddMember = useCallback((teamId: string, partId: string) => {
        setEditingMember(null);
        setModalContext({ teamId, partId });
        setIsModalOpen(true);
    }, []);

    // 멤버 편집 모달 열기
    const handleEditMember = useCallback((member: MemberType) => {
        setEditingMember(member);
        setModalContext(null);
        setIsModalOpen(true);
    }, []);

    // 멤버 위치 찾기 유틸리티
    const findMemberLocation = useCallback((memberToFind: MemberType) => {
        for (const team of teams) {
            for (const part of team.parts) {
                if (part.members.some(m => m.id === memberToFind.id)) {
                    return { teamId: team.id, partId: part.id };
                }
            }
        }
        return { teamId: null, partId: null };
    }, [teams]);

    // 멤버 저장 로직
    const handleSaveMember = useCallback(async (data: MemberType & { teamId: string; partId: string }, isEditing: boolean) => {
        const { teamId, partId, ...memberData } = data;
        
        await saveOperationActions.execute(async () => {
            if (isEditing) {
                const oldLocation = findMemberLocation(memberData);
                
                if (oldLocation.teamId && (oldLocation.teamId !== teamId || oldLocation.partId !== partId)) {
                    // 팀/파트 이동이 필요한 경우
                    // UI 상태 업데이트
                    const teamsWithoutMember = teams.map((team: Team) => {
                        if (team.id === oldLocation.teamId) {
                            return {
                                ...team,
                                parts: team.parts.map((part: Part) => {
                                    if (part.id === oldLocation.partId) {
                                        return {
                                            ...part,
                                            members: part.members.filter((m: MemberType) => m.id !== memberData.id)
                                        };
                                    }
                                    return part;
                                })
                            };
                        }
                        return team;
                    });
                    
                    const updatedTeams = teamsWithoutMember.map((team: Team) => {
                        if (team.id === teamId) {
                            return {
                                ...team,
                                parts: team.parts.map((part: Part) => {
                                    if (part.id === partId) {
                                        // 멤버 ID가 없으면 생성
                                        if (!memberData.id) {
                                            memberData.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                        }
                                        // 이미 멤버가 있는지 확인
                                        const memberExists = part.members.some((m: MemberType) => m.id === memberData.id);
                                        if (!memberExists) {
                                            return {
                                                ...part,
                                                members: [...part.members, memberData]
                                            };
                                        }
                                    }
                                    return part;
                                })
                            };
                        }
                        return team;
                    });
                    
                    setTeams(updatedTeams);
                } else {
                    // 같은 팀/파트 내에서 정보만 업데이트
                    // UI 상태 업데이트
                    const updatedTeams = teams.map((team: Team) => {
                        if (team.id === teamId) {
                            return {
                                ...team,
                                parts: team.parts.map((p: Part) => {
                                    if (p.id === partId) {
                                        const memberIndex = p.members.findIndex((m: MemberType) => m.id === memberData.id);
                                        if (memberIndex > -1) {
                                            const updatedMembers = [...p.members];
                                            updatedMembers[memberIndex] = memberData;
                                            return {
                                                ...p,
                                                members: updatedMembers
                                            };
                                        } else {
                                            // 새로운 멤버 추가
                                            // 멤버 ID가 없으면 생성
                                            if (!memberData.id) {
                                                memberData.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                            }
                                            return {
                                                ...p,
                                                members: [...p.members, memberData]
                                            };
                                        }
                                    }
                                    return p;
                                })
                            };
                        }
                        return team;
                    });
                    
                    setTeams(updatedTeams);
                }
            } else {
                // 새 멤버 추가
                // UI 상태 업데이트
                const updatedTeams = teams.map((team: Team) => {
                    if (team.id === teamId) {
                        return {
                            ...team,
                            parts: team.parts.map((p: Part) => {
                                if (p.id === partId) {
                                    // 멤버 ID가 없으면 생성
                                    if (!memberData.id) {
                                        memberData.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    }
                                    // 이미 멤버가 있는지 확인
                                    const memberExists = p.members.some((m: MemberType) => m.id === memberData.id);
                                    if (!memberExists) {
                                        return {
                                            ...p,
                                            members: [...p.members, memberData]
                                        };
                                    }
                                }
                                return p;
                            })
                        };
                    }
                    return team;
                });
                
                setTeams(updatedTeams);
            }
            return 'success';
        }, {
            successMessage: isEditing ? '멤버 정보가 성공적으로 업데이트되었습니다.' : '새 멤버가 성공적으로 추가되었습니다.',
            errorMessage: `멤버 ${isEditing ? '수정' : '추가'} 중 오류가 발생했습니다.`,
            onSuccess: () => {
                setIsModalOpen(false);
                setEditingMember(null);
                setModalContext(null);
            }
        });
    }, [saveOperationActions, findMemberLocation, teams, setTeams]);

    // 멤버 퇴사 처리
    const handleDeleteMember = useCallback((memberToDelete: MemberType) => {
        const location = findMemberLocation(memberToDelete);

        if (!location.teamId || !location.partId) {
            showError("오류: 멤버의 소속을 찾을 수 없어 퇴사 처리할 수 없습니다.");
            return;
        }

        confirmationActions.showConfirmation({
            title: '퇴사 처리 확인',
            message: `${memberToDelete.name}님을 퇴사 처리하시겠습니까? 이 작업은 되돌릴 수 있지만, 조직도에서 즉시 제외됩니다.`,
            onConfirm: async () => {
                const updatedMemberData = { ...memberToDelete, status: 'resigned' as const, ...location };
                await handleSaveMember(updatedMemberData as MemberType & { teamId: string; partId: string }, true);
            },
            confirmButtonText: '퇴사 처리',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700'
        });
    }, [findMemberLocation, confirmationActions, showError, handleSaveMember]);

    // 퇴사자 기록 영구 삭제
    const handleDeleteResignedMember = useCallback((memberToDelete: MemberType) => {
        confirmationActions.showConfirmation({
            title: '기록 영구 삭제',
            message: `${memberToDelete.name}님의 퇴사 기록을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
            onConfirm: async () => {
                await deleteOperationActions.execute(async () => {
                    // UI 상태 업데이트
                    setTeams((prevTeams: Team[]) => {
                        const updatedTeams = prevTeams.map((team: Team) => {
                            if (team.id === memberToDelete.teamId) {
                                return {
                                    ...team,
                                    parts: team.parts.map((part: Part) => {
                                        if (part.id === memberToDelete.partId) {
                                            return {
                                                ...part,
                                                members: part.members.filter((m: MemberType) => m.id !== memberToDelete.id)
                                            };
                                        }
                                        return part;
                                    })
                                };
                            }
                            return team;
                        });
                        return updatedTeams;
                    });
                    
                    return 'success';
                }, {
                    successMessage: '멤버 기록이 영구적으로 삭제되었습니다.',
                    errorMessage: '멤버 삭제 중 오류가 발생했습니다.'
                });
            },
            confirmButtonText: '영구 삭제',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700'
        });
    }, [confirmationActions, deleteOperationActions, teams, setTeams]);

    // 멤버 복직 처리
    const handleReinstateMember = useCallback((memberToReinstate: MemberType) => {
        confirmationActions.showConfirmation({
            title: '복직 처리 확인',
            message: `${memberToReinstate.name}님을 복직 처리하시겠습니까? 멤버가 조직도에 다시 표시됩니다.`,
            onConfirm: async () => {
                const updatedMember = { ...memberToReinstate, status: 'active' as const };
                if (updatedMember.teamId && updatedMember.partId) {
                    await handleSaveMember(updatedMember as MemberType & { teamId: string; partId: string; }, true);
                } else {
                    showError("멤버를 복직 처리할 수 없습니다. 소속 정보가 누락되었습니다.");
                }
            },
            confirmButtonText: '복직 처리',
            confirmButtonColor: 'bg-sky-600 hover:bg-sky-700'
        });
    }, [confirmationActions, showError, handleSaveMember]);

    return {
        // 상태
        isModalOpen,
        setIsModalOpen,
        editingMember,
        modalContext,
        saveOperation,
        deleteOperation,
        confirmation,
        
        // 핸들러
        handleAddMember,
        handleEditMember,
        handleDeleteMember,
        handleDeleteResignedMember,
        handleReinstateMember,
        handleSaveMember,
        
        // 액션
        confirmationActions
    };
};
