import { memo } from 'react';
import { Button } from '../../../components/common';
import { Modal, ModalFooter, ModalHeader } from '../../../components/common/Modal';
import { EvaluationItem } from '../../../constants';

interface TemplatePreviewModalProps {
    show: boolean;
    onClose: () => void;
    template: {
        name: string;
        type: string;
        category: string;
        items: EvaluationItem[];
    };
    tags: string[];
    version: number;
    usesWeights: boolean;
    totalWeight: number;
}

export const TemplatePreviewModal = memo(({
    show,
    onClose,
    template,
    tags,
    version,
    usesWeights,
    totalWeight,
}: TemplatePreviewModalProps) => {
    if (!show) return null;

    return (
        <Modal
            open={show}
            onOpenChange={(open) => !open && onClose()}
            maxWidth="sm:max-w-3xl"
            className="p-0 max-h-[90vh] overflow-hidden"
            bodyClassName="p-0"
        >
            <div className="bg-white rounded-2xl flex flex-col max-h-[90vh]">
                <ModalHeader className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{template.type} · {template.category || '미지정'}</p>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">{template.name || '새 템플릿'}</h2>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                            <span>v{version}</span>
                            {tags.length > 0 && tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </ModalHeader>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between text-sm text-slate-600">
                        <span>총 항목: {template.items.length}개</span>
                        {usesWeights && <span>가중치 합계: {totalWeight}%</span>}
                    </div>
                    <div className="space-y-3">
                        {template.items.map((item, index) => (
                            <div key={item.id ?? index} className="flex items-start justify-between bg-white border border-slate-200 rounded-lg p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{item.title || `항목 ${index + 1}`}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.type}</p>
                                    {item.details?.description && (
                                        <p className="text-xs text-slate-400 mt-2">{item.details.description}</p>
                                    )}
                                </div>
                                {usesWeights && (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.weight || 0}%</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <ModalFooter className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        닫기
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
});

TemplatePreviewModal.displayName = 'TemplatePreviewModal';
