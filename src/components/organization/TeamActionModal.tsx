import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon, InputField } from '../common';
import { ModalActions } from '../common/Button';
import { ICONS, Team } from '../../constants';
import { ConfirmationModal } from '../ConfirmationModal';

interface TeamActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, lead: string }) => void;
    mode: 'add' | 'edit';
    initialData?: Team | null;
}

export const TeamActionModal: React.FC<TeamActionModalProps> = ({ isOpen, onClose, onSave, mode, initialData = null }) => {
    const [formData, setFormData] = useState({ name: '', lead: '' });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [initialFormData, setInitialFormData] = useState({ name: '', lead: '' });
    const formRef = useRef<HTMLFormElement>(null);

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
            const initialFormData = {
                name: initialData?.name || '',
                lead: initialData?.lead || '',
            };
            setFormData(initialFormData);
            setInitialFormData(initialFormData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const hasChanges = () => {
        return formData.name !== initialFormData.name || formData.lead !== initialFormData.lead;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // 폼 유효성 검사
        if (!formData.name.trim()) {
            alert('팀 이름을 입력해주세요.');
            return;
        }
        
        // 폼 제출 처리
        try {
            await onSave(formData);
            setInitialFormData({...formData});
            onClose();
        } catch (error) {
            console.error('Error saving team:', error);
            alert('팀 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 폼 제출 처리
        handleSave();
    };

    const handleCloseRequest = () => {
        // 변경사항이 있으면 확인 모달 표시
        if (hasChanges() && (formData.name || formData.lead)) {
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

    const title = mode === 'add' ? '새 팀 추가' : '팀 정보 수정';

    const leaderOptions = useMemo(() => {
        if (!initialData) return [];
        const members = initialData.parts.flatMap(part =>
            part.members
                .filter(member => member.status === 'active' || member.status === 'intern')
                .map(member => ({ value: member.name, label: `${member.name} · ${part.title}` }))
        );
        const hasCurrentLead = formData.lead && members.some(option => option.value === formData.lead);
        if (formData.lead && !hasCurrentLead) {
            return [{ value: formData.lead, label: `${formData.lead} (현재 팀장)` }, ...members];
        }
        return members;
    }, [initialData, formData.lead]);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                            <button type="button" onClick={handleCloseRequest} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                                <Icon path={ICONS.xMark} className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <InputField 
                                label="팀 이름" 
                                id="name" 
                                name="name" 
                                type="text" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="팀 이름 입력" 
                            />
                            <div>
                                <label htmlFor="lead" className="block text-sm font-medium text-slate-700 mb-1">팀장</label>
                                <select
                                    id="lead"
                                    name="lead"
                                    value={formData.lead}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                                    disabled={mode === 'add' || leaderOptions.length === 0}
                                >
                                    <option value="">팀장 미지정</option>
                                    {leaderOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {mode === 'add' && (
                                    <p className="text-xs text-slate-500 mt-2">팀을 만든 뒤 멤버를 추가하면 팀장을 지정할 수 있습니다.</p>
                                )}
                                {mode === 'edit' && leaderOptions.length === 0 && (
                                    <p className="text-xs text-slate-500 mt-2">팀 멤버가 없어 팀장을 지정할 수 없습니다.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <ModalActions
                                onCancel={handleCloseRequest}
                                onConfirm={handleSave}
                                cancelText="취소"
                                confirmText={mode === 'add' ? '팀 추가' : '저장'}
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
}
