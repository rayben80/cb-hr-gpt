import { REPORTING_CATEGORY_OPTIONS } from '../constants';

const REPORTING_CATEGORY_SET = new Set<string>(REPORTING_CATEGORY_OPTIONS);

const normalizeText = (value?: string) => (value ?? '').trim();

const resolveExplicitCategory = (value?: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return undefined;
    return REPORTING_CATEGORY_SET.has(normalized)
        ? (normalized as (typeof REPORTING_CATEGORY_OPTIONS)[number])
        : undefined;
};

const KEYWORD_RULES: { keywords: string[]; category: string }[] = [
    { keywords: ['성과', '본인평가', 'KPI', '매출'], category: '성과' },
    { keywords: ['프로젝트', '과제'], category: '프로젝트' },
    { keywords: ['리더십', '팀장', '관리자', '임원'], category: '리더십' },
    { keywords: ['역량', '다면', '동료', '피드백', '360'], category: '역량' },
    { keywords: ['직무', '수습', '온보딩', 'OJT', '전문성'], category: '직무' },
];

const resolveCategoryByKeywords = (value?: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return undefined;

    for (const rule of KEYWORD_RULES) {
        if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
            return rule.category;
        }
    }

    return undefined;
};

interface ReportingCategorySource {
    reportingCategory?: string | undefined;
    templateCategory?: string | undefined;
    templateType?: string | undefined;
    type?: string | undefined;
    name?: string | undefined;
    title?: string | undefined;
}

export const resolveReportingCategory = (source: ReportingCategorySource, options?: { fallback?: string }) => {
    const fallback = options?.fallback ?? '미지정';

    const explicit = resolveExplicitCategory(source.reportingCategory);
    if (explicit) return explicit;

    const templateCategory = resolveExplicitCategory(source.templateCategory);
    if (templateCategory) return templateCategory;

    const byTemplateType = resolveCategoryByKeywords(source.templateType) ?? resolveCategoryByKeywords(source.type);
    if (byTemplateType) return byTemplateType;

    const byTitle = resolveCategoryByKeywords(source.title) ?? resolveCategoryByKeywords(source.name);
    if (byTitle) return byTitle;

    return fallback;
};
