import React, { memo } from 'react';

interface WordCloudProps {
    keywords: { text: string; value: number }[];
}

const colors = [
    'text-primary bg-primary/10',
    'text-primary bg-primary/20',
    'text-teal-600 bg-teal-50',
    'text-purple-600 bg-purple-50',
    'text-pink-600 bg-pink-50',
    'text-indigo-600 bg-indigo-50',
];

export const WordCloud: React.FC<WordCloudProps> = memo(({ keywords }) => {
    // Simple visual mapping without complex library
    // Sort by weight to probably center bigger words if we had a real layout engine,
    // but here we just flex-wrap them.

    return (
        <div className="flex flex-wrap justify-center gap-3 p-6 bg-slate-50 rounded-xl min-h-[200px] content-center">
            {keywords.map((word, index) => {
                const sizeClass =
                    word.value > 80
                        ? 'text-2xl font-bold px-4 py-2'
                        : word.value > 60
                          ? 'text-xl font-bold px-3 py-1.5'
                          : word.value > 40
                            ? 'text-lg font-semibold px-3 py-1'
                            : 'text-sm font-medium px-2 py-1';

                // Deterministic color assignment based on index
                const colorClass = colors[index % colors.length];

                return (
                    <span
                        key={word.text}
                        className={`${sizeClass} ${colorClass} rounded-full transition-all hover:scale-110 cursor-default shadow-sm border border-black/5`}
                    >
                        {word.text}
                    </span>
                );
            })}
        </div>
    );
});

WordCloud.displayName = 'WordCloud';
