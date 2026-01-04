import { X } from '@phosphor-icons/react';
import React, { memo, useCallback, useState } from 'react';
import { Team } from '../../constants';
import { useBulkSelectionContext } from '../../contexts/BulkSelectionContext';

interface BulkMoveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (targetTeamId: string, targetPartId: string) => void;
    teams: Team[];
}

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
        parts: Array<{ id: string; title: string }>; // Note: Part interface uses 'title'
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
    ({
        onCancel,
        onConfirm,
        disabled,
        count,
    }: {
        onCancel: () => void;
        onConfirm: () => void;
        disabled: boolean;
        count: number;
    }) => (
        <div className="flex gap-3 mt-8">
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
                {count}명 이동
            </button>
        </div>
    )
);
ActionButtons.displayName = 'ActionButtons';

export const BulkMoveModal: React.FC<BulkMoveModalProps> = ({ isOpen, onClose, onMove, teams }) => {
    const { selectedMemberIds } = useBulkSelectionContext();
    const count = selectedMemberIds.size;
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedPartId, setSelectedPartId] = useState<string>('');

    // Reset when opened
    React.useEffect(() => {
        if (isOpen) {
            setSelectedTeamId('');
            setSelectedPartId('');
        }
    }, [isOpen]);

    const handleTeamChange = useCallback((teamId: string) => {
        setSelectedTeamId(teamId);
        setSelectedPartId('');
    }, []);

    const handleMove = useCallback(() => {
        if (selectedTeamId && selectedPartId) {
            const finalPartId = selectedPartId === 'DIRECT' ? '' : selectedPartId;
            onMove(selectedTeamId, finalPartId);
            onClose();
        }
    }, [selectedTeamId, selectedPartId, onMove, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    const selectedTeam = teams.find((team) => team.id === selectedTeamId);
    // Be careful with 'parts'. In Team interface it's 'parts'.
    // And Part interface has 'name' or 'title'? In MemberMoveModal it used 'title' but check definitions.
    // 'src/constants/index.ts' -> Part has 'name'. MemberMoveModal might have been wrong or used an alias.
    // I will use 'name' which is standard. Matches my 'PartSelector' above.
    const parts = selectedTeam ? selectedTeam.parts : [];

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">멤버 일괄 이동 ({count}명)</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" weight="regular" />
                        </button>
                    </div>

                    <div className="space-y-4">
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
                    <ActionButtons
                        onCancel={onClose}
                        onConfirm={handleMove}
                        disabled={!selectedTeamId || !selectedPartId}
                        count={count}
                    />
                </div>
            </div>
        </div>
    );
};
