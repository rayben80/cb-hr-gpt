import React, { useEffect, useMemo, useState } from 'react';
import { Headquarter } from '../../constants';
import { useConfirmation } from '../../hooks/common/useConfirmation';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { Button, Modal } from '../common';
import { ConfirmationModal } from '../feedback/ConfirmationModal';
import { HeadquarterFormFields } from './HeadquarterFormFields';

interface HeadquarterActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    headquarter?: Headquarter | null;
    mode?: 'add' | 'edit';
    onSave: (payload: { id?: string; leader?: Headquarter['leader']; name?: string; description?: string }) => void;
    onDismissLeader?: (headquarterId: string) => void;
}

export const HeadquarterActionModal: React.FC<HeadquarterActionModalProps> = ({
    isOpen,
    onClose,
    headquarter,
    mode = 'edit',
    onSave,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        leaderName: '',
        leaderRole: '',
        leaderEmail: '',
        leaderPhone: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [confirmState, confirmActions] = useConfirmation();

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && headquarter) {
                setFormData({
                    name: headquarter.name,
                    leaderName: headquarter.leader?.name || '',
                    leaderRole: headquarter.leader?.role || '',
                    leaderEmail: headquarter.leader?.email || '',
                    leaderPhone: headquarter.leader?.phone || '',
                });
            } else if (mode === 'add') {
                setFormData({
                    name: '',
                    leaderName: '',
                    leaderRole: '',
                    leaderEmail: '',
                    leaderPhone: '',
                });
            }
        }
    }, [isOpen, headquarter, mode]);

    // 본부명은 필수, 본부장 정보는 선택 (공석 가능)
    const isNameValid = useMemo(() => formData.name.trim().length > 0, [formData.name]);
    const hasLeaderInfo = useMemo(
        () => formData.leaderName.trim().length > 0 && formData.leaderEmail.trim().length > 0,
        [formData.leaderName, formData.leaderEmail]
    );

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSave = () => {
        if (!isNameValid) {
            setError('본부명을 입력해 주세요.');
            return;
        }

        // 본부장 정보가 일부만 입력된 경우 경고
        if (formData.leaderName.trim() && !formData.leaderEmail.trim()) {
            setError('본부장 이메일을 입력해 주세요.');
            return;
        }

        onSave({
            ...(headquarter?.id ? { id: headquarter.id } : {}),
            name: formData.name.trim(),
            leader: hasLeaderInfo
                ? {
                      name: formData.leaderName.trim(),
                      role: formData.leaderRole.trim() || '본부장',
                      email: formData.leaderEmail.trim(),
                      phone: formData.leaderPhone.trim(),
                      avatar:
                          headquarter?.leader?.avatar && headquarter.leader.name === formData.leaderName.trim()
                              ? headquarter.leader.avatar
                              : getAvatarUrl(formData.leaderName.trim()),
                  }
                : undefined,
        });
    };

    const handleDismissLeader = () => {
        confirmActions.showConfirmation({
            title: '본부장 해임',
            message:
                '정말 본부장 정보를 초기화(해임)하시겠습니까?\n(아직 반영되지 않으며, 저장 버튼을 눌러야 실제 반영됩니다.)',
            confirmButtonText: '해임',
            confirmButtonColor: 'destructive',
            onConfirm: () => {
                setFormData((prev) => ({
                    ...prev,
                    leaderName: '',
                    leaderRole: '',
                    leaderEmail: '',
                    leaderPhone: '',
                }));
            },
        });
    };

    const hasCurrentLeader = !!headquarter?.leader;

    return (
        <Modal
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
            title={
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        {mode === 'add' ? '새 본부 추가' : '본부 정보 수정'}
                    </p>
                    <p className="text-xl font-bold">{mode === 'add' ? '새로운 본부 만들기' : headquarter?.name}</p>
                </div>
            }
            maxWidth="sm:max-w-xl"
            footer={
                <div className="flex justify-between w-full">
                    <div>
                        {mode === 'edit' && hasCurrentLeader && formData.leaderName && (
                            <Button variant="destructive" onClick={handleDismissLeader}>
                                본부장 해임
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            {mode === 'add' ? '추가' : '저장'}
                        </Button>
                    </div>
                </div>
            }
        >
            <HeadquarterFormFields formData={formData} onChange={handleChange} error={error} />
            <ConfirmationModal
                isOpen={confirmState.isOpen}
                onClose={confirmActions.closeConfirmation}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                confirmButtonText={confirmState.confirmButtonText || '확인'}
                confirmButtonColor={confirmState.confirmButtonColor || 'primary'}
            />
        </Modal>
    );
};

export default HeadquarterActionModal;
