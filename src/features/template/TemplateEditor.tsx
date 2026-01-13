import { memo } from 'react';
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { StatusCard } from '../../components/feedback/Status';
import { EvaluationTemplate } from '../../constants';
// Added Button import
import { Button } from '@/components/ui/button';
import { TemplateEditorHeader, TemplateImportModal, TemplateItemsPanel, TemplatePreviewModal } from './components';
import { useTemplateEditorLogic } from './hooks/useTemplateEditorLogic';

export interface TemplateEditorProps {
    onSave: (template: EvaluationTemplate) => void;
    onCancel: () => void;
    initialTemplate?: EvaluationTemplate | null;
    categoryOptions: string[];
    isArchived?: boolean;
    existingTemplates?: EvaluationTemplate[];
    onArchive?: () => void;
    onRestore?: () => Promise<void> | void | null;
}

const TemplateEditor = memo((props: TemplateEditorProps) => {
    const {
        onSave,
        onCancel,
        initialTemplate = null,
        categoryOptions,

        isArchived = false,
        existingTemplates = [],
        onArchive = () => {},
        onRestore = async () => {},
    } = props;

    const {
        template,
        setTemplate,
        showPreview,
        setShowPreview,
        showImportModal,
        setShowImportModal,
        showValidation,
        confirmation,
        setConfirmation,
        tagProps,
        draftInfo,
        handleRestoreDraft,
        handleDiscardDraft,
        itemProps,
        usesWeights,
        totalWeight,
        handleSave,
        validationMessages,
        showItemsError,
        handleCancelClick,
        getDropPosition,
    } = useTemplateEditorLogic({
        onSave,
        onCancel,
        initialTemplate,
        categoryOptions,
        isArchived,
        existingTemplates,
    });

    return (
        <div>
            <TemplateEditorHeader
                template={template}
                onChange={(field, value) => setTemplate((prev) => ({ ...prev, [field]: value }))}
                onSave={handleSave}
                onCancel={handleCancelClick}
                categoryOptions={categoryOptions}
                isArchived={isArchived}
                onArchive={onArchive}
                onRestore={onRestore}
                tagProps={tagProps}
                validationMessages={showValidation ? validationMessages : []}
            />

            {draftInfo && (
                <div className="mb-6 mt-6">
                    <StatusCard
                        status="info"
                        title="임시 저장본이 있습니다."
                        description={`마지막 저장: ${new Date(draftInfo.updatedAt).toLocaleString()}`}
                        action={
                            <div className="flex gap-2">
                                <Button onClick={handleRestoreDraft} variant="default" size="sm">
                                    복원
                                </Button>
                                <Button onClick={handleDiscardDraft} variant="secondary" size="sm">
                                    무시
                                </Button>
                            </div>
                        }
                    />
                </div>
            )}

            <div className="mt-8 space-y-8">
                <TemplateItemsPanel
                    items={template.items || []}
                    usesWeights={usesWeights}
                    isArchived={isArchived}
                    existingTemplatesCount={existingTemplates.length}
                    showItemsError={showItemsError}
                    getDropPosition={getDropPosition}
                    onShowImportModal={() => setShowImportModal(true)}
                    {...itemProps}
                />
            </div>

            {showPreview && (
                <TemplatePreviewModal
                    show={showPreview}
                    template={{ ...template, items: template.items || [] }}
                    onClose={() => setShowPreview(false)}
                    tags={tagProps.tags}
                    version={template.version || 1}
                    usesWeights={usesWeights}
                    totalWeight={totalWeight}
                />
            )}

            <TemplateImportModal
                show={showImportModal}
                onClose={() => setShowImportModal(false)}
                templates={existingTemplates}
                currentTemplateId={initialTemplate?.id}
                onImport={itemProps.handleImportFromTemplate}
            />

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                confirmButtonText="확인"
                confirmButtonColor="destructive"
            />
        </div>
    );
});

TemplateEditor.displayName = 'TemplateEditor';

export default TemplateEditor;
