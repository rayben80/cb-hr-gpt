import { X } from '@phosphor-icons/react';
import { memo } from 'react';
import { EvaluationTemplate, TEMPLATE_TYPE_OPTIONS } from '../../../constants';
import { useTemplateTags } from '../hooks/useTemplateTags';

interface TemplateBasicInfoProps {
    template: EvaluationTemplate;
    onChange: (field: keyof EvaluationTemplate, value: any) => void;
    categoryOptions: string[];
    tagProps: ReturnType<typeof useTemplateTags>;
}

export const TemplateBasicInfo = memo(({ template, onChange, categoryOptions, tagProps }: TemplateBasicInfoProps) => {
    const { tagInput, setTagInput, tags, handleTagKeyDown, handleTagBlur, handleRemoveTag, tagLimitReached } = tagProps;

    return (
        <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="template-name" className="block text-sm font-semibold text-slate-800">
                        템플릿 명 <span className="text-primary">*</span>
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
                    <label className="block text-sm font-semibold text-slate-800">평가 유형</label>
                    <div className="flex p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        {TEMPLATE_TYPE_OPTIONS.map((type) => (
                            <button
                                key={type}
                                onClick={() => onChange('type', type)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    template.type === type
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
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
                <div className="space-y-2">
                    <label htmlFor="template-category" className="block text-sm font-semibold text-slate-800">
                        카테고리 <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="template-category"
                            value={template.category}
                            onChange={(e) => onChange('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm hover:border-primary/50 appearance-none cursor-pointer"
                        >
                            {categoryOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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
            </div>
        </div>
    );
});
TemplateBasicInfo.displayName = 'TemplateBasicInfo';
