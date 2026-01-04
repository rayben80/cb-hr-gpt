import { useCallback, useEffect, useMemo, useState } from 'react';
import { Team } from '../constants';
import { showError } from '../utils/toast';
import { useEscapeKey } from './useModalUtils';

interface TeamFormData {
    name: string;
    lead: string;
}

interface UseTeamFormOptions {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TeamFormData) => void;
    mode: 'add' | 'edit';
    initialData?: Team | null;
    existingTeams?: Team[];
}

const getLeaderOptions = (initialData: Team | null, currentLead: string) => {
    if (!initialData) return [];

    // 1. Get Part Members
    const partMembers = initialData.parts.flatMap((part) =>
        part.members
            .filter((m) => m.status === 'active' || m.status === 'intern')
            .map((m) => ({ value: m.name, label: `${m.name} · ${part.title}` }))
    );

    // 2. Get Direct Members
    const directMembers = (initialData.members || [])
        .filter((m) => m.status === 'active' || m.status === 'intern')
        .map((m) => ({ value: m.name, label: `${m.name} · 팀 직속` }));

    const allMembers = [...directMembers, ...partMembers];

    const hasCurrentLead = currentLead && allMembers.some((o) => o.value === currentLead);
    if (currentLead && !hasCurrentLead)
        return [{ value: currentLead, label: `${currentLead} (현재 팀장)` }, ...allMembers];
    return allMembers;
};

export const useTeamForm = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData = null,
    existingTeams = [],
}: UseTeamFormOptions) => {
    const [formData, setFormData] = useState<TeamFormData>({ name: '', lead: '' });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [initialFormData, setInitialFormData] = useState<TeamFormData>({ name: '', lead: '' });
    const [error, setError] = useState<string | null>(null);

    const hasChanges = useCallback(
        () => formData.name !== initialFormData.name || formData.lead !== initialFormData.lead,
        [formData, initialFormData]
    );

    const handleCloseRequest = useCallback(() => {
        if (hasChanges() && (formData.name || formData.lead)) setShowConfirmation(true);
        else onClose();
    }, [hasChanges, formData.name, formData.lead, onClose]);

    useEscapeKey({ isOpen, onEscape: handleCloseRequest });

    useEffect(() => {
        if (isOpen) {
            let initialLead = initialData?.lead || '';

            // Fallback: If no lead is set in data, try to derived it from member roles (same as TeamCard display logic)
            if (!initialLead && initialData) {
                const allMembers = [...(initialData.members || []), ...initialData.parts.flatMap((p) => p.members)];
                const derivedLead = allMembers.find(
                    (m) => m.role.includes('팀장') || m.role.toLowerCase().includes('team lead')
                );
                if (derivedLead) {
                    initialLead = derivedLead.name;
                }
            }

            const data = { name: initialData?.name || '', lead: initialLead };
            setFormData(data);
            setInitialFormData(data);
        }
    }, [isOpen, initialData]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
            setError(null);
        },
        []
    );

    const validateForm = useCallback((): boolean => {
        if (!formData.name.trim()) {
            setError('팀 이름을 입력해주세요.');
            return false;
        }
        const isDuplicate = existingTeams.some(
            (t) => !(mode === 'edit' && initialData && t.id === initialData.id) && t.name === formData.name.trim()
        );
        if (isDuplicate) {
            setError('이미 존재하는 팀 이름입니다. 다른 이름을 입력해주세요.');
            return false;
        }
        return true;
    }, [formData.name, existingTeams, mode, initialData]);

    const handleSave = useCallback(async () => {
        if (!validateForm()) return;
        try {
            await onSave(formData);
            setInitialFormData({ ...formData });
            onClose();
        } catch (err) {
            console.error('Error saving team:', err);
            showError('팀 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }, [validateForm, onSave, formData, onClose]);

    const handleSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSave();
        },
        [handleSave]
    );
    const leaderOptions = useMemo(() => getLeaderOptions(initialData, formData.lead), [initialData, formData.lead]);
    const handleConfirmClose = useCallback(() => {
        setShowConfirmation(false);
        onClose();
    }, [onClose]);

    return {
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
    };
};
