import { useCallback, useState } from 'react';
import { Member as MemberType, Team } from '../../constants';
import { useMemberOperations } from './useMemberOperations';

/**
 * 멤버 관리 로직을 처리하는 커스텀 훅
 */
export const useMemberManagement = (teams: Team[], firestoreActions: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<MemberType | null>(null);
    const [modalContext, setModalContext] = useState<{ teamId: string; partId: string } | null>(null);

    const handleOperationSuccess = useCallback((keepOpen: boolean) => {
        if (!keepOpen) {
            setIsModalOpen(false);
            setEditingMember(null);
            setModalContext(null);
        } else {
            setEditingMember(null);
        }
    }, []);

    const {
        saveOperation,
        deleteOperation,
        confirmation,
        handleDeleteMember,
        handleDeleteResignedMember,
        handleReinstateMember,
        handleSaveMember,
        confirmationActions,
    } = useMemberOperations(teams, handleOperationSuccess, firestoreActions);
    // Note: useMemberOperations returns operational handlers, but add/edit trigger modal state.
    // The original useMemberManagement handled modal state + logic.
    // We kept modal state here.

    // Re-bind exposed handlers from useMemberOperations
    // The previous design mixed modal state control with operations?
    // Let's check useMemberOperations export again.
    // it exports: saveOperation, deleteOperation, confirmation, confirmationActions, handleSaveMember, handleDeleteMember, handleDeleteResignedMember, handleReinstateMember
    // It does NOT export handleAddMember/handleEditMember because those manipulate modal state primarily.

    // So we implement generic modal handlers here.

    const handleAddMember = useCallback((teamId: string, partId: string) => {
        setEditingMember(null);
        setModalContext({ teamId, partId });
        setIsModalOpen(true);
    }, []);

    const handleEditMember = useCallback((member: MemberType) => {
        setEditingMember(member);
        setModalContext(null);
        setIsModalOpen(true);
    }, []);

    return {
        isModalOpen,
        setIsModalOpen,
        editingMember,
        modalContext,
        saveOperation, // exposed from ops
        deleteOperation, // exposed from ops
        confirmation, // exposed from ops
        handleAddMember,
        handleEditMember,
        handleDeleteMember, // exposed from ops
        handleDeleteResignedMember, // exposed from ops
        handleReinstateMember, // exposed from ops
        handleSaveMember, // exposed from ops
        confirmationActions, // exposed from ops
    };
};
