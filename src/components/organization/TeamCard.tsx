import React, { memo, useMemo, useCallback, useState } from 'react';
import { Icon, Dropdown, DropdownItem } from '../common';
import { ICONS, Team, Member, Part } from '../../constants';
import { PartSection } from './PartSection';

interface TeamCardProps {
    team: Team;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: Member) => void;
    onDeleteMember: (member: Member) => void;
    onDropMemberInPart: (memberId: string, teamId: string, partId: string) => void;
    onAddPart: (teamId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onEditTeam: (team: Team) => void;
    onDeleteTeam: (teamId: string) => void;
    onMoveMember: (member: Member) => void;
    searchTerm: string;
    baseDate: string;
}

export const TeamCard: React.FC<TeamCardProps> = memo(({ 
    team, 
    onAddMember, 
    onEditMember, 
    onDeleteMember, 
    onDropMemberInPart, 
    onAddPart, 
    onEditPart, 
    onDeletePart, 
    onEditTeam, 
    onDeleteTeam, 
    onMoveMember,
    searchTerm, 
    baseDate
}) => {
    // 디버깅 로그 추가
    console.log('TeamCard rendered with team:', team);
    
    // 팀 카드 접기/펼치기 상태
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // 성능 최적화: 계산값들을 메모이제이션
    const { memberCountText, isTeamEmpty, shouldRender } = useMemo(() => {
        const filtered = team.parts.reduce((sum, part) => sum + part.members.length, 0);
        const original = team.originalTotalMemberCount || 0;
        const countText = searchTerm ? `${filtered} / ${original}` : original.toString();
        const isEmpty = original === 0;
        const shouldShow = searchTerm ? filtered > 0 : team.parts.length > 0;
        
        console.log('TeamCard render conditions:', {
            teamId: team.id,
            teamName: team.name,
            searchTerm,
            filteredMembers: filtered,
            originalMembers: original,
            partsCount: team.parts.length,
            shouldShow
        });
        
        return {
            memberCountText: countText,
            isTeamEmpty: isEmpty,
            shouldRender: shouldShow
        };
    }, [team.parts, team.originalTotalMemberCount, searchTerm]);

    // 최적화: 콜백 함수들을 메모이제이션
    const handleEditTeam = useCallback(() => onEditTeam(team), [onEditTeam, team]);
    const handleDeleteTeam = useCallback(() => {
        console.log('TeamCard handleDeleteTeam called with teamId:', team.id);
        onDeleteTeam(team.id);
    }, [onDeleteTeam, team.id]);
    const handleAddPart = useCallback(() => onAddPart(team.id), [onAddPart, team.id]);
    
    // 팀 카드 접기/펼치기 토글 함수
    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    // shouldRender 조건 확인
    if (!shouldRender) {
        console.log('TeamCard not rendering for team:', team.id);
        return null;
    }

    return (
        <div 
            className="bg-white p-3 sm:p-4 rounded-xl shadow-sm space-y-2 flex flex-col h-full transition-all duration-200"
        >
            <div className="flex items-start sm:items-center justify-between px-1 sm:px-2 py-1 gap-2">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{team.name} ({memberCountText}명)</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">팀장: {team.lead}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                    <button 
                        onClick={toggleCollapse}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors touch-manipulation"
                    >
                        <Icon 
                            path={isCollapsed ? ICONS.chevronDown : ICONS.chevronUp} 
                            className="w-5 h-5" 
                        />
                    </button>
                    <Dropdown trigger={<button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors touch-manipulation"><Icon path={ICONS.moreHorizontal} className="w-5 h-5" /></button>}>
                        <DropdownItem onClick={handleEditTeam}>
                            <Icon path={ICONS.pencil} className="w-4 h-4 mr-2" /> 팀 정보 수정
                        </DropdownItem>
                        <DropdownItem 
                            onClick={handleDeleteTeam}
                            className={isTeamEmpty ? 'hover:!bg-red-50 hover:!text-red-600' : ''}
                            disabled={!isTeamEmpty}
                            disabledTooltip="멤버가 있는 팀은 삭제할 수 없습니다."
                        >
                            <Icon path={ICONS.trash} className="w-4 h-4 mr-2" /> 팀 삭제
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>
            {!isCollapsed && (
                <div className="space-y-1 sm:space-y-2 flex-grow">
                    {team.parts.map(part => (
                        <PartSection 
                            key={part.id} 
                            part={part} 
                            teamId={team.id} 
                            onAddMember={onAddMember} 
                            onEditMember={onEditMember} 
                            onDeleteMember={onDeleteMember} 
                            onDropMemberInPart={onDropMemberInPart} 
                            onEditPart={onEditPart} 
                            onDeletePart={onDeletePart} 
                            onMoveMember={onMoveMember}
                            searchTerm={searchTerm} 
                            baseDate={baseDate}
                        />
                    ))}
                </div>
            )}
            <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                    onClick={handleAddPart}
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-sky-600 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 p-2.5 sm:p-3 rounded-lg border-2 border-dashed border-sky-200 transition-colors touch-manipulation"
                >
                    <Icon path={ICONS.plus} className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden xs:inline">파트 추가</span>
                    <span className="xs:hidden">파트 +</span>
                </button>
            </div>
        </div>
    );
});

TeamCard.displayName = 'TeamCard';
