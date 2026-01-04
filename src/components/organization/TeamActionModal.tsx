import React, { useRef } from 'react';
import { Team } from '../../constants';
import { useTeamForm } from '../../hooks/useTeamForm';
import { Button, Modal } from '../common';
import { ConfirmationModal } from '../feedback/ConfirmationModal';
import { TeamForm } from './TeamForm';

interface TeamActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; lead: string }) => void;
    mode: 'add' | 'edit';
    initialData?: Team | null;
    existingTeams?: Team[];
}

export const TeamActionModal: React.FC<TeamActionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData = null,
    existingTeams = [],
}) => {
    const formRef = useRef<HTMLFormElement>(null);
    const {
        formData,
        error,
        showConfirmation,
        leaderOptions,
        handleChange,
        handleSubmit,
        handleSave,
        handleCloseRequest,
        handleConfirmClose,
        setShowConfirmation,
    } = useTeamForm({ isOpen, onClose, onSave, mode, initialData, existingTeams });

    const modalTitle = mode === 'add' ? '새 팀 추가' : '팀 정보 수정';

    return (
        <>
            <Modal
                open={isOpen}
                onOpenChange={(open) => !open && handleCloseRequest()}
                title={modalTitle}
                maxWidth="sm:max-w-md"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseRequest}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            저장
                        </Button>
                    </>
                }
            >
                <TeamForm
                    formRef={formRef}
                    formData={formData}
                    error={error}
                    mode={mode}
                    leaderOptions={leaderOptions}
                    onSubmit={handleSubmit}
                    onChange={handleChange}
                    onCloseRequest={handleCloseRequest}
                    onSave={handleSave}
                    hideHeader
                    hideFooter
                />
            </Modal>
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmClose}
                title="변경사항 취소"
                message="정말 닫으시겠습니까? 입력한 내용은 저장되지 않습니다."
                confirmButtonText="네, 닫습니다"
                confirmButtonColor="destructive"
            />
        </>
    );
};
