import { useRef, useState } from 'react';
import { EvaluationTemplate, currentUser } from '../../constants';
import { validateTemplate } from '../../utils/templateIO';

export const useImportExport = (addTemplate: (template: Omit<EvaluationTemplate, 'id'>) => Promise<string>) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const handleExport = (templatesToExport: EvaluationTemplate[]) => {
        if (templatesToExport.length === 0) return;

        const dataStr = JSON.stringify(templatesToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `evaluation_templates_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);

                // Validate imported data is array of templates
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid format: root must be an array');
                }

                const validTemplates = importedData.filter(validateTemplate);
                if (validTemplates.length !== importedData.length) {
                    throw new Error('유효하지 않은 템플릿이 포함되어 있습니다.');
                }

                // Append with new IDs to avoid collision
                const newTemplates = validTemplates.map((t: EvaluationTemplate) => ({
                    ...t,
                    name: `${t.name} (Imported)`,
                    importedAt: new Date().toISOString(),
                    author: currentUser.name,
                }));

                // Use Promise.all to add all templates to Firestore
                const promises = newTemplates.map(async (t: EvaluationTemplate) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...templateData } = t; // Exclude fake/old ID
                    await addTemplate(templateData);
                });

                await Promise.all(promises);
                setImportError(null);
            } catch (err) {
                console.error('Import error:', err);
                const message =
                    err instanceof Error && err.message
                        ? err.message
                        : '파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 형식이 아닙니다.';
                setImportError(message);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return {
        handleExport,
        handleImportClick,
        handleFileChange,
        fileInputRef,
        importError,
    };
};
