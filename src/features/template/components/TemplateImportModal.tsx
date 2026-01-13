import { memo } from 'react';
import { Modal, ModalHeader } from '../../../components/common/Modal';
import { EvaluationTemplate } from '../../../constants';

interface TemplateImportModalProps {
    show: boolean;
    onClose: () => void;
    templates: EvaluationTemplate[];
    currentTemplateId?: string | number | null | undefined;
    onImport: (template: EvaluationTemplate) => void;
}

export const TemplateImportModal = memo(({
    show,
    onClose,
    templates,
    currentTemplateId,
    onImport,
}: TemplateImportModalProps) => {
    if (!show) return null;

    const filteredTemplates = templates.filter(
        t => t.id !== currentTemplateId && t.items && t.items.length > 0
    );

    const handleImport = (template: EvaluationTemplate) => {
        onImport(template);
        onClose();
    };

    return (
        <Modal
            open={show}
            onOpenChange={(open) => !open && onClose()}
            maxWidth="sm:max-w-lg"
            className="p-0 max-h-[80vh] overflow-hidden"
            bodyClassName="p-0"
        >
            <div className="bg-white rounded-2xl flex flex-col max-h-[80vh]">
                <ModalHeader>
                    <h2 className="text-lg font-bold text-slate-900">템플릿에서 항목 가져오기</h2>
                </ModalHeader>
                <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
                    {filteredTemplates.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">가져올 수 있는 템플릿이 없습니다.</p>
                    ) : (
                        filteredTemplates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleImport(t)}
                                className="w-full text-left p-4 bg-slate-50 hover:bg-primary/10 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors"
                            >
                                <p className="font-semibold text-slate-800">{t.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{t.type} · 항목 {t.items?.length || 0}개</p>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
});

TemplateImportModal.displayName = 'TemplateImportModal';
