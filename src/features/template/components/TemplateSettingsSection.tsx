import { FocusEvent, KeyboardEvent, memo } from 'react';
import { InputField } from '../../../components/common';
import { SettingsCard } from '../../../components/settings/SettingsCard';
import { SCORING_TYPES } from '../../../constants';

interface TemplateSettingsSectionProps {
    templateName: string;
    templateType: string;
    templateCategory: string;
    typeOptions: string[];
    tagInput: string;
    tags: string[];
    tagLimitReached: boolean;
    showNameError: boolean;
    showCategoryError: boolean;
    defaultScoringType: string;
    itemsCount: number;
    onNameChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onTagInputChange: (value: string) => void;
    onTagKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onTagBlur: (e: FocusEvent<HTMLInputElement>) => void;
    onRemoveTag: (tag: string) => void;
    onDefaultScoringTypeChange: (value: string) => void;
    onBulkScoringUpdate: () => void;
}

export const TemplateSettingsSection = memo(
    ({
        templateName,
        templateType,
        templateCategory,
        typeOptions,
        tagInput,
        tags,
        tagLimitReached,
        showNameError,
        showCategoryError,
        defaultScoringType,
        itemsCount,
        onNameChange,
        onTypeChange,
        onCategoryChange,
        onTagInputChange,
        onTagKeyDown,
        onTagBlur,
        onRemoveTag,
        onDefaultScoringTypeChange,
        onBulkScoringUpdate,
    }: TemplateSettingsSectionProps) => (
        <>
            <SettingsCard title="기본 정보" description="템플릿의 이름과 유형을 설정합니다.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="템플릿 이름 *"
                        id="templateName"
                        name="templateName"
                        type="text"
                        value={templateName}
                        onChange={(e: any) => onNameChange(e.target.value)}
                        placeholder="예: 2024년 하반기 역량 평가"
                        error={showNameError ? '템플릿 이름을 입력해주세요.' : ''}
                    />
                    <div>
                        <label htmlFor="templateType" className="block text-sm font-medium text-slate-700 mb-1">
                            템플릿 유형 <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="templateType"
                            value={templateType}
                            onChange={(e) => onTypeChange(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            {typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <InputField
                        label="카테고리"
                        id="templateCategory"
                        name="templateCategory"
                        type="text"
                        value={templateCategory}
                        onChange={(e: any) => onCategoryChange(e.target.value)}
                        placeholder="예: 공통, 개발, 영업"
                        error={showCategoryError ? '카테고리를 입력해주세요.' : ''}
                    />
                    <div>
                        <InputField
                            label="태그 (쉼표로 구분)"
                            id="templateTags"
                            name="templateTags"
                            type="text"
                            value={tagInput}
                            onChange={(e: any) => onTagInputChange(e.target.value)}
                            onKeyDown={onTagKeyDown}
                            onBlur={onTagBlur}
                            placeholder={tagLimitReached ? '태그 최대 6개' : '예: 상반기, 리더십, 핵심역량'}
                            disabled={tagLimitReached}
                        />
                        {tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => onRemoveTag(tag)}
                                        className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full hover:bg-slate-200"
                                        title="태그 제거"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                        {tagLimitReached && (
                            <p className="mt-2 text-xs text-amber-600">태그는 최대 6개까지 추가할 수 있습니다.</p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">엔터 또는 콤마로 태그를 추가할 수 있습니다.</p>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="채점 방식 설정" description="새 항목의 기본값 설정 및 일괄 변경 기능을 제공합니다.">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label htmlFor="default-scoring-type" className="block text-sm font-medium text-slate-700 mb-1">
                            기본 채점 방식
                        </label>
                        <select
                            id="default-scoring-type"
                            value={defaultScoringType}
                            onChange={(e) => onDefaultScoringTypeChange(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            {SCORING_TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500">
                            {SCORING_TYPES.find((t) => t.id === defaultScoringType)?.grades.join(' > ')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onBulkScoringUpdate}
                        disabled={itemsCount === 0}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        기존 항목에 일괄 적용
                    </button>
                </div>
            </SettingsCard>
        </>
    )
);

TemplateSettingsSection.displayName = 'TemplateSettingsSection';
