import { DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useState } from 'react';
import { Member } from '../../constants';

interface UseMemberSortProps {
    members: Member[];
    onReorder: (activeId: string, overId: string) => void;
    onReorderToEnd: (activeId: string) => void;
    onMove: (memberId: string, targetTeamId: string, targetPartId: string | null) => void;
}

export const useMemberSort = ({ members, onReorder, onReorderToEnd, onMove }: UseMemberSortProps) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            handleDragEndEvent(event, members, { setActiveId, onReorder, onReorderToEnd, onMove });
        },
        [members, onReorder, onReorderToEnd, onMove]
    );

    return {
        sensors,
        activeId,
        handleDragStart,
        handleDragEnd,
    };
};

// Helper functions to reduce complexity
interface MemberDropActions {
    onReorder: (active: string, over: string) => void;
    onReorderToEnd: (active: string) => void;
    onMove: (id: string, teamId: string, partId: string | null) => void;
}

interface DragEndActions extends MemberDropActions {
    setActiveId: (value: string | null) => void;
}

const normalizeId = (value: string | null | undefined) => (value ? value : null);

const handleDragEndEvent = (event: DragEndEvent, members: Member[], actions: DragEndActions) => {
    const { active, over } = event;
    actions.setActiveId(null);
    if (!over) return;

    const activeMemberId = active.id as string;
    const overId = over.id as string;
    if (activeMemberId === overId) return;

    const activeMember = members.find((m) => m.id === activeMemberId);
    const overMember = members.find((m) => m.id === overId);
    if (!activeMember) return;

    if (overMember) {
        handleMemberDrop(activeMember, overMember, activeMemberId, overId, actions);
        return;
    }

    const overData = over.data.current;
    if (overData) {
        handleContainerDrop(activeMember, overData, actions);
    }
};

const handleMemberDrop = (
    activeMember: Member,
    overMember: Member,
    activeMemberId: string,
    overId: string,
    actions: MemberDropActions
) => {
    const activeTeamId = normalizeId(activeMember.teamId);
    const overTeamId = normalizeId(overMember.teamId);
    const activePartId = normalizeId(activeMember.partId);
    const overPartId = normalizeId(overMember.partId);
    const isSameTeam = activeTeamId === overTeamId;
    const isSamePart = activePartId === overPartId;

    if (isSameTeam && isSamePart) {
        actions.onReorder(activeMemberId, overId);
    } else if (overTeamId) {
        actions.onMove(activeMemberId, overTeamId, overPartId);
    }
};

const handleTeamDrop = (
    activeMember: Member,
    targetTeamId: string | null,
    actions: { onMove: (id: string, teamId: string, partId: string | null) => void; onReorderToEnd: (id: string) => void }
) => {
    const activeTeamId = normalizeId(activeMember.teamId);
    const activePartId = normalizeId(activeMember.partId);
    if (targetTeamId && activeTeamId === targetTeamId && !activePartId) {
        actions.onReorderToEnd(activeMember.id);
        return;
    }
    if (targetTeamId && (activeTeamId !== targetTeamId || activePartId)) {
        actions.onMove(activeMember.id, targetTeamId, null);
    }
};

const handlePartDrop = (
    activeMember: Member,
    targetTeamId: string | null,
    targetPartId: string | null,
    actions: { onMove: (id: string, teamId: string, partId: string | null) => void; onReorderToEnd: (id: string) => void }
) => {
    const activeTeamId = normalizeId(activeMember.teamId);
    const activePartId = normalizeId(activeMember.partId);
    if (targetTeamId && targetPartId && activeTeamId === targetTeamId && activePartId === targetPartId) {
        actions.onReorderToEnd(activeMember.id);
        return;
    }
    if (targetTeamId && targetPartId && (activePartId !== targetPartId || activeTeamId !== targetTeamId)) {
        actions.onMove(activeMember.id, targetTeamId, targetPartId);
    }
};

const handleContainerDrop = (
    activeMember: Member,
    overData: any, // or strongly typed if available
    actions: { onMove: (id: string, teamId: string, partId: string | null) => void; onReorderToEnd: (id: string) => void }
) => {
    if (overData.type === 'team') {
        handleTeamDrop(activeMember, normalizeId(overData.id), actions);
        return;
    }
    if (overData.type === 'part') {
        handlePartDrop(activeMember, normalizeId(overData.teamId), normalizeId(overData.id), actions);
    }
};
