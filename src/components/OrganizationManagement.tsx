import React, { useState, memo, useCallback, useMemo, useEffect, useRef } from 'react';
import { Icon } from './common';
import { ICONS } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';
import { Member as MemberType, Team, Part, Headquarter, HQ_UNASSIGNED_ID } from '../constants';

// Custom Hooks
import { useOrganizationData } from '../hooks/useOrganizationData';
import { useMemberManagement } from '../hooks/useMemberManagement';
import { useTeamPartManagement } from '../hooks/useTeamPartManagement';
import { useOrganizationFilter } from '../hooks/useOrganizationFilter';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

// Components
import { OrgStatCard } from './organization/OrgStatCard';
import { TeamCard } from './organization/TeamCard';
import { InactiveMemberList } from './organization/InactiveMemberList';
import { MemberActionModal } from './organization/MemberActionModal';
import { PartActionModal } from './organization/PartActionModal';
import { TeamActionModal } from './organization/TeamActionModal';
import { RestructuringWizardOptimized as RestructuringWizard } from './organization/RestructuringWizard';
import { LoadingSpinner } from './Progress';
import { StatusCard } from './Status';
import { MemberMoveModal } from './organization/MemberMoveModal';
import { HeadquarterActionModal } from './organization/HeadquarterActionModal';

const OrganizationManagement = memo(() => {
    // UI 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [teamSearchTerm, setTeamSearchTerm] = useState(''); // 팀 이름 검색을 위한 상태
    const [teamLeadSearchTerm, setTeamLeadSearchTerm] = useState(''); // 팀 리더 검색을 위한 상태
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false); // 고급 검색 옵션 표시 여부
    const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('orgChart');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    
    // 멤버 이동 모달 관련 상태
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [memberToMove, setMemberToMove] = useState<MemberType | null>(null);

    const [isHeadquarterModalOpen, setIsHeadquarterModalOpen] = useState(false);
    const [headquarterToEdit, setHeadquarterToEdit] = useState<Headquarter | null>(null);
    
    // 커스텀 스크롤 관련 상태
    const scrollContainerRef = useRef<HTMLElement | null>(null);
    const scrollTimerRef = useRef<number | null>(null);
    const isAutoScrolling = useRef(false);
    const scrollDirection = useRef<'up' | 'down' | null>(null);
    const scrollSpeed = useRef(0);
    const isDraggingRef = useRef(false);
    
    // 네트워크 상태
    const [networkState, networkActions] = useNetworkStatus();
    
    // 조직 데이터 관리
    const {
        teams,
        setTeams,
        isLoading,
        error,
        stats,
        seedOperation,
        confirmation: orgDataConfirmation,
        handleSeedDatabase,
        confirmationActions: orgDataConfirmationActions,
        headquarters,
        updateHeadquarter
    } = useOrganizationData();
    
    // 멤버 관리
    const {
        isModalOpen,
        setIsModalOpen,
        editingMember,
        modalContext,
        saveOperation,
        deleteOperation,
        handleAddMember,
        handleEditMember,
        handleDeleteMember,
        handleDeleteResignedMember,
        handleReinstateMember,
        handleSaveMember
    } = useMemberManagement(teams, setTeams);
    
    // 멤버를 특정 팀/파트로 이동하는 함수
    const moveMemberToTeamPart = useCallback((memberId: string, targetTeamId: string, targetPartId: string) => {
        
        // 로컬 상태에서 멤버 이동 처리
        setTeams(prevTeams => {
            // 먼저 멤버를 찾고 제거
            let memberToMove: MemberType | undefined = undefined;
            const teamsWithoutMember = prevTeams.map(team => {
                const updatedParts = team.parts.map(part => {
                    const memberIndex = part.members.findIndex(m => m.id === memberId);
                    if (memberIndex !== -1 && memberToMove === undefined) {
                        // 멤버를 찾았을 때 한 번만 추출
                        memberToMove = {...part.members[memberIndex]};
                        return {
                            ...part,
                            members: [
                                ...part.members.slice(0, memberIndex),
                                ...part.members.slice(memberIndex + 1)
                            ]
                        };
                    }
                    return part;
                });
                return {
                    ...team,
                    parts: updatedParts
                };
            });
            
            // 멤버를 찾지 못한 경우 기존 상태 반환
            if (!memberToMove) {
                console.warn('Member not found for moving:', memberId);
                return prevTeams;
            }
            
            // 타겟 팀/파트에 멤버 추가
            return teamsWithoutMember.map(team => {
                if (team.id === targetTeamId) {
                    return {
                        ...team,
                        parts: team.parts.map(part => {
                            if (part.id === targetPartId) {
                                // 이미 해당 멤버가 존재하는지 확인
                                const memberExists = part.members.some(m => m.id === memberId);
                                if (!memberExists) {
                                    return {
                                        ...part,
                                        members: [...part.members, memberToMove!]
                                    };
                                }
                            }
                            return part;
                        })
                    };
                }
                return team;
            });
        });
    }, [setTeams]);
    
    // 멤버 이동 모달을 여는 함수
    const openMoveModal = useCallback((member: MemberType) => {
        setMemberToMove(member);
        setIsMoveModalOpen(true);
    }, []);
    
    // 멤버 이동 모달을 닫는 함수
    const closeMoveModal = useCallback(() => {
        setIsMoveModalOpen(false);
        setMemberToMove(null);
    }, []);
    
    // 멤버 이동 처리 함수
    const handleMoveMember = useCallback((memberId: string, targetTeamId: string, targetPartId: string) => {
        moveMemberToTeamPart(memberId, targetTeamId, targetPartId);
        closeMoveModal();
    }, [moveMemberToTeamPart, closeMoveModal]);

    const openHeadquarterModal = useCallback((hq: Headquarter) => {
        setHeadquarterToEdit(hq);
        setIsHeadquarterModalOpen(true);
    }, []);

    const closeHeadquarterModal = useCallback(() => {
        setIsHeadquarterModalOpen(false);
        setHeadquarterToEdit(null);
    }, []);

    const handleSaveHeadquarter = useCallback((payload: { id: string; leader: Headquarter['leader']; description?: string; name?: string }) => {
        const target = headquarters.find(hq => hq.id === payload.id);
        if (!target) {
            return;
        }

        const updatedHeadquarter: Headquarter = {
            ...target,
            ...(payload.name ? { name: payload.name } : {}),
            ...(payload.description !== undefined ? { description: payload.description } : {}),
            leader: {
                ...target.leader,
                ...payload.leader,
            },
        };

        updateHeadquarter(updatedHeadquarter);
        closeHeadquarterModal();
    }, [headquarters, updateHeadquarter, closeHeadquarterModal]);

    // 팀/파트 관리
    const {
        partModalState,
        openPartModal,
        closePartModal,
        handleSavePart,
        handleDeletePart,
        teamModalState,
        openTeamModal,
        closeTeamModal,
        handleSaveTeam,
        handleDeleteTeam,
        confirmation: teamPartConfirmation,
        confirmationActions: teamPartConfirmationActions
    } = useTeamPartManagement(teams, setTeams, headquarters);

    // 데이터 필터링
    const {
        activeTeams,
        filteredInactiveMembers
    } = useOrganizationFilter(teams, searchTerm, teamSearchTerm, teamLeadSearchTerm);
    
    // 디버깅용 로그
    
    // teams 상태가 변경될 때마다 콘솔에 로그 출력
    useEffect(() => {
    }, [teams]);

    // activeTeams가 변경될 때마다 콘솔에 로그 출력
    useEffect(() => {
    }, [activeTeams]);

    // 팀 추가 시 UI에 즉시 반영되도록 팀 목록을 메모이제이션


    const renderTeamCard = useCallback((team: Team) => (
        <TeamCard
            key={`team-${team.id}`}
            team={team}
            baseDate={baseDate}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onDropMemberInPart={(memberId, teamId, partId) => moveMemberToTeamPart(memberId, teamId, partId)}
            onAddPart={(teamId) => openPartModal('add', { teamId })}
            onEditPart={(teamId, part) => openPartModal('edit', { teamId, part })}
            onDeletePart={handleDeletePart}
            onEditTeam={(teamData) => openTeamModal('edit', teamData)}
            onDeleteTeam={(teamId) => {
                handleDeleteTeam(teamId);
            }}
            onMoveMember={openMoveModal}
            searchTerm={searchTerm}
        />
    ), [
        baseDate,
        handleAddMember,
        handleEditMember,
        handleDeleteMember,
        moveMemberToTeamPart,
        openPartModal,
        handleDeletePart,
        openTeamModal,
        handleDeleteTeam,
        openMoveModal,
        searchTerm,
    ]);

    const defaultHeadquarterId = headquarters[0]?.id ?? HQ_UNASSIGNED_ID;

    const groupedHeadquarters = useMemo(() => {
        const assignedTeamIds = new Set<string>();
        const sections = headquarters.map((hq) => {
            const teamsInHeadquarter = activeTeams.filter((team) => {
                const teamHeadquarterId = team.headquarterId ?? defaultHeadquarterId;
                const belongsToHeadquarter = teamHeadquarterId === hq.id;
                if (belongsToHeadquarter) {
                    assignedTeamIds.add(team.id);
                }
                return belongsToHeadquarter;
            });
            return { headquarter: hq, teams: teamsInHeadquarter };
        });
        const unassignedTeams = activeTeams.filter(team => !assignedTeamIds.has(team.id));
        return { sections, unassignedTeams };
    }, [headquarters, activeTeams, defaultHeadquarterId]);

    const hasAnyTeamsInView = useMemo(
        () => groupedHeadquarters.sections.some(section => section.teams.length > 0) || groupedHeadquarters.unassignedTeams.length > 0,
        [groupedHeadquarters],
    );

    const getTeamGridClass = useCallback((count: number) => {
        const base = 'grid gap-4 sm:gap-6 lg:gap-8 items-start';
        if (count <= 1) return `${base} grid-cols-1`;
        if (count === 2) return `${base} grid-cols-1 md:grid-cols-2`;
        if (count === 3) return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
        if (count === 4) return `${base} grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3`;
        return `${base} mobile-grid`;
    }, []);

    const tabs = [
        { id: 'orgChart', label: '조직도' },
        { id: 'inactive', label: `비활성 인원 (${filteredInactiveMembers.onLeave.length + filteredInactiveMembers.resigned.length})` }
    ];

    // 커스텀 자동 스크롤 로직
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        return () => {
            if (scrollTimerRef.current !== null) {
                cancelAnimationFrame(scrollTimerRef.current);
                scrollTimerRef.current = null;
            }
        };
    }, []);

    const stopAutoScroll = useCallback(() => {
        if (scrollTimerRef.current !== null) {
            cancelAnimationFrame(scrollTimerRef.current);
            scrollTimerRef.current = null;
        }
        isAutoScrolling.current = false;
        scrollDirection.current = null;
        scrollSpeed.current = 0;
    }, []);

    const startAutoScroll = useCallback(() => {
        if (isAutoScrolling.current) return;
        isAutoScrolling.current = true;
        const tick = () => {
            if (!scrollContainerRef.current || !scrollDirection.current) {
                stopAutoScroll();
                return;
            }

            const container = scrollContainerRef.current;
            const delta = scrollSpeed.current;
            const maxScroll = container.scrollHeight - container.clientHeight;

            if (scrollDirection.current === 'up') {
                if (container.scrollTop <= 0) {
                    stopAutoScroll();
                    return;
                }
                container.scrollTop = Math.max(0, container.scrollTop - delta);
            } else {
                if (container.scrollTop >= maxScroll) {
                    stopAutoScroll();
                    return;
                }
                container.scrollTop = Math.min(maxScroll, container.scrollTop + delta);
            }

            scrollTimerRef.current = requestAnimationFrame(tick);
        };

        scrollTimerRef.current = requestAnimationFrame(tick);
    }, [stopAutoScroll]);

    const updateAutoScroll = useCallback((clientY: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const viewportTop = 0;
        const viewportBottom = window.innerHeight;
        const visibleTop = Math.max(rect.top, viewportTop);
        const visibleBottom = Math.min(rect.bottom, viewportBottom);

        if (visibleBottom <= visibleTop) {
            stopAutoScroll();
            return;
        }

        const threshold = 200;
        const maxSpeed = 32;

        const distanceToTop = Math.abs(clientY - visibleTop);
        const distanceToBottom = Math.abs(visibleBottom - clientY);

        const topProximity = distanceToTop <= threshold ? threshold - distanceToTop : 0;
        const bottomProximity = distanceToBottom <= threshold ? threshold - distanceToBottom : 0;

        if (topProximity === 0 && bottomProximity === 0) {
            stopAutoScroll();
            return;
        }

        const nextDirection = topProximity >= bottomProximity ? 'up' : 'down';
        const nextSpeed = topProximity >= bottomProximity
            ? Math.ceil((topProximity / threshold) * maxSpeed)
            : Math.ceil((bottomProximity / threshold) * maxSpeed);

        scrollDirection.current = nextDirection;
        scrollSpeed.current = Math.max(3, nextSpeed);
        startAutoScroll();
    }, [startAutoScroll, stopAutoScroll]);

    const handleContainerDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        isDraggingRef.current = true;
        updateAutoScroll(event.clientY);
    }, [updateAutoScroll]);

    const handleContainerDrop = useCallback(() => {
        stopAutoScroll();
    }, [stopAutoScroll]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            return;
        }

        const mainElement = document.querySelector('main');
        if (mainElement) {
            scrollContainerRef.current = mainElement as HTMLElement;
            return;
        }

        if (document.scrollingElement) {
            scrollContainerRef.current = document.scrollingElement as HTMLElement;
        }
    }, []);

    useEffect(() => {
        const handleDragStart = () => {
            isDraggingRef.current = true;
        };
        const handleDragOver = (event: DragEvent) => {
            if (!isDraggingRef.current) return;
            updateAutoScroll(event.clientY);
        };
        const handleDragEnd = () => {
            isDraggingRef.current = false;
            stopAutoScroll();
        };
        window.addEventListener('dragstart', handleDragStart);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragend', handleDragEnd);
        window.addEventListener('drop', handleDragEnd);

        return () => {
            window.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragend', handleDragEnd);
            window.removeEventListener('drop', handleDragEnd);
            stopAutoScroll();
        };
    }, [stopAutoScroll, updateAutoScroll]);
    
    // 조직 개편 처리
    const handleApplyRestructuring = (newTeams: any[]) => {
        setTeams(newTeams);
        setIsWizardOpen(false);
    };
    
    return (
        <>
            {/* 네트워크 연결 상태 표시 */}
            {!networkState.isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
                    <Icon path={ICONS.warning} className="w-4 h-4 inline mr-2" />
                    네트워크 연결이 끊어졌습니다.
                </div>
            )}
            
            {/* 로딩 오버레이 */}
            {(saveOperation.isLoading || deleteOperation.isLoading || seedOperation.isLoading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <div className="flex items-center space-x-3">
                            <LoadingSpinner size="md" color="blue" />
                            <span className="text-slate-700">
                                {seedOperation.isLoading && '데이터베이스 초기화 중...'}
                                {saveOperation.isLoading && '저장 중...'}
                                {deleteOperation.isLoading && '삭제 중...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">조직 관리</h1>
                <p className="text-lg text-slate-600 mt-1">클라우드사업본부 조직도 및 인원 현황</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <OrgStatCard icon={ICONS.users} title="전체 인원" value={stats.total} iconBgColor="bg-slate-500" />
                <OrgStatCard icon={ICONS.userCheck} title="재직" value={stats.active} iconBgColor="bg-green-500" />
                <OrgStatCard icon={ICONS.userGraduate} title="인턴" value={stats.intern} iconBgColor="bg-purple-500" />
                <OrgStatCard icon={ICONS.userPause} title="휴직" value={stats.onLeave} iconBgColor="bg-amber-500" />
                <OrgStatCard icon={ICONS.userExit} title="퇴사" value={stats.resigned} iconBgColor="bg-gray-400" />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
                <div className="flex flex-col gap-4">
                    {/* 검색 및 기준일 */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Icon path={ICONS.search} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="구성원 이름으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mobile-text" 
                            />
                        </div>
                        {showAdvancedSearch && (
                            <>
                                <div className="relative flex-1">
                                    <Icon path={ICONS.users} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="팀 이름으로 검색..."
                                        value={teamSearchTerm}
                                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mobile-text" 
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <Icon path={ICONS.userCircle} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="팀 리더로 검색..."
                                        value={teamLeadSearchTerm}
                                        onChange={(e) => setTeamLeadSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mobile-text" 
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-3">
                            <Icon path={ICONS.calendar} className="w-5 h-5 text-slate-500" />
                            <label htmlFor="baseDate" className="font-semibold whitespace-nowrap">기준일:</label>
                            <input
                                type="date"
                                id="baseDate"
                                value={baseDate}
                                onChange={(e) => setBaseDate(e.target.value)}
                                className="bg-transparent border-none text-slate-800 p-0 ml-1 focus:outline-none focus:ring-0 cursor-pointer"
                            />
                        </div>
                    </div>
                    
                    {/* 고급 검색 토글 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <Icon 
                                path={showAdvancedSearch ? ICONS.chevronUp : ICONS.chevronDown} 
                                className="w-4 h-4" 
                            />
                            {showAdvancedSearch ? '고급 검색 옵션 숨기기' : '고급 검색 옵션'}
                        </button>
                    </div>
                    
                    {/* 액션 버튼들 */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => openTeamModal('add', null)} className="mobile-button bg-sky-500 hover:bg-sky-600 text-white transition-all">
                            <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                            팀 추가
                        </button>
                        <button onClick={() => setIsWizardOpen(true)} className="mobile-button bg-slate-600 hover:bg-slate-700 text-white transition-all">
                            <Icon path={ICONS.organizationChart} className="w-5 h-5 mr-2" />
                            조직 개편
                        </button>
                        <button 
                            onClick={handleSeedDatabase} 
                            className="mobile-button bg-amber-500 hover:bg-amber-600 text-white transition-all"
                            title="기존 데이터를 Firestore에 한 번만 업로드합니다."
                        >
                            <Icon path={ICONS.database} className="w-5 h-5 mr-2" />
                            <span className="hidden sm:inline">초기 데이터베이스 채우기</span>
                            <span className="sm:hidden">DB 초기화</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div 
                className="space-y-8" 
                onDragOver={handleContainerDragOver}
                onDrop={handleContainerDrop}
            >
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="flex flex-col items-center">
                            <LoadingSpinner size="lg" color="blue" />
                            <p className="text-slate-500 mt-4">조직도 데이터를 불러오는 중...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <StatusCard 
                        status="error"
                        title="데이터 로드 실패"
                        description={error}
                        className="max-w-4xl mx-auto my-8"
                        action={
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                                >
                                    새로고침
                                </button>
                                <button 
                                    onClick={handleSeedDatabase}
                                    className="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors"
                                >
                                    샘플 데이터 로드
                                </button>
                            </div>
                        }
                    />
                )}
                {!isLoading && !error && (
                    <>
                        {activeTab === 'orgChart' && (
                            hasAnyTeamsInView ? (
                                <div className="space-y-10">
                                    {groupedHeadquarters.sections.map((section) => (
                                        <section key={section.headquarter.id} className="space-y-6">
                                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">본부</p>
                                                    <h2 className="text-2xl font-bold text-slate-900">{section.headquarter.name}</h2>
                                                    {section.headquarter.description && (
                                                        <p className="text-sm text-slate-500 mt-2">
                                                            {section.headquarter.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={section.headquarter.leader.avatar}
                                                        alt={`${section.headquarter.leader.name} avatar`}
                                                        className="w-16 h-16 rounded-full object-cover shadow-sm"
                                                    />
                                                    <div className="flex flex-col items-start gap-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900">본부장 {section.headquarter.leader.name}</p>
                                                            <p className="text-xs text-slate-500">{section.headquarter.leader.email}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openHeadquarterModal(section.headquarter)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-700"
                                                        >
                                                            <Icon path={ICONS.pencil} className="w-4 h-4" />
                                                            본부장 변경
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {section.teams.length > 0 ? (
                                                <div className={getTeamGridClass(section.teams.length)}>{section.teams.map(renderTeamCard)}</div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500">
                                                    검색 조건에 맞는 팀이 없습니다.
                                                </div>
                                            )}
                                        </section>
                                    ))}
                                    {groupedHeadquarters.unassignedTeams.length > 0 && (
                                        <section className="space-y-6">
                                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col gap-2">
                                                <p className="text-sm font-medium text-amber-600">본부 미지정</p>
                                                <h2 className="text-lg font-semibold text-slate-900">본부에 속하지 않은 팀</h2>
                                                <p className="text-sm text-slate-500">
                                                    팀 정보를 편집해 본부를 지정해 주세요.
                                                </p>
                                            </div>
                                            <div className={getTeamGridClass(groupedHeadquarters.unassignedTeams.length)}>{groupedHeadquarters.unassignedTeams.map(renderTeamCard)}</div>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <Icon path={ICONS.users} className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                                        {searchTerm ? '검색 조건에 해당하는 팀이 없습니다' : '등록된 팀이 없습니다'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        {searchTerm ? '다른 검색어로 다시 시도해 주세요.' : '첫 번째 팀을 추가해 조직도를 완성해 보세요.'}
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => openTeamModal('add', null)}
                                            className="mobile-button bg-sky-500 hover:bg-sky-600 text-white"
                                        >
                                            <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                                            팀 추가
                                        </button>
                                    )}
                                </div>
                            )
                        )}

                        {activeTab === 'inactive' && (
                            <div className="mobile-grid gap-4 sm:gap-6 lg:gap-8 items-start">
                                <InactiveMemberList 
                                    title="휴직중인 인원" 
                                    type="on_leave" 
                                    members={filteredInactiveMembers.onLeave} 
                                    onReinstate={handleReinstateMember} 
                                    onDelete={() => {}} 
                                    baseDate={baseDate} 
                                />
                                <InactiveMemberList 
                                    title="퇴사한 인원" 
                                    type="resigned" 
                                    members={filteredInactiveMembers.resigned} 
                                    onDelete={handleDeleteResignedMember} 
                                    onReinstate={() => {}} 
                                    baseDate={baseDate} 
                                />
                            </div>
                        )}
                    </>
                 )}
            </div>

            {/* 모달들 */}
            <HeadquarterActionModal
                isOpen={isHeadquarterModalOpen}
                onClose={closeHeadquarterModal}
                headquarter={headquarterToEdit}
                onSave={handleSaveHeadquarter}
            />
            <MemberActionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                teams={teams}
                memberData={editingMember}
                context={modalContext}
            />
            <PartActionModal 
                isOpen={partModalState.isOpen}
                onClose={closePartModal}
                onSave={handleSavePart}
                mode={partModalState.mode}
                initialName={partModalState.data?.part?.title || ''}
            />
            <TeamActionModal
                isOpen={teamModalState.isOpen}
                onClose={closeTeamModal}
                onSave={handleSaveTeam}
                mode={teamModalState.mode}
                initialData={teamModalState.data}
            />
            <RestructuringWizard
                isOpen={isWizardOpen}
                onClose={() => {
                    setIsWizardOpen(false);
                }}
                onSave={handleApplyRestructuring}
                currentTeams={teams}
            />
            <ConfirmationModal 
                isOpen={teamPartConfirmation.isOpen}
                onClose={teamPartConfirmationActions.closeConfirmation}
                onConfirm={teamPartConfirmation.onConfirm}
                title={teamPartConfirmation.title}
                message={teamPartConfirmation.message}
                confirmButtonText={teamPartConfirmation.confirmButtonText || '확인'}
                confirmButtonColor={teamPartConfirmation.confirmButtonColor || 'bg-red-600 hover:bg-red-700'}
            />
            
            {/* 멤버 이동 모달 */}
            <MemberMoveModal
                isOpen={isMoveModalOpen}
                onClose={closeMoveModal}
                onMove={handleMoveMember}
                member={memberToMove}
                teams={teams}
            />
        </>
    );
});

OrganizationManagement.displayName = 'OrganizationManagement';

export default OrganizationManagement;



