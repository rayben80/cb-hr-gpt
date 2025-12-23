import React, { useState, useCallback, useMemo, memo } from 'react';
import { Icon } from './common';
import { ICONS, EvaluationTemplate, TEMPLATE_TYPE_OPTIONS, currentUser, initialLibraryData } from '../constants';
import TemplateEditor from './TemplateEditor';
import { ConfirmationModal } from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { LoadingSpinner } from './Progress';
import { StatusCard } from './Status';

const TemplatePreviewModal = memo(({ template, onClose }: { template: EvaluationTemplate; onClose: () => void }) => {
    const items = template.items || [];
    const hasItems = items.length > 0;
    const hasWeights = items.some(item => (item.weight || 0) > 0);
    const versionLabel = `v${template.version ?? 1}`;
    const tags = template.tags || [];
    const questionCount = template.questions || items.length;
    const fallbackQuestions = useMemo(
        () => Array.from({ length: Math.min(questionCount, 10) }, (_, i) => `질문 ${i + 1}`),
        [questionCount]
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">{template.type} · {template.category || '미지정'}</p>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">{template.name}</h2>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                            <span>{versionLabel}</span>
                            <span>수정: {template.lastUpdated}</span>
                            <span>작성자: {template.author}</span>
                            {template.favorite && <span className="text-amber-600">즐겨찾기</span>}
                            {template.archived && <span className="text-slate-500">보관됨</span>}
                        </div>
                        {tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
                        <Icon path={ICONS.xMark} className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between text-sm text-slate-600">
                        <span>총 항목: {questionCount}개</span>
                        {hasWeights && <span>가중치 합계: {items.reduce((sum, item) => sum + (item.weight || 0), 0)}%</span>}
                    </div>
                    {hasItems ? (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id ?? index} className="flex items-start justify-between bg-white border border-slate-200 rounded-lg p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{item.title || `질문 ${index + 1}`}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.type}</p>
                                    </div>
                                    {hasWeights && (
                                        <span className="text-xs text-slate-500">{item.weight || 0}%</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {fallbackQuestions.map((label, index) => (
                                <div key={label} className="bg-white border border-dashed border-slate-200 rounded-lg p-4 text-sm text-slate-600">
                                    {label}
                                    {questionCount > 10 && index === fallbackQuestions.length - 1 && (
                                        <span className="ml-2 text-xs text-slate-400">외 {questionCount - fallbackQuestions.length}개</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
});

TemplatePreviewModal.displayName = 'TemplatePreviewModal';

const TemplateCard = memo(({
    template,
    onEdit,
    onArchive,
    onRestore,
    onDuplicate,
    onPreview,
    onToggleFavorite,
    isBusy,
}: {
    template: EvaluationTemplate;
    onEdit: (id: string | number) => void;
    onArchive: (id: string | number) => void;
    onRestore: (id: string | number) => void;
    onDuplicate: (id: string | number) => void;
    onPreview: (template: EvaluationTemplate) => void;
    onToggleFavorite: (id: string | number) => void;
    isBusy: boolean;
}) => {
    const categoryStyles: Record<string, { icon: string; color: string; bg: string }> = useMemo(() => ({
        '본인평가': { icon: ICONS.selfEvaluation, color: 'text-sky-600', bg: 'bg-sky-100' },
        '역량평가': { icon: ICONS.selfEvaluation, color: 'text-sky-600', bg: 'bg-sky-100' },
        '수습평가': { icon: ICONS.userGraduate, color: 'text-green-600', bg: 'bg-green-100' },
        '다면평가': { icon: ICONS.multiEvaluation, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        '리더십평가': { icon: ICONS.leadershipEvaluation, color: 'text-amber-600', bg: 'bg-amber-100' },
        '기타': { icon: ICONS.settingsModern, color: 'text-slate-600', bg: 'bg-slate-100' },
    }), []);
    
    const normalizedType = useMemo(() => template.type.replace(/\s+/g, ''), [template.type]);
    const style = useMemo(() => categoryStyles[normalizedType] || categoryStyles['기타'], [categoryStyles, normalizedType]);
    const itemCount = useMemo(() => template.items ? template.items.length : (template.questions || 0), [template.items, template.questions]);

    const versionLabel = `v${template.version ?? 1}`;
    const tags = template.tags?.slice(0, 3) || [];
    const isArchived = Boolean(template.archived);
    const isFavorite = Boolean(template.favorite);

    return (
        <div
            onClick={() => onPreview(template)}
            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all flex flex-col group cursor-pointer ${isArchived ? 'opacity-60' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPreview(template);
                }
            }}
        >
            <div className="p-6 flex-grow">
                <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                        <Icon path={style.icon} className={`w-6 h-6 ${style.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.id); }}
                            disabled={isArchived}
                            className={`p-1.5 rounded-full ${isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'} ${isArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                        >
                            <Icon path={ICONS.star} className="w-5 h-5" />
                        </button>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            {!isArchived && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(template.id); }}
                                    disabled={isBusy}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="복제"
                                >
                                    <Icon path={ICONS.copy} className="w-5 h-5" />
                                </button>
                            )}
                            {!isArchived && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(template.id); }}
                                    disabled={isBusy}
                                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="수정"
                                >
                                    <Icon path={ICONS.pencil} className="w-5 h-5" />
                                </button>
                            )}
                            {isArchived ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRestore(template.id); }}
                                    disabled={isBusy}
                                    className="p-1.5 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="복원"
                                >
                                    <Icon path={ICONS.arrowUp} className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onArchive(template.id); }}
                                    disabled={isBusy}
                                    className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="보관"
                                >
                                    <Icon path={ICONS.trash} className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{template.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{template.type} · {template.category || '미지정'}</p>
                {isArchived && (
                    <span className="mt-2 inline-flex text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        보관됨
                    </span>
                )}
                {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>항목 {itemCount}개</span>
                <span>{versionLabel} · {template.lastUpdated}</span>
            </div>
        </div>
    );
});

TemplateCard.displayName = 'TemplateCard';


const EvaluationLibrary = memo(() => {
    const [view, setView] = useState('list');
    const [templates, setTemplates] = useState<EvaluationTemplate[]>(initialLibraryData);
    const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('전체');
    const [categoryFilter, setCategoryFilter] = useState('전체');
    const [previewTemplate, setPreviewTemplate] = useState<EvaluationTemplate | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    
    const [confirmation, confirmationActions] = useConfirmation();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const [duplicateOperation, duplicateOperationActions] = useAsyncOperation();
    const isBusy = saveOperation.isLoading || deleteOperation.isLoading || duplicateOperation.isLoading;

    const handleSaveTemplate = useCallback(async (newTemplateData: EvaluationTemplate) => {
        await saveOperationActions.execute(async () => {
            if (editingTemplate) {
                // 기존 템플릿 수정
                setTemplates(prev => prev.map(t => 
                    t.id === editingTemplate.id
                        ? { ...t, ...newTemplateData, favorite: t.favorite, archived: t.archived }
                        : t
                ));
            } else {
                // 새 템플릿 추가
                setTemplates(prev => [...prev, { ...newTemplateData, favorite: false, archived: false }]);
            }
            return 'success';
        }, {
            successMessage: editingTemplate ? '템플릿이 성공적으로 수정되었습니다.' : '템플릿이 성공적으로 추가되었습니다.',
            errorMessage: `템플릿 ${editingTemplate ? '수정' : '추가'} 중 오류가 발생했습니다.`,
            onSuccess: () => {
                setView('list');
                setEditingTemplate(null);
            }
        });
    }, [editingTemplate, saveOperationActions]);
    
    const handleEditTemplate = useCallback((templateId: string | number) => {
        const templateToEdit = templates.find(t => t.id === templateId);
        if (templateToEdit && !templateToEdit.archived) {
            setEditingTemplate(templateToEdit);
            setView('editor');
        }
    }, [templates]);

    const handleArchiveTemplate = useCallback((templateId: string | number) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
    
        confirmationActions.showConfirmation({
            title: '템플릿 보관',
            message: `'${template.name}' 템플릿을 보관하시겠습니까? 보관된 템플릿은 목록에서 숨겨집니다.`,
            confirmButtonText: '보관',
            confirmButtonColor: 'bg-slate-700 hover:bg-slate-800',
            onConfirm: async () => {
                await deleteOperationActions.execute(async () => {
                    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, archived: true, favorite: false } : t));
                    return 'success';
                }, {
                    successMessage: '템플릿이 보관되었습니다.',
                    errorMessage: '템플릿 보관 중 오류가 발생했습니다.'
                });
            }
        });
    }, [templates, confirmationActions, deleteOperationActions]);

    const handleRestoreTemplate = useCallback((templateId: string | number) => {
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, archived: false } : t));
    }, []);

    const handleToggleFavorite = useCallback((templateId: string | number) => {
        setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, favorite: !t.favorite } : t));
    }, []);

    const handleDuplicateTemplate = useCallback(async (templateId: string | number) => {
        const templateToDuplicate = templates.find(t => t.id === templateId);
        if (!templateToDuplicate) return;
        
        await duplicateOperationActions.execute(async () => {
            const { id, ...dataToDuplicate } = templateToDuplicate;
            const newTemplate = { 
                ...dataToDuplicate, 
                id: Date.now() + Math.random(),
                name: `${templateToDuplicate.name} (복사본)`,
                author: currentUser.name,
                lastUpdated: new Date().toISOString().split('T')[0],
                version: 1,
                favorite: false,
                archived: false,
            };
            setTemplates(prev => [...prev, newTemplate]);
            return 'success';
        }, {
            successMessage: '템플릿이 성공적으로 복사되었습니다.',
            errorMessage: '템플릿 복사 중 오류가 발생했습니다.'
        });
    }, [templates, duplicateOperationActions]);
    
    const handleCancel = useCallback(() => {
        setView('list');
        setEditingTemplate(null);
    }, []);

    const typeOptions = useMemo(() => {
        const typeSet = new Set<string>(TEMPLATE_TYPE_OPTIONS);
        templates.forEach(template => typeSet.add(template.type));
        return ['전체', ...Array.from(typeSet)];
    }, [templates]);

    const categoryOptions = useMemo(() => {
        const categorySet = new Set<string>();
        templates.forEach(template => {
            if (template.category) {
                categorySet.add(template.category);
            }
        });
        return ['전체', ...Array.from(categorySet)];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return templates.filter(template => {
            if (!showArchived && template.archived) return false;
            if (typeFilter !== '전체' && template.type !== typeFilter) return false;
            if (categoryFilter !== '전체' && template.category !== categoryFilter) return false;
            if (!query) return true;
            return (
                template.name.toLowerCase().includes(query)
                || template.type.toLowerCase().includes(query)
                || template.author.toLowerCase().includes(query)
                || (template.category || '').toLowerCase().includes(query)
                || (template.tags || []).some(tag => tag.toLowerCase().includes(query))
            );
        });
    }, [templates, searchTerm, typeFilter, categoryFilter, showArchived]);

    const sortedTemplates = useMemo(() => (
        filteredTemplates
            .map((template, index) => ({ template, index }))
            .sort((a, b) => {
                const favoriteSort = (b.template.favorite ? 1 : 0) - (a.template.favorite ? 1 : 0);
                return favoriteSort !== 0 ? favoriteSort : a.index - b.index;
            })
            .map(({ template }) => template)
    ), [filteredTemplates]);

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">평가 라이브러리</h1>
                <p className="text-lg text-slate-600 mt-1">평가 템플릿 관리 및 생성</p>
            </div>

            {view === 'list' && (
                <>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">템플릿 목록</h2>
                                <p className="text-slate-600 mt-1">평가에 사용할 템플릿을 관리하세요</p>
                            </div>
                            <button
                                onClick={() => setView('editor')}
                                disabled={isBusy}
                                className="mobile-button bg-sky-500 hover:bg-sky-600 text-white transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                {isBusy ? (
                                    <>
                                        <LoadingSpinner size="sm" color="white" className="mr-2" />
                                        처리 중...
                                    </>
                                ) : (
                                    <>
                                        <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                                        새 템플릿 생성
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="mt-4 flex flex-col md:flex-row gap-3">
                            <div className="relative w-full md:w-64">
                                <Icon path={ICONS.search} className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="템플릿 이름/태그 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full md:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                {typeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full md:w-40 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                {categoryOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={showArchived}
                                    onChange={(e) => setShowArchived(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                />
                                보관 포함
                            </label>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center">
                                <LoadingSpinner size="lg" color="blue" />
                                <p className="text-slate-500 mt-4">템플릿 데이터를 불러오는 중...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <StatusCard 
                            status="error"
                            title="데이터 로드 실패"
                            description={error}
                            className="max-w-4xl mx-auto my-8"
                            action={
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                                    >
                                        새로고침
                                    </button>
                                </div>
                            }
                        />
                    )}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedTemplates.map(template => (
                                <TemplateCard 
                                    key={template.id} 
                                    template={template} 
                                    onEdit={handleEditTemplate}
                                    onArchive={handleArchiveTemplate}
                                    onRestore={handleRestoreTemplate}
                                    onDuplicate={handleDuplicateTemplate}
                                    onPreview={(selected) => setPreviewTemplate(selected)}
                                    onToggleFavorite={handleToggleFavorite}
                                    isBusy={isBusy}
                                />
                            ))}
                            {sortedTemplates.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <Icon path={ICONS.documentText} className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                                        {searchTerm.trim() || typeFilter !== '전체' || categoryFilter !== '전체'
                                            ? '검색 결과가 없습니다'
                                            : showArchived
                                                ? '보관된 템플릿이 없습니다'
                                                : '등록된 템플릿이 없습니다'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        {searchTerm.trim() || typeFilter !== '전체' || categoryFilter !== '전체'
                                            ? '다른 검색어나 필터를 시도해보세요.'
                                            : '첫 번째 템플릿을 만들어보세요.'}
                                    </p>
                                    {!searchTerm.trim() && typeFilter === '전체' && categoryFilter === '전체' && !showArchived && (
                                        <button 
                                            onClick={() => setView('editor')}
                                            className="mobile-button bg-sky-500 hover:bg-sky-600 text-white"
                                        >
                                            <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                                            템플릿 생성
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {view === 'editor' && (
                <TemplateEditor 
                    initialTemplate={editingTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={handleCancel}
                    categoryOptions={categoryOptions.filter(option => option !== '전체')}
                />
            )}

            {previewTemplate && (
                <TemplatePreviewModal 
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}

            <ConfirmationModal 
                isOpen={confirmation.isOpen}
                onClose={confirmationActions.closeConfirmation}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                confirmButtonText={confirmation.confirmButtonText || '확인'}
                confirmButtonColor={confirmation.confirmButtonColor || 'bg-red-600 hover:bg-red-700'}
            />
        </div>
    );
});

EvaluationLibrary.displayName = 'EvaluationLibrary';

export default EvaluationLibrary;
