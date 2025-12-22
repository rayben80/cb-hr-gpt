import React, { useState, useCallback } from 'react';
import { Icon } from '../common';
import { ICONS, Team, Member } from '../../constants';

interface MemberMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (memberId: string, targetTeamId: string, targetPartId: string) => void;
    member: Member | null;
    teams: Team[];
}

export const MemberMoveModal: React.FC<MemberMoveModalProps> = ({ 
    isOpen, 
    onClose, 
    onMove,
    member,
    teams
}) => {
    console.log('MemberMoveModal rendered with:', { isOpen, member, teams });
    
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedPartId, setSelectedPartId] = useState<string>('');

    // 팀 선택 시 파트 목록 업데이트
    const handleTeamChange = useCallback((teamId: string) => {
        setSelectedTeamId(teamId);
        setSelectedPartId('');
    }, []);

    // 이동 처리
    const handleMove = useCallback(() => {
        if (member && selectedTeamId && selectedPartId) {
            onMove(member.id, selectedTeamId, selectedPartId);
            onClose();
        }
    }, [member, selectedTeamId, selectedPartId, onMove, onClose]);

    // 모달 외부 클릭 시 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !member) return null;

    // 선택된 팀의 파트 목록
    const selectedTeam = teams.find(team => team.id === selectedTeamId);
    const parts = selectedTeam ? selectedTeam.parts : [];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">멤버 이동</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Icon path={ICONS.xMark} className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                        <img 
                            className="h-12 w-12 rounded-full object-cover" 
                            src={member.avatar} 
                            alt={`${member.name} avatar`} 
                        />
                        <div>
                            <p className="font-semibold text-slate-800">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                이동할 팀
                            </label>
                            <select
                                value={selectedTeamId}
                                onChange={(e) => handleTeamChange(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                            >
                                <option value="">팀을 선택하세요</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedTeamId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    이동할 파트
                                </label>
                                <select
                                    value={selectedPartId}
                                    onChange={(e) => setSelectedPartId(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                    disabled={!selectedTeamId}
                                >
                                    <option value="">파트를 선택하세요</option>
                                    {parts.map(part => (
                                        <option key={part.id} value={part.id}>
                                            {part.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleMove}
                            disabled={!selectedTeamId || !selectedPartId}
                            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                                selectedTeamId && selectedPartId
                                    ? 'bg-sky-500 hover:bg-sky-600'
                                    : 'bg-slate-300 cursor-not-allowed'
                            }`}
                        >
                            이동
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};