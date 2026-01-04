import { memo } from 'react';

interface HighlightedTextProps {
    text: string;
    searchTerm?: string;
    className?: string;
}

export const HighlightedText = memo(({ text, searchTerm, className = '' }: HighlightedTextProps) => {
    if (!searchTerm) {
        return <span className={className}>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return (
        <span className={className}>
            {parts.map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-amber-200 text-slate-900 px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
});

HighlightedText.displayName = 'HighlightedText';
