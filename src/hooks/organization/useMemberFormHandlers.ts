import { useCallback } from 'react';
import { Team } from '../../constants';
import { initialFormState, MemberFormData } from './memberFormUtils';

export const useMemberFormHandlers = (
    formData: MemberFormData,
    setFormData: React.Dispatch<React.SetStateAction<MemberFormData>>,
    setDisplayEmail: React.Dispatch<React.SetStateAction<string>>,
    setInitialFormData: React.Dispatch<React.SetStateAction<MemberFormData>>,
    teams: Team[]
) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        [setFormData]
    );

    const handleEmailChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setDisplayEmail(value);
            if (value.includes('@')) {
                setFormData((prev) => ({ ...prev, email: value }));
            } else {
                setFormData((prev) => ({ ...prev, email: value ? `${value}@forcs.com` : '' }));
            }
        },
        [setFormData, setDisplayEmail]
    );

    const handleTeamChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newTeamId = e.target.value;
            // Logic to select first part of new team
            const firstPartIdOfNewTeam = teams.find((t) => t.id === newTeamId)?.parts[0]?.id || '';
            setFormData((prev) => ({ ...prev, teamId: newTeamId, partId: firstPartIdOfNewTeam }));
        },
        [teams, setFormData]
    );

    const resetForm = useCallback(() => {
        const resetData: MemberFormData = {
            ...initialFormState,
            teamId: formData.teamId,
            partId: formData.partId,
        };
        setFormData(resetData);
        setInitialFormData({ ...resetData });
        setDisplayEmail('');
    }, [formData.teamId, formData.partId, setFormData, setInitialFormData, setDisplayEmail]);

    const updateInitialData = useCallback(() => {
        setInitialFormData({ ...formData });
    }, [formData, setInitialFormData]);

    return {
        handleChange,
        handleEmailChange,
        handleTeamChange,
        resetForm,
        updateInitialData,
    };
};
