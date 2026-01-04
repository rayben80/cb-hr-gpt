import { CaretDown, CaretUp } from '@phosphor-icons/react';
import React, { memo, useCallback, useMemo } from 'react';
import { Member } from '../../constants';
import { calculateServiceDuration } from '../../utils/dateFormatter';
import { InactiveMemberItem } from './InactiveMemberItem';

interface InactiveMemberListProps {
    title: string;
    type: 'on_leave' | 'resigned';
    members: Member[];
    onReinstate: (member: Member) => void;
    onDelete: (member: Member) => void;
    baseDate: string;
}

export const InactiveMemberList: React.FC<InactiveMemberListProps> = memo(
    ({ title, type, members, onReinstate, onDelete, baseDate }) => {
        // 리스트 접기/펼치기 상태
        const [isCollapsed, setIsCollapsed] = React.useState(false);

        const handleReinstate = useCallback(
            (member: Member) => {
                onReinstate(member);
            },
            [onReinstate]
        );

        const handleDelete = useCallback(
            (member: Member) => {
                onDelete(member);
            },
            [onDelete]
        );

        // 리스트 접기/펼치기 토글 함수
        const toggleCollapse = useCallback(() => {
            setIsCollapsed((prev) => !prev);
        }, []);

        // 성능 최적화: 멤버별 상세 정보 계산 메모이제이션
        const memberDetails = useMemo(
            () =>
                members.map((member) => ({
                    ...member,
                    duration: calculateServiceDuration(member.hireDate, baseDate),
                })),
            [members, baseDate]
        );

        if (members.length === 0)
            return (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">{title} (0명)</h2>
                    <p className="text-center text-slate-500 py-8">해당하는 인원이 없습니다.</p>
                </div>
            );

        return (
            <>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-start sm:items-center justify-between px-1 sm:px-2 py-1 gap-2">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            {title} ({members.length}명)
                        </h2>
                        <div className="flex-shrink-0 flex items-center gap-1">
                            <button
                                onClick={toggleCollapse}
                                className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors touch-manipulation"
                            >
                                {isCollapsed ? (
                                    <CaretDown className="w-5 h-5" weight="regular" />
                                ) : (
                                    <CaretUp className="w-5 h-5" weight="regular" />
                                )}
                            </button>
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {memberDetails.map((memberWithDuration) => {
                                const { duration, ...member } = memberWithDuration;
                                return (
                                    <InactiveMemberItem
                                        key={member.id}
                                        member={member}
                                        duration={duration}
                                        type={type}
                                        onReinstate={handleReinstate}
                                        onDelete={handleDelete}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </>
        );
    }
);

InactiveMemberList.displayName = 'InactiveMemberList';
