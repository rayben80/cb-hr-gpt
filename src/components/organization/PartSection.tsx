import React, { useState, memo, useMemo, useCallback } from 'react';
import { Icon, Dropdown, DropdownItem } from '../common';
import { ICONS, Part, Member as MemberType } from '../../constants';
import { Member } from './Member';

interface PartSectionProps {
    part: Part & { originalMemberCount?: number };
    teamId: string;
    onAddMember: (teamId: string, partId: string) => void;
    onEditMember: (member: MemberType) => void;
    onDeleteMember: (member: MemberType) => void;
    onDropMemberInPart: (memberId: string, teamId: string, partId: string) => void;
    onEditPart: (teamId: string, part: Part) => void;
    onDeletePart: (teamId: string, partId: string) => void;
    onMoveMember: (member: MemberType) => void;
    searchTerm: string;
    baseDate: string;
}


export const PartSection: React.FC<PartSectionProps> = memo(({ 
    part, 
    teamId, 
    onAddMember, 
    onEditMember, 
    onDeleteMember, 
    onDropMemberInPart, 
    onEditPart, 
    onDeletePart, 
    onMoveMember,
    searchTerm, 
    baseDate
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isDragOver, setIsDragOver] = useState(false);
    
    // 성능 최적화: 멤버 카운트 텍스트 계산 메모이제이션
    const memberCountText = useMemo(() => 
        searchTerm ? `${part.members.length} / ${part.originalMemberCount}` : part.members.length
    , [searchTerm, part.members.length, part.originalMemberCount]);



    // 성능 최적화: 액션 콜백 메모이제이션
    const handleAddMember = useCallback(() => onAddMember(teamId, part.id), [onAddMember, teamId, part.id]);
    const handleEditPart = useCallback(() => onEditPart(teamId, part), [onEditPart, teamId, part]);
    const handleDeletePart = useCallback(() => onDeletePart(teamId, part.id), [onDeletePart, teamId, part.id]);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);
    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    }, []);
    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }
        setIsDragOver(false);
    }, []);
    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const memberId = event.dataTransfer.getData('memberId') || event.dataTransfer.getData('text/plain');
        if (!memberId) {
            return;
        }
        onDropMemberInPart(memberId, teamId, part.id);
    }, [onDropMemberInPart, teamId, part.id]);

    return (
        <div className="transition-all">
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-700 text-sm sm:text-base truncate">{part.title} ({memberCountText}명)</h3>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleAddMember}
                        className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 transition-colors touch-manipulation"
                    >
                        <Icon path={ICONS.userPlus} className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">멤버 추가</span>
                    </button>
                    <button
                        type="button"
                        onClick={toggleOpen}
                        aria-label={isOpen ? '파트 접기' : '파트 펼치기'}
                        className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors touch-manipulation"
                    >
                        <Icon path={isOpen ? ICONS.chevronUp : ICONS.chevronDown} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <Dropdown trigger={
                        <button className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors touch-manipulation">
                            <Icon path={ICONS.moreHorizontal} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    }>
                        <DropdownItem onClick={handleEditPart}>
                            <Icon path={ICONS.pencil} className="w-4 h-4 mr-2" /> 파트명 변경
                        </DropdownItem>
                        <DropdownItem 
                            onClick={handleDeletePart}
                            className={part.members.length === 0 ? 'hover:!bg-red-50 hover:!text-red-600' : ''}
                            disabled={part.members.length > 0}
                            disabledTooltip="멤버가 있는 파트는 삭제할 수 없습니다."
                        >
                            <Icon path={ICONS.trash} className="w-4 h-4 mr-2" /> 파트 삭제
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>
            {isOpen && (
                <div 
                    className="pl-4 sm:pl-8 pr-2 sm:pr-3 pb-2 rounded-lg transition-all duration-300"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className={`bg-slate-50 rounded-lg divide-y divide-slate-200 border-2 transition-all duration-300 overflow-hidden ${
                        isDragOver ? 'border-sky-400 bg-sky-50' : 'border-transparent'
                    }`}>
                        {isDragOver && (
                            <div className="text-center py-3 text-sky-700 text-xs font-medium bg-sky-100">
                                여기에 드롭하세요
                            </div>
                        )}
                        {part.members.map(member => (
                            <Member 
                                key={member.id} 
                                member={member} 
                                onEdit={onEditMember} 
                                onDelete={onDeleteMember} 
                                onMove={onMoveMember}
                                baseDate={baseDate}
                            />
                        ))}
                        
                        {part.members.length === 0 && (
                            <div className="text-center p-3 sm:p-4 text-slate-400 transition-all">
                                {searchTerm ? (
                                    <p className="text-xs">검색 결과가 없습니다.</p>
                                ) : (
                                    <>
                                        <p className="text-xs">
                                            <span className="hidden sm:inline">이 파트에 멤버가 없습니다.</span>
                                            <span className="sm:hidden">멤버 없음</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleAddMember}
                                            className="mt-2 inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600 hover:bg-sky-100 transition-colors"
                                        >
                                            <Icon path={ICONS.userPlus} className="w-3.5 h-3.5" />
                                            멤버 추가
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

PartSection.displayName = 'PartSection';
