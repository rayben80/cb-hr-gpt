import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Icon, InputField } from './common';
import { SettingsCard } from './SettingsCard';
import { ICONS, currentUser, EvaluationTemplate, EvaluationItem } from '../constants';
import { ProgressBar } from './Progress';
import { StatusBadge } from './Status';

const defaultScoring = [
    { grade: 'S', description: '' },
    { grade: 'A', description: '' },
    { grade: 'B', description: '' },
    { grade: 'C', description: '' },
    { grade: 'D', description: '' },
];

const createNewItem = (type: '정량' | '정성'): EvaluationItem => ({
    id: Date.now(),
    type, // '정량' or '정성'
    title: '',
    weight: 10,
    details: type === '정량' ? {
        metric: '', // 측정지표
        target: '', // 목표
        calculation: '달성치 / 목표치 * 100%', // 산식
    } : {
        description: '' // 목표설명
    },
    scoring: JSON.parse(JSON.stringify(defaultScoring))
});

const EvaluationItemEditor = memo(({ item, onSave, onCancel }: { item: EvaluationItem, onSave: (item: EvaluationItem) => void, onCancel: () => void }) => {
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
        setEditedItem(prev => ({ ...prev, weight: parseInt(e.target.value, 10) || 0 }));
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border animate-fade-in">
            <h3 className="text-lg font-bold text-sky-700 mb-4">{item.type} 항목 편집</h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <InputField label="항목명" id="title" name="title" type="text" value={editedItem.title} onChange={handleTitleChange} placeholder="예: 1분기 신규 고객 유치" />
                    </div>
                    <InputField label="가중치(%)" id="weight" name="weight" type="number" value={editedItem.weight} onChange={handleWeightChange} placeholder="10" />
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

const EvaluationItemSummary = memo(({ item, onEdit, onRemove }: { item: EvaluationItem, onEdit: () => void, onRemove: () => void }) => {
    const icon = useMemo(() => item.type === '정량' ? ICONS.dashboard : ICONS.documentText, [item.type]);
    const color = useMemo(() => item.type === '정량' ? 'text-green-600' : 'text-blue-600', [item.type]);
    return (
        <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <Icon path={ICONS.gripVertical} className="w-5 h-5 text-slate-400 cursor-grab" />
                <Icon path={icon} className={`w-6 h-6 ${color}`} />
                <p className="font-semibold text-slate-800">{item.title || '새 항목'}</p>
                <span className="text-sm text-slate-500">({item.weight}%)</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
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
}

const TemplateEditor: React.FC<TemplateEditorProps> = memo(({ onSave, onCancel, initialTemplate = null }) => {
    const [template, setTemplate] = useState<{
        name: string;
        type: string;
        items: EvaluationItem[];
    }>({
        name: '',
        type: '본인평가',
        items: [],
    });
    const [activeItemId, setActiveItemId] = useState<number | null>(null);

    useEffect(() => {
        if (initialTemplate) {
            setTemplate({
                name: initialTemplate.name || '',
                type: initialTemplate.type || '본인평가',
                items: initialTemplate.items || Array.from({ length: initialTemplate.questions || 0 }, (_, i) => ({
                     id: i, type: '정성', title: `질문 ${i+1}`, weight: Math.round(100 / (initialTemplate.questions || 1)), details: { description: '' }, scoring: JSON.parse(JSON.stringify(defaultScoring))
                }))
            });
        }
    }, [initialTemplate]);

    const handleItemChange = useCallback((updatedItem: EvaluationItem) => {
        setTemplate(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item)
        }));
        setActiveItemId(null);
    }, []);
    
    const addItem = useCallback((type: '정량' | '정성') => {
        const newItem = createNewItem(type);
        setTemplate(prev => ({ ...prev, items: [...prev.items, newItem] }));
        setActiveItemId(newItem.id);
    }, []);

    const removeItem = useCallback((id: number) => {
        setTemplate(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
        if (activeItemId === id) {
            setActiveItemId(null);
        }
    }, [activeItemId]);

    const totalWeight = useMemo(() => template.items.reduce((sum, item) => sum + (item.weight || 0), 0), [template.items]);
    
    const handleSave = useCallback(() => {
        if (totalWeight !== 100 && template.type === '본인평가') {
            alert('항목의 총 가중치가 100%가 되어야 합니다.');
            return;
        }
        
        const finalTemplate: EvaluationTemplate = {
            ...template,
            id: initialTemplate?.id || Date.now(),
            category: '공통',
            lastUpdated: new Date().toISOString().split('T')[0],
            author: currentUser.name,
        };
        onSave(finalTemplate);
    }, [totalWeight, template, initialTemplate, onSave]);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                     <button onClick={onCancel} className="flex items-center text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors mb-2">
                        <Icon path={ICONS.arrowLeftBack} className="w-4 h-4 mr-2" />
                        라이브러리로 돌아가기
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">{initialTemplate ? '템플릿 수정' : '새 템플릿 만들기'}</h1>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right space-y-2">
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
                                <option>본인평가</option>
                                <option>다면평가</option>
                                <option>리더십평가</option>
                            </select>
                        </div>
                    </div>
                </SettingsCard>

                {template.type === '본인평가' && (
                    <SettingsCard title="평가 항목" description="템플릿에 포함될 질문들을 추가하고 관리합니다.">
                        <div className="space-y-4">
                             {template.items.map((item) => (
                                <div key={item.id}>
                                {activeItemId === item.id ? (
                                    <EvaluationItemEditor 
                                        item={item} 
                                        onSave={handleItemChange} 
                                        onCancel={() => setActiveItemId(null)}
                                    />
                                ) : (
                                    <EvaluationItemSummary 
                                        item={item} 
                                        onEdit={() => setActiveItemId(item.id)}
                                        onRemove={() => removeItem(item.id)}
                                    />
                                )}
                                </div>
                            ))}
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => addItem('정량')} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 p-3 rounded-lg border-2 border-dashed border-green-200 transition-colors">
                                   <Icon path={ICONS.plus} className="w-5 h-5" />
                                   정량 항목 추가
                                </button>
                                 <button onClick={() => addItem('정성')} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 p-3 rounded-lg border-2 border-dashed border-blue-200 transition-colors">
                                   <Icon path={ICONS.plus} className="w-5 h-5" />
                                   정성 항목 추가
                                </button>
                            </div>
                        </div>
                    </SettingsCard>
                )}
                
                 {template.type !== '본인평가' && (
                     <SettingsCard title="질문 목록" description="평가에 사용될 질문을 자유롭게 추가해주세요.">
                        <p className="text-center text-slate-500 p-8">이 평가 유형에 대한 항목 설정 기능은 아직 준비중입니다.</p>
                     </SettingsCard>
                )}
            </div>
        </div>
    );
});

TemplateEditor.displayName = 'TemplateEditor';

export default TemplateEditor;