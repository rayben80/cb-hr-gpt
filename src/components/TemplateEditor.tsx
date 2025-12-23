import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Icon, InputField } from './common';
import { SettingsCard } from './SettingsCard';
import { ICONS, TEMPLATE_TYPE_OPTIONS, currentUser, EvaluationTemplate, EvaluationItem } from '../constants';
import { ProgressBar } from './Progress';
import { StatusBadge } from './Status';

const defaultScoring = [
    { grade: 'S', description: '' },
    { grade: 'A', description: '' },
    { grade: 'B', description: '' },
    { grade: 'C', description: '' },
    { grade: 'D', description: '' },
];

const createNewItem = (type: '정량' | '정성', weight = 10): EvaluationItem => ({
    id: Date.now(),
    type, // '정량' or '정성'
    title: '',
    weight,
    details: type === '정량' ? {
        metric: '', // 측정지표
        target: '', // 목표
        calculation: '달성치 / 목표치 * 100%', // 산식
    } : {
        description: '' // 목표설명
    },
    scoring: JSON.parse(JSON.stringify(defaultScoring))
});

const EvaluationItemEditor = memo(({ item, onSave, onCancel, showWeight }: { item: EvaluationItem, onSave: (item: EvaluationItem) => void, onCancel: () => void, showWeight: boolean }) => {
    const [editedItem, setEditedItem] = useState(item);

    const handleDetailChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditedItem(prev => ({
            ...prev,
            details: { ...prev.details, [e.target.name]: e.target.value }
        }));
    }, []);

    const handleScoringChange = useCallback((grade: string, description: string) => {
        setEditedItem(prev => ({
            ...prev,
            scoring: prev.scoring.map(s => s.grade === grade ? { ...s, description } : s)
        }));
    }, []);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedItem(prev => ({ ...prev, title: e.target.value }));
    }, []);

    const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
        setEditedItem(prev => ({ ...prev, weight: nextValue }));
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border animate-fade-in">
            <h3 className="text-lg font-bold text-sky-700 mb-4">{item.type} 항목 편집</h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={showWeight ? 'md:col-span-2' : 'md:col-span-3'}>
                        <InputField label="항목명" id="title" name="title" type="text" value={editedItem.title} onChange={handleTitleChange} placeholder="예: 1분기 신규 고객 유치" />
                    </div>
                    {showWeight && (
                        <InputField label="가중치(%)" id="weight" name="weight" type="number" value={editedItem.weight} onChange={handleWeightChange} placeholder="10" />
                    )}
                </div>

                {editedItem.type === '정량' ? (
                    <SettingsCard title="정량 지표 설정" description="측정 가능한 목표를 설정합니다.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="측정 지표" id="metric" name="metric" type="text" value={editedItem.details.metric || ''} onChange={handleDetailChange} placeholder="예: 신규 계약 건수" />
                            <InputField label="목표" id="target" name="target" type="text" value={editedItem.details.target || ''} onChange={handleDetailChange} placeholder="예: 30 건" />
                        </div>
                        <div className="mt-4">
                            <InputField label="성과 산식" id="calculation" name="calculation" type="text" value={editedItem.details.calculation || ''} onChange={handleDetailChange} placeholder="예: 달성치 / 목표치 * 100%" />
                        </div>
                    </SettingsCard>
                ) : (
                     <SettingsCard title="정성 목표 설정" description="달성해야 할 목표를 구체적으로 서술합니다.">
                        <InputField label="목표 설명" as="textarea" id="description" name="description" type="text" value={editedItem.details.description || ''} onChange={handleDetailChange} placeholder="달성해야 할 목표를 구체적으로 서술합니다." />
                    </SettingsCard>
                )}

                <SettingsCard title="등급별 평가 기준" description="각 등급에 대한 달성 기준을 명확하게 정의합니다.">
                    <div className="space-y-3">
                        {editedItem.scoring.map(({ grade }) => (
                            <div key={grade} className="flex items-center gap-4">
                                <span className="font-bold text-lg text-slate-700 w-8 text-center">{grade}</span>
                                <InputField 
                                    label=""
                                    id={`scoring-${grade}`} 
                                    name={`scoring-${grade}`} 
                                    type="text" 
                                    value={editedItem.scoring.find(s => s.grade === grade)?.description || ''} 
                                    onChange={(e) => handleScoringChange(grade, e.target.value)}
                                    placeholder={editedItem.type === '정량' ? '예: 달성률 120% 이상' : '예: 기대치를 월등히 초과하는 성과를 보임'} 
                                />
                            </div>
                        ))}
                    </div>
                </SettingsCard>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onCancel} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition-all">취소</button>
                    <button type="button" onClick={() => onSave(editedItem)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">항목 저장</button>
                </div>
            </div>
        </div>
    );
});

EvaluationItemEditor.displayName = 'EvaluationItemEditor';

const EvaluationItemSummary = memo(({ item, onEdit, onRemove, onCopy, showWeight }: { item: EvaluationItem, onEdit: () => void, onRemove: () => void, onCopy: () => void, showWeight: boolean }) => {
    const icon = useMemo(() => item.type === '정량' ? ICONS.dashboard : ICONS.documentText, [item.type]);
    const color = useMemo(() => item.type === '정량' ? 'text-green-600' : 'text-blue-600', [item.type]);
    return (
        <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <Icon path={ICONS.gripVertical} className="w-5 h-5 text-slate-400 cursor-grab" />
                <Icon path={icon} className={`w-6 h-6 ${color}`} />
                <p className="font-semibold text-slate-800">{item.title || '새 항목'}</p>
                {showWeight && <span className="text-sm text-slate-500">({item.weight}%)</span>}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <button onClick={onCopy} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-200 transition-colors" title="복사">
                    <Icon path={ICONS.copy} className="w-5 h-5" />
                </button>
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-200 transition-colors"><Icon path={ICONS.pencil} className="w-5 h-5" /></button>
                <button onClick={onRemove} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-200 transition-colors"><Icon path={ICONS.trash} className="w-5 h-5" /></button>
            </div>
        </div>
    );
});

EvaluationItemSummary.displayName = 'EvaluationItemSummary';

interface TemplateEditorProps {
    onSave: (template: EvaluationTemplate) => void;
    onCancel: () => void;
    initialTemplate?: EvaluationTemplate | null;
    categoryOptions: string[];
}

const TemplateEditor: React.FC<TemplateEditorProps> = memo(({ onSave, onCancel, initialTemplate = null, categoryOptions }) => {
    const [template, setTemplate] = useState<{
        name: string;
        type: string;
        category: string;
        items: EvaluationItem[];
    }>({
        name: '',
        type: TEMPLATE_TYPE_OPTIONS[0],
        category: categoryOptions[0] || '공통',
        items: [],
    });
    const [activeItemId, setActiveItemId] = useState<number | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [tagsInput, setTagsInput] = useState('');
    const [copiedItem, setCopiedItem] = useState<EvaluationItem | null>(null);
    const weightedTemplateTypes = useMemo(() => new Set(['역량 평가', '수습 평가']), []);
    const usesWeights = weightedTemplateTypes.has(template.type);
    const typeOptions = useMemo(() => {
        const optionSet = new Set<string>(TEMPLATE_TYPE_OPTIONS);
        if (template.type && !optionSet.has(template.type)) {
            optionSet.add(template.type);
        }
        return Array.from(optionSet);
    }, [template.type]);
    const normalizedTags = useMemo(() => (
        tagsInput.split(',').map(tag => tag.trim()).filter(Boolean)
    ), [tagsInput]);

    useEffect(() => {
        if (initialTemplate) {
            setTemplate({
                name: initialTemplate.name || '',
                type: initialTemplate.type || TEMPLATE_TYPE_OPTIONS[0],
                category: initialTemplate.category || categoryOptions[0] || '공통',
                items: initialTemplate.items || Array.from({ length: initialTemplate.questions || 0 }, (_, i) => ({
                     id: i, type: '정성', title: `질문 ${i+1}`, weight: Math.round(100 / (initialTemplate.questions || 1)), details: { description: '' }, scoring: JSON.parse(JSON.stringify(defaultScoring))
                }))
            });
            setTagsInput((initialTemplate.tags || []).join(', '));
        } else {
            setTagsInput('');
        }
        setCopiedItem(null);
    }, [initialTemplate, categoryOptions]);

    const handleItemChange = useCallback((updatedItem: EvaluationItem) => {
        setTemplate(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item)
        }));
        setActiveItemId(null);
    }, []);
    
    const addItem = useCallback((type: '정량' | '정성') => {
        const defaultWeight = usesWeights ? 10 : 0;
        const newItem = createNewItem(type, defaultWeight);
        setTemplate(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setActiveItemId(newItem.id);
    }, [usesWeights]);

    const removeItem = useCallback((id: number) => {
        setTemplate(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
        if (activeItemId === id) {
            setActiveItemId(null);
        }
    }, [activeItemId]);

    const handleCopyItem = useCallback((item: EvaluationItem) => {
        setCopiedItem({
            ...item,
            details: { ...item.details },
            scoring: item.scoring.map(score => ({ ...score })),
        });
    }, []);

    const handlePasteItem = useCallback(() => {
        if (!copiedItem) return;
        const newItem: EvaluationItem = {
            ...copiedItem,
            id: Date.now(),
            weight: usesWeights ? copiedItem.weight : 0,
            details: { ...copiedItem.details },
            scoring: copiedItem.scoring.map(score => ({ ...score })),
        };
        setTemplate(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setActiveItemId(newItem.id);
    }, [copiedItem, usesWeights]);

    const handleDragStart = useCallback((id: number) => {
        setDraggedItemId(id);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedItemId(null);
    }, []);

    const handleDrop = useCallback((targetId: number) => {
        if (draggedItemId === null || draggedItemId === targetId) return;
        setTemplate(prev => {
            const items = [...prev.items];
            const fromIndex = items.findIndex(item => item.id === draggedItemId);
            const toIndex = items.findIndex(item => item.id === targetId);
            if (fromIndex === -1 || toIndex === -1) return prev;
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            return { ...prev, items };
        });
        setDraggedItemId(null);
    }, [draggedItemId]);

    const totalWeight = useMemo(() => template.items.reduce((sum, item) => sum + (item.weight || 0), 0), [template.items]);
    
    const handleSave = useCallback(() => {
        if (!template.name.trim()) {
            alert('템플릿 이름을 입력해주세요.');
            return;
        }
        if (template.items.length === 0) {
            alert('항목을 최소 1개 이상 추가해주세요.');
            return;
        }
        if (usesWeights && totalWeight !== 100) {
            alert('항목의 총 가중치가 100%가 되어야 합니다.');
            return;
        }
        
        const nextVersion = initialTemplate?.version ? initialTemplate.version + 1 : 1;
        const finalTemplate: EvaluationTemplate = {
            ...template,
            tags: normalizedTags,
            version: nextVersion,
            id: initialTemplate?.id || Date.now(),
            category: template.category || categoryOptions[0] || '공통',
            lastUpdated: new Date().toISOString().split('T')[0],
            author: currentUser.name,
        };
        onSave(finalTemplate);
    }, [totalWeight, template, initialTemplate, onSave, usesWeights, normalizedTags, categoryOptions]);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                     <button onClick={onCancel} className="flex items-center text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors mb-2">
                        <Icon path={ICONS.arrowLeftBack} className="w-4 h-4 mr-2" />
                        라이브러리로 돌아가기
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">{initialTemplate ? '템플릿 수정' : '새 템플릿 만들기'}</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        버전 {initialTemplate?.version ? `v${initialTemplate.version}` : 'v1'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right space-y-2">
                        {usesWeights ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800">총 가중치</p>
                                    <StatusBadge 
                                        status={totalWeight === 100 ? 'success' : totalWeight > 100 ? 'error' : 'warning'}
                                        text={`${totalWeight}%`}
                                        size="sm"
                                    />
                                </div>
                                <div className="w-32">
                                    <ProgressBar 
                                        progress={Math.min(totalWeight, 100)}
                                        color={totalWeight === 100 ? 'green' : totalWeight > 100 ? 'red' : 'yellow'}
                                        size="sm"
                                        showPercentage={false}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 justify-end">
                                <p className="font-semibold text-slate-800">질문 수</p>
                                <StatusBadge status="info" text={`${template.items.length}개`} size="sm" />
                            </div>
                        )}
                    </div>
                    <button onClick={handleSave} className="flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                        템플릿 저장
                    </button>
                </div>
            </div>
            
            <div className="space-y-8">
                <SettingsCard title="기본 정보" description="템플릿의 이름과 유형을 설정합니다.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <InputField label="템플릿 이름" id="templateName" name="templateName" type="text" value={template.name} onChange={(e) => setTemplate({...template, name: e.target.value})} placeholder="예: 2024년 하반기 역량 평가" />
                         <div>
                            <label htmlFor="templateType" className="block text-sm font-medium text-slate-700 mb-1">템플릿 유형</label>
                            <select id="templateType" value={template.type} onChange={(e) => setTemplate({...template, type: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                                {typeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <InputField
                            label="카테고리"
                            id="templateCategory"
                            name="templateCategory"
                            type="text"
                            value={template.category}
                            onChange={(e) => setTemplate({...template, category: e.target.value})}
                            placeholder="예: 공통, 개발, 영업"
                        />
                        <div>
                            <InputField
                                label="태그 (쉼표로 구분)"
                                id="templateTags"
                                name="templateTags"
                                type="text"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="예: 상반기, 리더십, 핵심역량"
                            />
                            {normalizedTags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {normalizedTags.map(tag => (
                                        <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard
                    title={usesWeights ? "평가 항목" : "질문 목록"}
                    description={usesWeights ? "템플릿에 포함될 질문들을 추가하고 관리합니다." : "평가에 사용될 질문을 추가해주세요."}
                >
                    <div className="space-y-4">
                         {template.items.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(item.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(item.id)}
                                className={draggedItemId === item.id ? 'opacity-60' : ''}
                            >
                            {activeItemId === item.id ? (
                                <EvaluationItemEditor 
                                    item={item} 
                                    onSave={handleItemChange} 
                                    onCancel={() => setActiveItemId(null)}
                                    showWeight={usesWeights}
                                />
                            ) : (
                                <EvaluationItemSummary 
                                    item={item} 
                                    onEdit={() => setActiveItemId(item.id)}
                                    onRemove={() => removeItem(item.id)}
                                    onCopy={() => handleCopyItem(item)}
                                    showWeight={usesWeights}
                                />
                            )}
                            </div>
                        ))}
                        <div className="flex gap-4 pt-4">
                            {usesWeights ? (
                                <>
                                    <button onClick={() => addItem('정량')} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 p-3 rounded-lg border-2 border-dashed border-green-200 transition-colors">
                                       <Icon path={ICONS.plus} className="w-5 h-5" />
                                       정량 항목 추가
                                    </button>
                                     <button onClick={() => addItem('정성')} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg border-2 border-dashed border-blue-200 transition-colors">
                                       <Icon path={ICONS.plus} className="w-5 h-5" />
                                       정성 항목 추가
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => addItem('정성')} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg border-2 border-dashed border-blue-200 transition-colors">
                                   <Icon path={ICONS.plus} className="w-5 h-5" />
                                   질문 추가
                                </button>
                            )}
                            <button
                                onClick={handlePasteItem}
                                disabled={!copiedItem}
                                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border-2 border-dashed border-slate-200 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Icon path={ICONS.copy} className="w-5 h-5" />
                                항목 붙여넣기
                            </button>
                        </div>
                        {copiedItem && (
                            <p className="text-xs text-slate-500">
                                복사됨: {copiedItem.title || '이름 없는 항목'}
                            </p>
                        )}
                    </div>
                </SettingsCard>
            </div>
        </div>
    );
});

TemplateEditor.displayName = 'TemplateEditor';

export default TemplateEditor;
