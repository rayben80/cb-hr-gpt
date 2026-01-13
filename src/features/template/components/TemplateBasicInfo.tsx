import { Crown, GraduationCap, UserCheck, Users, X } from '@phosphor-icons/react';
import { memo, useState, type KeyboardEvent } from 'react';
import { HelpTooltip } from '../../../components/common';
import { EvaluationTemplate, TEMPLATE_TYPE_OPTIONS } from '../../../constants';
import { CategoryManagementModal } from '../../settings/CategoryManagementModal';
import { useTemplateTags } from '../hooks/useTemplateTags';

// 평가 유형별 아이콘 컴포넌트 매핑
const TYPE_ICONS: Record<string, React.ElementType> = {
    '성과 평가': UserCheck,
    '역량 평가': UserCheck,
    '다면 평가': Users,
    '리더십 평가': Crown,
    '수습 평가': GraduationCap,
};
const MANAGE_CATEGORY_VALUE = '__manage_category__';

interface CategorySelectProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    onManage: () => void;
}

const CategorySelect = memo(({ value, options, onChange, onManage }: CategorySelectProps) => (
    <div className="space-y-2">
        <label htmlFor="template-category" className="block text-sm font-semibold text-slate-800">
            카테고리 <span className="text-primary">*</span>
        </label>
        <div className="relative">
            <select
                id="template-category"
                value={value}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    if (nextValue === MANAGE_CATEGORY_VALUE) {
                        onManage();
                        return;
                    }
                    onChange(nextValue);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm hover:border-primary/50 appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
                <option disabled value="__divider__">
                    --------------
                </option>
                <option value={MANAGE_CATEGORY_VALUE}>카테고리 관리...</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    </div>
));

CategorySelect.displayName = 'CategorySelect';

interface TagSectionProps {
    tags: string[];
    tagInput: string;
    setTagInput: (value: string) => void;
    handleTagKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    handleTagBlur: () => void;
    handleRemoveTag: (tag: string) => void;
    tagLimitReached: boolean;
}

const TagSection = memo(
    ({
        tags,
        tagInput,
        setTagInput,
        handleTagKeyDown,
        handleTagBlur,
        handleRemoveTag,
        tagLimitReached,
    }: TagSectionProps) => (
        <div className="space-y-2">
            <label htmlFor="template-tags" className="block text-sm font-semibold text-slate-800">
                태그 <span className="text-slate-400 font-normal">({tags.length}/6)</span>
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[52px] shadow-sm transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary hover:border-primary/50">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm bg-primary/5 text-primary border border-primary/10 font-medium"
                    >
                        #{tag}
                        <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-primary/40 hover:text-primary transition-colors"
                            aria-label={`${tag} 태그 삭제`}
                        >
                            <X className="w-3.5 h-3.5" weight="regular" />
                        </button>
                    </span>
                ))}
                {!tagLimitReached && (
                    <input
                        id="template-tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={handleTagBlur}
                        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-slate-400"
                        placeholder={tags.length === 0 ? '태그 입력 (Enter 또는 쉼표)' : ''}
                    />
                )}
            </div>
        </div>
    )
);

TagSection.displayName = 'TagSection';

interface TemplateBasicInfoProps {
    template: EvaluationTemplate;
    onChange: (field: keyof EvaluationTemplate, value: any) => void;
    categoryOptions: string[];
    tagProps: ReturnType<typeof useTemplateTags>;
}

export const TemplateBasicInfo = memo(({ template, onChange, categoryOptions, tagProps }: TemplateBasicInfoProps) => {
    const { tagInput, setTagInput, tags, handleTagKeyDown, handleTagBlur, handleRemoveTag, tagLimitReached } = tagProps;
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    return (
        <>
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="template-name"
                            className="flex items-center text-sm font-semibold text-slate-800"
                        >
                            템플릿 명 <span className="text-primary">*</span>
                            <HelpTooltip content="평가 목록에서 쉽게 구분할 수 있는 이름을 작성하세요." />
                        </label>
                        <input
                            id="template-name"
                            type="text"
                            value={template.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm hover:border-primary/50"
                            placeholder="예: 2024년 상반기 정기 평가"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-slate-800">
                            평가 유형
                            <HelpTooltip content="평가 목적에 맞는 유형을 선택하세요. 유형에 따라 추천 항목이 달라집니다." />
                        </label>
                        <div className="flex p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                            {TEMPLATE_TYPE_OPTIONS.map((type) => {
                                const Icon = TYPE_ICONS[type];
                                const isSelected = template.type === type;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => onChange('type', type)}
                                        className={`flex-1 py-2 px-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                        }`}
                                    >
                                        {Icon && <Icon className="w-4 h-4" weight={isSelected ? 'fill' : 'regular'} />}
                                        <span className="hidden lg:inline">{type}</span>
                                        <span className="lg:hidden">{type.replace(' 평가', '')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="template-description" className="block text-sm font-semibold text-slate-800">
                            설명
                        </label>
                        <textarea
                            id="template-description"
                            value={template.description || ''}
                            onChange={(e) => onChange('description', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm hover:border-primary/50 min-h-[100px] resize-none"
                            placeholder="이 템플릿에 대한 설명을 입력하세요..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <CategorySelect
                        value={template.category}
                        options={categoryOptions}
                        onChange={(value) => onChange('category', value)}
                        onManage={() => setShowCategoryModal(true)}
                    />
                    <TagSection
                        tags={tags}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                        handleTagKeyDown={handleTagKeyDown}
                        handleTagBlur={handleTagBlur}
                        handleRemoveTag={handleRemoveTag}
                        tagLimitReached={tagLimitReached}
                    />
                </div>
            </div>
            <CategoryManagementModal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} />
        </>
    );
});

TemplateBasicInfo.displayName = 'TemplateBasicInfo';
