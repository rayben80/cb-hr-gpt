import {
    closestCenter,
    CollisionDetection,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    pointerWithin,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { Headquarter } from '../../constants';
import { MemberCard } from './Member';
import { OrganizationContent } from './OrganizationContent';

interface OrganizationMainContentProps {
    isLoading: boolean;
    error: any;
    // Data Props
    teams: any[];
    headquarters: Headquarter[];
    hideSingleHeadquarterHeader?: boolean;
    dndContextProps: {
        sensors: any;
        onDragStart: (event: DragStartEvent) => void;
        onDragEnd: (event: DragEndEvent) => void;
    };
    dragActiveId: string | null;
    [key: string]: any; // Allow other props to pass through
}

export const OrganizationMainContent = (props: OrganizationMainContentProps) => {
    const { isLoading, error, teams, dndContextProps, dragActiveId, ...contentProps } = props;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-destructive space-y-2">
                <span className="text-lg font-medium">데이터를 불러오는데 실패했습니다</span>
                <span className="text-sm text-muted-foreground">{error}</span>
            </div>
        );
    }

    const activeMember = dragActiveId
        ? teams
              .flatMap((t: any) => [...(t.members || []), ...t.parts.flatMap((p: any) => p.members)])
              .find((m: any) => m.id === dragActiveId)
        : null;

    const collisionDetection: CollisionDetection = (args) => {
        const activeType = args.active.data.current?.type;
        if (activeType !== 'member') {
            return closestCenter(args);
        }

        const normalizeId = (value?: string | null) => (value ? value : null);
        const activeTeamId = normalizeId(args.active.data.current?.teamId);
        const activePartId = normalizeId(args.active.data.current?.partId);
        const activeContainerId = activePartId ? `part-${activePartId}` : activeTeamId ? `team-${activeTeamId}` : null;

        const containerDroppables = args.droppableContainers.filter((container) => {
            const type = container.data.current?.type;
            return type === 'team' || type === 'part';
        });

        const pointerContainers = pointerWithin({
            ...args,
            droppableContainers: containerDroppables,
        });

        const overContainerId = pointerContainers[0]?.id ?? null;
        if (overContainerId && overContainerId !== activeContainerId) {
            return closestCenter({
                ...args,
                droppableContainers: containerDroppables,
            });
        }

        const memberDroppables = args.droppableContainers.filter(
            (container) => container.data.current?.type === 'member'
        );
        const memberCollisions = closestCenter({
            ...args,
            droppableContainers: memberDroppables,
        });
        if (memberCollisions.length > 0) {
            return memberCollisions;
        }

        return closestCenter({
            ...args,
            droppableContainers: containerDroppables.length ? containerDroppables : args.droppableContainers,
        });
    };

    return (
        <DndContext
            sensors={dndContextProps.sensors}
            collisionDetection={collisionDetection}
            onDragStart={dndContextProps.onDragStart}
            onDragEnd={dndContextProps.onDragEnd}
        >
            <div className="space-y-6">
                <OrganizationContent
                    groupedHeadquarters={props.groupedHeadquarters}
                    teams={teams}
                    activeTab={props.activeTab}
                    {...(contentProps as any)}
                />
            </div>

            {createPortal(
                <DragOverlay dropAnimation={null}>
                    {activeMember ? (
                        <MemberCard
                            member={activeMember}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            onMove={() => {}}
                            baseDate={contentProps.baseDate}
                            isOverlay={true}
                        />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};
