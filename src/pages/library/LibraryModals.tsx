import { memo } from 'react';
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { CampaignWizardModal } from '../../features/evaluation/CampaignWizardModal';
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
    campaignWizardTemplateId: string | number | null;
    setCampaignWizardTemplateId: (id: string | number | null) => void;
    templates: any[];
    teams?: any[];
    members?: any[];
    createCampaignFromWizard: (draft: any, teams: any[], members: any[]) => Promise<any>;
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
        campaignWizardTemplateId,
        setCampaignWizardTemplateId,
        templates,
        teams = [],
        members = [],
        createCampaignFromWizard,
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
            {campaignWizardTemplateId && (
                <CampaignWizardModal
                    isOpen={!!campaignWizardTemplateId}
                    onClose={() => setCampaignWizardTemplateId(null)}
                    templateId={campaignWizardTemplateId}
                    template={templates.find((t) => t.id === campaignWizardTemplateId)}
                    teams={teams}
                    members={members}
                    onSubmit={async (draft) => {
                        try {
                            if (teams && members) {
                                await createCampaignFromWizard(draft, teams, members);
                                setCampaignWizardTemplateId(null);
                            }
                        } catch (error) {
                            console.error('Campaign creation failed:', error);
                            // Error handling is likely done within createCampaignFromWizard's hooks (showError)
                        }
                    }}
                />
            )}
        </>
    )
);

LibraryModals.displayName = 'LibraryModals';
