import { Trash, UserPlus } from '@phosphor-icons/react';
import React from 'react';
import { Member } from '../../constants';

interface InactiveMemberItemProps {
    member: Member;
    duration: string;
    type: 'on_leave' | 'resigned';
    onReinstate: (member: Member) => void;
    onDelete: (member: Member) => void;
}

export const InactiveMemberItem: React.FC<InactiveMemberItemProps> = ({
    member,
    duration,
    type,
    onReinstate,
    onDelete,
}) => {
    return (
        <div className="flex items-center p-3 bg-slate-50 rounded-md justify-between group">
            <div className="flex items-center min-w-0">
                <img
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    src={member.avatar}
                    alt={`${member.name} avatar`}
                />
                <div className="ml-4 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                        {member.name} <span className="font-normal text-slate-600">({member.role})</span>
                    </p>
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
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4 flex gap-2">
                <button
                    onClick={() => onReinstate(member)}
                    className="flex items-center text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1 rounded-md shadow-sm"
                >
                    <UserPlus className="w-4 h-4 mr-2" weight="regular" />
                    복직 처리
                </button>
                {type === 'resigned' && (
                    <button
                        onClick={() => onDelete(member)}
                        className="flex items-center text-sm font-medium bg-white border border-slate-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-md shadow-sm"
                    >
                        <Trash className="w-4 h-4 mr-2" weight="regular" />
                        기록 삭제
                    </button>
                )}
                {type === 'on_leave' && (
                    <button
                        onClick={() => onDelete(member)}
                        className="flex items-center text-sm font-medium bg-white border border-slate-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded-md shadow-sm"
                    >
                        <Trash className="w-4 h-4 mr-2" weight="regular" />
                        퇴사 처리
                    </button>
                )}
            </div>
        </div>
    );
};
