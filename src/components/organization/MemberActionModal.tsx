import { format } from 'date-fns';
import React from 'react';
import { Member, Team } from '../../constants';
import { useMemberForm } from '../../hooks/organization/useMemberForm';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { Button, Modal } from '../common';
import { ConfirmationModal } from '../feedback/ConfirmationModal';
import { MemberFormFields } from './MemberFormFields';

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
    context: { teamId: string; partId: string } | null;
}

export const MemberActionModal: React.FC<MemberActionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    teams,
    memberData,
    context,
}) => {
    const {
        formData,
        setFormData,
        displayEmail,
        showConfirmation,
        setShowConfirmation,
        keepAdding,
        setKeepAdding,
        assignTeamLead,
        setAssignTeamLead,
        handleChange,
        handleEmailChange,
        handleTeamChange,
        handleCloseRequest,
        handleConfirmClose,
        resetForm,
    } = useMemberForm(isOpen, teams, memberData, context, onClose);

    const handleSave = () => {
        const submissionData = { ...formData };
        if (!memberData) {
            // New member ID generation if not present
            if (!submissionData.id) submissionData.id = `mem_${Date.now()}`;
            if (!submissionData.avatar) submissionData.avatar = getAvatarUrl(submissionData.name);
        }

        const shouldKeepOpen = !memberData && keepAdding;
        const shouldAssignLead = assignTeamLead && submissionData.status !== 'resigned';
        const teamLead = teams.find((team) => team.id === formData.teamId)?.lead || '';
        const memberWasLead = memberData ? teamLead === memberData.name : false;
        const shouldClearLead = memberWasLead && !assignTeamLead;

        onSave(submissionData as Member & { teamId: string; partId: string }, !!memberData, {
            keepOpen: shouldKeepOpen,
            setTeamLead: shouldAssignLead,
            clearTeamLead: shouldClearLead,
            onSuccess: () => {
                if (shouldKeepOpen) {
                    resetForm();
                }
            },
        });
    };

    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({
            ...prev,
            hireDate: date ? format(date, 'yyyy-MM-dd') : '',
        }));
    };

    const modalTitle = memberData ? '멤버 정보 수정' : '새 멤버 추가';

    return (
        <>
            <Modal
                open={isOpen}
                onOpenChange={(open) => !open && handleCloseRequest()}
                title={modalTitle}
                maxWidth="sm:max-w-lg"
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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="max-h-[60vh] overflow-y-auto px-1"
                >
                    <MemberFormFields
                        formData={formData}
                        displayEmail={displayEmail}
                        teams={teams}
                        onChange={handleChange}
                        onEmailChange={handleEmailChange}
                        onTeamChange={handleTeamChange}
                        onDateChange={handleDateChange}
                        assignTeamLead={assignTeamLead}
                        onAssignTeamLeadChange={setAssignTeamLead}
                        keepAdding={keepAdding}
                        onKeepAddingChange={setKeepAdding}
                        isEditing={!!memberData}
                    />
                </form>
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
