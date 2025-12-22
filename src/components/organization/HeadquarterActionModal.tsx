import React, { useState, useEffect, useMemo } from 'react';
import { Icon, InputField } from '../common';
import { ModalActions } from '../common/Button';
import { ICONS, Headquarter } from '../../constants';

interface HeadquarterActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    headquarter: Headquarter | null;
    onSave: (payload: { id: string; leader: Headquarter['leader']; name?: string; description?: string }) => void;
}

export const HeadquarterActionModal: React.FC<HeadquarterActionModalProps> = ({ isOpen, onClose, headquarter, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        leaderName: '',
        leaderRole: '',
        leaderEmail: '',
        leaderAvatar: '',
    });

    useEffect(() => {
        if (isOpen && headquarter) {
            setFormData({
                name: headquarter.name,
                description: headquarter.description ?? '',
                leaderName: headquarter.leader.name,
                leaderRole: headquarter.leader.role,
                leaderEmail: headquarter.leader.email,
                leaderAvatar: headquarter.leader.avatar,
            });
        }
    }, [isOpen, headquarter]);

    const isValid = useMemo(() => formData.leaderName.trim().length > 0 && formData.leaderEmail.trim().length > 0, [formData.leaderName, formData.leaderEmail]);

    if (!isOpen || !headquarter) {
        return null;
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!isValid) {
            alert('본부장 이름과 이메일을 입력해 주세요.');
            return;
        }

        onSave({
            id: headquarter.id,
            name: formData.name.trim() || headquarter.name,
            description: formData.description.trim(),
            leader: {
                name: formData.leaderName.trim(),
                role: formData.leaderRole.trim() || headquarter.leader.role,
                email: formData.leaderEmail.trim(),
                avatar: formData.leaderAvatar.trim() || headquarter.leader.avatar,
            },
        });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        handleSave();
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4' onClick={event => event.target === event.currentTarget && onClose()}>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-xl'>
                <form onSubmit={handleSubmit}>
                    <div className='flex items-center justify-between border-b border-slate-200 p-6'>
                        <div>
                            <p className='text-sm font-medium text-slate-500'>본부장 지정</p>
                            <h2 className='text-xl font-bold text-slate-900'>{headquarter.name}</h2>
                        </div>
                        <button type='button' onClick={onClose} className='p-2 text-slate-400 hover:text-slate-700 rounded-full'>
                            <Icon path={ICONS.xMark} className='w-6 h-6' />
                        </button>
                    </div>

                    <div className='p-8 space-y-6'>
                        <InputField
                            label='본부명'
                            id='hqName'
                            name='name'
                            type='text'
                            value={formData.name}
                            onChange={handleChange}
                            placeholder='본부명을 입력하세요'
                        />
                        <InputField
                            label='본부 설명'
                            id='hqDescription'
                            name='description'
                            as='textarea'
                            type='text'
                            value={formData.description}
                            onChange={handleChange}
                            placeholder='본부에 대한 설명을 입력하세요'
                        />
                        <div className='grid gap-4 md:grid-cols-2'>
                            <InputField
                                label='본부장 이름'
                                id='leaderName'
                                name='leaderName'
                                type='text'
                                value={formData.leaderName}
                                onChange={handleChange}
                                placeholder='예: 홍길동'
                            />
                            <InputField
                                label='본부장 직책'
                                id='leaderRole'
                                name='leaderRole'
                                type='text'
                                value={formData.leaderRole}
                                onChange={handleChange}
                                placeholder='예: 본부장'
                            />
                            <InputField
                                label='이메일'
                                id='leaderEmail'
                                name='leaderEmail'
                                type='email'
                                value={formData.leaderEmail}
                                onChange={handleChange}
                                placeholder='예: leader@example.com'
                            />
                            <InputField
                                label='프로필 이미지 URL'
                                id='leaderAvatar'
                                name='leaderAvatar'
                                type='url'
                                value={formData.leaderAvatar}
                                onChange={handleChange}
                                placeholder='https://...'
                            />
                        </div>
                    </div>

                    <div className='border-t border-slate-200 bg-slate-50 p-6'>
                        <ModalActions
                            onCancel={onClose}
                            onConfirm={handleSave}
                            cancelText='취소'
                            confirmText='저장'
                            confirmVariant='primary'
                            className='justify-end'
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HeadquarterActionModal;
