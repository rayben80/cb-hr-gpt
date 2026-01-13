import React, { memo, useCallback, useState } from 'react';
import { Member, Team } from '../../constants';
import { Modal, ModalFooter, ModalHeader } from '../common/Modal';
import { getDisplayAvatarUrl } from '../../utils/avatarUtils';

interface MemberMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (memberId: string, targetTeamId: string, targetPartId: string) => void;
    member: Member | null;
    teams: Team[];
}

const MemberPreview = memo(({ member }: { member: Member }) => (
    <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <img
            className="h-12 w-12 rounded-full object-cover"
            src={getDisplayAvatarUrl(member.name, member.avatar, member.email)}
            alt={`${member.name} avatar`}
        />
        <div>
            <p className="font-semibold text-slate-800">{member.name}</p>
            <p className="text-sm text-slate-500">{member.role}</p>
        </div>
    </div>
));
MemberPreview.displayName = 'MemberPreview';

const TeamSelector = memo(
    ({ teams, value, onChange }: { teams: Team[]; value: string; onChange: (teamId: string) => void }) => (
        <div>
            <label htmlFor="team-selector" className="block text-sm font-medium text-slate-700 mb-2">
                이동할 팀
            </label>
            <select
                id="team-selector"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
                <option value="">팀을 선택하세요</option>
                {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                        {team.name}
                    </option>
                ))}
            </select>
        </div>
    )
);
TeamSelector.displayName = 'TeamSelector';

const PartSelector = memo(
    ({
        parts,
        value,
        onChange,
        disabled,
    }: {
        parts: Array<{ id: string; title: string }>;
        value: string;
        onChange: (partId: string) => void;
        disabled: boolean;
    }) => (
        <div>
            <label htmlFor="part-selector" className="block text-sm font-medium text-slate-700 mb-2">
                이동할 파트
            </label>
            <select
                id="part-selector"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={disabled}
            >
                <option value="">파트를 선택하세요</option>
                <option value="DIRECT">팀 직속</option>
                {parts.map((part) => (
                    <option key={part.id} value={part.id}>
                        {part.title}
                    </option>
                ))}
            </select>
        </div>
    )
);
PartSelector.displayName = 'PartSelector';

const ActionButtons = memo(
    ({ onCancel, onConfirm, disabled }: { onCancel: () => void; onConfirm: () => void; disabled: boolean }) => (
        <div className="flex gap-3">
            <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
                취소
            </button>
            <button
                onClick={onConfirm}
                disabled={disabled}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                    !disabled ? 'bg-primary hover:bg-primary/90' : 'bg-slate-300 cursor-not-allowed'
                }`}
            >
                이동
            </button>
        </div>
    )
);
ActionButtons.displayName = 'ActionButtons';

export const MemberMoveModal: React.FC<MemberMoveModalProps> = ({ isOpen, onClose, onMove, member, teams }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedPartId, setSelectedPartId] = useState<string>('');

    // Initialize state when member changes
    React.useEffect(() => {
        if (member && isOpen) {
            setSelectedTeamId(member.teamId || '');
            // If member is in a team but no part (and logic implies direct), set to DIRECT.
            // If member.partId is present, set it.
            // If member has no team (unlikely in this context?), empty.
            setSelectedPartId(member.partId || (member.teamId ? 'DIRECT' : ''));
        }
    }, [member, isOpen]);

    const handleTeamChange = useCallback((teamId: string) => {
        setSelectedTeamId(teamId);
        setSelectedPartId('');
    }, []);

    const handleMove = useCallback(() => {
        if (member && selectedTeamId && selectedPartId) {
            // If 'DIRECT', send empty string as partId
            const finalPartId = selectedPartId === 'DIRECT' ? '' : selectedPartId;
            onMove(member.id, selectedTeamId, finalPartId);
            onClose();
        }
    }, [member, selectedTeamId, selectedPartId, onMove, onClose]);

    if (!isOpen || !member) return null;

    const selectedTeam = teams.find((team) => team.id === selectedTeamId);
    const parts = selectedTeam ? selectedTeam.parts : [];

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            maxWidth="sm:max-w-md"
            className="p-0"
            bodyClassName="p-0"
        >
            <div className="bg-white rounded-xl w-full max-w-md transform transition-all">
                <ModalHeader>
                    <h2 className="text-xl font-bold text-slate-900">멤버 이동</h2>
                </ModalHeader>
                <div className="p-6 space-y-4">
                    <MemberPreview member={member} />
                    <TeamSelector teams={teams} value={selectedTeamId} onChange={handleTeamChange} />
                    {selectedTeamId && (
                        <PartSelector
                            parts={parts}
                            value={selectedPartId}
                            onChange={setSelectedPartId}
                            disabled={!selectedTeamId}
                        />
                    )}
                </div>
                <ModalFooter>
                    <ActionButtons
                        onCancel={onClose}
                        onConfirm={handleMove}
                        disabled={!selectedTeamId || !selectedPartId}
                    />
                </ModalFooter>
            </div>
        </Modal>
    );
};
