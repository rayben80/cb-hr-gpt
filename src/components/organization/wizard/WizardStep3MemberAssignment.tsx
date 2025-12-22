import React, { DragEvent } from 'react';
import { Icon } from '../../common';
import { ICONS, Team, Member } from '../../../constants';

interface WizardStep3MemberAssignmentProps {
    newTeams: Team[];
    unassignedMembers: Member[];
    memberSearch: string;
    isDragOver: string | null;
    onMemberSearchChange: (value: string) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, member: Member, sourceInfo?: {teamId: string, partId: string}) => void;
    onDragEnd: () => void;
    onDragOver: (e: DragEvent<HTMLDivElement>, targetKey: string) => void;
    onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    onDrop: (e: DragEvent<HTMLDivElement>, targetTeamId: string, targetPartId: string) => void;
}

export const WizardStep3MemberAssignment: React.FC<WizardStep3MemberAssignmentProps> = ({
    newTeams,
    unassignedMembers = [], // 기본값 설정
    memberSearch,
    isDragOver,
    onMemberSearchChange,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center">
                    <Icon path={ICONS.users} className="w-5 h-5 mr-2 text-sky-600" />
                    3단계: 멤버 배치하기
                </h3>
                <p className="text-sm text-slate-500 mb-2">왼쪽의 미배치 인원을 드래그하여 오른쪽의 신규 조직에 배치해주세요.</p>
                {unassignedMembers.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                            <Icon path={ICONS.warningAlert} className="w-4 h-4 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800 font-medium">
                                {unassignedMembers.length}명의 미배치 인원이 있습니다.
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border-2 border-slate-200 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-800 flex items-center">
                            <Icon path={ICONS.users} className="w-4 h-4 mr-2 text-slate-600" />
                            미배치 인원 ({unassignedMembers.length})
                        </h4>
                    </div>
                    <div className="relative mb-3">
                        <Icon path={ICONS.search} className="w-4 h-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="이름 검색..." 
                            value={memberSearch} 
                            onChange={e => onMemberSearchChange(e.target.value)} 
                            className="pl-9 pr-3 py-2 w-full text-sm border border-slate-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                                     transition-all duration-200" 
                        />
                    </div>
                    <div className="overflow-y-auto space-y-2 flex-1 pr-2">
                        {unassignedMembers.map(member => (
                            <div 
                                key={member.id} 
                                draggable 
                                onDragStart={e => onDragStart(e, member)}
                                onDragEnd={onDragEnd}
                                className="flex items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 
                                         rounded-lg cursor-grab active:cursor-grabbing transform transition-all 
                                         duration-200 hover:scale-105 hover:shadow-md border border-slate-200"
                            >
                                <img src={member.avatar} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" alt={member.name} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                </div>
                                <Icon path={ICONS.gripVertical} className="w-4 h-4 text-slate-400" />
                            </div>
                        ))}
                        {unassignedMembers.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                <Icon path={ICONS.checkCircle} className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                <p className="text-sm font-medium">모든 인원이 배치되었습니다!</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border-2 border-slate-200 overflow-y-auto">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <Icon path={ICONS.organizationChart} className="w-4 h-4 mr-2 text-sky-600" />
                        신규 조직도
                    </h4>
                    <div className="space-y-6">
                         {newTeams.map(team => (
                            <div key={team.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-4 border-b border-slate-200">
                                    <h5 className="font-bold text-lg text-slate-800 flex items-center">
                                        <Icon path={ICONS.buildingOffice2} className="w-5 h-5 mr-2 text-sky-600" />
                                        {team.name}
                                        <span className="ml-2 text-sm font-normal text-slate-600">(팀장: {team.lead})</span>
                                    </h5>
                                </div>
                                <div className="p-4 space-y-4">
                                    {team.parts.map(part => {
                                        const dragKey = `${team.id}-${part.id}`;
                                        const isDropTarget = isDragOver === dragKey;
                                        return (
                                            <div 
                                                key={part.id} 
                                                onDragOver={e => onDragOver(e, dragKey)}
                                                onDragLeave={onDragLeave}
                                                onDrop={e => onDrop(e, team.id, part.id)} 
                                                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                                                    isDropTarget 
                                                        ? 'border-sky-400 bg-sky-50 shadow-lg scale-105' 
                                                        : 'border-slate-300 bg-slate-50 hover:border-sky-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="font-semibold text-sm text-slate-700 flex items-center">
                                                        <Icon path={ICONS.users} className="w-4 h-4 mr-2 text-slate-500" />
                                                        {part.title} ({part.members?.length || 0}명)
                                                    </p>
                                                    {isDropTarget && (
                                                        <div className="flex items-center text-sky-600 text-xs font-medium">
                                                            <Icon path={ICONS.arrowDown} className="w-4 h-4 mr-1" />
                                                            여기에 드롭하세요
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-[60px]">
                                                    {part.members?.map(member => (
                                                         <div 
                                                            key={member.id} 
                                                            draggable 
                                                            onDragStart={e => onDragStart(e, member, {teamId: team.id, partId: part.id})}
                                                            onDragEnd={onDragEnd}
                                                            className="flex items-center p-2 bg-white rounded-lg shadow-sm cursor-grab 
                                                                     active:cursor-grabbing hover:shadow-md transition-all duration-200 
                                                                     border border-slate-200 hover:border-sky-300"
                                                        >
                                                            <img src={member.avatar} className="w-8 h-8 rounded-full mr-2 border border-slate-200" alt={member.name} />
                                                            <span className="text-xs font-medium text-slate-700 flex-1 truncate">{member.name}</span>
                                                            <Icon path={ICONS.gripVertical} className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                    ))}
                                                    {(!part.members || part.members.length === 0) && !isDropTarget && (
                                                        <div className="col-span-full flex items-center justify-center py-4 text-slate-400">
                                                            <Icon path={ICONS.plus} className="w-6 h-6 mr-2" />
                                                            <span className="text-sm">멤버를 드래그하여 추가하세요</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
};