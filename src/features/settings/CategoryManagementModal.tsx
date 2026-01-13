import { memo } from 'react';
import { Modal } from '../../components/common';
import { CategoryManagement } from './CategoryManagement';

interface CategoryManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * 카테고리 관리 모달
 * 평가 템플릿 페이지에서 사용
 */
export const CategoryManagementModal = memo(({ isOpen, onClose }: CategoryManagementModalProps) => {
    if (!isOpen) return null;

    return (
        <Modal open={isOpen} onOpenChange={(open) => !open && onClose()} title="카테고리 관리" maxWidth="sm:max-w-md">
            <CategoryManagement />
        </Modal>
    );
});

CategoryManagementModal.displayName = 'CategoryManagementModal';
