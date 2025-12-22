import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Icon } from './common';
import { ICONS, EvaluationTemplate, initialLibraryData } from '../constants';
import TemplateEditor from './TemplateEditor';
import { ConfirmationModal } from './ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useError } from '../contexts/ErrorContext';
import { LoadingSpinner } from './Progress';
import { StatusCard } from './Status';

const TemplateCard = memo(({ template, onEdit, onDelete, onDuplicate }: { template: EvaluationTemplate, onEdit: (id: string | number) => void, onDelete: (id: string | number) => void, onDuplicate: (id: string | number) => void }) => {
    const categoryStyles: Record<string, { icon: string; color: string; bg: string }> = useMemo(() => ({
        '본인평가': { icon: ICONS.selfEvaluation, color: 'text-sky-600', bg: 'bg-sky-100' },
        '다면평가': { icon: ICONS.multiEvaluation, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        '리더십평가': { icon: ICONS.leadershipEvaluation, color: 'text-amber-600', bg: 'bg-amber-100' },
        '기타': { icon: ICONS.settingsModern, color: 'text-slate-600', bg: 'bg-slate-100' },
        '역량 평가': { icon: ICONS.selfEvaluation, color: 'text-sky-600', bg: 'bg-sky-100' },
        '다면 평가': { icon: ICONS.multiEvaluation, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        '수습 평가': { icon: ICONS.userGraduate, color: 'text-green-600', bg: 'bg-green-100' },
        '리더십 평가': { icon: ICONS.leadershipEvaluation, color: 'text-amber-600', bg: 'bg-amber-100' },
    }), []);
    
    const style = useMemo(() => categoryStyles[template.type] || categoryStyles['기타'], [categoryStyles, template.type]);
    const itemCount = useMemo(() => template.items ? template.items.length : (template.questions || 0), [template.items, template.questions]);

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all flex flex-col group">
            <div className="p-6 flex-grow">
                <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                        <Icon path={style.icon} className={`w-6 h-6 ${style.color}`} />
                    </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <button onClick={(e) => { e.stopPropagation(); onDuplicate(template.id); }} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100" title="복제">
                            <Icon path={ICONS.plus} className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(template.id); }} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100" title="수정">
                            <Icon path={ICONS.pencil} className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(template.id); }} className="p-1.5 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100" title="삭제">
                            <Icon path={ICONS.trash} className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{template.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{template.type}</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>항목 {itemCount}개</span>
                <span>수정: {template.lastUpdated}</span>
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
    
    const [confirmation, confirmationActions] = useConfirmation();
    const [networkState, networkActions] = useNetworkStatus();
    const [saveOperation, saveOperationActions] = useAsyncOperation();
    const [deleteOperation, deleteOperationActions] = useAsyncOperation();
    const [duplicateOperation, duplicateOperationActions] = useAsyncOperation();
    const { showError } = useError();

    const handleSaveTemplate = useCallback(async (newTemplateData: EvaluationTemplate) => {
        await saveOperationActions.execute(async () => {
            if (editingTemplate) {
                // 기존 템플릿 수정
                setTemplates(prev => prev.map(t => 
                    t.id === editingTemplate.id ? newTemplateData : t
                ));
            } else {
                // 새 템플릿 추가
                setTemplates(prev => [...prev, newTemplateData]);
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
        if (templateToEdit) {
            setEditingTemplate(templateToEdit);
            setView('editor');
        }
    }, [templates]);

    const handleDeleteTemplate = useCallback((templateId: string | number) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
    
        confirmationActions.showConfirmation({
            title: '템플릿 삭제 확인',
            message: `'${template.name}' 템플릿을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
            confirmButtonText: '삭제',
            confirmButtonColor: 'bg-red-600 hover:bg-red-700',
            onConfirm: async () => {
                await deleteOperationActions.execute(async () => {
                    setTemplates(prev => prev.filter(t => t.id !== templateId));
                    return 'success';
                }, {
                    successMessage: '템플릿이 성공적으로 삭제되었습니다.',
                    errorMessage: '템플릿 삭제 중 오류가 발생했습니다.'
                });
            }
        });
    }, [templates, confirmationActions, deleteOperationActions]);

    const handleDuplicateTemplate = useCallback(async (templateId: string | number) => {
        const templateToDuplicate = templates.find(t => t.id === templateId);
        if (!templateToDuplicate) return;
        
        await duplicateOperationActions.execute(async () => {
            const { id, ...dataToDuplicate } = templateToDuplicate;
            const newTemplate = { 
                ...dataToDuplicate, 
                id: Date.now() + Math.random(),
                name: `${templateToDuplicate.name} (복사본)` 
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

    const filteredTemplates = useMemo(() => templates, [templates]);

    return (
        <div className="space-y-6">
            {/* 네트워크 연결 상태 표시 */}
            {!networkState.isOnline && (
                <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
                    <Icon path={ICONS.warning} className="w-4 h-4 inline mr-2" />
                    네트워크 연결이 끊어졌습니다.
                </div>
            )}
            
            {/* 로딩 오버레이 */}
            {(saveOperation.isLoading || deleteOperation.isLoading || duplicateOperation.isLoading) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <div className="flex items-center space-x-3">
                            <LoadingSpinner size="md" color="blue" />
                            <span className="text-slate-700">
                                {saveOperation.isLoading && '저장 중...'}
                                {deleteOperation.isLoading && '삭제 중...'}
                                {duplicateOperation.isLoading && '복제 중...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

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
                                className="mobile-button bg-sky-500 hover:bg-sky-600 text-white transition-all"
                            >
                                <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                                새 템플릿 생성
                            </button>
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
                            {filteredTemplates.map(template => (
                                <TemplateCard 
                                    key={template.id} 
                                    template={template} 
                                    onEdit={handleEditTemplate}
                                    onDelete={handleDeleteTemplate}
                                    onDuplicate={handleDuplicateTemplate}
                                />
                            ))}
                            {filteredTemplates.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <Icon path={ICONS.documentText} className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">등록된 템플릿이 없습니다</h3>
                                    <p className="text-sm text-slate-500 mb-6">첫 번째 템플릿을 만들어보세요</p>
                                    <button 
                                        onClick={() => setView('editor')}
                                        className="mobile-button bg-sky-500 hover:bg-sky-600 text-white"
                                    >
                                        <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
                                        템플릿 생성
                                    </button>
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