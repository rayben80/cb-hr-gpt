import React, { useState, useEffect, ChangeEvent } from 'react';
import { Icon, InputField, Checkbox } from '../common';
import { ModalActions } from '../common/Button';
import { ICONS, Member, Team } from '../../constants';
import { ConfirmationModal } from '../ConfirmationModal';

interface MemberActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (
        data: Member & { teamId: string; partId: string },
        isEditing: boolean,
        options?: { keepOpen?: boolean; onSuccess?: () => void; setTeamLead?: boolean; clearTeamLead?: boolean }
    ) => void;
    teams: Team[];
    memberData: Member | null;
    context: { teamId: string, partId: string } | null;
}

export const MemberActionModal: React.FC<MemberActionModalProps> = ({ isOpen, onClose, onSave, teams, memberData, context }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        role: '',
        avatar: '',
        hireDate: '',
        email: '',
        status: 'active' as Member['status'],
        teamId: '',
        partId: '',
    });
    const [displayEmail, setDisplayEmail] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [initialFormData, setInitialFormData] = useState({...formData});
    const [keepAdding, setKeepAdding] = useState(false);
    const [assignTeamLead, setAssignTeamLead] = useState(false);

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleCloseRequest();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const findMemberLocation = (teams: Team[], memberId: string) => {
                 for (const team of teams) {
                    for (const part of team.parts) {
                        if (part.members.some(m => m.id === memberId)) {
                            return { teamId: team.id, partId: part.id };
                        }
                    }
                }
                return { teamId: '', partId: '' };
            }

            if (memberData) {
                const location = findMemberLocation(teams, memberData.id);
                const teamLead = teams.find(team => team.id === location.teamId)?.lead || '';
                const email = memberData.email || '';
                const newFormData = {
                    id: memberData.id,
                    name: memberData.name || '',
                    role: memberData.role || '',
                    avatar: memberData.avatar || '',
                    hireDate: memberData.hireDate || '',
                    email: email,
                    status: memberData.status || 'active',
                    teamId: location.teamId || memberData.teamId || '',
                    partId: location.partId || memberData.partId || '',
                } as typeof formData;
                setFormData(newFormData);
                setInitialFormData({...newFormData});
                setAssignTeamLead(teamLead === memberData.name);
                if (email.endsWith('@forcs.com')) {
                    setDisplayEmail(email.replace('@forcs.com', ''));
                } else {
                    setDisplayEmail(email);
                }
            } else if (context) { // For adding a new member
                const teamLead = teams.find(team => team.id === context.teamId)?.lead || '';
                const newFormData = {
                    id: '',
                    name: '',
                    role: '',
                    avatar: '',
                    hireDate: '',
                    email: '',
                    status: 'active' as Member['status'],
                    teamId: context.teamId,
                    partId: context.partId,
                } as typeof formData;
                setFormData(newFormData);
                setInitialFormData({...newFormData});
                setDisplayEmail('');
                setAssignTeamLead(!teamLead);
            }
            setKeepAdding(false);
        }
    }, [memberData, context, isOpen, teams]);

    useEffect(() => {
        if (formData.status === 'resigned' && assignTeamLead) {
            setAssignTeamLead(false);
        }
    }, [formData.status, assignTeamLead]);

    if (!isOpen) return null;

    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialFormData) || 
               (displayEmail !== (formData.email?.endsWith('@forcs.com') ? 
                                  formData.email.replace('@forcs.com', '') : 
                                  formData.email || ''));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDisplayEmail(value);
        if (value.includes('@')) {
            setFormData(prev => ({ ...prev, email: value }));
        } else {
            setFormData(prev => ({ ...prev, email: value ? `${value}@forcs.com` : '' }));
        }
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTeamId = e.target.value;
        const firstPartIdOfNewTeam = teams.find(t => t.id === newTeamId)?.parts[0]?.id || '';
        setFormData(prev => ({ ...prev, teamId: newTeamId, partId: firstPartIdOfNewTeam }));
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSave();
    };

    const handleSave = () => {
        let submissionData = { ...formData };
        if (!memberData) { // If it's a new member
            submissionData.id = `mem_${Date.now()}`;
            submissionData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(submissionData.name)}&background=random&color=fff`;
        }
        const shouldKeepOpen = !memberData && keepAdding;
        const shouldAssignLead = assignTeamLead && submissionData.status !== 'resigned';
        const teamLead = teams.find(team => team.id === formData.teamId)?.lead || '';
        const memberWasLead = memberData ? teamLead === memberData.name : false;
        const shouldClearLead = memberWasLead && !assignTeamLead;
        onSave(
            submissionData as Member & { teamId: string; partId: string },
            !!memberData,
            {
                keepOpen: shouldKeepOpen,
                setTeamLead: shouldAssignLead,
                clearTeamLead: shouldClearLead,
                onSuccess: () => {
                    if (shouldKeepOpen) {
                        const resetData = {
                            id: '',
                            name: '',
                            role: '',
                            avatar: '',
                            hireDate: '',
                            email: '',
                            status: 'active' as Member['status'],
                            teamId: formData.teamId,
                            partId: formData.partId,
                        };
                        setFormData(resetData);
                        setInitialFormData({ ...resetData });
                        setDisplayEmail('');
                    } else {
                        setInitialFormData({ ...formData });
                    }
                }
            }
        );
    };
    
    const availableParts = teams.find(t => t.id === formData.teamId)?.parts || [];

    const handleCloseRequest = () => {
        // 변경사항이 있으면 확인 모달 표시
        if (hasChanges()) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmation(false);
        onClose();
    };

    // 배경 클릭으로 모달 닫기
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCloseRequest();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{memberData ? '멤버 정보 수정' : '새 멤버 추가'}</h2>
                            <button type="button" onClick={handleCloseRequest} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                                <Icon path={ICONS.xMark} className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <InputField label="이름" id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} placeholder="이름 입력" />
                            <InputField label="직책" id="role" name="role" type="text" value={formData.role || ''} onChange={handleChange} placeholder="직책 입력" />
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                                <div className="relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="email"
                                        id="email"
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm pr-28"
                                        value={displayEmail}
                                        onChange={handleEmailChange}
                                        placeholder="이메일 아이디"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="text-slate-500 sm:text-sm">
                                            {displayEmail.includes('@') ? '' : '@forcs.com'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <InputField label="입사일" id="hireDate" name="hireDate" type="date" value={formData.hireDate || ''} onChange={handleChange} placeholder="" />
                            <div>
                                <label htmlFor="teamId" className="block text-sm font-medium text-slate-700 mb-1">소속 팀</label>
                                <select id="teamId" name="teamId" value={formData.teamId || ''} onChange={handleTeamChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="partId" className="block text-sm font-medium text-slate-700 mb-1">소속 파트</label>
                                <select id="partId" name="partId" value={formData.partId || ''} onChange={handleChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" disabled={!formData.teamId}>
                                    {availableParts.map(part => <option key={part.id} value={part.id}>{part.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                <select id="status" name="status" value={formData.status || 'active'} onChange={handleChange} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                    <option value="active">재직</option>
                                    <option value="intern">인턴</option>
                                    <option value="on_leave">휴직</option>
                                    <option value="resigned">퇴사</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <Checkbox
                                    checked={assignTeamLead}
                                    indeterminate={false}
                                    onChange={(e) => setAssignTeamLead(e.target.checked)}
                                    disabled={formData.status === 'resigned'}
                                />
                                이 멤버를 팀장으로 지정
                            </label>
                            {!memberData && (
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <Checkbox
                                        checked={keepAdding}
                                        indeterminate={false}
                                        onChange={(e) => setKeepAdding(e.target.checked)}
                                    />
                                    저장 후 계속 추가
                                </label>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <ModalActions
                                onCancel={handleCloseRequest}
                                onConfirm={handleSave}
                                cancelText="취소"
                                confirmText="저장"
                                confirmVariant="primary"
                                className="justify-end"
                            />
                        </div>
                    </form>
                </div>
            </div>
            <ConfirmationModal 
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="변경사항 취소"
                message="정말 닫으시겠습니까? 입력한 내용은 저장되지 않습니다."
                confirmButtonText="네, 닫습니다"
                confirmButtonColor="bg-red-600 hover:bg-red-700"
            />
        </>
    );
};
