import { useCallback, useMemo, useState } from 'react';
import { Member, Part, Team } from '../../constants';

/**
 * 멤버 선택 상태와 로직을 관리하는 훅
 */
export const useMemberSelection = () => {
    const [selectedMembers, setSelectedMembers] = useState(new Set<string>());

    // 그룹(팀 또는 파트)의 멤버들을 가져오는 함수
    const getGroupMembers = useCallback((group: Team | Part): Member[] => {
        if ('parts' in group) {
            return group.parts
                .flatMap((p) => p.members)
                .filter((member) => member.status === 'active' || member.status === 'intern');
        }
        if ('members' in group) {
            return group.members.filter((member) => member.status === 'active' || member.status === 'intern');
        }
        return [];
    }, []);

    // 그룹의 선택 상태를 가져오는 함수
    const getGroupSelectionState = useCallback(
        (group: Team | Part) => {
            const members = getGroupMembers(group);
            if (members.length === 0) return { checked: false, indeterminate: false, disabled: true };
            const selectedCount = members.filter((m) => selectedMembers.has(m.name)).length;
            if (selectedCount === 0) return { checked: false, indeterminate: false, disabled: false };
            if (selectedCount === members.length) return { checked: true, indeterminate: false, disabled: false };
            return { checked: false, indeterminate: true, disabled: false };
        },
        [getGroupMembers, selectedMembers]
    );

    // 개별 멤버 토글
    const toggleMember = useCallback(
        (memberName: string) => {
            const newSet = new Set(selectedMembers);
            if (newSet.has(memberName)) {
                newSet.delete(memberName);
            } else {
                newSet.add(memberName);
            }
            setSelectedMembers(newSet);
        },
        [selectedMembers]
    );

    // 그룹 전체 토글
    const toggleGroup = useCallback(
        (group: Team | Part) => {
            const members = getGroupMembers(group);
            if (members.length === 0) return;
            const { checked } = getGroupSelectionState(group);
            const newSet = new Set(selectedMembers);
            if (checked) {
                members.forEach((m) => newSet.delete(m.name));
            } else {
                members.forEach((m) => newSet.add(m.name));
            }
            setSelectedMembers(newSet);
        },
        [getGroupMembers, getGroupSelectionState, selectedMembers]
    );

    // 선택 초기화
    const clearSelection = useCallback(() => {
        setSelectedMembers(new Set());
    }, []);

    // 정렬된 선택 멤버 목록
    const sortedSelectedMembers = useMemo(() => Array.from(selectedMembers).sort(), [selectedMembers]);

    return {
        selectedMembers,
        sortedSelectedMembers,
        toggleMember,
        toggleGroup,
        getGroupMembers,
        getGroupSelectionState,
        clearSelection,
    };
};

export type UseMemberSelectionReturn = ReturnType<typeof useMemberSelection>;
