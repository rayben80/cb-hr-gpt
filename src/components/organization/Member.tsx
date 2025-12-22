import React, { memo, useMemo, useCallback } from 'react';
import { Icon } from '../common';
import { ICONS, Member as MemberType } from '../../constants';

const MemberStatusBadge = memo(({ status }: { status: MemberType['status'] }) => {
    // 성능 최적화: 상태맵 정의를 메모이제이션
    const statusInfo = useMemo(() => {
        const statusMap: Record<Exclude<MemberType['status'], 'active'>, { text: string; styles: string }> = {
            on_leave: { text: '휴직중', styles: 'bg-amber-100 text-amber-800' },
            resigned: { text: '퇴사', styles: 'bg-slate-200 text-slate-600' },
            intern: { text: '인턴', styles: 'bg-purple-100 text-purple-800' }
        };
        
        if (status === 'active' || !statusMap[status as keyof typeof statusMap]) return null;
        return statusMap[status as keyof typeof statusMap];
    }, [status]);

    if (!statusInfo) return null;

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.styles}`}>
            {statusInfo.text}
        </span>
    );
});

MemberStatusBadge.displayName = 'MemberStatusBadge';

const calculateServiceDuration = (hireDateStr: string, baseDateStr: string): string => {
    if (!hireDateStr || !baseDateStr) return '';
    const hireDate = new Date(hireDateStr);
    const baseDate = new Date(baseDateStr);

    if (isNaN(hireDate.getTime()) || isNaN(baseDate.getTime()) || hireDate > baseDate) {
        return '';
    }
    
    const effectiveBaseDate = new Date(baseDate);
    effectiveBaseDate.setDate(effectiveBaseDate.getDate() + 1);

    let years = effectiveBaseDate.getFullYear() - hireDate.getFullYear();
    let months = effectiveBaseDate.getMonth() - hireDate.getMonth();
    let days = effectiveBaseDate.getDate() - hireDate.getDate();

    if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(effectiveBaseDate.getFullYear(), effectiveBaseDate.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    if (days > 0) parts.push(`${days}일`);
    
    if (parts.length === 0) {
        return '(1일)';
    }

    return `(${parts.join(' ')})`;
};

interface MemberProps {
    member: MemberType;
    onEdit: (member: MemberType) => void;
    onDelete: (member: MemberType) => void;
    onMove?: (member: MemberType) => void;
    baseDate: string;
    isDragging?: boolean;
    onDragStart?: (member: MemberType) => void;
    onDragEnd?: () => void;
}

export const Member: React.FC<MemberProps> = memo(({ 
    member, 
    onEdit, 
    onDelete, 
    onMove,
    baseDate,
    isDragging = false,
    onDragStart,
    onDragEnd
}) => {
    // 성능 최적화: 재직 기간 계산 메모이제이션
    const duration = useMemo(() => 
        calculateServiceDuration(member.hireDate, baseDate)
    , [member.hireDate, baseDate]);
    


    // 성능 최적화: 액션 콜백 메모이제이션
    const handleEdit = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        onEdit(member);
    }, [onEdit, member]);
    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        onDelete(member);
    }, [onDelete, member]);
    const handleMove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        console.log('Member clicked:', member);
        if (onMove) {
            console.log('onMove function called');
            onMove(member);
        } else {
            console.log('onMove function is not defined');
        }
    }, [onMove, member]);
    
    const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('memberId', member.id);
        event.dataTransfer.effectAllowed = 'move';
        if (onDragStart) {
            onDragStart(member);
        }
    }, [member, onDragStart]);

    const handleDragEnd = useCallback(() => {
        if (onDragEnd) {
            onDragEnd();
        }
    }, [onDragEnd]);

    return (
        <div
            className={`drag-item table table-fixed w-full gap-2 sm:gap-4 p-2 sm:p-3 group hover:bg-slate-100 rounded-md cursor-pointer transition-all duration-200 ${
                isDragging ? 'dragging opacity-50 scale-95' : ''
            }`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {/* 드래그 핸들 */}
            <div className="table-cell align-middle w-6 pr-2 hidden sm:table-cell">
                <div className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <Icon path={ICONS.gripVertical} className="w-4 h-4" />
                </div>
            </div>
            
            <div className="table-cell align-middle pr-2 sm:pr-4">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0" src={member.avatar} alt={`${member.name} avatar`} />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{member.name}</p>
                        <div className="flex items-center flex-wrap gap-1 min-w-0">
                            <span className="text-xs text-slate-500 truncate">{member.role}</span>
                            {member.hireDate && <span className="text-slate-400">·</span>}
                            {member.hireDate && (
                              <span className="text-xs text-slate-500" title={member.hireDate}>
                                {member.hireDate}
                              </span>
                            )}
                            {duration && <span className="text-slate-400 font-normal text-xs whitespace-nowrap">{duration}</span>}
                        </div>
                        {member.email && (
                            <p className="text-xs text-slate-500 truncate mt-0.5 hidden sm:block" title={member.email}>
                                {member.email}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0 sm:hidden">
                        <MemberStatusBadge status={member.status} />
                    </div>
                </div>
            </div>
            <div className="table-cell align-middle w-16 pr-2 hidden sm:table-cell">
                <div className="flex justify-center">
                    <MemberStatusBadge status={member.status} />
                </div>
            </div>
            <div className="table-cell align-middle w-40 sm:w-44">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-shrink-0 justify-end transition-opacity">
                    <button
                        onClick={handleMove}
                        className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-md px-2 py-1.5 sm:px-2.5 sm:py-1 transition-colors shadow-sm touch-manipulation"
                        aria-label={`${member.name}님 이동`}
                    >
                        <Icon path={ICONS.move3d} className="w-3 h-3" />
                        <span className="hidden sm:inline">이동</span>
                    </button>
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-md px-2 py-1.5 sm:px-2.5 sm:py-1 transition-colors shadow-sm touch-manipulation"
                        aria-label={`${member.name}님 정보 수정`}
                    >
                        <Icon path={ICONS.pencil} className="w-3 h-3" />
                        <span className="hidden sm:inline">수정</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 active:bg-red-100 border border-slate-300 hover:border-red-200 rounded-md px-2 py-1.5 sm:px-2.5 sm:py-1 transition-colors shadow-sm touch-manipulation"
                        aria-label={`${member.name}님 퇴사 처리`}
                    >
                        <Icon path={ICONS.trash} className="w-3 h-3" />
                        <span className="hidden sm:inline">퇴사</span>
                    </button>
                </div>
            </div>
            
            {/* 모바일 드래그 힘트 */}
            <div className="table-cell align-middle w-6 sm:hidden">
                <div className="flex items-center justify-center w-6 h-6 text-slate-400">
                    <Icon path={ICONS.gripVertical} className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
});

Member.displayName = 'Member';
