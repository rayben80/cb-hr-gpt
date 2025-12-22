import React, { memo, useMemo, useCallback } from 'react';
import { Icon } from '../common';
import { ICONS, Member } from '../../constants';
import { ConfirmationModal } from '../ConfirmationModal'; // ConfirmationModal 추가

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

interface InactiveMemberListProps {
    title: string;
    type: 'on_leave' | 'resigned';
    members: Member[];
    onReinstate: (member: Member) => void;
    onDelete: (member: Member) => void;
    baseDate: string;
}

export const InactiveMemberList: React.FC<InactiveMemberListProps> = memo(({ title, type, members, onReinstate, onDelete, baseDate }) => {
    // 확인 모달 상태
    const [confirmation, setConfirmation] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });
    
    // 리스트 접기/펼치기 상태
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    
    // 확인 모달 열기
    const openConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
        setConfirmation({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    }, []);
    
    // 확인 모달 닫기
    const closeConfirmation = useCallback(() => {
        setConfirmation(prev => ({
            ...prev,
            isOpen: false
        }));
    }, []);
    
    // 리스트 접기/펼치기 토글 함수
    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);
    
    // 성능 최적화: 멤버별 상세 정보 계산 메모이제이션
    const memberDetails = useMemo(() => 
        members.map(member => ({
            ...member,
            duration: calculateServiceDuration(member.hireDate, baseDate)
        }))
    , [members, baseDate]);
    
    if (members.length === 0) return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-xl font-bold text-slate-900 mb-4">{title} (0명)</h2>
             <p className="text-center text-slate-500 py-8">해당하는 인원이 없습니다.</p>
        </div>
    );
    
    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-start sm:items-center justify-between px-1 sm:px-2 py-1 gap-2">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{title} ({members.length}명)</h2>
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
                    </div>
                </div>
                {!isCollapsed && (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {memberDetails.map(memberWithDuration => {
                            const { duration, ...member } = memberWithDuration;
                            
                            // 성능 최적화: 각 멤버별 액션 콜백 메모이제이션
                            const handleReinstate = useCallback(() => onReinstate(member), [member, onReinstate]);
                            const handleDelete = useCallback(() => {
                                if (type === 'resigned') {
                                    // 퇴사자 삭제 확인 모달 표시
                                    openConfirmation(
                                        '기록 영구 삭제',
                                        `${member.name}님의 퇴사 기록을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
                                        () => {
                                            onDelete(member);
                                            closeConfirmation();
                                        }
                                    );
                                } else {
                                    onDelete(member);
                                }
                            }, [member, onDelete, type, openConfirmation, closeConfirmation]);
                            
                            return (
                                <div key={member.id} className="flex items-center p-3 bg-slate-50 rounded-md justify-between group">
                                     <div className="flex items-center min-w-0">
                                        <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={member.avatar} alt={`${member.name} avatar`} />
                                        <div className="ml-4 min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{member.name} <span className="font-normal text-slate-600">({member.role})</span></p>
                                            <p className="text-xs text-slate-500 truncate">{`${member.teamName} / ${member.partName}`}</p>
                                            <p className="text-xs text-slate-500 flex items-center flex-wrap mt-0.5">
                                                {member.hireDate && <span>{member.hireDate}</span>}
                                                {duration && <span className="ml-1.5 text-slate-400 font-normal">{duration}</span>}
                                            </p>
                                            {member.email && (
                                                <p className="text-xs text-slate-500 truncate mt-0.5" title={member.email}>
                                                    {member.email}
                                                </p>
                                            )}
                                        </div>
                                     </div>
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                                        {type === 'on_leave' && (
                                            <button onClick={handleReinstate} className="flex items-center text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1 rounded-md shadow-sm">
                                                <Icon path={ICONS.userPlus} className="w-4 h-4 mr-2" />
                                                복직 처리
                                            </button>
                                        )}
                                         {type === 'resigned' && (
                                            <button onClick={handleDelete} className="flex items-center text-sm font-medium bg-white border border-slate-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-md shadow-sm">
                                                <Icon path={ICONS.trash} className="w-4 h-4 mr-2" />
                                                기록 삭제
                                            </button>
                                        )}
                                     </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* 확인 모달 */}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                confirmButtonText="영구 삭제"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
});

InactiveMemberList.displayName = 'InactiveMemberList';