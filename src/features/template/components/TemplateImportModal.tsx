import { memo } from 'react';
import { CloseButton } from '../../../components/common/index';
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
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">템플릿에서 항목 가져오기</h2>
                    </div>
                    <CloseButton onClick={onClose} size="sm" />
                </div>
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
        </div>
    );
});

TemplateImportModal.displayName = 'TemplateImportModal';
