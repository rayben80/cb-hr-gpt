import { EvaluationItem, EvaluationTemplate } from '../constants';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isValidEvaluationItem = (value: unknown): value is EvaluationItem => {
    if (!isRecord(value)) return false;
    if (typeof value.id !== 'number') return false;
    if (value.type !== '정량' && value.type !== '정성') return false;
    if (typeof value.title !== 'string' || !value.title.trim()) return false;
    if (typeof value.weight !== 'number') return false;
    if (!isRecord(value.details)) return false;
    if (value.scoring !== undefined && !Array.isArray(value.scoring)) return false;
    return true;
};

/**
 * 템플릿 데이터 유효성 검증
 */
export const validateTemplate = (data: unknown): data is EvaluationTemplate => {
    if (!isRecord(data)) return false;

    const template = data;

    // 필수 필드 검증
    if (typeof template.name !== 'string' || !template.name.trim()) return false;
    if (typeof template.type !== 'string' || !template.type.trim()) return false;
    if (typeof template.category !== 'string' || !template.category.trim()) return false;
    if (typeof template.lastUpdated !== 'string') return false;
    if (typeof template.author !== 'string') return false;
    if (template.items !== undefined) {
        if (!Array.isArray(template.items)) return false;
        if (!template.items.every(isValidEvaluationItem)) return false;
    }

    return true;
};

/**
 * 템플릿 배열 내보내기 (JSON 파일 다운로드)
 */
export const exportTemplates = (templates: EvaluationTemplate[], filename?: string): void => {
    const dataToExport = templates.map((template) => ({
        ...template,
        // 내보내기 시 archived와 favorite은 false로 초기화
        archived: false,
    }));

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * 단일 템플릿 내보내기
 */
export const exportSingleTemplate = (template: EvaluationTemplate): void => {
    const safeName = template.name.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    exportTemplates([template], `template-${safeName}.json`);
};

/**
 * JSON 파일에서 템플릿 가져오기
 */
export const importTemplates = (file: File): Promise<EvaluationTemplate[]> => {
    return new Promise((resolve, reject) => {
        if (!file.name.endsWith('.json')) {
            reject(new Error('JSON 파일만 가져올 수 있습니다.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);

                // 배열이 아닌 경우 배열로 변환
                const templates = Array.isArray(parsed) ? parsed : [parsed];

                // 각 템플릿 유효성 검증
                const validTemplates: EvaluationTemplate[] = [];
                const invalidCount = { count: 0 };

                templates.forEach((item, index) => {
                    if (validateTemplate(item)) {
                        // 새 ID 할당 (충돌 방지)
                        validTemplates.push({
                            ...item,
                            id: Date.now() + index + Math.random(),
                            lastUpdated: new Date().toISOString().split('T')[0],

                            archived: false,
                        });
                    } else {
                        invalidCount.count++;
                    }
                });

                if (validTemplates.length === 0) {
                    reject(new Error('유효한 템플릿을 찾을 수 없습니다.'));
                    return;
                }

                resolve(validTemplates);
            } catch {
                reject(new Error('파일을 파싱하는 중 오류가 발생했습니다.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
        };

        reader.readAsText(file);
    });
};
