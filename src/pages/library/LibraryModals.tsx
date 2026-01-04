import { memo } from 'react';
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateStartModal } from './TemplateStartModal';

interface LibraryModalsProps {
    previewTemplate: any;
    showStartModal: boolean;
    confirmation: any;
    confirmationActions: any;
    handleEditTemplate: any;
    handleDuplicateTemplate: any;
    handleRestoreVersion: any;
    setPreviewTemplate: any;
    setShowStartModal: any;
    handleSelectBlank: any;
    handleSelectPreset: any;
}

export const LibraryModals = memo(
    ({
        previewTemplate,
        showStartModal,
        confirmation,
        confirmationActions,
        handleEditTemplate,
        handleDuplicateTemplate,
        handleRestoreVersion,
        setPreviewTemplate,
        setShowStartModal,
        handleSelectBlank,
        handleSelectPreset,
    }: LibraryModalsProps) => (
        <>
            {previewTemplate && (
                <TemplatePreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                    onEdit={(id: string | number) => {
                        handleEditTemplate(id);
                        setPreviewTemplate(null);
                    }}
                    onDuplicate={(id: string | number) => {
                        handleDuplicateTemplate(id);
                        setPreviewTemplate(null);
                    }}
                    onRestoreVersion={(id: string | number, v: number) =>
                        handleRestoreVersion(id, v, setPreviewTemplate)
                    }
                />
            )}
            {showStartModal && (
                <TemplateStartModal
                    onClose={() => setShowStartModal(false)}
                    onSelectBlank={handleSelectBlank}
                    onSelectPreset={handleSelectPreset}
                />
            )}
            {confirmation.isOpen && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={confirmationActions.closeConfirmation}
                    title={confirmation.title}
                    message={confirmation.message}
                    confirmButtonText={confirmation.confirmButtonText}
                    onConfirm={confirmation.onConfirm}
                    confirmButtonColor={confirmation.confirmButtonColor}
                />
            )}
        </>
    )
);

LibraryModals.displayName = 'LibraryModals';
