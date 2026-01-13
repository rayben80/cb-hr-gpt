import { memo, useMemo, useState } from 'react';
import { Button } from '../../components/common';
import { Modal, ModalFooter, ModalHeader } from '../../components/common/Modal';
import { EvaluationTemplate } from '../../constants';
import { TemplateContentTab } from './TemplateContentTab';
import { TemplateHistoryTab } from './TemplateHistoryTab';

interface TemplatePreviewModalProps {
    template: EvaluationTemplate;
    onClose: () => void;
    onEdit?: (id: string | number) => void;
    onDuplicate?: (id: string | number) => void;
    onStart?: () => void;
    onRestoreVersion?: ((templateId: string | number, version: number) => void) | undefined;
}

export const TemplatePreviewModal = memo(
    ({ template, onClose, onRestoreVersion, onEdit, onDuplicate, onStart }: TemplatePreviewModalProps) => {
        const [activeTab, setActiveTab] = useState<'content' | 'history'>('content');
        const items = template.items || [];
        const hasItems = items.length > 0;
        const hasWeights = items.some((item) => (item.weight || 0) > 0);
        const versionLabel = `v${template.version ?? 1}`;
        const tags = template.tags || [];
        const questionCount = template.questions || items.length;
        const versionHistory = template.versionHistory || [];
        const hasVersionHistory = versionHistory.length > 0;

        const fallbackQuestions = useMemo(
            () => Array.from({ length: Math.min(questionCount, 10) }, (_, i) => `질문 ${i + 1}`),
            [questionCount]
        );

        return (
            <Modal
                open={true}
                onOpenChange={(open) => !open && onClose()}
                maxWidth="sm:max-w-3xl"
                className="p-0 max-h-[90vh] overflow-hidden"
                bodyClassName="p-0"
            >
                <div className="bg-white rounded-2xl flex flex-col max-h-[90vh]">
                    <ModalHeader className="flex items-start justify-between">
                        <TemplatePreviewHeader template={template} versionLabel={versionLabel} tags={tags} />
                    </ModalHeader>

                    {hasVersionHistory && (
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            historyCount={versionHistory.length}
                        />
                    )}

                    <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                        {activeTab === 'content' ? (
                            <TemplateContentTab
                                items={items}
                                hasItems={hasItems}
                                hasWeights={hasWeights}
                                questionCount={questionCount}
                                fallbackQuestions={fallbackQuestions}
                            />
                        ) : (
                            <TemplateHistoryTab
                                versionHistory={versionHistory}
                                templateId={template.id}
                                onRestoreVersion={onRestoreVersion}
                            />
                        )}
                    </div>

                    <ModalFooter className="flex justify-end gap-2">
                        {activeTab === 'content' && (
                            <>
                                {onStart && (
                                    <Button variant="primary" onClick={onStart}>
                                        평가 시작
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button variant="outline" onClick={() => onEdit(template.id)}>
                                        수정
                                    </Button>
                                )}
                                {onDuplicate && (
                                    <Button variant="outline" onClick={() => onDuplicate(template.id)}>
                                        복제
                                    </Button>
                                )}
                            </>
                        )}
                        <Button variant="outline" onClick={onClose}>
                            닫기
                        </Button>
                    </ModalFooter>
                </div>
            </Modal>
        );
    }
);

TemplatePreviewModal.displayName = 'TemplatePreviewModal';

// Sub-components
interface TemplatePreviewHeaderProps {
    template: EvaluationTemplate;
    versionLabel: string;
    tags: string[];
}

const TemplatePreviewHeader = memo(({ template, versionLabel, tags }: TemplatePreviewHeaderProps) => (
    <div>
        <p className="text-sm text-slate-500">
            {template.type} · {template.category || '미지정'}
        </p>
        <h2 className="text-xl font-bold text-slate-900 mt-1">{template.name}</h2>
        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
            <span>{versionLabel}</span>
            <span>수정: {template.lastUpdated}</span>
            <span>작성자: {template.author}</span>

            {template.archived && <span className="text-slate-500">보관됨</span>}
        </div>
        {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </div>
));

TemplatePreviewHeader.displayName = 'TemplatePreviewHeader';

interface TabNavigationProps {
    activeTab: 'content' | 'history';
    setActiveTab: (tab: 'content' | 'history') => void;
    historyCount: number;
}

const TabNavigation = memo(({ activeTab, setActiveTab, historyCount }: TabNavigationProps) => (
    <div className="px-6 pt-4 flex gap-4 border-b border-slate-100">
        <button
            onClick={() => setActiveTab('content')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
            현재 버전
        </button>
        <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
            버전 히스토리 ({historyCount})
        </button>
    </div>
));

TabNavigation.displayName = 'TabNavigation';
