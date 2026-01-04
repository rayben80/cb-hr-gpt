import { useCallback, useState } from 'react';

export const useTemplateTags = (initialTags: string[] = [], maxTags: number = 6) => {
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(initialTags);

    const tagLimitReached = tags.length >= maxTags;

    const addTagsFromInput = useCallback(
        (value: string) => {
            const candidates = value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
            if (candidates.length === 0) return;
            setTags((prev) => {
                const normalized = prev.map((tag) => tag.toLowerCase());
                const next = [...prev];
                for (const candidate of candidates) {
                    if (next.length >= maxTags) break;
                    if (normalized.includes(candidate.toLowerCase())) continue;
                    next.push(candidate);
                    normalized.push(candidate.toLowerCase());
                }
                return next;
            });
        },
        [maxTags]
    );

    const handleTagKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                if (tagLimitReached) return;
                if (!tagInput.trim()) return;
                addTagsFromInput(tagInput);
                setTagInput('');
            }
            if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                setTags((prev) => prev.slice(0, -1));
            }
        },
        [addTagsFromInput, tagInput, tags.length, tagLimitReached]
    );

    const handleTagBlur = useCallback(() => {
        if (!tagInput.trim()) return;
        addTagsFromInput(tagInput);
        setTagInput('');
    }, [addTagsFromInput, tagInput]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    }, []);

    return {
        tagInput,
        setTagInput,
        tags,
        setTags,
        tagLimitReached,
        handleTagKeyDown,
        handleTagBlur,
        handleRemoveTag,
    };
};
