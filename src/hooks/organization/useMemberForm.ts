import { useCallback, useEffect, useState } from 'react';
import { Member, Team } from '../../constants';
// utils
import { getDisplayEmail, getInitialMemberFormData, initialFormState, MemberFormData } from './memberFormUtils';
import { useMemberFormHandlers } from './useMemberFormHandlers';

export type { MemberFormData };

export const useMemberForm = (
    isOpen: boolean,
    teams: Team[],
    memberData: Member | null,
    context: { teamId: string; partId: string } | null,
    onClose: () => void
) => {
    const [formData, setFormData] = useState<MemberFormData>(initialFormState);
    const [displayEmail, setDisplayEmail] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [initialFormData, setInitialFormData] = useState<MemberFormData>(initialFormState);
    const [keepAdding, setKeepAdding] = useState(false);
    const [assignTeamLead, setAssignTeamLead] = useState(false);

    const { handleChange, handleEmailChange, handleTeamChange, resetForm, updateInitialData } = useMemberFormHandlers(
        formData,
        setFormData,
        setDisplayEmail,
        setInitialFormData,
        teams
    );

    // Initialization
    useEffect(() => {
        if (isOpen) {
            const {
                formData: newFormData,
                assignTeamLead: newAssignLead,
                displayEmail: newDisplayEmail,
            } = getInitialMemberFormData(teams, memberData, context);

            setFormData(newFormData);
            setInitialFormData({ ...newFormData });
            setAssignTeamLead(newAssignLead);
            setDisplayEmail(newDisplayEmail);
            setKeepAdding(false);
        }
    }, [memberData, context, isOpen, teams]);

    useEffect(() => {
        if (formData.status === 'resigned' && assignTeamLead) {
            setAssignTeamLead(false);
        }
    }, [formData.status, assignTeamLead]);

    const hasChanges = useCallback(() => {
        const currentEmail = formData.email || '';
        const effectiveDisplayEmail = getDisplayEmail(currentEmail);

        return JSON.stringify(formData) !== JSON.stringify(initialFormData) || displayEmail !== effectiveDisplayEmail;
    }, [formData, initialFormData, displayEmail]);

    const handleCloseRequest = useCallback(() => {
        if (hasChanges()) {
            setShowConfirmation(true);
        } else {
            onClose();
        }
    }, [hasChanges, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowConfirmation(false);
        onClose();
    }, [onClose]);

    // ESC handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleCloseRequest();
            }
        };

        if (!isOpen) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleCloseRequest]);

    return {
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
        updateInitialData,
    };
};
