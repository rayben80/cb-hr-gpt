import { useState, useEffect, useCallback, useRef } from 'react';
import { EvaluationItem } from '../../../constants';

interface TemplateState {
    name: string;
    type: string;
    category: string;
    items: EvaluationItem[];
}

interface TemplateDraft {
    template: TemplateState;
    tags: string[];
    tagInput?: string;
    updatedAt: string;
}

interface UseTemplateDraftOptions {
    templateId?: string | number | null | undefined;
    template: TemplateState;
    setTemplate: React.Dispatch<React.SetStateAction<TemplateState>>;
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
    tagInput: string;
    setTagInput: React.Dispatch<React.SetStateAction<string>>;
    setShowValidation: React.Dispatch<React.SetStateAction<boolean>>;
}

const safeStorageGet = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeStorageSet = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures (private mode/quota)
    }
};

const safeStorageRemove = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch {
        // Ignore storage failures (private mode/quota)
    }
};

export function useTemplateDraft({
    templateId,
    template,
    setTemplate,
    tags,
    setTags,
    tagInput,
    setTagInput,
    setShowValidation,
}: UseTemplateDraftOptions) {
    const [draftInfo, setDraftInfo] = useState<TemplateDraft | null>(null);
    const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const isFirstRender = useRef(true);
    const draftKey = `template-draft-${templateId ?? 'new'}`;

    // Load draft on mount
    useEffect(() => {
        const raw = safeStorageGet(draftKey);
        if (!raw) { setDraftInfo(null); return; }
        try {
            const parsed = JSON.parse(raw) as TemplateDraft;
            if (parsed?.template?.name && parsed?.updatedAt) {
                setDraftInfo(parsed);
            } else {
                setDraftInfo(null);
            }
        } catch { setDraftInfo(null); }
    }, [draftKey]);

    // Track dirty state
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        setIsDirty(true);
    }, [template, tags, tagInput]);

    // Autosave every 10 seconds
    useEffect(() => {
        if (!isDirty) return;
        const interval = setInterval(() => {
            const draft: TemplateDraft = { template, tags, tagInput, updatedAt: new Date().toISOString() };
            safeStorageSet(draftKey, JSON.stringify(draft));
            setLastAutosavedAt(draft.updatedAt);
        }, 10000);
        return () => clearInterval(interval);
    }, [isDirty, template, tags, tagInput, draftKey]);

    // Warn on page unload
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!isDirty) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleRestoreDraft = useCallback(() => {
        if (!draftInfo) return;
        setTemplate(draftInfo.template);
        setTags(draftInfo.tags || []);
        setTagInput(draftInfo.tagInput || '');
        setShowValidation(false);
        setIsDirty(true);
        setDraftInfo(null);
    }, [draftInfo, setTemplate, setTags, setTagInput, setShowValidation]);

    const handleDiscardDraft = useCallback(() => {
        safeStorageRemove(draftKey);
        setDraftInfo(null);
        setLastAutosavedAt(null);
    }, [draftKey]);

    const clearDraftOnSave = useCallback(() => {
        safeStorageRemove(draftKey);
        setDraftInfo(null);
        setLastAutosavedAt(null);
        setIsDirty(false);
    }, [draftKey]);

    const resetDirty = useCallback(() => {
        setIsDirty(false);
        isFirstRender.current = true;
    }, []);

    return {
        draftInfo,
        lastAutosavedAt,
        isDirty,
        draftKey,
        handleRestoreDraft,
        handleDiscardDraft,
        clearDraftOnSave,
        resetDirty,
    };
}
