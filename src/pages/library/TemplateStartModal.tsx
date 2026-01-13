import { FileText } from '@phosphor-icons/react';
import { memo } from 'react';
import { Button } from '../../components/common';
import { Modal, ModalFooter, ModalHeader } from '../../components/common/Modal';
import { TEMPLATE_TYPE_OPTIONS } from '../../constants';

interface TemplateStartModalProps {
    onClose: () => void;
    onSelectBlank: () => void;
    onSelectPreset: (templateType: string) => void;
}

export const TemplateStartModal = memo(({ onClose, onSelectBlank, onSelectPreset }: TemplateStartModalProps) => {
    return (
        <Modal
            open={true}
            onOpenChange={(open) => !open && onClose()}
            maxWidth="sm:max-w-lg"
            className="p-0"
            bodyClassName="p-0"
        >
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
                <ModalHeader>
                    <h2 className="text-xl font-bold text-slate-900">새 템플릿 만들기</h2>
                    <p className="text-sm text-slate-500 mt-1">시작 방법을 선택하세요</p>
                </ModalHeader>
                <div className="p-6 space-y-4">
                    {/* 빈 템플릿 */}
                    <button
                        onClick={onSelectBlank}
                        className="w-full p-4 text-left bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-200 hover:border-primary/40 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-primary/40">
                                <FileText className="w-6 h-6 text-slate-400" weight="regular" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">빈 템플릿</p>
                                <p className="text-sm text-slate-500">처음부터 직접 항목을 추가합니다</p>
                            </div>
                        </div>
                    </button>

                    {/* 추천 항목으로 시작 */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">추천 항목으로 시작</p>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATE_TYPE_OPTIONS.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onSelectPreset(type)}
                                    className="p-3 text-left bg-gradient-to-br from-purple-50 to-primary/5 hover:from-purple-100 hover:to-primary/10 rounded-lg border border-purple-200 hover:border-purple-300 transition-all"
                                >
                                    <p className="font-medium text-slate-800 text-sm">{type}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">5개 항목</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <ModalFooter className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        취소
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
});

TemplateStartModal.displayName = 'TemplateStartModal';
