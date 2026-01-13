import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowsOutSimple, DotsSixVertical, DotsThree, PencilSimple, Star, Trash, X } from '@phosphor-icons/react';
import React, { memo, useMemo } from 'react';
import { Member as MemberType } from '../../constants';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';
import { Badge, Dropdown, DropdownItem } from '../common';
import { StatusBadge } from '../feedback/Status';

// --- Role Badge ---
const MemberRoleBadge = memo(
    ({
        isTeamLead,
        employmentType,
    }: {
        isTeamLead?: boolean | undefined;
        employmentType?: 'regular' | 'intern' | undefined;
    }) => {
        return (
            <>
                {isTeamLead && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 whitespace-nowrap">
                        팀장
                    </Badge>
                )}
                {employmentType === 'intern' && (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 whitespace-nowrap text-indigo-600 border-indigo-200 bg-indigo-50"
                    >
                        인턴
                    </Badge>
                )}
            </>
        );
    }
);
MemberRoleBadge.displayName = 'MemberRoleBadge';

// --- Status Badge ---
const MemberStatusBadge = memo(({ status }: { status: MemberType['status'] }) => {
    const statusInfo = useMemo(() => {
        const map: Record<
            Exclude<MemberType['status'], 'active' | 'intern'>,
            { status: 'warning' | 'error' | 'info'; text: string }
        > = {
            on_leave: { status: 'warning', text: '휴직중' },
            resigned: { status: 'error', text: '퇴사' },
        };
        if (status === 'active' || status === 'intern' || !map[status as keyof typeof map]) return null;
        return map[status as keyof typeof map];
    }, [status]);
    if (!statusInfo) return null;
    return <StatusBadge status={statusInfo.status} text={statusInfo.text} size="sm" showIcon={false} />;
});
MemberStatusBadge.displayName = 'MemberStatusBadge';

// --- Service Duration Calculator ---
const calculateServiceDuration = (hireDateStr: string, baseDateStr: string): string => {
    if (!hireDateStr || !baseDateStr) return '';
    const hireDate = new Date(hireDateStr),
        baseDate = new Date(baseDateStr);
    if (isNaN(hireDate.getTime()) || isNaN(baseDate.getTime()) || hireDate > baseDate) return '';
    const effectiveBaseDate = new Date(baseDate);
    effectiveBaseDate.setDate(effectiveBaseDate.getDate() + 1);
    let y = effectiveBaseDate.getFullYear() - hireDate.getFullYear();
    let m = effectiveBaseDate.getMonth() - hireDate.getMonth();
    let d = effectiveBaseDate.getDate() - hireDate.getDate();
    if (d < 0) {
        m--;
        d += new Date(effectiveBaseDate.getFullYear(), effectiveBaseDate.getMonth(), 0).getDate();
    }
    if (m < 0) {
        y--;
        m += 12;
    }
    const parts = [y > 0 && `${y}년`, m > 0 && `${m}개월`, d > 0 && `${d}일`].filter(Boolean);
    return parts.length === 0 ? '(1일)' : `(${parts.join(' ')})`;
};

// --- Dropdown Menu ---
const MemberActions = memo(
    ({
        memberName,
        onMove,
        onEdit,
        onDelete,
        onAssignTeamLead,
        onRemoveTeamLead,
        isTeamLead,
    }: {
        memberName: string;
        onMove: () => void;
        onEdit: () => void;
        onDelete: () => void;
        onAssignTeamLead?: (() => void) | undefined;
        onRemoveTeamLead?: (() => void) | undefined;
        isTeamLead?: boolean | undefined;
    }) => (
        <Dropdown
            trigger={
                <button
                    className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors touch-manipulation"
                    aria-label={`${memberName}님 액션 메뉴`}
                >
                    <DotsThree className="w-4 h-4 sm:w-5 sm:h-5" weight="bold" />
                </button>
            }
        >
            <DropdownItem onClick={onMove}>
                <ArrowsOutSimple className="w-4 h-4 mr-2" weight="regular" /> 이동
            </DropdownItem>
            <DropdownItem onClick={onEdit}>
                <PencilSimple className="w-4 h-4 mr-2" weight="regular" /> 수정
            </DropdownItem>
            {!isTeamLead && onAssignTeamLead && (
                <DropdownItem onClick={onAssignTeamLead}>
                    <Star className="w-4 h-4 mr-2" weight="regular" /> 팀장 임명
                </DropdownItem>
            )}
            {isTeamLead && onRemoveTeamLead && (
                <DropdownItem
                    onClick={onRemoveTeamLead}
                    className="text-amber-600 hover:!bg-amber-50 hover:!text-amber-700"
                >
                    <X className="w-4 h-4 mr-2" weight="regular" /> 팀장 해임
                </DropdownItem>
            )}
            <DropdownItem onClick={onDelete} className="hover:!bg-destructive/10 hover:!text-destructive">
                <Trash className="w-4 h-4 mr-2" weight="regular" /> 퇴사 처리
            </DropdownItem>
        </Dropdown>
    )
);
MemberActions.displayName = 'MemberActions';

// --- Drag Handle ---
const DragHandle = memo((props: any) => (
    <div
        {...props}
        data-testid="drag-handle"
        className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing"
    >
        <DotsSixVertical className="w-4 h-4" weight="regular" />
    </div>
));
DragHandle.displayName = 'DragHandle';

interface MemberProps {
    member: MemberType;
    onEdit: (member: MemberType) => void;
    onDelete: (member: MemberType) => void;
    onMove?: (member: MemberType) => void;
    baseDate: string;
    isTeamLead?: boolean;
    onAssignTeamLead?: (member: MemberType) => void;
    onRemoveTeamLead?: (member: MemberType) => void;
    isOverlay?: boolean;
    forceDragging?: boolean;
}

// --- Member Card (UI Component) ---
export const MemberCard = memo(
    ({
        member,
        onEdit,
        onDelete,
        onMove,
        baseDate,
        isTeamLead,
        onAssignTeamLead,
        onRemoveTeamLead,
        isOverlay,
        activeDragging,
        setNodeRef,
        style,
        attributes,
        listeners,
    }: MemberProps & {
        activeDragging?: boolean;
        setNodeRef?: (node: HTMLElement | null) => void;
        style?: React.CSSProperties;
        attributes?: any;
        listeners?: any;
    }) => {
        const duration = useMemo(
            () => calculateServiceDuration(member.hireDate, baseDate),
            [member.hireDate, baseDate]
        );
        const avatarSrc = useMemo(
            () => getDisplayAvatarUrl(member.name, member.avatar, member.email),
            [member.avatar, member.email, member.name]
        );

        const stop = (e?: React.MouseEvent) => e?.stopPropagation();
        const handleEdit = () => {
            stop();
            onEdit(member);
        };
        const handleDelete = () => {
            stop();
            onDelete(member);
        };
        const handleMove = () => {
            stop();
            onMove?.(member);
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`drag-item table table-fixed w-full gap-2 sm:gap-4 p-2 sm:p-3 group hover:bg-muted/50 rounded-md transition-all duration-200 ${
                    activeDragging ? 'dragging opacity-50 scale-95' : ''
                } ${isOverlay ? 'bg-white shadow-xl ring-1 ring-primary/20 scale-105 z-50' : ''}`}
            >
                <div className="hidden sm:table-cell sm:align-middle w-6 pr-2">
                    {/* Hide drag handle in overlay if desired, or keep it. Keeping for consistency. */}
                    <DragHandle {...attributes} {...listeners} />
                </div>
                <div className="table-cell align-middle pr-2 sm:pr-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0 bg-muted"
                            src={avatarSrc}
                            alt={`${member.name} avatar`}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <p className="font-semibold text-foreground text-xs sm:text-sm truncate">
                                    {member.name}
                                </p>
                                <MemberRoleBadge isTeamLead={isTeamLead} />
                            </div>
                            <div className="flex items-center flex-wrap gap-1 min-w-0">
                                <span className="text-xs text-muted-foreground truncate">{member.role}</span>
                                {duration && (
                                    <span
                                        className="text-muted-foreground font-normal text-xs whitespace-nowrap"
                                        title={member.hireDate || undefined}
                                    >
                                        {duration}
                                    </span>
                                )}
                                <MemberRoleBadge employmentType={member.employmentType} />
                            </div>
                            {member.email && (
                                <p
                                    className="text-xs text-muted-foreground truncate mt-0.5 hidden md:block"
                                    title={member.email}
                                >
                                    {member.email}
                                </p>
                            )}
                        </div>
                        <div className="flex-shrink-0 sm:hidden">
                            <MemberStatusBadge status={member.status} />
                        </div>
                    </div>
                </div>
                <div className="hidden sm:table-cell sm:align-middle w-16 pr-2">
                    <div className="flex justify-center">
                        <MemberStatusBadge status={member.status} />
                    </div>
                </div>
                <div className="table-cell align-middle w-12 sm:w-16">
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <MemberActions
                            memberName={member.name}
                            onMove={handleMove}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAssignTeamLead={onAssignTeamLead ? () => onAssignTeamLead(member) : undefined}
                            onRemoveTeamLead={onRemoveTeamLead ? () => onRemoveTeamLead(member) : undefined}
                            isTeamLead={isTeamLead}
                        />
                    </div>
                </div>
                <div className="table-cell align-middle w-6 sm:hidden">
                    <DragHandle {...attributes} {...listeners} />
                </div>
            </div>
        );
    }
);
MemberCard.displayName = 'MemberCard';

export const Member: React.FC<MemberProps> = memo((props) => {
    const { member, forceDragging } = props;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: member.id,
        data: { ...member, type: 'member' },
    });

    const activeDragging = isDragging || forceDragging;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: activeDragging ? 0.4 : 1,
    };

    return (
        <MemberCard
            {...props}
            activeDragging={activeDragging || false}
            setNodeRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
        />
    );
});

Member.displayName = 'Member';
