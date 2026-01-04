import { useCallback, useRef, useState } from 'react';
import { EvaluationTemplate } from '../../constants';
import { exportTemplates, importTemplates } from '../../utils/templateIO';

interface UseImportExportOptions {
    onImportSuccess: (imported: EvaluationTemplate[]) => void;
    filteredTemplates: EvaluationTemplate[];
}

export function useImportExport({
    onImportSuccess,
    filteredTemplates,
}: UseImportExportOptions) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const handleExport = useCallback(() => {
        const templatesForExport = filteredTemplates.filter(t => !t.archived);
        if (templatesForExport.length === 0) {
            setImportError('내보낼 템플릿이 없습니다.');
            setTimeout(() => setImportError(null), 3000);
            return;
        }
        exportTemplates(templatesForExport);
    }, [filteredTemplates]);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const imported = await importTemplates(file);
            onImportSuccess(imported);
            setImportError(null);
        } catch (err) {
            setImportError(err instanceof Error ? err.message : '가져오기 실패');
            setTimeout(() => setImportError(null), 3000);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onImportSuccess]);

    return {
        fileInputRef,
        importError,
        handleExport,
        handleImportClick,
        handleFileChange,
    };
}
